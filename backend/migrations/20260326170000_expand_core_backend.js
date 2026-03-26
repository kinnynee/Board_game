/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  const hasIsActive = await knex.schema.hasColumn('users', 'is_active');

  if (!hasIsActive) {
    await knex.schema.alterTable('users', (table) => {
      table.boolean('is_active').notNullable().defaultTo(true);
    });
  }

  await knex.schema.createTable('games', (table) => {
    table.increments('id').primary();
    table.string('slug', 80).notNullable().unique();
    table.string('name', 120).notNullable();
    table.text('description').defaultTo('');
    table.string('board_size', 30).defaultTo('');
    table.boolean('is_enabled').notNullable().defaultTo(true);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('game_saves', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('game_id').unsigned().notNullable().references('id').inTable('games').onDelete('CASCADE');
    table.string('save_name', 120).notNullable();
    table.jsonb('state_json').notNullable();
    table.integer('score').notNullable().defaultTo(0);
    table.integer('duration_seconds').notNullable().defaultTo(0);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('game_scores', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('game_id').unsigned().notNullable().references('id').inTable('games').onDelete('CASCADE');
    table.integer('score').notNullable().defaultTo(0);
    table.string('result', 20).notNullable().defaultTo('completed');
    table.integer('duration_seconds').notNullable().defaultTo(0);
    table.jsonb('metadata_json').defaultTo('{}');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('ratings', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('game_id').unsigned().notNullable().references('id').inTable('games').onDelete('CASCADE');
    table.integer('rating').notNullable();
    table.text('comment').defaultTo('');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    table.unique(['user_id', 'game_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('ratings');
  await knex.schema.dropTableIfExists('game_scores');
  await knex.schema.dropTableIfExists('game_saves');
  await knex.schema.dropTableIfExists('games');

  const hasIsActive = await knex.schema.hasColumn('users', 'is_active');

  if (hasIsActive) {
    await knex.schema.alterTable('users', (table) => {
      table.dropColumn('is_active');
    });
  }
};
