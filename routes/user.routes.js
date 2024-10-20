import { Router } from "express";
import { currentPasswordChange, getCurrentUser, loginUser, logoutUser, refreshAcessToken, registerUser, updateRoleDetails } from "../controllers/users.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()

router.route("/register").post(registerUser);
router.route("/login").post(loginUser)

// secured routes
router.route("/logout").post(verifyJWT, logoutUser) 

// verifyJWT middleware m cookies se jwt token verify krke uski id se db m call ki or
// user info req m bhejdi taaki on that basis logout kr ske

router.route("/refresh-token").post(verifyJWT, refreshAcessToken);
router.route("/resetPassword").post(verifyJWT, currentPasswordChange);
router.route("/getCurrentUser").get(verifyJWT, getCurrentUser);
router.route("/updateRole").patch(verifyJWT, updateRoleDetails);

// NOTE: in verifyJWT middleware it gets 

export default router;