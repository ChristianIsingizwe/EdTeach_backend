import { verify } from "jsonwebtoken";
import User from "../models/userModel.js";
import { generateAccessToken } from "../utils/generateTokens.js";

const authorize = (requiredRole) => async (req, res, next) => {
  try {
    const accessToken = req.headers["authorization"]?.split(" ")[1];

    if (!accessToken) {
      return res.status(401).json({ message: "Access token not found" });
    }

    try {
      const decoded = verify(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY);
      req.user = { id: decoded.id, role: decoded.role };

      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ message: "Access denied." });
      }

      return next();
    } catch (err) {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({ message: "Not authenticated. " });
      }

      let decoded;
      try {
        decoded = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET_KEY
        );
      } catch (error) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      const user = await User.findById(decoded.id);
      if (!user || user.tokenVersion !== decoded.tokenVersion) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      const newAccessToken = generateAccessToken({
        userId: user._id,
        role: user.role,
      });
      res.setHeader("Authorization", `Bearer ${newAccessToken}`);

      req.user = { id: user._id, role: user.role };

      if (requiredRole && user.role !== requiredRole) {
        return res.status(403).json({ message: "Access denied" });
      }

      return next();
    }
  } catch (error) {
    console.error("Authorization failed: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default authorize;
