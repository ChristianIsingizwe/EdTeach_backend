import { createTransport } from "nodemailer";

const transporter = createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends a verification email.
 *
 * @param {string} email - The recipient's email address.
 * @param {string} code - The plain-text verification code.
 */

const sendVerificationEmail = async (email, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your verification code: ",
    text: `Your verification code is ${code}. It is valid for 5 minutes`,
  };

  await transporter.sendMail(mailOptions);
};

export default sendVerificationEmail
