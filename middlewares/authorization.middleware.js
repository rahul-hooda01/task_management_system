import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Middleware to verify if the user has an authorized role (e.g., Admin or Manager)
export const authorizeRoles = (...allowedRoles) =>
  asyncHandler(async (req, res, next) => {
    // Get user from JWT middleware
    const user = req.user;
    if (!user) {
      return res.status(400).json( new ApiError(404, "User not found"));
    }

    // Check if the user's role is in the allowed roles
    if (!allowedRoles.includes(user.role)) {
      return res.status(400).json( new ApiError(403, "Access denied, insufficient permissions"));
    }
    next();
});