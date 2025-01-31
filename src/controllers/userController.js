import {
  registerUserService,
  loginUserService,
  verifyOTPService,
  findUserService,
  findUsersService,
  deleteUserService,
  updateUserService,
} from "../services/userService.js";
import _ from "lodash";

const registerUser = async (req, res) => {
  try {
    const response = await registerUserService(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("An error occurred while registering the user: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const value = _.pick(req.body, ["email", "password"]);
    const response = await loginUserService(value);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("An error occurred during login: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const response = await verifyOTPService(req.body);

    if (response.cookies) {
      res.cookie(
        "refreshToken",
        response.cookies.refreshToken,
        response.cookies.options
      );
    }

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error verifying OTP: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const findUser = async (req, res) => {
  try {
    const response = await findUserService(req.params.id);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error finding user: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const findUsers = async (req, res) => {
  try {
    const response = await findUsersService();
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error finding users: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const response = await deleteUserService(req.params.id);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error deleting user: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await updateUserService(id, req);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res
      .status(error.status || 500)
      .json(
        error.data || { error: "An error occurred while updating the profile." }
      );
  }
};

export {
  registerUser,
  loginUser,
  verifyOTP,
  findUser,
  findUsers,
  deleteUser,
  updateUser,
};
