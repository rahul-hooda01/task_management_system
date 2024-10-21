import { Router } from "express";
import {
    currentPasswordChange,
    getCurrentUser,
    loginUser,
    logoutUser,
    refreshAcessToken,
    registerUser,
    updateRoleDetailsById,
    getUserById,
    getAllUsers
} from "../controllers/users.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";
import { validateSchemaId } from "../middlewares/validateSchemaId.middleware.js";

const router = Router()

router.route("/register").post(registerUser);
router.route("/login").post(loginUser)

// secured routes
router.route("/logout").post(verifyJWT, logoutUser) 
router.route("/refresh-token").post(refreshAcessToken);
router.route("/resetPassword").post(verifyJWT, currentPasswordChange);
router.route("/getCurrentUser").get(verifyJWT, getCurrentUser);
router.route("/updateRoleByUserId/:id").patch(verifyJWT, validateSchemaId, authorizeRoles('Admin'), updateRoleDetailsById);
router.route("/getUserById/:id").get(verifyJWT, validateSchemaId, authorizeRoles('Admin', 'Manager'), getUserById);
router.route("/getAllUsers").get(verifyJWT, authorizeRoles('Admin'), getAllUsers);

// NOTE: in verifyJWT middleware it gets userId from validate that token from cookies or header based on that will validate

export default router;