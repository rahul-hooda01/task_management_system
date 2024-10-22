import Redis from "ioredis";
import dotenv from "dotenv";
import {logger} from "../logs/logger.js"
// Load environment variables
dotenv.config();
logger.info(`in redis --------------------test logs--------------->process.env.REDIS_HOST: ${process.env.REDIS_HOST}`);
class RedisClient {
    constructor() {
        if (!RedisClient.instance) {
            RedisClient.instance = new Redis({
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT,
                password: process.env.REDIS_PASSWORD || undefined,
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
