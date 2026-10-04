import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Link from '#models/link'
import Tag from '#models/tag'
import vine from '@vinejs/vine'

export default class LinksController {
  /**
   * GET /api/v1/links
   * Powers the catalog and autocomplete popover:
   * Supports: ?query=sprint/t or ?tag=devops
   */
  async index({ request, response }: HttpContext) {
    const search = request.input('query', '').trim()
    const tag = request.input('tag', '').trim()

    const query = Link.query()
      .whereNull('deleted_at')
      .preload('team')
      .preload('tags')
      .orderBy('click_count', 'desc')

    if (search) {
      query.where((builder) => {
        builder
          .whereILike('slug', `%${search}%`)
          .orWhereILike('title', `%${search}%`)
          .orWhereILike('destination_url', `%${search}%`)
      })
    }

    if (tag) {
      query.whereHas('tags', (tagQuery) => {
        tagQuery.where('name', tag)
      })
    }

    const links = await query.limit(25)
    return response.ok(links)
  }

  /**
   * POST /api/v1/links
   * Validates and registers a new shortcut
   */
  async store({ request, response }: HttpContext) {
    const validator = vine.compile(
      vine.object({
        slug: vine
          .string()
          .trim()
          .regex(/^[a-zA-Z0-9-_/]+$/),
        destinationUrl: vine.string().trim().url(),
        title: vine.string().trim().maxLength(255),
        description: vine.string().trim().optional(),
        teamId: vine.number().optional(),
        userId: vine.number(),
        tags: vine.array(vine.string()).optional(),
      })
    )

    const payload = await request.validateUsing(validator)

    // Check collision in target scope
    const existing = await Link.query()
      .where('slug', payload.slug)
      .where((b) => {
        if (payload.teamId) {
          b.where('team_id', payload.teamId)
        } else {
          b.whereNull('team_id')
        }
      })
      .whereNull('deleted_at')
      .first()

    if (existing) {
      return response.conflict({
        error: `Shortcut 'go/${payload.slug}' already exists in this scope.`,
      })
    }

    const link = await Link.create({
      slug: payload.slug,
      destinationUrl: payload.destinationUrl,
      title: payload.title,
      description: payload.description || null,
      teamId: payload.teamId || null,
      userId: payload.userId,
      isActive: true,
      healthStatus: 'healthy',
      clickCount: 0,
    })

    // Attach tags if provided
    if (payload.tags && payload.tags.length > 0) {
      const tagIds: number[] = []
      for (const tagName of payload.tags) {
        const tag = await Tag.firstOrCreate({ name: tagName.toLowerCase() })
        tagIds.push(tag.id)
      }
      await link.related('tags').attach(tagIds)
    }

    await link.load('tags')
    await link.load('team')

    return response.created(link)
  }

  /**
   * GET /api/v1/links/:id
   */
  async show({ params, response }: HttpContext) {
    const link = await Link.query()
      .where('id', params.id)
      .whereNull('deleted_at')
      .preload('team')
      .preload('tags')
      .first()

    if (!link) {
      return response.notFound({ error: 'Link not found' })
    }

    return response.ok(link)
  }

  /**
   * DELETE /api/v1/links/:id
   * Soft deletes a shortcut
   */
  async destroy({ params, response }: HttpContext) {
    const link = await Link.find(params.id)
    if (!link) {
      return response.notFound({ error: 'Link not found' })
    }

    await link.merge({ deletedAt: DateTime.now(), isActive: false }).save()
    return response.ok({ message: 'Shortcut deleted successfully' })
  }
}
