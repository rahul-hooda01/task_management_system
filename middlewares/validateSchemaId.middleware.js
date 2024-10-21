import Joi from "joi";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Define the Joi validation schema for an ID field
export const schemaIdValidation = Joi.string()
  .length(24)
  .hex()
  .required()
  .messages({
    "string.base": "schemaId should be a type of 'text'.",
    "string.empty": "schemaId cannot be an empty field.",
    "string.length": "schemaId must be exactly 24 characters long.",
    "string.hex": "schemaId must be a valid hexadecimal string.",
    "any.required": "schemaId is a required field.",
});


export const validateSchemaId = asyncHandler(async (req, res, next) => {
    const id = req.query.id || req.params.id; 
  
    // Validate the schemaId using Joi
    const { error } = schemaIdValidation.validate(id);
    if (error) {
      return res.status(400).json( new ApiError(404, error.details[0].message));
    }
  
    // If validation passes, proceed to the next middleware or controller logic
    next();
});