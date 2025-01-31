import connectToDB from "../path-to/connectToDB";
import mongoose from "mongoose";

// Mock the mongoose.connect method
jest.mock("mongoose");

describe("connectToDB", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should connect to the database successfully", async () => {
    // Mock a successful connection
    mongoose.connect.mockResolvedValueOnce();

    // Create a mock console.log to check if success message is logged
    const logSpy = jest.spyOn(console, "log").mockImplementation();

    await connectToDB("mongodb://localhost/test");

    // Check if the connection success message was logged
    expect(logSpy).toHaveBeenCalledWith("Connected to Database successfully");

    logSpy.mockRestore(); // Restore original console.log
  });

  it("should handle connection errors", async () => {
    // Mock a failed connection
    const error = new Error("Connection failed");
    mongoose.connect.mockRejectedValueOnce(error);

    // Create a mock console.error to check if error message is logged
    const errorSpy = jest.spyOn(console, "error").mockImplementation();
    const exitSpy = jest.spyOn(process, "exit").mockImplementation();

    await connectToDB("mongodb://localhost/test");

    // Check if the error message was logged
    expect(errorSpy).toHaveBeenCalledWith(
      "Error connecting to the database: ",
      error
    );

    // Check if process.exit() was called
    expect(exitSpy).toHaveBeenCalled();

    errorSpy.mockRestore(); // Restore original console.error
    exitSpy.mockRestore(); // Restore process.exit
  });
});
