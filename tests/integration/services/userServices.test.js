import mongoose from "mongoose";
import User from "../models/userModel";
import {
  registerUserService,
  loginUserService,
  verifyOTPService,
  findUserService,
  findUsersService,
  deleteUserService,
  updateUserService,
} from "../services/userService";
import { hashPassword } from "../utils/passwordHelper";
import { sendOTP } from "../utils/sendOtp";

// Mock sendOTP to avoid actual email sending
jest.mock("../utils/sendOtp", () => ({
  sendOTP: jest.fn(),
}));

describe("User Service Integration Tests", () => {
  let testUser;

  beforeEach(async () => {
    // Create a test user in the in-memory database
    testUser = await User.create({
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@example.com",
      passwordHash: await hashPassword("password123"),
      role: "user",
    });
  });

  it("should register a new user successfully", async () => {
    const userData = {
      firstName: "Jane",
      lastName: "Doe",
      email: "janedoe@example.com",
      password: "password123",
      role: "user",
    };

    const response = await registerUserService(userData);
    expect(response.status).toBe(201);
    expect(response.data.message).toBe(
      "User registered successfully. Please check your email."
    );

    const newUser = await User.findOne({ email: userData.email });
    expect(newUser).not.toBeNull();
    expect(newUser.firstName).toBe(userData.firstName);
    expect(sendOTP).toHaveBeenCalledWith(userData.email, expect.any(String));
  });

  it("should not register a user with an existing email", async () => {
    const response = await registerUserService({
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@example.com",
      password: "password123",
      role: "user",
    });

    expect(response.status).toBe(400);
    expect(response.data.message).toBe("User already exists.");
  });

  it("should login a user and send OTP", async () => {
    const response = await loginUserService({
      email: "johndoe@example.com",
      password: "password123",
    });

    expect(response.email).toBe("johndoe@example.com");
    expect(response.message).toBe("Verify your email for the OTP");

    const updatedUser = await User.findOne({ email: "johndoe@example.com" });
    expect(updatedUser.otp).toBeDefined();
    expect(sendOTP).toHaveBeenCalledWith(updatedUser.email, updatedUser.otp);
  });

  it("should not login a user with incorrect password", async () => {
    const response = await loginUserService({
      email: "johndoe@example.com",
      password: "wrongpassword",
    });

    expect(response.status).toBe(400);
    expect(response.data.message).toBe("Invalid credentials.");
  });

  it("should verify OTP successfully", async () => {
    const otp = "123456";
    testUser.otp = otp;
    testUser.otpExpiration = Date.now() + 5 * 60 * 1000;
    await testUser.save();

    const response = await verifyOTPService({
      email: "johndoe@example.com",
      otp,
    });

    expect(response.status).toBe(200);
    expect(response.data.accessToken).toBeDefined();
    expect(response.data.refreshToken).toBeDefined();
  });

  it("should not verify an expired OTP", async () => {
    const otp = "123456";
    testUser.otp = otp;
    testUser.otpExpiration = Date.now() - 5 * 60 * 1000; // Expired OTP
    await testUser.save();

    const response = await verifyOTPService({
      email: "johndoe@example.com",
      otp,
    });

    expect(response.status).toBe(400);
    expect(response.data.message).toBe("Invalid or expired OTP.");
  });

  it("should fetch a user by ID", async () => {
    const response = await findUserService(testUser._id);
    expect(response.status).toBe(200);
    expect(response.data.user.email).toBe("johndoe@example.com");
  });

  it("should return 404 if user not found", async () => {
    const response = await findUserService(new mongoose.Types.ObjectId());
    expect(response.status).toBe(404);
    expect(response.data.message).toBe("User not found");
  });

  it("should fetch all users", async () => {
    const response = await findUsersService();
    expect(response.status).toBe(200);
    expect(response.data.length).toBe(1);
  });

  it("should delete a user", async () => {
    const response = await deleteUserService(testUser._id);
    expect(response.status).toBe(200);
    expect(response.data.message).toBe("User deleted successfully");

    const deletedUser = await User.findById(testUser._id);
    expect(deletedUser).toBeNull();
  });

  it("should not delete a non-existent user", async () => {
    const response = await deleteUserService(new mongoose.Types.ObjectId());
    expect(response.status).toBe(404);
    expect(response.data.message).toBe("User not found.");
  });

  it("should update a user's first name", async () => {
    const req = {
      body: {
        firstName: "UpdatedName",
      },
      files: {}, // No profile picture update
    };

    const response = await updateUserService(testUser._id, req);
    expect(response.status).toBe(200);
    expect(response.data.message).toBe("User updated successfully.");

    const updatedUser = await User.findById(testUser._id);
    expect(updatedUser.firstName).toBe("UpdatedName");
  });

  it("should return 404 when updating a non-existent user", async () => {
    const req = {
      body: {
        firstName: "NewName",
      },
      files: {},
    };

    await expect(
      updateUserService(new mongoose.Types.ObjectId(), req)
    ).rejects.toEqual({
      status: 404,
      data: { error: "User not found." },
    });
  });
});
