import Link from '#models/link'
import Team from '#models/team'

/**
 * Finds the active, non-deleted link for a slug and counts the click.
 * Without teamSlug only global links (team_id is null) match.
 * Returns null when the team, link, or an active link is missing.
 */
export async function resolveRedirect(linkSlug: string, teamSlug?: string) {
  let teamId: number | null = null

  if (teamSlug !== undefined) {
    const team = await Team.findBy('slug', teamSlug)
    if (!team) {
      return null
    }
    teamId = team.id
  }

  const link = await Link.query()
    .where('slug', linkSlug)
    .where((builder) => {
      if (teamId) {
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
