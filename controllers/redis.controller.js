import redis from "../services/redisClient.service.js";  // Import the singleton Redis client
import { logger } from "../logs/logger.js"
// Set value with optional expiration
export const setCache = async (key, value, ttl = process.env.REDIS_TTL) => {
    try {
        await redis.set(key, JSON.stringify(value), "EX", ttl);
        logger.info(`Cache set for key: ${key}`);
    } catch (error) {
        logger.error(`Error setting cache: ${error}`);
        throw new Error("Redis set operation failed.");
    }
};

// Get value from Redis cache
export const getCache = async (key) => {
    try {
        const data = await redis.get(key);
        if (data) {
            
            logger.info(`Cache hit for key: ${key}`);
            return JSON.parse(data);  // Parse JSON to object
        }
        logger.info(`Cache miss for key: ${key}`);
        return null;
    } catch (error) {
        logger.error(`Error getting cache: ${error}`);
        throw new Error("Redis get operation failed.");
    }
};

// Delete a key from Redis (optional)
export const deleteCache = async (key) => {
    try {
        await redis.del(key);
        logger.info(`Cache deleted for key: ${key}`);
    } catch (error) {
        logger.error(`Error deleting cache: ${error}`);
        throw new Error("Redis delete operation failed.");
    }
};
