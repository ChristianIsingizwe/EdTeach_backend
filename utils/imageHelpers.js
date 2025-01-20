import sharp from "sharp";

const validateFile = (file, maxSize, allowedTypes) => {
  if (file.size > maxSize) {
    throw new Error("The file size is too big");
  }

  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error("Invalid file type");
  }

  return true;
};

const resizeImage = async (inputPath, outputPath, width) => {
  try {
    await sharp(inputPath).resize(width).toFormat("jpeg").toFile(outputPath);
    return outputPath;
  } catch (error) {
    throw new Error("Error resizing the image.");
  }
};

export { validateFile, resizeImage };
