import Link from '#models/link'
import Team from '#models/team'
import { SLUG_PATTERN } from '#validators/link'

export const MAX_SLUG_LENGTH = 64

/**
 * Validates that a slug parameter is a non-empty string conforming
 * to the allowed characters (letters, numbers, hyphens, underscores, slashes)
 * and maximum column length (64 chars). Rejects SQL injection attempts,
 * spaces, quotes, and other special characters.
 */
export function isValidSlug(slug: unknown): slug is string {
  if (typeof slug !== 'string') {
    return false
  }
  const trimmed = slug.trim()
  if (!trimmed || trimmed.length > MAX_SLUG_LENGTH) {
    return false
  }
  return SLUG_PATTERN.test(trimmed)
}

/**
 * Finds the active, non-deleted link for a slug and counts the click.
 * Without teamSlug only global links (team_id is null) match.
 * Returns null when the team, link, or an active link is missing,
 * or when slug/parameter inputs fail validation.
 *
 * Uses parameterized queries with safe Lucid ORM query bindings to protect
 * against CWE-89 (SQL Injection) while preserving tenant scoping.
 */
export async function resolveRedirect(linkSlug: string, teamSlug?: string) {
  if (!isValidSlug(linkSlug)) {
    return null
  }

  let teamId: number | null = null

  if (teamSlug !== undefined) {
    if (!isValidSlug(teamSlug)) {
      return null
    }
    const cleanTeamSlug = teamSlug.trim()
    const team = await Team.query().where('slug', cleanTeamSlug).first()
    if (!team) {
      return null
    }
    teamId = team.id
  }

  const cleanLinkSlug = linkSlug.trim()
  const link = await Link.query()
    .where('slug', cleanLinkSlug)
    .where((builder) => {
      if (teamId !== null) {
        builder.where('team_id', teamId)
      } else {
        builder.whereNull('team_id')
      }
    })
    .where('is_active', true)
    .whereNull('deleted_at')
    .first()

  if (!link) {
    return null
  }

  await link.merge({ clickCount: link.clickCount + 1 }).save()
  return link
}
