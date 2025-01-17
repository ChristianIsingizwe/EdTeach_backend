import { createTransport } from "nodemailer";

/**
 * Creates a transport instance using the nodemailer library.
 * - Dynamically supports multiple email services (e.g., Gmail, Yahoo, Outlook).
 *
 * Supported services include:
 * - Gmail
 * - Yahoo
 * - Outlook (Office365)
 * - Other standard SMTP services (custom configurations can be added if required).
 */
const transporter = createTransport({
  service: process.env.EMAIL_SERVICE || "gmail", // Email service (e.g., "gmail", "yahoo").
  auth: {
    user: process.env.EMAIL_USER, // Email address used for authentication.
    pass: process.env.EMAIL_PASS, // Password or app-specific password for authentication.
  },
});

/**
 * Sends a verification email to the specified recipient with a unique code.
 *
 * @param {string} email - The recipient's email address.
 * @param {string} code - The verification code to be sent in the email.
 * @returns {Promise<void>} Resolves when the email is successfully sent.
 *
 * @throws {Error} Throws an error if email sending fails.
 *
 * @example
 * sendVerificationEmail("user@example.com", "123456")
 *   .then(() => console.log("Email sent successfully!"))
 *   .catch(err => console.error("Failed to send email:", err));
 */
const sendVerificationEmail = async (email, code) => {
  // Email configuration with recipient, subject, and message content.
  const mailOptions = {
    from: process.env.EMAIL_USER, // The sender's email address (from field).
    to: email, // The recipient's email address (to field).
    subject: "Your verification code:", // Subject line of the email.
    text: `Your verification code is ${code}. It is valid for 5 minutes`, // Plain text message body.
  };

  // Sends the email using the configured transporter.
  await transporter.sendMail(mailOptions);
};

// Exports the function for use in other modules.
export default sendVerificationEmail;
