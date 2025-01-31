import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../models/User"; // Ensure correct path to your User model

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

afterEach(async () => {
  await User.deleteMany();
});

describe("User Model Unit Tests", () => {
  it("should create and save a valid user", async () => {
    const validUser = new User({
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@example.com",
      passwordHash: "hashedpassword123",
      role: "user",
    });

    const savedUser = await validUser.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe("johndoe@example.com");
    expect(savedUser.profilePictureUrl).toBe(
      "https://www.gravatar.com/avatar/?d=mp"
    );
    expect(savedUser.tokenVersion).toBe(1);
    expect(savedUser.joinedChallenges).toHaveLength(0);
  });

  it("should fail to save a user without required fields", async () => {
    const userWithoutRequiredFields = new User({
      email: "missingfields@example.com",
      passwordHash: "password123",
    });

    await expect(userWithoutRequiredFields.save()).rejects.toThrow(
      mongoose.Error.ValidationError
    );
  });

  it("should enforce unique email constraint", async () => {
    const user1 = new User({
      firstName: "Alice",
      lastName: "Smith",
      email: "alice@example.com",
      passwordHash: "hashedpassword",
      role: "user",
    });

    const user2 = new User({
      firstName: "Bob",
      lastName: "Brown",
      email: "alice@example.com", // Duplicate email
      passwordHash: "hashedpassword",
      role: "user",
    });

    await user1.save();
    await expect(user2.save()).rejects.toThrow(mongoose.Error);
  });

  it("should validate email format", async () => {
    const invalidEmailUser = new User({
      firstName: "Invalid",
      lastName: "Email",
      email: "invalid-email",
      passwordHash: "hashedpassword",
      role: "user",
    });

    await expect(invalidEmailUser.save()).rejects.toThrow(
      mongoose.Error.ValidationError
    );
  });

  it("should ensure role is either 'user' or 'admin'", async () => {
    const invalidRoleUser = new User({
      firstName: "Wrong",
      lastName: "Role",
      email: "wrongrole@example.com",
      passwordHash: "hashedpassword",
      role: "invalidRole",
    });

    await expect(invalidRoleUser.save()).rejects.toThrow(
      mongoose.Error.ValidationError
    );
  });

  it("should set default values correctly", async () => {
    const newUser = new User({
      firstName: "Default",
      lastName: "Values",
      email: "defaultvalues@example.com",
      passwordHash: "hashedpassword",
      role: "user",
    });

    const savedUser = await newUser.save();
    expect(savedUser.tokenVersion).toBe(1);
    expect(savedUser.profilePictureUrl).toBe(
      "https://www.gravatar.com/avatar/?d=mp"
    );
    expect(savedUser.otp).toBeNull();
    expect(savedUser.otpExpiration).toBeNull();
  });

  it("should allow updating user fields", async () => {
    const user = new User({
      firstName: "Original",
      lastName: "Name",
      email: "original@example.com",
      passwordHash: "hashedpassword",
      role: "user",
    });

    const savedUser = await user.save();
    savedUser.firstName = "Updated";
    await savedUser.save();

    const updatedUser = await User.findById(savedUser._id);
    expect(updatedUser.firstName).toBe("Updated");
  });
});
