import dotenv from "dotenv";

dotenv.config();

export const radiusConfig = {
    secret: process.env.RADIUS_SECRET || "testing123",
    port: parseInt(process.env.RADIUS_PORT || "") || 1812,
    host: process.env.RADIUS_HOST || "127.0.0.1",
};