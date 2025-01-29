import * as userService from "../services/userService.js";

const registerUser = async (req, res) => {
  try {
    const response = await userService.registerUser(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("An error occurred while registering the user: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const response = await userService.loginUser(req.body);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("An error occurred during login: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const response = await userService.verifyOTP(req.body);
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
    res.status(500).json({ message: "Internal server error" });
  }
};

const findUser = async (req, res) => {
  try {
    const response = await userService.findUser(req.params.id);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error finding user: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const findUsers = async (req, res) => {
  try {
    const response = await userService.findUsers();
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error finding users: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const response = await userService.deleteUser(req.params.id);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error deleting user: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const response = await userService.updateUser(req);
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the profile." });
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
