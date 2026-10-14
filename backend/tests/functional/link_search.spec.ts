import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import type { ApiClient } from '@japa/api-client'
import Link from '#models/link'
import Tag from '#models/tag'
import Team from '#models/team'
import User from '#models/user'

const TABLES = [
  'link_tags',
  'auth_access_tokens',
  'links',
  'tags',
  'team_members',
  'teams',
  'users',
]

type ListedLink = {
  id: number
  slug: string
  title: string
  destinationUrl: string
  clickCount: number
  isActive: boolean | number
  teamId: number | null
  team: { id: number; slug: string } | null
  tags: { name: string }[]
}

/**
 * Delete rows before each test. HTTP requests share this process, so a
 * rolled-back transaction would hide fixtures from the route handlers.
 * Schema comes from `node ace migration:run`, which backend CI runs first.
 */
function isolateDatabase(group: { each: { setup: (hook: () => Promise<void>) => void } }) {
  group.each.setup(async () => {
    for (const table of TABLES) {
      await db.from(table).delete()
    }
  })
}

async function createOwner() {
  return User.create({
    fullName: 'Link Owner',
    email: 'owner@example.com',
    password: 'password-123',
  })
}

async function seedLink(
  userId: number,
  seed: {
    slug: string
    title: string
    destinationUrl?: string
    description?: string | null
    teamId?: number | null
    isActive?: boolean
    clickCount?: number
    deletedAt?: DateTime | null
    tags?: string[]
  }
) {
  const link = await Link.create({
    slug: seed.slug,
    destinationUrl: seed.destinationUrl ?? `https://example.com/${seed.slug}`,
    title: seed.title,
    description: seed.description ?? null,
    teamId: seed.teamId ?? null,
    userId,
    isActive: seed.isActive ?? true,
    healthStatus: 'healthy',
    clickCount: seed.clickCount ?? 0,
    deletedAt: seed.deletedAt ?? null,
  })

  for (const name of seed.tags ?? []) {
    const tag = await Tag.firstOrCreate({ name })
    await link.related('tags').attach([tag.id])
  }

  return link
}

function listed(body: unknown) {
  return body as ListedLink[]
}

function slugs(body: unknown) {
  return listed(body).map((link) => link.slug)
}

async function getLinks(client: ApiClient, query: Record<string, string> = {}) {
  const request = client.get('/api/v1/links')
  if (Object.keys(query).length > 0) {
    request.qs(query)
  }
  const response = await request
  response.assertOk()
  return response
}

test.group('Link search / catalog', (group) => {
  isolateDatabase(group)

  test('lists global and team shortcuts with tags and does not require auth', async ({
    client,
    assert,
  }) => {
    const user = await createOwner()
    const sprint = await Team.create({ name: 'Sprint', slug: 'sprint', description: null })

    await seedLink(user.id, {
      slug: 'handbook',
      title: 'Team handbook',
      clickCount: 2,
      tags: ['docs'],
    })
    await seedLink(user.id, {
      slug: 'board',
      title: 'Sprint board',
      teamId: sprint.id,
      clickCount: 9,
      tags: ['planning', 'sprint'],
    })

    const response = await getLinks(client)
    const body = listed(response.body())

    assert.deepEqual(slugs(body), ['board', 'handbook'])

    const teamLink = body[0]
    assert.equal(teamLink.teamId, sprint.id)
    assert.equal(teamLink.team?.slug, 'sprint')
    assert.deepEqual(teamLink.tags.map((tag) => tag.name).sort(), ['planning', 'sprint'])

    const globalLink = body[1]
    assert.isNull(globalLink.teamId)
    assert.isNull(globalLink.team)
    assert.deepEqual(
      globalLink.tags.map((tag) => tag.name),
      ['docs']
    )
  })

  test('keeps an inactive shortcut in the catalog', async ({ client, assert }) => {
    const user = await createOwner()
    await seedLink(user.id, {
      slug: 'old-docs',
      title: 'Old docs',
      isActive: false,
      clickCount: 4,
    })

    const response = await getLinks(client)
    const body = listed(response.body())

    assert.deepEqual(slugs(body), ['old-docs'])
    assert.equal(Boolean(body[0].isActive), false)
  })

  test('excludes a soft-deleted shortcut from the catalog and from lookup', async ({
    client,
    assert,
  }) => {
    const user = await createOwner()
    const retired = await seedLink(user.id, {
      slug: 'retired',
      title: 'Retired shortcut',
      clickCount: 20,
      deletedAt: DateTime.utc(),
    })
    await seedLink(user.id, { slug: 'current', title: 'Current shortcut', clickCount: 1 })

    const catalog = await getLinks(client)
    assert.deepEqual(slugs(catalog.body()), ['current'])

    const lookup = await client.get(`/api/v1/links/${retired.id}`)
    lookup.assertNotFound()
    lookup.assertBodyContains({ error: 'Link not found' })
  })

  test('orders shortcuts by click count descending', async ({ client, assert }) => {
    const user = await createOwner()
    await seedLink(user.id, { slug: 'low', title: 'Low', clickCount: 1 })
    await seedLink(user.id, { slug: 'high', title: 'High', clickCount: 30 })
    await seedLink(user.id, { slug: 'mid', title: 'Mid', clickCount: 8 })

    const response = await getLinks(client)
    assert.deepEqual(slugs(response.body()), ['high', 'mid', 'low'])
  })

  test('returns at most 25 shortcuts', async ({ client, assert }) => {
    const user = await createOwner()
    for (let clickCount = 1; clickCount <= 26; clickCount++) {
      await seedLink(user.id, {
        slug: `c${String(clickCount).padStart(2, '0')}`,
        title: `Count ${clickCount}`,
        clickCount,
      })
    }

    const response = await getLinks(client)
    const body = listed(response.body())

    assert.lengthOf(body, 25)
    assert.equal(body[0].slug, 'c26')
    assert.equal(body[24].slug, 'c02')
    assert.notInclude(
      body.map((link) => link.slug),
      'c01'
    )
  })
})

test.group('Link search / query text', (group) => {
  isolateDatabase(group)

  test('matches a partial alias regardless of case', async ({ client, assert }) => {
    const user = await createOwner()
    const sprint = await Team.create({ name: 'Sprint', slug: 'sprint', description: null })
    await seedLink(user.id, {
      slug: 'api-docs',
      title: 'Reference',
      destinationUrl: 'https://docs.example.com/guide',
      teamId: sprint.id,
    })
    await seedLink(user.id, {
      slug: 'standup',
      title: 'Daily standup',
      destinationUrl: 'https://example.com/standup',
    })

    const response = await getLinks(client, { query: '  API-DO  ' })
    const body = listed(response.body())

    assert.deepEqual(slugs(body), ['api-docs'])
    assert.equal(body[0].team?.slug, 'sprint')
  })

  test('matches a title', async ({ client, assert }) => {
    const user = await createOwner()
    await seedLink(user.id, {
      slug: 'tasks',
      title: 'Sprint Board',
      destinationUrl: 'https://example.com/tasks',
    })
    await seedLink(user.id, {
      slug: 'roadmap',
      title: 'Quarterly roadmap',
      destinationUrl: 'https://example.com/roadmap',
    })

    const response = await getLinks(client, { query: 'sprint' })
    assert.deepEqual(slugs(response.body()), ['tasks'])
  })

  test('matches a destination URL', async ({ client, assert }) => {
    const user = await createOwner()
    await seedLink(user.id, {
      slug: 'api',
      title: 'API',
      destinationUrl: 'https://internal.example/swagger-ui',
    })
    await seedLink(user.id, {
      slug: 'wiki',
      title: 'Wiki',
      destinationUrl: 'https://internal.example/wiki',
    })

    const response = await getLinks(client, { query: 'Swagger-UI' })
    assert.deepEqual(slugs(response.body()), ['api'])
  })

  test('does not match description text or tag names', async ({ client, assert }) => {
    const user = await createOwner()
    await seedLink(user.id, {
      slug: 'notes',
      title: 'Notes',
      destinationUrl: 'https://example.com/notes',
      description: 'zebra-unique-description',
      tags: ['payroll'],
    })

    const byDescription = await getLinks(client, { query: 'zebra-unique-description' })
    const byTag = await getLinks(client, { query: 'payroll' })

    assert.deepEqual(slugs(byDescription.body()), [])
    assert.deepEqual(slugs(byTag.body()), [])
  })

  test('treats a blank query as the full catalog', async ({ client, assert }) => {
    const user = await createOwner()
    await seedLink(user.id, { slug: 'alpha', title: 'Alpha', clickCount: 2 })
    await seedLink(user.id, { slug: 'beta', title: 'Beta', clickCount: 1 })

    const response = await getLinks(client, { query: '   ' })
    assert.deepEqual(slugs(response.body()), ['alpha', 'beta'])
  })

  test('returns an empty list when nothing matches', async ({ client, assert }) => {
    const user = await createOwner()
    await seedLink(user.id, { slug: 'handbook', title: 'Handbook' })

    const response = await getLinks(client, { query: 'missing-term' })
    assert.deepEqual(slugs(response.body()), [])
  })
})

test.group('Link search / tags', (group) => {
  isolateDatabase(group)

  test('filters by an exact tag name', async ({ client, assert }) => {
    const user = await createOwner()
    await seedLink(user.id, {
      slug: 'oncall',
      title: 'On call',
      clickCount: 3,
      tags: ['devops', 'api'],
    })
    await seedLink(user.id, {
      slug: 'brand',
      title: 'Brand kit',
      clickCount: 1,
      tags: ['design'],
    })

    const response = await getLinks(client, { tag: 'devops' })
    const body = listed(response.body())

    assert.deepEqual(slugs(body), ['oncall'])
    assert.deepEqual(body[0].tags.map((tag) => tag.name).sort(), ['api', 'devops'])
  })

  test('does not treat a tag prefix or different case as a match', async ({ client, assert }) => {
    const user = await createOwner()
    await seedLink(user.id, { slug: 'oncall', title: 'On call', tags: ['devops'] })

    const prefix = await getLinks(client, { tag: 'dev' })
    const differentCase = await getLinks(client, { tag: 'DevOps' })

    assert.deepEqual(slugs(prefix.body()), [])
    assert.deepEqual(slugs(differentCase.body()), [])
  })

  test('trims the tag filter', async ({ client, assert }) => {
    const user = await createOwner()
    await seedLink(user.id, { slug: 'oncall', title: 'On call', tags: ['devops'] })

    const response = await getLinks(client, { tag: '  devops  ' })
    assert.deepEqual(slugs(response.body()), ['oncall'])
  })

  test('requires both the text query and the tag to match', async ({ client, assert }) => {
    const user = await createOwner()
    await seedLink(user.id, {
      slug: 'api-docs',
      title: 'API docs',
      destinationUrl: 'https://example.com/api-docs',
      clickCount: 5,
      tags: ['devops'],
    })
    await seedLink(user.id, {
      slug: 'standup',
      title: 'Standup',
      destinationUrl: 'https://example.com/standup',
      clickCount: 4,
      tags: ['devops'],
    })
    await seedLink(user.id, {
      slug: 'api-portal',
      title: 'API portal',
      destinationUrl: 'https://example.com/api-portal',
      clickCount: 3,
      tags: ['design'],
    })

    const response = await getLinks(client, { query: 'api', tag: 'devops' })
    assert.deepEqual(slugs(response.body()), ['api-docs'])
  })

  test('does not return a soft-deleted shortcut from a tag filter', async ({ client, assert }) => {
    const user = await createOwner()
    await seedLink(user.id, {
      slug: 'old-oncall',
      title: 'Old on call',
      tags: ['devops'],
      deletedAt: DateTime.utc(),
    })
    await seedLink(user.id, {
      slug: 'oncall',
      title: 'On call',
      tags: ['devops'],
    })

    const response = await getLinks(client, { tag: 'devops' })
    assert.deepEqual(slugs(response.body()), ['oncall'])
  })
})
