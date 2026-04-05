const knex_lib = require('knex');
const { Model } = require('objection');
const config = require('./knex');

const environment = process.env.NODE_ENV || 'development';
const knex = knex_lib(config[environment]);

const setup_db = async () => {
    try {
        Model.knex(knex);

        await knex.raw('SELECT 1');

        console.log('✅ Database connected');
    } catch (error) {
        console.error('❌ DB connection failed:', error.message);
        throw error;
    }
};

module.exports = {
    knex,
    setup_db,
};