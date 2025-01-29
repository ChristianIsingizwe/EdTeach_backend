import { mailer } from "../lib/mailer.js";

export const sendOTP = async (email, otp) => {
  const config = {
    to: email,
    subject: "Your OTP for Multi-Factor Authentication",
    html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #007bff;">Your OTP Code</h2>
        <p>Hello,</p>
        <p>Your OTP for logging into the platform is:</p>
        <h1 style="color: #007bff; text-align: center;">${otp}</h1>
        <p>Please use this code within the next 5 minutes. Do not share this code with anyone for security reasons.</p>
        <hr style="border: none; border-top: 1px solid #ddd;" />
        <p style="font-size: 12px; color: #777;">If you did not request this email, please ignore it or contact support immediately.</p>
        <p style="font-size: 12px; color: #777;">Thank you, <br>EdTech Platform Team</p>
        </div>
    `,
  };

  try {
    await mailer.sendEmail(config);
  } catch (error) {
    console.log(error);
    throw new Error(`Sending OTP Failed: ${error}`);
  }
};
