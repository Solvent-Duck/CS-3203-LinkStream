import { BaseModel, belongsTo, column, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Team from '#models/team'
import User from '#models/user'
import Tag from '#models/tag'

export default class Link extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare slug: string

  @column()
  declare destinationUrl: string

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare teamId: number | null

  @column()
  declare userId: number

  @column()
  declare clickCount: number

  @column()
  declare healthStatus: 'healthy' | 'degraded' | 'broken'

  @column.dateTime()
  declare lastHealthCheckAt: DateTime | null

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @column.dateTime()
  declare deletedAt: DateTime | null

  @belongsTo(() => Team)
  declare team: BelongsTo<typeof Team>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @manyToMany(() => Tag, {
    pivotTable: 'link_tags',
  })
  declare tags: ManyToMany<typeof Tag>
}
