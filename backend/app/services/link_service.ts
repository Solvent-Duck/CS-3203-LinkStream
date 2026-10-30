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
 */
export async function resolveTagIds(tagNames: string[]) {
  const tagIds: number[] = []
  for (const tagName of tagNames) {
    const tag = await Tag.firstOrCreate({ name: tagName.toLowerCase() })
    tagIds.push(tag.id)
  }
  return tagIds
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
