import { Router } from "express";
import {
    createTask,
    getAllTasks,
    getMyTasks,
    getAllAssignTasksByUserId,
    getTaskById,
    assignTask,
    updateTaskById,
    deleteTaskById 
} from "../controllers/tasks.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorization.middleware.js";
import { validateSchemaId } from "../middlewares/validateSchemaId.middleware.js";

const router = Router();

// Create a new Task (secured)
router.route("/addTasks").post(verifyJWT, authorizeRoles('Admin','Manager'), createTask);

// Get all tasks (pagination included) admin
router.route("/getAllTasks").get(verifyJWT, authorizeRoles('Admin'), getAllTasks);

// Get my tasks (pagination included) 
router.route("/getMyTasks").get(verifyJWT, getMyTasks);

// Get all tasks of a particular user- role based manager or admin (pagination included)
router.route("/getAllAssignTasksByUserId/:id").get(verifyJWT, validateSchemaId, authorizeRoles('Admin','Manager'), getAllAssignTasksByUserId);

// Get a specific Task by ID
router.route("/getTaskById/:id").get(verifyJWT, validateSchemaId, getTaskById);

// assign  a specific Task by ID to user 'Admin', 'Manager'
router.route("/assign/TasksById/:id").get(verifyJWT, validateSchemaId, authorizeRoles('Admin','Manager', 'User'), assignTask);

// Update a Task by ID (secured) 
router.route("/updateTask/:id").patch(verifyJWT, validateSchemaId, authorizeRoles('Admin','Manager'), updateTaskById);

// Delete a Task by ID (secured) admin
router.route("/deleteTask/:id").delete(verifyJWT, validateSchemaId, authorizeRoles('Admin'), deleteTaskById);

// Analytics
// -- Get the number of completed tasks.
// --  Get count of tasks by status (Pending, In Progress, Overdue).


export default router;
