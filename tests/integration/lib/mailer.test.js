describe("Mailer Integration Tests", () => {
  let transporterMock;

  beforeAll(() => {
    transporterMock = {
      sendMail: jest.fn().mockResolvedValue("Email sent"),
    };
    nodemailer.createTransport.mockReturnValue(transporterMock);
  });

  test("should successfully send an email", async () => {
    const emailConfig = {
      to: "test@example.com",
      subject: "Test Email",
      html: "<p>Test Content</p>",
    };

    await expect(mailer.sendEmail(emailConfig)).resolves.not.toThrow();
    expect(transporterMock.sendMail).toHaveBeenCalledWith(
      expect.objectContaining(emailConfig)
    );
  });

  test("should handle email sending failure", async () => {
    transporterMock.sendMail.mockRejectedValue(new Error("Email failed"));
    const emailConfig = {
      to: "test@example.com",
      subject: "Test Email",
      html: "<p>Test Content</p>",
    };

    await expect(mailer.sendEmail(emailConfig)).rejects.toThrow("Email failed");
  });
});
