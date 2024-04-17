import { Pool, QueryResult } from 'pg';
import dotenv from "dotenv";

dotenv.config();

interface QueryParams {
    [key: string]: any;
}

interface DatabaseClient {
    query: (text: string, params?: any[]) => Promise<QueryResult<any>>;
}

export const pool = new Pool({
    host: process.env.POSTGRESQL_HOST || '127.0.0.1',
    database: process.env.POSTGRESQL_DATABASE || 'radius',
    user: process.env.POSTGRESQL_USER || 'radius',
    password: process.env.POSTGRESQL_PASSWORD || 'radpass',
    port: parseInt(process.env.POSTGRESQL_PORT || "5432") || 5432,
});

export const db: DatabaseClient = {
    query: async (text: string, params?: any[]): Promise<QueryResult<any>> => {
        const client = await pool.connect();
        try {
            return await client.query(text, params);
        } finally {
            client.release();
        }
    },
};
