import Joi from "joi";

const createChallengeSchema = Joi.object({
  title: Joi.string().required(),
  deadline: Joi.date().greater("now").required(),
  duration: Joi.string().required(),
  moneyPrize: Joi.string().required(),
  contactEmail: Joi.string().email().required(),
  challengeStatus: Joi.string().valid("open", "ongoing", "closed").optional(),
  projectDescription: Joi.string().max(260).required(),
  projectBrief: Joi.string().max(60).required(),
  projectTasks: Joi.string().max(510).required(),
});
const editChallengeSchema = Joi.object({
  title: Joi.string().optional(),
  deadline: Joi.date().greater("now").optional(),
  duration: Joi.string().optional(),
  moneyPrize: Joi.string().optional(),
  contactEmail: Joi.string().email().optional(),
  challengeStatus: Joi.string().valid("open", "ongoing", "closed").optional(),
  projectDescription: Joi.string().max(260).optional(),
  projectBrief: Joi.string().max(60).optional(),
  projectTasks: Joi.string().max(510).optional(),
});

export { createChallengeSchema, editChallengeSchema };
