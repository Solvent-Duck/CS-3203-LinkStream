import Link from '#models/link'
import Tag from '#models/tag'

export type CreateLinkPayload = {
  slug: string
  destinationUrl: string
  title: string
  description?: string | null
  teamId?: number | null
  userId: number
  tags?: string[]
}

/**
 * Thrown when a slug is already taken in the target scope
 * (the same team, or the global scope when teamId is null).
 */
export class SlugConflictError extends Error {
  constructor(slug: string) {
    super(`Shortcut 'go/${slug}' already exists in this scope.`)
    this.name = 'SlugConflictError'
  }
}

/**
 * Returns the live link using this slug in the given scope, if any.
 * Pass excludeId to ignore the link being edited.
 */
export async function findSlugConflict(slug: string, teamId: number | null, excludeId?: number) {
  const query = Link.query()
    .where('slug', slug)
    .where((builder) => {
      if (teamId) {
        builder.where('team_id', teamId)
      } else {
        builder.whereNull('team_id')
      }
    })
    .whereNull('deleted_at')

  if (excludeId !== undefined) {
    query.where('id', '!=', excludeId)
  }

  return query.first()
}

/**
 * Resolves tag names to ids, creating missing tags (stored lowercase).
 *
 * CWE-770: looks up every tag in one query instead of one query per
 * tag, and only inserts the ones that are missing. The validator caps
 * the list at MAX_TAGS_PER_LINK, so the work per request stays bounded.
 */
export async function resolveTagIds(tagNames: string[]) {
  const names = [...new Set(tagNames.map((name) => name.toLowerCase()))]
  if (names.length === 0) {
    return []
  }

  const tags = await Tag.fetchOrCreateMany(
    'name',
    names.map((name) => ({ name }))
  )
  return tags.map((tag) => tag.id)
}

/**
 * Stores a new active shortcut with zero clicks.
 * Throws SlugConflictError when the slug is taken in the same scope.
 */
export async function createLink(payload: CreateLinkPayload) {
  const teamId = payload.teamId || null

  if (await findSlugConflict(payload.slug, teamId)) {
    throw new SlugConflictError(payload.slug)
  }

  const link = await Link.create({
    slug: payload.slug,
    destinationUrl: payload.destinationUrl,
    title: payload.title,
    description: payload.description || null,
    teamId,
    userId: payload.userId,
    isActive: true,
    healthStatus: 'healthy',
    clickCount: 0,
  })

  if (payload.tags && payload.tags.length > 0) {
    await link.related('tags').attach(await resolveTagIds(payload.tags))
  }

  return link
}
