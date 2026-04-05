require('dotenv').config();

const knex_lib = require('knex');
const { Model } = require('objection');


const db_config = {
    development: {
        client: 'pg',
        connection: {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 5432,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            charset: 'utf8',
        },
        migrations: {
            directory: './src/migrations',
        },
        seeds: {
            directory: './src/seeds',
        },
    },

    production: {
        client: 'pg',
        connection: process.env.database_url,
        migrations: {
            directory: './src/migrations',
        },
        seeds: {
            directory: './src/seeds',
        },
    },
};

const env = process.env.node_env || 'development';
const knex_instance = knex_lib(db_config[env]);

const setup_db = async () => {
    try {
        Model.knex(knex_instance);

        await knex_instance.raw('SELECT 1');

        console.log('✅ Database connection established successfully.');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        throw error;
    }
};

module.exports = {
    knex: knex_instance,
    setup_db,
};