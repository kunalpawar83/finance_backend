exports.up = async function (knex) {
    // 1. Create roles table first
    await knex.schema.createTable('roles', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable().unique();
        table.timestamps(true, true);
    });

    // 2. Create users table
    await knex.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('email').notNullable().unique();
        table.string('password').notNullable();

        table
            .integer('role_id') // ✅ snake_case (important)
            .unsigned()
            .references('id')
            .inTable('roles')
            .onDelete('CASCADE');

        table.enum('status', ['A', 'I']).defaultTo('A');

        table.timestamps(true, true);
    });
};

exports.down = async function (knex) {
    // Drop in reverse order (FK dependency)
    await knex.schema.dropTableIfExists('users');
    await knex.schema.dropTableIfExists('roles');
};