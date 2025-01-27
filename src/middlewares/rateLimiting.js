import rateLimit from "express-rate-limit";

const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: "Too many requests. Try again later",
});

const authRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: "Too many authentication requests, please try again later",
});

const adminRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: "Too many actions for admin actions, please try again later",
});

export { generalRateLimiter, authRateLimiter, adminRateLimiter };
