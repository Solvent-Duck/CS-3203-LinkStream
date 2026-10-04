import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import TeamMember from '#models/team_member'
import Link from '#models/link'

export default class Team extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare slug: string

  @column()
  declare description: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasMany(() => TeamMember)
  declare members: HasMany<typeof TeamMember>

  @hasMany(() => TeamMember)
  declare teamMembers: HasMany<typeof TeamMember>

  @hasMany(() => Link)
  declare links: HasMany<typeof Link>
}
