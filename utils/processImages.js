import { join, dirname, basename } from "path";
import sharp from "sharp";
import { unlinkSync } from "fs";

const processImage = async (filePath) => {
  const newFilePath = join(dirname(filePath), `resized_${basename(filePath)}`);

  try {
    await sharp(filePath)
      .resize(500, 500, { fit: "inside" })
      .toFile(newFilePath);
    unlinkSync(filePath);
  } catch (error) {
    throw new Error("Error resizing image");
  }
};

export default processImage;
