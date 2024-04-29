import pkg from 'pg';

import dotenv from "dotenv";

dotenv.config();

export const pool = new pkg.Pool({
    host: process.env.POSTGRESQL_HOST || '127.0.0.1',
    database: process.env.POSTGRESQL_DATABASE || 'radius',
    user: process.env.POSTGRESQL_USER || 'radius',
    password: process.env.POSTGRESQL_PASSWORD || 'radpass',
    port: parseInt(process.env.POSTGRESQL_PORT || "5432") || 5432,
});

export const db = {
    query: async (text, params) => {
        const client = await pool.connect();
        try {
            return client.query(text, params);
        } finally {
            client.release();
        }
    }
};
