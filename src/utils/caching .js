import { redis } from "..";

const CACHE_EXPIRATION = 3600;

const getCachedData = async (key) => {
  const cachedData = await redis.get(key);
  return cachedData ? JSON.parse(cachedData) : null;
};

const setCachedData = async (key, data, expiration = CACHE_EXPIRATION) => {
  await redis.setex(key, expiration, JSON.stringify(data));
};

const deleteCachedData = async (key) => {
  await redis.del(key);
};

export { getCachedData, setCachedData, deleteCachedData };
 