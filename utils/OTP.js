import nodemailer from "nodemailer";
import { google } from "googleapis";

const { OAuth2 } = google.auth;

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID; // Your Google client ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET; // Your Google client secret
const REDIRECT_URI = "https://developers.google.com/oauthplayground"; // OAuth Playground or your redirect URI
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN; // OAuth2 Refresh Token

const oAuth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

oAuth2Client.setCredentials({
  refresh_token: REFRESH_TOKEN,
});

const sendOTP = async (email, otp) => {
  try {
    const accessTokenResponse = await oAuth2Client.getAccessToken();
    const accessToken = accessTokenResponse.token;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Umurava OTP",
      html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                  <h2 style="color: #333; text-align: center;">Your Umurava OTP</h2>
                  <p style="font-size: 16px; color: #555;">
                      Hello,
                  </p>
                  <p style="font-size: 16px; color: #555;">
                      Your OTP is:
                  </p>
                  <div style="text-align: center; margin: 20px 0;">
                      <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #007BFF; padding: 10px 20px; border: 2px solid #007BFF; border-radius: 5px;">
                          ${otp}
                      </span>
                  </div>
                  <p style="font-size: 16px; color: #555;">
                      Please use this OTP within the next <strong>5 minutes</strong>.
                  </p>
                  <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                  <footer style="font-size: 14px; color: #777; text-align: center;">
                      Thank you for using Umurava. If you did not request this OTP, please ignore this email.
                  </footer>
              </div>
            `,
    };

    // Send the email using the transporter
    await transporter.sendMail(mailOptions);
    console.log("OTP sent successfully");
  } catch (error) {
    console.error("Error sending OTP: ", error);
  }
};

export default sendOTP;
