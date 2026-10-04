import type { HttpContext } from '@adonisjs/core/http'
import Link from '#models/link'
import Team from '#models/team'

export default class RedirectsController {
  /**
   * GET /go/:linkSlug
   * Resolves global shortcuts (team_id is null)
   */
  async resolveGlobal({ params, response }: HttpContext) {
    const { linkSlug } = params

    const link = await Link.query()
      .where('slug', linkSlug)
      .whereNull('team_id')
      .where('is_active', true)
      .whereNull('deleted_at')
      .first()

    if (!link) {
      // Fallback: send user to web portal with slug ready to create
      return response.redirect(
        `http://localhost:3000/?search=${encodeURIComponent(linkSlug)}&notFound=true`
      )
    }

    // Atomic increment for click counter
    await link.merge({ clickCount: link.clickCount + 1 }).save()

    return response.redirect(link.destinationUrl)
  }

  /**
   * GET /go/:teamSlug/:linkSlug
   * Resolves team-scoped shortcuts (e.g., go/sprint/tasks)
   */
  async resolveScoped({ params, response }: HttpContext) {
    const { teamSlug, linkSlug } = params

    const team = await Team.findBy('slug', teamSlug)
    if (!team) {
      return response.redirect(
        `http://localhost:3000/?search=${encodeURIComponent(linkSlug)}&notFound=true`
      )
    }

    const link = await Link.query()
      .where('slug', linkSlug)
      .where('team_id', team.id)
      .where('is_active', true)
      .whereNull('deleted_at')
      .first()

    if (!link) {
      return response.redirect(
        `http://localhost:3000/?search=${encodeURIComponent(linkSlug)}&notFound=true`
      )
    }

    await link.merge({ clickCount: link.clickCount + 1 }).save()

    return response.redirect(link.destinationUrl)
  }
}
