import Joi from "joi";
import jwt from "jsonwebtoken";

import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { logger } from "../logs/logger.js";


const generateAccessAndRefreshToken = async(user_id)=>{ // yhs p normal async use kiya kyuki isi file m handle krenge thoda sa response
try {
    const user = await User.findById(user_id)
    const accessToken = user.generateAccessToken(); //access token created and saved in to variable
    const refreshToken =user.generateRefreshToken();

    user.refreshToken = refreshToken;
    // user.save();  // refresh token saved in db
    //NOTE- when you save something in db mongoose's model gets kicked in,
    // thats mean it will try to find password and try to validate, and others field required true;
    // so we remove validation before save in it
    await user.save({validateBeforeSave: false});
    return {accessToken, refreshToken};

} catch (error) {
    logger.error('something went wrong while creating refreshToken');
    return res.status(500).json( new ApiError(500, 'something went wrong while creating refreshToken'));
}

}

// Define the Joi validation schema
const registerUserSchema = Joi.object({
    userName: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required()
        .messages({
            "string.base": "Username should be a type of 'text'.",
            "string.empty": "Username cannot be an empty field.",
            "string.min": "Username should have a minimum length of 3.",
            "string.max": "Username should have a maximum length of 30.",
            "any.required": "Username is a required field.",
        }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            "string.email": "Please provide a valid email address.",
            "string.empty": "Email cannot be an empty field.",
            "any.required": "Email is a required field.",
        }),
    password: Joi.string()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/)
        .required()
        .messages({
            "string.pattern.base":
                "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number.",
            "string.empty": "Password cannot be an empty field.",
            "any.required": "Password is a required field.",
        }),
    role: Joi.string()
        .valid("Admin", "Manager", "User")
        .default("User")
        .messages({
            "any.only": "Role must be one of the following: Admin, Manager, User.",
        }),
});

// Controller function for user registration
const registerUser = asyncHandler(async (req, res, next) => {
    const { userName, email, password, role } = req.body;
  
    // Validate the request body using Joi
    const { error } = registerUserSchema.validate({ userName, email, password, role });
    if (error) {
        return res.status(400).json( new ApiError(400, error.details[0].message));
    }
  
    // Check if a user already exists with the provided username or email
    const existingUser = await User.findOne({ 
      $or: [{ userName }, { email }]
    });
    if (existingUser) {
        return res.status(400).json( new ApiError(409, "User with Email & userName already exist"));
    }
  
    // Create the user object
    const user = await User.create({
        userName,
        email,
        password,
        role: role || 'User'
    });
  
    // Retrieve the created user (without password and refreshToken fields)
    const userCreated = await User.findById(user._id).select(
        "-password -refreshToken"  // except these two field all user data can be sent to frontend
    )
    if (!userCreated){
        logger.error("something went wrong while registering user");
        return res.status(500).json( new ApiError(500, "something went wrong while registering user"));
    }
    
    logger.info("user registered successfully");
    return res.status(201).json( // data return(res) to frontend
       new ApiResponse(200, userCreated, "user registered successfully")
    );
});


const loginUser = asyncHandler(async(req,res,next)=>{
    //get data from req.body, validate data( if empty or not, if available userName or email in db)
    // find the user, password check (jwt and hash things), give access token and refresh token in cookies

    try {
        const {email,password, userName}  = req.body;
    
        if(!((userName || email) && password)){
            return res.status(400).json( new ApiError(400, "Email/userName or password  required"));
        }
        // find user with help of userName or email
        const user = await User.findOne({ 
            $or : [{userName}, {email}]
        })

        if(!user){
            return res.status(400).json( new ApiError(400, "user does not exist"));
        }
        const isPasswordValid = await user.isPasswordCorrect(password); // check this function if it working or not

        if(!isPasswordValid){
            return res.status(400).json( new ApiError(401, "Invalid user credentials"));
        }
        const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id); 
        const loggedInUser =await User.findById(user._id).select("-password -refreshToken")
        
        // send cookies to frontend with user info
        const options = {
            httpOnly: true,  // Ensure the cookie is only accessible via HTTP(S)
            secure: process.env.NODE_ENV === 'production',  // Use 'secure' in production (HTTPS)
            sameSite: 'strict',  // Prevent CSRF attacks
        };
        
        return res.status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken',refreshToken,options)
        .json(
            new ApiResponse(200,
                {
                    user: loggedInUser  // sent in respose if frontend wants to use it
                },
                "user logged In sucessfully"
            )
        )
    } catch (error) {
        return res.status(500).json( new ApiError(501, error.message || "error in login"));
    }

})

const logoutUser = asyncHandler(async(req,res,next)=>{
    // cookies needs to be clear
    // clear refresh tocken
    User.findByIdAndUpdate(
       await req.user._id,
        {
            $set: {
                refreshToken:undefined
            }
        },
        {
            new: true  // do this new true so that will get reposnse back 
        }
    )
    const options = {
        httpOnly:true,
        secure:true
    }
    return res.status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken',options)
    .json(
        new ApiResponse(200,
            {},
            "user logged out sucessfully"
        )
    )
})

const refreshAcessToken = asyncHandler(async(req,res,next)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken; 
    if (!incomingRefreshToken){
        return res.status(400).json( new ApiError(401,  "unauthorized request"));
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id);
        if (!user){
            return res.status(500).json( new ApiError(501, "Invalid refresh Token"));
        }

        if(incomingRefreshToken!==user?.refreshToken){
            return res.status(400).json( new ApiError(401, "refresh Token is expired or used"));
        }
        //generate new token
        // generateAccessAndRefreshToken
        const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id);
        const options = {
            httpOnly: true,  // Ensure the cookie is only accessible via HTTP(S)
            secure: process.env.NODE_ENV === 'production',  // Use 'secure' in production (HTTPS)
            sameSite: 'strict',  // Prevent CSRF attacks
        };
        return res.status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken',refreshToken,options)
        .json(
            new ApiResponse(200,
                {},
                "Access token refreshed"
            )
        )
    } catch (error) {
        logger.error(`error in refresh access token: ${ error.message}`)
        return res.status(500).json( new ApiError(501, error.message || "Invalid refresh Token"));
    }
})

const currentPasswordChange = asyncHandler(async(req,res,next)=>{
    const {oldPassword, newPassword} = req.body;

    const user = await User.findById(req.user?._id) // cause of auth middleware we have access to user details
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword); // means existing password seems correct
    if(!isPasswordCorrect){
        return res.status(400).json( new ApiError(401,  "Invalid  old password "));
    }
    user.password = newPassword;  // set this in User and save in model in password but dont send back
    await user.save({validateBeforeSave:false});
    return res.status(200).json(new ApiResponse(200, {}, "password change successfully"));
})

const getCurrentUser = asyncHandler(async(req,res,next)=>{
    return res.status(200).json(new ApiResponse(200, req.user, "current user fetch sucesfully"));
})

const updateRoleDetailsById = asyncHandler(async(req,res,next)=>{
    const id = req.query.id || req.params.id; 
    const {newRole} = req.body;
    if (!newRole) {
        return res.status(400).json( new ApiError(401,  "new role field required"));
    }
    // Check newRole enum (if provided)
    const validRoles = ['Admin', 'Manager', 'User'];
    if (newRole && !validRoles.includes(newRole)) {
        return res.status(400).json( new ApiError(400, `newRole must be one of the following: ${validRoles.join(', ')}.`));
    }
    const user = await User.findById(id) // cause of auth middleware we have access to user details

    user.role = newRole;  // set this in User and save in model in role but dont send back
    await user.save({validateBeforeSave:false});
    return res.status(200).json(new ApiResponse(200, {}, `role change successfully to role: ${newRole}`));
});

const getUserById = asyncHandler(async(req,res,next)=>{
    const id = req.query.id || req.params.id; 

    try {
        const user = await User.findById(id).select(
            "-password -refreshToken"  // except these two field all user data can be sent to frontend
        );
        if (!user) {
            return res.status(400).json( new ApiError(404, "User not found"));
        }
        return res.status(200).json(
            new ApiResponse(200, user, "User fetched successfully")
        );
    } catch (error) {
        return res.status(500).json( new ApiError(501, error.message || "Error fetching user"));
    }
});

// Controller to get all users
const getAllUsers = asyncHandler(async (req, res, next) => {
    try {
      // Query the database to get all users, excluding sensitive information like passwords
      const users = await User.find().select("-password -refreshToken");
  
      if (!users || users.length === 0) {
        return next(new ApiError(404, "No users found"));
      }
  
      // Return the list of users in the response
      res.status(200).json(
        new ApiResponse(200, users, "Users fetched successfully"));
    } catch (error) {
        logger.error(`Server error while fetching users : ${error.message}`);
      // Handle any potential errors and pass them to the error-handling middleware
      return res.status(500).json( new ApiError(501, error.message || "Server error while fetching users"));
    }
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAcessToken,
    currentPasswordChange,
    getCurrentUser,
    updateRoleDetailsById,
    getUserById,
    getAllUsers
};