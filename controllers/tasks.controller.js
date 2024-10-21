import Joi from "joi";
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { logger } from "../logs/logger.js";

// Validation schema using Joi
const taskValidationSchema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(5).max(1000).required(),
    dueDate: Joi.date().iso().required(),
    priority: Joi.string().valid("Low", "Medium", "High").required(),
    status: Joi.string().valid("Pending", "In Progress", "Completed"),
});

const createTask = asyncHandler(async(req,res,next)=>{
    const { error } = taskValidationSchema.validate(req.body);

    // Return validation errors
    if (error) {
        return res.status(400).json( new ApiError(401, error.details[0].message));
    }
  
    const { title, description, dueDate, priority, status } = req.body;
  
    // Create the task
    const task = await Task.create({
        title,
        description,
        dueDate,
        priority,
        status: status || "Pending", // default to "Pending"
        assignedTo:  req.user._id, // Associate the task with the creator
        createdBy: req.user._id, // Associate the task with the creator
    });
  
    const taskCreated = await Task.findById(task._id);
    if (!taskCreated){
        logger.error("something went wrong while creating task");
        return res.status(500).json( new ApiError(500, "something went wrong while creating task"));
    }

    return res.status(201).json( // data return(res) to frontend
       new ApiResponse(200, taskCreated, "task registered successfully")
    );

});

const getAllTasks = asyncHandler(async(req,res,next)=>{
    try {
        // Query the database to get all tasks
        const tasks = await Task.find().populate("createdBy assignedTo", "userName email");
    
        if (!tasks.length) {
            return res.status(500).json( new ApiError(404, "No tasks found"));
        }
    
        // Return the list of users in the response
        res.status(200).json(
          new ApiResponse(200, tasks, "tasks fetched successfully"));
      } catch (error) {
        logger.error(`Server error while fetching tasks: ${error.message}`);
        // Handle any potential errors and pass them to the error-handling middleware
        return res.status(500).json( new ApiError(501, error.message || "Server error while fetching tasks"));
      }
});
const getMyTasks = asyncHandler(async(req,res,next)=>{
    const tasks = await Task.find({ createdBy: req.user._id });

    if (!tasks.length) {
      return res.status(400).json( new ApiError(404, "You have no tasks"));
    }
  
    return res.status(201).json( // data return(res) to frontend
        new ApiResponse(200, tasks, "User tasks retrieved successfully")
     );
});
const getAllAssignTasksByUserId = asyncHandler(async(req,res,next)=>{
    const id = req.query.id || req.params.id; 
    try {
        const tasks = await Task.find({ assignedTo: id });
        if (!tasks.length) {
            return res.status(400).json( new ApiError(404, "No tasks found for this user"));
        }
        return res.status(200).json(
            new ApiResponse(200, tasks, "Tasks for the user retrieved successfully")
        );
    } catch (error) {
        return res.status(500).json( new ApiError(501, error.message || "Error fetching tasks"));
    }
});
const getTaskById = asyncHandler(async(req,res,next)=>{
    const taskId = req.query.id || req.params.id; 
    try {
        const task = await Task.findById(taskId).populate("createdBy assignedTo", "userName email");
    
        if (!task) {
            return res.status(400).json( new ApiError(404, "Task not found"));
        }
        return res.status(200).json(
            new ApiResponse(200, task, "Tasks retrieved successfully")
        );
    } catch (error) {
        return res.status(500).json( new ApiError(501, error.message || "Error fetching tasks"));
    }
});
const assignTask = asyncHandler(async(req,res,next)=>{
    const taskId = req.query.id || req.params.id;
    const {userId} = req.body;
    // Validate User ID
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json( new ApiError(400, "Invalid User ID"));
    }
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json( new ApiError(404, "User not found"));
        }
    
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json( new ApiError(404, "Task not found"));
        }
    
        // Update the task's assigned user
        task.assignedTo = userId;
        await task.save({validateBeforeSave:false});
        return res.status(200).json(new ApiResponse(200, {}, `Task assigned to user ${user.userName} successfully`));
    } catch (error) {
        return res.status(500).json( new ApiError(501, error.message || "Error fetching tasks"));
    }
});
const updateTaskById = asyncHandler(async(req,res,next)=>{
    const { error } = taskValidationSchema.validate(req.body);
    // Return validation errors
    if (error) {
        return res.status(400).json( new ApiError(401, error.details[0].message));
    }

    const taskId = req.query.id || req.params.id;
    const { title, description, dueDate, priority, status } = req.body;

    try {
        // Validate task ID
        const task = await Task.findById(taskId);
        if (!task) {
            return next(new ApiError(404, "Task not found"));
        }
        // Update fields if provided
        if (title) task.title = title;
        if (description) task.description = description;
        if (dueDate) task.dueDate = dueDate;
        if (priority) task.priority = priority;
        if (status) task.status = status;
    
        await task.save({validateBeforeSave:false});
        return res.status(200).json(new ApiResponse(200, task, "Task updated successfully"));
    } catch (error) {
        return res.status(500).json( new ApiError(501, error.message || "Error updateding tasks"));
    }
});
const deleteTaskById = asyncHandler(async(req,res,next)=>{
    const taskId = req.query.id || req.params.id;
    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json( new ApiError(404, "Task not found"));
        }
    
        // remove the task
        await task.deleteOne();
        return res.status(200).json(new ApiResponse(200, {}, "Task deleted successfully"));
    } catch (error) {
        return res.status(500).json( new ApiError(501, error.message || "Error fetching tasks"));
    }
});


export {
    createTask, 
    getAllTasks,
    getMyTasks,
    getAllAssignTasksByUserId,
    getTaskById,
    assignTask,
    updateTaskById,
    deleteTaskById
}