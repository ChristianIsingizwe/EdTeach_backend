import request from "supertest";
import app from "../server";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import {
  registerUserService,
  loginUserService,
  verifyOTPService,
  findUserService,
  findUsersService,
  deleteUserService,
  updateUserService,
} from "../../../src/services/userService";

jest.mock("../../../src/services/userService");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("User Controller Tests", () => {
  describe("POST /register", () => {
    it("should register a user successfully", async () => {
      registerUserService.mockResolvedValue({
        status: 201,
        data: { message: "User registered successfully. Check your email." },
      });

      const response = await request(app).post("/register").send({
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@example.com",
        password: "password123",
      });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe(
        "User registered successfully. Check your email."
      );
    });

    it("should handle internal server error", async () => {
      registerUserService.mockRejectedValue(new Error("Database error"));

      const response = await request(app).post("/register").send({
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@example.com",
        password: "password123",
      });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Internal server error");
    });
  });

  describe("POST /login", () => {
    it("should log in a user and send OTP", async () => {
      loginUserService.mockResolvedValue({
        status: 200,
        data: { message: "Verify your email for the OTP" },
      });

      const response = await request(app).post("/login").send({
        email: "johndoe@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Verify your email for the OTP");
    });

    it("should return 500 on login error", async () => {
      loginUserService.mockRejectedValue(new Error("Unexpected error"));

      const response = await request(app).post("/login").send({
        email: "johndoe@example.com",
        password: "password123",
      });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Internal server error");
    });
  });

  describe("POST /verifyOtp", () => {
    it("should verify OTP successfully and set refresh token cookie", async () => {
      verifyOTPService.mockResolvedValue({
        status: 200,
        data: { accessToken: "testAccessToken" },
        cookies: {
          refreshToken: "testRefreshToken",
          options: { httpOnly: true, secure: true },
        },
      });

      const response = await request(app).post("/verifyOtp").send({
        email: "johndoe@example.com",
        otp: "123456",
      });

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBe("testAccessToken");
      expect(response.headers["set-cookie"]).toBeDefined();
    });

    it("should return 500 on OTP verification error", async () => {
      verifyOTPService.mockRejectedValue(new Error("Verification failed"));

      const response = await request(app).post("/verifyOtp").send({
        email: "johndoe@example.com",
        otp: "123456",
      });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Internal server error");
    });
  });

  describe("GET /users/:id", () => {
    it("should find a user by ID", async () => {
      findUserService.mockResolvedValue({
        status: 200,
        data: { user: { email: "johndoe@example.com" } },
      });

      const response = await request(app).get("/users/12345");

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe("johndoe@example.com");
    });

    it("should return 500 on user lookup error", async () => {
      findUserService.mockRejectedValue(new Error("User not found"));

      const response = await request(app).get("/users/12345");

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Internal server error");
    });
  });

  describe("GET /users", () => {
    it("should retrieve all users", async () => {
      findUsersService.mockResolvedValue({
        status: 200,
        data: [{ email: "johndoe@example.com" }],
      });

      const response = await request(app).get("/users");

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
    });

    it("should return 500 on error retrieving users", async () => {
      findUsersService.mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/users");

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Internal server error");
    });
  });

  describe("DELETE /users/:id", () => {
    it("should delete a user", async () => {
      deleteUserService.mockResolvedValue({
        status: 200,
        data: { message: "User deleted successfully" },
      });

      const response = await request(app).delete("/users/12345");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("User deleted successfully");
    });

    it("should return 500 on delete user error", async () => {
      deleteUserService.mockRejectedValue(new Error("Deletion failed"));

      const response = await request(app).delete("/users/12345");

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Internal server error");
    });
  });

  describe("PATCH /users/:id", () => {
    it("should update a user profile", async () => {
      updateUserService.mockResolvedValue({
        status: 200,
        data: { message: "User updated successfully" },
      });

      const response = await request(app).patch("/users/12345").send({
        firstName: "UpdatedName",
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("User updated successfully");
    });

    it("should return 500 on update user error", async () => {
      updateUserService.mockRejectedValue({
        status: 404,
        data: { error: "User not found." },
      });

      const response = await request(app).patch("/users/12345").send({
        firstName: "UpdatedName",
      });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("User not found.");
    });
  });
});
