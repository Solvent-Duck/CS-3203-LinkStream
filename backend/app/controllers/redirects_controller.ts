import type { HttpContext } from '@adonisjs/core/http'
import { resolveRedirect } from '#services/redirect_service'

function portalFallback(linkSlug: string) {
  return `http://localhost:3000/?search=${encodeURIComponent(linkSlug)}&notFound=true`
}

export default class RedirectsController {
  /**
   * GET /go/:linkSlug
   * Resolves global shortcuts (team_id is null)
   */
  async resolveGlobal({ params, response }: HttpContext) {
    const { linkSlug } = params

    const link = await resolveRedirect(linkSlug)
    if (!link) {
      // Fallback: send user to web portal with slug ready to create
      return response.redirect(portalFallback(linkSlug))
    }

    return response.redirect(link.destinationUrl)
  }

  /**
   * GET /go/:teamSlug/:linkSlug
   * Resolves team-scoped shortcuts (e.g., go/sprint/tasks)
   */
  async resolveScoped({ params, response }: HttpContext) {
    const { teamSlug, linkSlug } = params

    const link = await resolveRedirect(linkSlug, teamSlug)
    if (!link) {
      return response.redirect(portalFallback(linkSlug))
    }

    return response.redirect(link.destinationUrl)
  }
}
