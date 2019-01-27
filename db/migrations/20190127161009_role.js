exports.up = function(knex, Promise) {
  return knex.schema.createTable('role', table => {
    table
      .uuid('id')
      .primary()
      .unique()
      .defaultTo(knex.raw('gen_random_uuid()'))
    table
      .string('name')
      .unique()
      .notNullable()
    table.string('password').notNullable()
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('role')
}
