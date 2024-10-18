//! VALIDATION
const Joi = require("joi"); //USED FOR VALIDATION

const userRegisterValidate = (req, res, next) => {
  const schema = Joi.object({
    // fullName: Joi.string().min(3).max(100).required(),
    // email: Joi.string().email().required(),
    // password: Joi.string().min(4).alphanum().required(),
    username: Joi.string(),
    email: Joi.string().email(),
    birthdate: Joi.string(),
    gender: Joi.string(),
    role: Joi.string(),
    active: Joi.boolean(),
    password: Joi.string(),
    confirm_password: Joi.string(),
    heightCm: Joi.string(),
    heightFeet: Joi.number(),
    heightInches: Joi.number().allow("").allow(null),
    heightUnit: Joi.string(),
    religion: Joi.string(),
    zodiac: Joi.string(),
    qualification: Joi.string(),
    school: Joi.string(),
    college: Joi.string(),
    job_title: Joi.string().allow("").allow(null),
    organisation_url: Joi.string().allow("").allow(null),
    ethnicity: Joi.string(),
    country: Joi.string(),
    drinking: Joi.string(),
    smoking: Joi.string(),
    exercise: Joi.string(),
    sexual_orientation: Joi.string(),
    personality: Joi.string(),
    interest_details: Joi.array(),
    looking_for: Joi.array().allow("").allow(null),
    prompt_question: Joi.array().allow("").allow(null),
    bio: Joi.string().allow("").allow(null),
    profileImage: Joi.string().allow("").allow(null),
    followers: Joi.array().allow("").allow(null),
    following: Joi.array().allow("").allow(null),
    posts: Joi.array().allow("").allow(null),
  });
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Bad Request", error });
  }
  next();
};

const userLoginValidate = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(4).required(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Bad Request", error });
  }
  next();
};

const adminRegisterValidator = (req, res, next) => {
  const schema = Joi.object({
    firstName: Joi.string().min(5).max(30).required(),
    lastName: Joi.string().min(5).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(5).alphanum().required(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Bad Request", error });
  }
  next();
};

const adminLoginValidate = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(5).required(),
  });
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Bad Request", error });
  }
  next();
};
module.exports = {
  userRegisterValidate,
  userLoginValidate,
  adminRegisterValidator,
  adminLoginValidate,
};
