exports.up = function(knex) {
  return knex.schema
    .createTable('users', table => {
      table.increments('id').primary();
      table.string('username', 50).unique().notNullable();
      table.string('email', 100).unique().notNullable();
      table.string('password_hash').notNullable();
      table.string('display_name', 100);
      table.text('avatar');
      table.text('bio');
      table.enum('role', ['user', 'admin']).defaultTo('user');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    })
    .createTable('games', table => {
      table.increments('id').primary();
      table.string('name', 100).notNullable();
      table.string('slug', 50).unique().notNullable();
      table.text('description');
      table.text('instructions');
      table.integer('board_width').defaultTo(10);
      table.integer('board_height').defaultTo(10);
      table.boolean('enabled').defaultTo(true);
      table.string('category', 50);
      table.timestamps(true, true);
    })
    .createTable('game_saves', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.string('game_slug', 50).notNullable();
      table.text('state_json').notNullable();
      table.integer('score').defaultTo(0);
      table.string('save_name', 100);
      table.timestamps(true, true);
    })
    .createTable('game_scores', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.string('game_slug', 50).notNullable();
      table.integer('score').defaultTo(0);
      table.integer('duration').defaultTo(0);
      table.string('result', 20);
      table.timestamps(true, true);
    })
    .createTable('friends', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.integer('friend_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.enum('status', ['pending', 'accepted', 'rejected']).defaultTo('pending');
      table.timestamps(true, true);
      table.unique(['user_id', 'friend_id']);
    })
    .createTable('messages', table => {
      table.increments('id').primary();
      table.integer('sender_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.integer('receiver_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.text('content').notNullable();
      table.boolean('is_read').defaultTo(false);
      table.timestamps(true, true);
    })
    .createTable('achievements', table => {
      table.increments('id').primary();
      table.string('name', 100).notNullable();
      table.text('description');
      table.string('icon', 50);
      table.string('game_slug', 50);
      table.string('condition_type', 50);
      table.integer('condition_value').defaultTo(1);
      table.timestamps(true, true);
    })
    .createTable('user_achievements', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.integer('achievement_id').unsigned().references('id').inTable('achievements').onDelete('CASCADE');
      table.timestamp('unlocked_at').defaultTo(knex.fn.now());
      table.unique(['user_id', 'achievement_id']);
    })
    .createTable('ratings', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.string('game_slug', 50).notNullable();
      table.integer('rating').notNullable();
      table.text('comment');
      table.timestamps(true, true);
      table.unique(['user_id', 'game_slug']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('ratings')
    .dropTableIfExists('user_achievements')
    .dropTableIfExists('achievements')
    .dropTableIfExists('messages')
    .dropTableIfExists('friends')
    .dropTableIfExists('game_scores')
    .dropTableIfExists('game_saves')
    .dropTableIfExists('games')
    .dropTableIfExists('users');
};
