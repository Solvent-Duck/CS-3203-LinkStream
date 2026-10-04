import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'links'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('slug', 64).notNullable()
      table.text('destination_url').notNullable()
      table.string('title', 255).notNullable()
      table.text('description').nullable()

      table
        .integer('team_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('teams')
        .onDelete('SET NULL')
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.bigInteger('click_count').notNullable().defaultTo(0)
      table
        .enum('health_status', ['healthy', 'degraded', 'broken'])
        .notNullable()
        .defaultTo('healthy')
      table.timestamp('last_health_check_at').nullable()
      table.boolean('is_active').notNullable().defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.timestamp('deleted_at').nullable()

      table.unique(['team_id', 'slug'])
      table.index(['slug'], 'links_slug_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
