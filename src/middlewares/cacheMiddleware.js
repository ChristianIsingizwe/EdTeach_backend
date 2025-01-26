import { redis } from "..";

const cacheMiddlware = (keyGenerator) => async (req, res, next) => {
  try {
    const cacheKey = keyGenerator(req);
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      console.log(`Cache hit for key: ${cacheKey}`);
      return res.status(200).json(JSON.parse(cachedData));
    }
    console.log(`Cache miss for: ${cacheKey}`);

    res.locals.cacheKey = cacheKey;
    next();
  } catch (error) {
    console.error("An error occurred");
    next();
  }
};

export default cacheMiddlware;
