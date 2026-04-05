/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('records', (table) => {
        table.increments('id').primary();
        table.integer('userId').unsigned().references('id').inTable('users').onDelete('CASCADE');
        table.decimal('amount', 15, 2).notNullable();
        table.enum('type', ['I', 'E']).notNullable();
        table.string("category").notNullable()
        table.date('date').notNullable();
        table.text('notes');
        table.boolean('isDelete').defaultTo(false);
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('records');
};

