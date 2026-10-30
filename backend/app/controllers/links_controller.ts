import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Link from '#models/link'
import vine from '@vinejs/vine'
import { tagNameSchema } from '#validators/tag'
import { destinationUrlSchema, linkSlugSchema, linkTitleSchema } from '#validators/link'
import {
  createLink,
  findSlugConflict,
  resolveTagIds,
  SlugConflictError,
} from '#services/link_service'

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
  async store({ request, response, auth }: HttpContext) {
    const validator = vine.compile(
      vine.object({
        slug: linkSlugSchema(),
        destinationUrl: destinationUrlSchema(),
        title: linkTitleSchema(),
        description: vine.string().trim().optional(),
        teamId: vine.number().optional(),
        tags: vine.array(tagNameSchema()).distinct().optional(),
      })
    )

    const payload = await request.validateUsing(validator)
    const user = auth.getUserOrFail()

    let link
    try {
      link = await createLink({ ...payload, userId: user.id })
    } catch (error) {
      if (error instanceof SlugConflictError) {
        return response.conflict({ error: error.message })
      }
      throw error
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
   * PATCH /api/v1/links/:id
   * Updates shortcut metadata and replaces tags when supplied.
   */
  async update({ params, request, response }: HttpContext) {
    const validator = vine.compile(
      vine.object({
        slug: linkSlugSchema().optional(),
        destinationUrl: destinationUrlSchema().optional(),
        title: linkTitleSchema().optional(),
        description: vine.string().trim().optional(),
        tags: vine.array(tagNameSchema()).distinct().optional(),
      })
    )

    const payload = await request.validateUsing(validator)
    const link = await Link.query().where('id', params.id).whereNull('deleted_at').first()

    if (!link) {
      return response.notFound({ error: 'Link not found' })
    }

    if (payload.slug && payload.slug !== link.slug) {
      const existing = await findSlugConflict(payload.slug, link.teamId, link.id)

      if (existing) {
        return response.conflict({
          error: new SlugConflictError(payload.slug).message,
        })
      }
    }

    await link
      .merge({
        slug: payload.slug ?? link.slug,
        destinationUrl: payload.destinationUrl ?? link.destinationUrl,
        title: payload.title ?? link.title,
        description:
          payload.description === undefined ? link.description : payload.description || null,
      })
      .save()

    if (payload.tags !== undefined) {
      await link.related('tags').sync(await resolveTagIds(payload.tags))
    }

    await link.load('tags')
    await link.load('team')
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
