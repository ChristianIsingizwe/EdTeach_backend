import Joi from "joi";

/**
 * Schema for validating the request data when sending verification codes.
 * It checks that both the senderId and email are provided and are in the correct format.
 */
const sendCodeSchema = Joi.object({
  senderId: Joi.string().required(), // The senderId is a required string.
  email: Joi.string().email().required(), // The email must be a valid email format.
});

/**
 * Schema for validating the request data when verifying the code.
 * It checks that both userId and code are provided and are in the correct format.
 */
const verifyCodeSchema = Joi.object({
  userId: Joi.string().required(), // The userId is a required string.
  code: Joi.string().required(), // The code is a required string.
});


export {sendCodeSchema, verifyCodeSchema}
