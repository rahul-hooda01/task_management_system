import Redis from "ioredis";
import dotenv from "dotenv";
import { logger } from "../logs/logger.js";

// Load environment variables
dotenv.config();
logger.info(`In Redis --------------------test logs---------------> process.env.REDIS_URL: ${process.env.REDIS_URL}`);

class RedisClient {
    constructor() {
        if (!RedisClient.instance) {
            // Create a new Redis instance using the REDIS_URL environment variable
            RedisClient.instance = new Redis(process.env.REDIS_URL, {
                retryStrategy(times) {
                    const delay = Math.min(times * 50, 2000); // Retry every few seconds
                    return delay;
                },
            });

            RedisClient.instance.on("connect", () => {
                logger.info("Connected to Redis");
            });

            RedisClient.instance.on("error", (err) => {
                logger.error("Redis connection error:", err);
            });
        }

        return RedisClient.instance;
    }
}

const redis = new RedisClient();
export default redis;
