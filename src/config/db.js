import mongoose from "mongoose";

const connectToDB = async (uri) => {
  try {
    await mongoose.connect(uri);
    console.log("Connected to Database successfully");
  } catch (error) {
    console.error("Error connecting to the database: ", error), process.exit();
  }
};

export default connectToDB;
