import { sendOTP } from "../utils/sendOTP";
import { mailer } from "../lib/mailer";

jest.mock("nodemailer");

describe("sendOTP", () => {
  test("should send an OTP email successfully", async () => {
    mailer.sendEmail = jest.fn().mockResolvedValue("Email sent");
    await expect(sendOTP("test@example.com", "123456")).resolves.not.toThrow();
    expect(mailer.sendEmail).toHaveBeenCalled();
  });

  test("should throw an error if email sending fails", async () => {
    mailer.sendEmail = jest.fn().mockRejectedValue(new Error("Failed"));
    await expect(sendOTP("test@example.com", "123456")).rejects.toThrow(
      "Sending OTP Failed: Error: Failed"
    );
  });
});
