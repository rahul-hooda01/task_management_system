import { Router } from "express";
import { currentPasswordChange, getCurrentUser, loginUser, logoutUser, refreshAcessToken, registerUser, updateRoleDetails } from "../controllers/users.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()

router.route("/register").post(registerUser);
router.route("/login").post(loginUser)

// secured routes
router.route("/logout").post(verifyJWT, logoutUser) 
router.route("/refresh-token").post(refreshAcessToken);
router.route("/resetPassword").post(verifyJWT, currentPasswordChange);
router.route("/getCurrentUser").get(verifyJWT, getCurrentUser);
router.route("/updateRole").patch(verifyJWT, updateRoleDetails);

// NOTE: in verifyJWT middleware it gets userId from validate that token from cookies or header based on that will validate

export default router;