import fs from "fs-extra";
import ensureUploadDir from "../utils/ensureUploadDir";

jest.mock("fs-extra");

describe("ensureUploadDir Utility Function", () => {
  const testDir = "/mock/uploads";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create the directory if it does not exist", () => {
    fs.existsSync.mockReturnValue(false);
    ensureUploadDir(testDir);
    expect(fs.mkdirSync).toHaveBeenCalledWith(testDir, { recursive: true });
  });

  it("should not create the directory if it already exists", () => {
    fs.existsSync.mockReturnValue(true);
    ensureUploadDir(testDir);
    expect(fs.mkdirSync).not.toHaveBeenCalled();
  });
});
