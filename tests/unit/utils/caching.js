import {
  getCachedData,
  setCachedData,
  deleteCachedData,
} from "../utils/cacheUtils";
import redis from "../redis";

jest.mock("../redis", () => ({
  get: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
}));

jest.mock("nodemailer");

describe("Redis Caching Utilities", () => {
  const mockKey = "testKey";
  const mockData = { message: "Hello World" };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("getCachedData should return parsed data if cache hit", async () => {
    redis.get.mockResolvedValue(JSON.stringify(mockData));
    const result = await getCachedData(mockKey);
    expect(result).toEqual(mockData);
    expect(redis.get).toHaveBeenCalledWith(mockKey);
  });

  test("getCachedData should return null if cache miss", async () => {
    redis.get.mockResolvedValue(null);
    const result = await getCachedData(mockKey);
    expect(result).toBeNull();
  });

  test("setCachedData should store data in Redis with expiration", async () => {
    await setCachedData(mockKey, mockData, 3600);
    expect(redis.setex).toHaveBeenCalledWith(
      mockKey,
      3600,
      JSON.stringify(mockData)
    );
  });

  test("deleteCachedData should remove data from Redis", async () => {
    await deleteCachedData(mockKey);
    expect(redis.del).toHaveBeenCalledWith(mockKey);
  });
});
