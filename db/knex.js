const path = require('path');

// ✅ Load .env from project root (fixes CLI + db folder issue)
require('dotenv').config({
    path: path.resolve(__dirname, '../.env'),
});

const { knexSnakeCaseMappers } = require('objection');

// ✅ Shared config (avoid duplication)
const baseConfig = {
    migrations: {
        directory: path.join(__dirname, 'migrations'),
    },
    seeds: {
        directory: path.join(__dirname, 'seeds'),
    },
    ...knexSnakeCaseMappers(),
};

module.exports = {
    development: {
        client: 'pg',
        connection: {
            host: process.env.DB_HOST || '127.0.0.1',
            port: Number(process.env.DB_PORT) || 5432,
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'postgres',
        },
        ...baseConfig,
    },

    production: {
        client: 'pg',
        connection: process.env.DATABASE_URL
            ? {
                connectionString: process.env.DATABASE_URL,
                ssl: { rejectUnauthorized: false }, // ✅ required for cloud DBs
            }
            : {
                host: process.env.DB_HOST,
                port: Number(process.env.DB_PORT) || 5432,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
            },
        ...baseConfig,
    },
};