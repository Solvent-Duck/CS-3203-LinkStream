import { test } from '@japa/runner'
import vine from '@vinejs/vine'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import Team from '#models/team'
import User from '#models/user'
import {
  destinationUrlSchema,
  linkSlugSchema,
  linkTitleSchema,
  MAX_TITLE_LENGTH,
} from '#validators/link'
import { createLink, SlugConflictError } from '#services/link_service'
import { resolveRedirect } from '#services/redirect_service'

// Sprint 1 core logic: slug validation, destination URL validation,
// link creation/storage, and redirect resolution with click counting.

const TABLES = [
  'link_tags',
  'auth_access_tokens',
  'links',
  'tags',
  'team_members',
  'teams',
  'users',
]

const DESTINATION = 'https://discord.gg/cs3203'

// Helpers: run a value through a schema.
// if valid: resolves the cleaned value
// if invalid: throws a validation error for assert.rejects
const validateSlug = (value: unknown) => vine.compile(linkSlugSchema()).validate(value)
const validateUrl = (value: unknown) => vine.compile(destinationUrlSchema()).validate(value)
const validateTitle = (value: unknown) => vine.compile(linkTitleSchema()).validate(value)

/**
 * Delete rows before each test so every test starts from an empty database.
 * Schema comes from `node ace migration:run`.
 */
function isolateDatabase(group: { each: { setup: (hook: () => Promise<void>) => void } }) {
  group.each.setup(async () => {
    for (const table of TABLES) {
      await db.from(table).delete()
    }
  })
}

async function createOwner() {
  return User.create({ fullName: 'Link Owner', email: 'owner@example.com', password: 'secret-123' })
}

async function createTeam(slug = 'group-a') {
  return Team.create({ name: 'Group A', slug, description: null })
}

test.group('Sprint 1 / slug validation', () => {
  test('accepts letters, numbers, hyphens, underscores, and slashes')
    .with(['team-docs', 'cs3203_project', 'canvas2026', 'go', 'sprint/tasks', 'API-Docs'])
    .run(async ({ assert }, slug) => {
      assert.equal(await validateSlug(slug), slug)
    })

  test('trims surrounding whitespace', async ({ assert }) => {
    assert.equal(await validateSlug('  team-docs  '), 'team-docs')
  })

  test('rejects spaces and special characters')
    .with(['bad slug with spaces', 'link@special!', 'go?q=1', 'emoji🙂', 'dot.slug'])
    .run(async ({ assert }, slug) => {
      await assert.rejects(() => validateSlug(slug))
    })

  test('rejects blank and non-string slugs')
    .with(['', '   ', null, undefined, 123])
    .run(async ({ assert }, slug) => {
      await assert.rejects(() => validateSlug(slug))
    })
})

test.group('Sprint 1 / destination URL and title validation', () => {
  test('trims whitespace around the destination URL', async ({ assert }) => {
    assert.equal(
      await validateUrl('   https://canvas.ou.edu/courses/12345   '),
      'https://canvas.ou.edu/courses/12345'
    )
  })

  test('rejects script, file, and malformed destinations')
    .with(['javascript:alert(1)', 'file:///etc/passwd', 'not a url', ''])
    .run(async ({ assert }, url) => {
      await assert.rejects(() => validateUrl(url))
    })

  test('accepts a title at the maximum length', async ({ assert }) => {
    const title = 'a'.repeat(MAX_TITLE_LENGTH)
    assert.equal(await validateTitle(title), title)
  })

  test('rejects a title one character over the maximum', async ({ assert }) => {
    await assert.rejects(() => validateTitle('a'.repeat(MAX_TITLE_LENGTH + 1)))
  })
})

test.group('Sprint 1 / link creation and storage', (group) => {
  isolateDatabase(group)

  test('creates an active global link with zero clicks', async ({ assert }) => {
    const owner = await createOwner()

    const link = await createLink({
      slug: 'discord-invite',
      destinationUrl: DESTINATION,
      title: 'Discord invite',
      userId: owner.id,
    })

    await link.refresh()
    assert.equal(link.slug, 'discord-invite')
    assert.equal(link.destinationUrl, DESTINATION)
    assert.equal(link.clickCount, 0)
    assert.isTrue(Boolean(link.isActive))
    assert.equal(link.healthStatus, 'healthy')
    assert.isNull(link.teamId)
    assert.isNull(link.description)
    assert.equal(link.userId, owner.id)
  })

  test('stores tags in lowercase', async ({ assert }) => {
    const owner = await createOwner()

    const link = await createLink({
      slug: 'ci-docs',
      destinationUrl: DESTINATION,
      title: 'CI docs',
      userId: owner.id,
      tags: ['DevOps', 'ci'],
    })

    await link.load('tags')
    assert.sameMembers(
      link.tags.map((tag) => tag.name),
      ['devops', 'ci']
    )
  })

  test('throws a conflict error on a duplicate slug in the same scope', async ({ assert }) => {
    const owner = await createOwner()
    const team = await createTeam()
    const payload = {
      slug: 'duplicate-test',
      destinationUrl: 'https://ou.edu',
      title: 'Duplicate',
      teamId: team.id,
      userId: owner.id,
    }

    await createLink(payload)
    await assert.rejects(() => createLink(payload), SlugConflictError)
  })

  test('allows the same slug in a different team', async ({ assert }) => {
    const owner = await createOwner()
    const teamA = await createTeam('group-a')
    const teamB = await createTeam('group-b')
    const base = {
      slug: 'standup',
      destinationUrl: DESTINATION,
      title: 'Standup',
      userId: owner.id,
    }

    const first = await createLink({ ...base, teamId: teamA.id })
    const second = await createLink({ ...base, teamId: teamB.id })

    assert.notEqual(first.id, second.id)
  })

  test('allows reusing a slug after the original is soft-deleted', async ({ assert }) => {
    const owner = await createOwner()
    const payload = {
      slug: 'reuse-me',
      destinationUrl: DESTINATION,
      title: 'Reuse',
      userId: owner.id,
    }

    const original = await createLink(payload)
    await original.merge({ deletedAt: DateTime.now(), isActive: false }).save()

    const replacement = await createLink(payload)
    assert.notEqual(replacement.id, original.id)
  })
})

test.group('Sprint 1 / redirect resolution and click counting', (group) => {
  isolateDatabase(group)

  test('resolves a global slug and counts each click', async ({ assert }) => {
    const owner = await createOwner()
    await createLink({
      slug: 'discord-invite',
      destinationUrl: DESTINATION,
      title: 'Discord invite',
      userId: owner.id,
    })

    const first = await resolveRedirect('discord-invite')
    assert.equal(first?.destinationUrl, DESTINATION)
    assert.equal(first?.clickCount, 1)

    const second = await resolveRedirect('discord-invite')
    assert.equal(second?.clickCount, 2)
  })

  test('resolves a team slug only through its team', async ({ assert }) => {
    const owner = await createOwner()
    const team = await createTeam('sprint')
    await createLink({
      slug: 'tasks',
      destinationUrl: DESTINATION,
      title: 'Sprint tasks',
      teamId: team.id,
      userId: owner.id,
    })

    const scoped = await resolveRedirect('tasks', 'sprint')
    assert.equal(scoped?.destinationUrl, DESTINATION)
    assert.isNull(await resolveRedirect('tasks'))
  })

  test('returns null for an unknown slug or unknown team', async ({ assert }) => {
    assert.isNull(await resolveRedirect('does-not-exist'))
    assert.isNull(await resolveRedirect('tasks', 'no-such-team'))
  })

  test('returns null and does not count clicks for inactive or deleted links', async ({
    assert,
  }) => {
    const owner = await createOwner()
    const base = { destinationUrl: DESTINATION, title: 'Hidden', userId: owner.id }
    const inactive = await createLink({ ...base, slug: 'inactive' })
    const deleted = await createLink({ ...base, slug: 'deleted' })
    await inactive.merge({ isActive: false }).save()
    await deleted.merge({ deletedAt: DateTime.now() }).save()

    assert.isNull(await resolveRedirect('inactive'))
    assert.isNull(await resolveRedirect('deleted'))

    await inactive.refresh()
    await deleted.refresh()
    assert.equal(inactive.clickCount, 0)
    assert.equal(deleted.clickCount, 0)
  })
})
