import Joi from "joi";

/**
 * Schema for validating the user registration data.
 * It ensures that the first name, last name, email, and password meet the required format and constraints.
 */
const registerUserSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(255)
    .regex(/^[A-Za-z]+$/)
    .required(), // The first name must contain only alphabetic characters and be between 2-255 characters.
  lastName: Joi.string()
    .min(2)
    .max(255)
    .regex(/^[A-Za-z]+$/)
    .required(), // The last name must contain only alphabetic characters and be between 2-255 characters.
  email: Joi.string().email().required(), // The email must be in a valid email format.
  password: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .min(8)
    .required(), // Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, a number, and a special character.
  role: Joi.string().valid("user", "admin").default("user").optional(), // The role is optional and defaults to 'user'.
});

/**
 * Schema for validating the user login data.
 * Ensures the email and password are provided and meet the required format.
 */
const loginSchema = Joi.object({
  email: Joi.string().email().required(), // The email must be in a valid email format.
  password: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&/])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .min(8)
    .required(), // The password must be at least 8 characters long and contain specific characters.
});

/**
 * Schema for validating the user update data.
 * It validates the user's first name, last name, and password changes.
 */
const updateUserSchema = Joi.object({
  firstName: Joi.string()
    .min(3)
    .max(255)
    .regex(/^[A-Za-z]+$/)
    .optional(), // The first name is optional and must be between 3-255 characters.
  lastName: Joi.string()
    .min(3)
    .max(255)
    .regex(/^[A-Za-z]+$/)
    .optional(), // The last name is optional and must be between 3-255 characters.
  currentPassword: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .min(8)
    .optional(), // The current password is optional and must meet the specified pattern.
  newPassword: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .min(8)
    .optional(), // The new password is optional and must meet the specified pattern.
});

export { registerUserSchema, loginSchema, updateUserSchema };
