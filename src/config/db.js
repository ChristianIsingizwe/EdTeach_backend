import mongoose from "mongoose";

/**
 * Function connect to the database.
 * Ensures effecient and reliable database connection
 *
 * @param {string} uri  - MongoDB connection string
 * @returns{Promise<void>} - Resolves when connection is successfull
 */
const connectToDB = async (uri) => {
  try {
    await mongoose.connect(uri);
    console.log("Connected to Database successfully");
  } catch (error) {
    console.error("Error connecting to the database: ", error), process.exit();
  }
};

export default connectToDB;
