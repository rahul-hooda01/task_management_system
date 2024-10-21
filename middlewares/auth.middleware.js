import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { logger } from "../logs/logger.js"


export const verifyJWT = asyncHandler(async(req,res,next)=>{
    // we have cookies acess because of cookie parsre used as  middleware in app.js

   try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearrer", "") // get token from cookies either from headers
 
     if(!token){
         logger.error("Unauthorization request");
         return res.status(400).json( new ApiError(401, "Unauthorization request"));
     }
 
     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
 
     const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
     if(!user){
         logger.error("Invalid or Expired Access Token");
         return res.status(400).json( new ApiError(404, "Invalid or Expired Access Token"));
     }
     req.user = user;
     next();
   } catch (error) {
      logger.error(`Authentication error: ${error?.message}`);
      return res.status(400).json( new ApiError(401, error?.message || "Invalid Access Token"));
   }

})
