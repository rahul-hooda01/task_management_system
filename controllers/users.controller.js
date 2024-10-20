import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

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
    return res.status(500).json( new ApiError(500, 'something went wrong while creating refreshToken'));
}

}

const registerUser = asyncHandler(async(req,res,next)=>{
    // get details from frontend, validation empty or other things
    // check if user already exist userName and email
    // create user object- create entry in db, except "-password -refreshToken" send response to frontend
    const { userName, email, password, role } = req.body;

     // Regex patterns for validation
    const usernamePattern = /^[a-zA-Z0-9]{3,30}$/; // Alphanumeric, 3-30 characters
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email pattern
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/; 
    // At least one lowercase, one uppercase, one number, 8+ characters

    if (!userName || !usernamePattern.test(userName)) {
        return res.status(400).json( new ApiError(404, 'Username must be 3-30 characters long and alphanumeric only'));
    }

    // Email validation: standard email pattern
    if (!email || !emailPattern.test(email)) {
        return res.status(400).json( new ApiError(404, 'Please provide a valid email address'));
    }

    // Password validation: minimum 8 characters, at least one uppercase, one lowercase, and one digit
    if (!password || !passwordPattern.test(password)) {
        return res.status(400).json( new ApiError(404, 
            'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number',
        ));
    }

    // Validate if all required fields are provided
    if ([userName, email, password].some(field => field?.trim() === "")) {
        return res.status(400).json( new ApiError(404, "All fields (userName, Email, password) are required"));
    }

    const existedUser = await User.findOne({ 
        $or: [{ userName }, { email }]
    })
    if (existedUser){
        return res.status(400).json( new ApiError(409, "User with Email & userName already exist"));
    }
    // Check role enum (if provided)
    const validRoles = ['Admin', 'Manager', 'User'];
    if (role && !validRoles.includes(role)) {
        return res.status(400).json( new ApiError(400, `role must be one of the following: ${validRoles.join(', ')}.`));
    }
    
    // //create user

    const user = await User.create({
        userName,
        email,
        password,
        role: role || 'User'
    })

    //test user created or not
    const userCreated = await User.findById(user._id).select(
        "-password -refreshToken"  // except these two field all user data can be sent to frontend
    )
    if (!userCreated){
        return res.status(500).json( new ApiError(500, "something went wrong while registering user"));
    }

    return res.status(201).json( // data return(res) to frontend
       new ApiResponse(200, userCreated, "user registered successfully")
    );
})

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
            httpOnly:true,
            secure:true
        }  // that means option set, now cookies will modified from server only
        
        return res.status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken',refreshToken,options)
        .json(
            new ApiResponse(200,
                {
                    user: loggedInUser, accessToken, refreshToken  // sent in respose if frontend wants to use it
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
// can apply redis here to store 
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
            user.refreshToken
            return res.status(400).json( new ApiError(401, "refresh Token is expired or used"));
        }
        //generate new token
        // generateAccessAndRefreshToken
        const {accessToken,NewRefreshToken} = await generateAccessAndRefreshToken(user._id);
    
        const options = {
            httpOnly:true,
            secure:true
        }
        return res.status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken',NewRefreshToken,options)
        .json(
            new ApiResponse(200,
                {
                 accessToken, refreshToken: NewRefreshToken
                },
                "Access token refreshed"
            )
        )
    } catch (error) {
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

const updateRoleDetails = asyncHandler(async(req,res,next)=>{
    // update role details if user is Admin
    const {role} = req.body;

    if (!role) {
        return res.status(400).json( new ApiError(401, "role field required"));
    }
    // Check role enum (if provided)
    const validRoles = ['Admin', 'Manager', 'User'];
    if (role && !validRoles.includes(role)) {
        return res.status(400).json( new ApiError(400, `role must be one of the following: ${validRoles.join(', ')}.`));
    }
    const user = await User.findByIdAndUpdate(req.user?._id, //accept 3 parameter
        {
            $set:{
                role: role || 'User'
            }
        },
        {new :true} 
    ).select("-password");

    res.status(200).json(new ApiResponse(200, user, "account details update succeessfully"));
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAcessToken,
    currentPasswordChange,
    getCurrentUser,
    updateRoleDetails
};