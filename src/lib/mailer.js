import "dotenv/config";
import nodemailer from "nodemailer";
import { google } from "googleapis";

class Mailer {
  constructor() {
    if (!process.env.GOOGLE_REFRESH_TOKEN) {
      throw new Error(
        "Google refresh token is missing. Set GOOGLE_REFRESH_TOKEN in environment variables."
      );
    }

    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );

    this.oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    this.transporter = null;
  }

  async createTransporter() {
    try {
      const accessTokenResponse = await this.oauth2Client.getAccessToken();
      const accessToken = accessTokenResponse?.token || "";

      if (!accessToken) {
        throw new Error(
          "Failed to generate access token. Check your credentials and refresh token."
        );
      }

      return nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: process.env.EMAIL_USER,
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
          accessToken,
        },
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
      });
    } catch (error) {
      console.error("Error creating transporter", error);
      throw error;
    }
  }

  async getTransporter() {
    if (!this.transporter) {
      this.transporter = await this.createTransporter();
    }
    return this.transporter;
  }

  async sendEmail(config) {
    try {
      const transporter = await this.getTransporter();
      await transporter.sendMail({
        ...config,
        from: `"Umurava" <${process.env.EMAIL_USER}>`,
      });
      console.log("Email sent successfully");
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }
}

export const mailer = new Mailer();
