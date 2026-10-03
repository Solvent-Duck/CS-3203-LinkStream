import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'link_tags'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .integer('link_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('links')
        .onDelete('CASCADE')
      table
        .integer('tag_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('tags')
        .onDelete('CASCADE')

      table.primary(['link_id', 'tag_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
