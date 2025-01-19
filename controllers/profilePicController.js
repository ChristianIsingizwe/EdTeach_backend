import formidable from "formidable";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import User from "../models/userModel.js";

const handleProfilePic = async (req, res) => {                   
  const uploadDir = path.join(__dirname, "../uploads/profile-pictures");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024,
    filter: (part) => part.mimetype?.startsWith("image/"),
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res
        .status(400)
        .json({ error: "File upload failed", details: err });
    }

    const { userId } = fields;
    const file = files.file;

    if (!userId || !file) {
      return res.status(400).json({ error: "User ID and file are required" });
    }

    try {
      const filePath = file.filepath;
      const fileName = `${userId}-${Date.now()}.jpg`;
      const finalFilePath = path.join(uploadDir, fileName);

      // Validate and process the image
      const image = sharp(filePath);
      const metadata = await image.metadata();

      const MAX_WIDTH = 800; // Max width for resized images
      const MAX_HEIGHT = 800; // Max height for resized images
      const MAX_FILE_SIZE_MB = 2; // Max file size in MB
      const TOO_LARGE_WIDTH = 2000; // Reject images wider than this
      const TOO_LARGE_HEIGHT = 2000; // Reject images taller than this

      // Reject overly large images
      if (
        metadata.width > TOO_LARGE_WIDTH ||
        metadata.height > TOO_LARGE_HEIGHT
      ) {
        fs.unlinkSync(filePath); // Delete the uploaded file
        return res
          .status(400)
          .json({ error: "Image dimensions are too large to process." });
      }

      // Resize if needed
      if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
        await image
          .resize(MAX_WIDTH, MAX_HEIGHT, { fit: "inside" })
          .toFile(finalFilePath);
      } else {
        // Save the original image if it's within acceptable dimensions
        fs.renameSync(filePath, finalFilePath);
      }

      // Save the URL to the database
      const profilePictureUrl = `/uploads/profile-pictures/${fileName}`;
      await User.findByIdAndUpdate(
        userId,
        { profilePicture: profilePictureUrl },
        { new: true }
      );

      res.status(200).json({
        message: "Profile picture uploaded successfully",
        url: profilePictureUrl,
      });
    } catch (error) {
      res.status(500).json({
        error: "An error occurred during image processing",
        details: error,
      });
    }
  });
};


export default handleProfilePic
