import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import Link from '#models/link'
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

const DESTINATION = 'https://docs.example.com/guide?tab=overview'

type ValidationErrorBody = {
  errors?: { field: string; message: string }[]
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

async function createOwner(email = 'owner@example.com') {
  return User.create({
    fullName: 'Link Owner',
    email,
    password: 'password-123',
  })
}

async function createTeam(slug = 'platform', name = 'Platform') {
  return Team.create({ name, slug, description: null })
}

function validationFields(body: unknown) {
  const errors = (body as ValidationErrorBody).errors ?? []
  return errors.map((error) => error.field)
}

function portalFallback(slug: string) {
  return `http://localhost:3000/?search=${encodeURIComponent(slug)}&notFound=true`
}

test.group('Link deployment / creating short links', (group) => {
  isolateDatabase(group)

  test('stores a global shortcut for an authenticated user', async ({ client, assert }) => {
    const user = await createOwner()

    const response = await client
      .post('/api/v1/links')
      .json({
        slug: 'api-docs',
        destinationUrl: DESTINATION,
        title: 'API docs',
      })
      .loginAs(user)

    response.assertCreated()
    response.assertBodyContains({
      slug: 'api-docs',
      destinationUrl: DESTINATION,
      title: 'API docs',
      description: null,
      teamId: null,
      userId: user.id,
      clickCount: 0,
      healthStatus: 'healthy',
      isActive: true,
      team: null,
    })

    const link = await Link.findByOrFail('slug', 'api-docs')
    assert.equal(link.userId, user.id)
    assert.isTrue(Boolean(link.isActive))
    assert.isNull(link.teamId)
    assert.isNull(link.deletedAt)
  })

  test('trims the alias and keeps the trimmed slug for duplicate checks', async ({ client }) => {
    const user = await createOwner()

    const created = await client
      .post('/api/v1/links')
      .json({
        slug: '  api-docs  ',
        destinationUrl: DESTINATION,
        title: 'API docs',
        description: '  Canonical docs  ',
      })
      .loginAs(user)

    created.assertCreated()
    created.assertBodyContains({
      slug: 'api-docs',
      description: 'Canonical docs',
    })

    const duplicate = await client
      .post('/api/v1/links')
      .json({
        slug: 'api-docs',
        destinationUrl: 'https://docs.example.com/other',
        title: 'Other docs',
      })
      .loginAs(user)

    duplicate.assertConflict()
    duplicate.assertBodyContains({
      error: "Shortcut 'go/api-docs' already exists in this scope.",
    })
  })

  test('accepts hyphen, underscore, slash, and mixed-case aliases as stored', async ({
    client,
  }) => {
    const user = await createOwner()

    const response = await client
      .post('/api/v1/links')
      .json({
        slug: 'Release_Notes/2026-Q4',
        destinationUrl: DESTINATION,
        title: 'Release notes',
      })
      .loginAs(user)

    response.assertCreated()
    response.assertBodyContains({ slug: 'Release_Notes/2026-Q4' })
  })

  test('lowercases tags and attaches them to the new shortcut', async ({ client, assert }) => {
    const user = await createOwner()

    const response = await client
      .post('/api/v1/links')
      .json({
        slug: 'oncall',
        destinationUrl: DESTINATION,
        title: 'On call',
        tags: ['DevOps', 'API'],
      })
      .loginAs(user)

    response.assertCreated()
    const body = response.body() as { tags: { name: string }[] }
    assert.deepEqual(body.tags.map((tag) => tag.name).sort(), ['api', 'devops'])
  })

  test('allows the same alias in a different team scope', async ({ client, assert }) => {
    const user = await createOwner()
    const platform = await createTeam('platform', 'Platform')
    const sprint = await createTeam('sprint', 'Sprint')

    const first = await client
      .post('/api/v1/links')
      .json({
        slug: 'board',
        destinationUrl: 'https://example.com/platform-board',
        title: 'Platform board',
        teamId: platform.id,
      })
      .loginAs(user)
    const second = await client
      .post('/api/v1/links')
      .json({
        slug: 'board',
        destinationUrl: 'https://example.com/sprint-board',
        title: 'Sprint board',
        teamId: sprint.id,
      })
      .loginAs(user)

    first.assertCreated()
    second.assertCreated()
    first.assertBodyContains({ slug: 'board', teamId: platform.id })
    second.assertBodyContains({ slug: 'board', teamId: sprint.id })

    const links = await Link.query().where('slug', 'board')
    assert.lengthOf(links, 2)
  })

  test('rejects an anonymous create', async ({ client, assert }) => {
    const response = await client.post('/api/v1/links').json({
      slug: 'api-docs',
      destinationUrl: DESTINATION,
      title: 'API docs',
    })

    response.assertUnauthorized()
    const rows = await Link.query()
    assert.lengthOf(rows, 0)
  })

  test('rejects a bearer token that is not an access token', async ({ client }) => {
    const response = await client
      .post('/api/v1/links')
      .json({
        slug: 'api-docs',
        destinationUrl: DESTINATION,
        title: 'API docs',
      })
      .bearerToken('not-a-real-token')

    response.assertUnauthorized()
  })

  test('rejects aliases outside letters, numbers, hyphens, underscores, and slashes', async ({
    client,
    assert,
  }) => {
    const user = await createOwner()

    for (const slug of ['two words', 'docs!', '.hidden', 'notes.com']) {
      const response = await client
        .post('/api/v1/links')
        .json({
          slug,
          destinationUrl: DESTINATION,
          title: 'API docs',
        })
        .loginAs(user)

      response.assertUnprocessableEntity()
      assert.include(
        validationFields(response.body()),
        'slug',
        `expected slug to be rejected: ${slug}`
      )
    }
  })

  test('rejects a blank alias', async ({ client, assert }) => {
    const user = await createOwner()

    const response = await client
      .post('/api/v1/links')
      .json({
        slug: '   ',
        destinationUrl: DESTINATION,
        title: 'API docs',
      })
      .loginAs(user)

    response.assertUnprocessableEntity()
    assert.include(validationFields(response.body()), 'slug')
  })

  test('rejects a destination that is not a URL', async ({ client, assert }) => {
    const user = await createOwner()

    const response = await client
      .post('/api/v1/links')
      .json({
        slug: 'api-docs',
        destinationUrl: 'not a url',
        title: 'API docs',
      })
      .loginAs(user)

    response.assertUnprocessableEntity()
    assert.include(validationFields(response.body()), 'destinationUrl')
  })

  test('rejects a missing title', async ({ client, assert }) => {
    const user = await createOwner()

    const response = await client
      .post('/api/v1/links')
      .json({
        slug: 'api-docs',
        destinationUrl: DESTINATION,
      })
      .loginAs(user)

    response.assertUnprocessableEntity()
    assert.include(validationFields(response.body()), 'title')
  })

  test('rejects a title longer than 255 characters', async ({ client, assert }) => {
    const user = await createOwner()

    const response = await client
      .post('/api/v1/links')
      .json({
        slug: 'api-docs',
        destinationUrl: DESTINATION,
        title: 'a'.repeat(256),
      })
      .loginAs(user)

    response.assertUnprocessableEntity()
    assert.include(validationFields(response.body()), 'title')
  })

  test('rejects a duplicate alias in the global scope', async ({ client, assert }) => {
    const user = await createOwner()
    const payload = {
      slug: 'standup',
      destinationUrl: DESTINATION,
      title: 'Standup',
    }

    const created = await client.post('/api/v1/links').json(payload).loginAs(user)
    const duplicate = await client.post('/api/v1/links').json(payload).loginAs(user)

    created.assertCreated()
    duplicate.assertConflict()
    duplicate.assertBodyContains({
      error: "Shortcut 'go/standup' already exists in this scope.",
    })

    const links = await Link.query().where('slug', 'standup').whereNull('team_id')
    assert.lengthOf(links, 1)
  })

  test('rejects a duplicate alias inside the same team', async ({ client, assert }) => {
    const user = await createOwner()
    const team = await createTeam()
    const payload = {
      slug: 'board',
      destinationUrl: DESTINATION,
      title: 'Board',
      teamId: team.id,
    }

    const created = await client.post('/api/v1/links').json(payload).loginAs(user)
    const duplicate = await client
      .post('/api/v1/links')
      .json({
        ...payload,
        destinationUrl: 'https://example.com/other-board',
      })
      .loginAs(user)

    created.assertCreated()
    duplicate.assertConflict()
    duplicate.assertBodyContains({
      error: "Shortcut 'go/board' already exists in this scope.",
    })

    const links = await Link.query().where('slug', 'board').where('team_id', team.id)
    assert.lengthOf(links, 1)
  })
})

test.group('Link deployment / resolving short links', (group) => {
  isolateDatabase(group)

  test('redirects an active global shortcut and counts each click', async ({ client, assert }) => {
    const user = await createOwner()
    const created = await client
      .post('/api/v1/links')
      .json({
        slug: 'api-docs',
        destinationUrl: DESTINATION,
        title: 'API docs',
      })
      .loginAs(user)
    created.assertCreated()

    const first = await client.get('/go/api-docs').redirects(0)
    const second = await client.get('/go/api-docs').redirects(0)

    first.assertStatus(302)
    second.assertStatus(302)
    first.assertHeader('location', DESTINATION)
    second.assertHeader('location', DESTINATION)

    const link = await Link.findByOrFail('slug', 'api-docs')
    assert.equal(Number(link.clickCount), 2)
  })

  test('redirects a team shortcut through /go/:teamSlug/:linkSlug', async ({ client, assert }) => {
    const user = await createOwner()
    const team = await createTeam('sprint', 'Sprint')
    const created = await client
      .post('/api/v1/links')
      .json({
        slug: 'tasks',
        destinationUrl: DESTINATION,
        title: 'Sprint tasks',
        teamId: team.id,
      })
      .loginAs(user)
    created.assertCreated()

    const response = await client.get('/go/sprint/tasks').redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', DESTINATION)
    const link = await Link.findByOrFail('slug', 'tasks')
    assert.equal(Number(link.clickCount), 1)
  })

  test('does not resolve a team shortcut from the global alias path', async ({
    client,
    assert,
  }) => {
    const user = await createOwner()
    const team = await createTeam('sprint', 'Sprint')
    await client
      .post('/api/v1/links')
      .json({
        slug: 'tasks',
        destinationUrl: DESTINATION,
        title: 'Sprint tasks',
        teamId: team.id,
      })
      .loginAs(user)

    const response = await client.get('/go/tasks').redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', portalFallback('tasks'))
    const link = await Link.findByOrFail('slug', 'tasks')
    assert.equal(Number(link.clickCount), 0)
  })

  test('does not resolve a global shortcut as another team alias', async ({ client, assert }) => {
    const user = await createOwner()
    await createTeam('sprint', 'Sprint')
    await client
      .post('/api/v1/links')
      .json({
        slug: 'tasks',
        destinationUrl: DESTINATION,
        title: 'Global tasks',
      })
      .loginAs(user)

    const response = await client.get('/go/sprint/tasks').redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', portalFallback('tasks'))
    const link = await Link.findByOrFail('slug', 'tasks')
    assert.equal(Number(link.clickCount), 0)
  })

  test('sends an unknown alias to the portal instead of a destination', async ({ client }) => {
    const response = await client.get('/go/missing-docs').redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', portalFallback('missing-docs'))
  })

  test('sends an unknown team to the portal', async ({ client }) => {
    const response = await client.get('/go/missing-team/tasks').redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', portalFallback('tasks'))
  })

  test('does not redirect an inactive shortcut', async ({ client, assert }) => {
    const user = await createOwner()
    await Link.create({
      slug: 'old-docs',
      destinationUrl: DESTINATION,
      title: 'Old docs',
      description: null,
      teamId: null,
      userId: user.id,
      isActive: false,
      healthStatus: 'healthy',
      clickCount: 4,
    })

    const response = await client.get('/go/old-docs').redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', portalFallback('old-docs'))
    const link = await Link.findByOrFail('slug', 'old-docs')
    assert.equal(Number(link.clickCount), 4)
  })

  test('does not redirect a soft-deleted shortcut', async ({ client, assert }) => {
    const user = await createOwner()
    await Link.create({
      slug: 'retired',
      destinationUrl: DESTINATION,
      title: 'Retired',
      description: null,
      teamId: null,
      userId: user.id,
      isActive: true,
      healthStatus: 'healthy',
      clickCount: 3,
      deletedAt: DateTime.utc(),
    })

    const response = await client.get('/go/retired').redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', portalFallback('retired'))
    const link = await Link.findByOrFail('slug', 'retired')
    assert.equal(Number(link.clickCount), 3)
  })

  test('matches the stored alias with case sensitivity', async ({ client, assert }) => {
    const user = await createOwner()
    await client
      .post('/api/v1/links')
      .json({
        slug: 'API-Docs',
        destinationUrl: DESTINATION,
        title: 'API docs',
      })
      .loginAs(user)

    const exact = await client.get('/go/API-Docs').redirects(0)
    const lower = await client.get('/go/api-docs').redirects(0)

    exact.assertStatus(302)
    exact.assertHeader('location', DESTINATION)
    lower.assertStatus(302)
    lower.assertHeader('location', portalFallback('api-docs'))

    const link = await Link.findByOrFail('slug', 'API-Docs')
    assert.equal(Number(link.clickCount), 1)
  })
})
