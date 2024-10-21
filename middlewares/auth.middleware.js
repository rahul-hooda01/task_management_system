import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { logger } from "../logs/logger.js";
import { getCache, setCache } from "../controllers/redis.controller.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || 
                      req.header("Authorization")?.replace("Bearer ", "").trim(); // Get token from cookies or headers.

        if (!token) {
            logger.error("Unauthorized request - No token provided");
            return res.status(401).json(new ApiError(401, "Unauthorized request"));
        }

        // Verify the JWT and get the user ID from the payload
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userId = decodedToken?._id;
        
        if (!userId) {
            logger.error("Invalid token payload");
            return res.status(401).json(new ApiError(401, "Invalid token"));
        }

        // Check if user data is cached in Redis
        let user = await getCache(`user:${userId}`);
        console.log('user--from redis--', user);
        if (!user) {
            // If not in cache, fetch from DB and cache the result
            user = await User.findById(userId).select("-password -refreshToken");
            if (!user) {
                logger.error("User not found or expired token");
                return res.status(404).json(new ApiError(404, "User not found"));
            }

            // Cache the user data with a TTL (e.g., 1 hour)
            await setCache(`user:${userId}`, user, 3600);
        }

        // Attach user data to the request object for further use in the route handlers
        req.user = user;
        next();
    } catch (error) {
        logger.error(`Authentication error: ${error?.message}`);
        return res.status(401).json(new ApiError(401, error?.message || "Invalid access token"));
    }
});
