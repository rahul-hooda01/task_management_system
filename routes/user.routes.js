import { Router } from "express";
import {
    currentPasswordChange,
    getCurrentUser,
    loginUser,
    logoutUser,
    refreshAcessToken,
    registerUser,
    updateUserById,
    getUserById,
    getAllUsers,
    changeNotificationType
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
router.route("/updateUserById/:id").patch(verifyJWT, validateSchemaId, authorizeRoles('Admin', 'Manager'), updateUserById);
router.route("/getUserById/:id").get(verifyJWT, validateSchemaId, authorizeRoles('Admin', 'Manager'), getUserById);
router.route("/getAllUsers").get(verifyJWT, authorizeRoles('Admin'), getAllUsers);

// Notifications set [off,email,sms]  create a api for that
router.route("/changeNotificationType").patch(verifyJWT, changeNotificationType);

// NOTE: in verifyJWT middleware it gets userId from validate that token from cookies or header based on that will validate

export default router;