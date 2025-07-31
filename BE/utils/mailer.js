const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 8px; border: 1px solid #eee;">
      <h2 style="color: #008000;">🔐 Password Reset Request</h2>
      <p>Hi there,</p>
      <p>We received a request to reset the password associated with your account on <strong>OLX Clone</strong>.</p>
      <p style="margin: 20px 0; font-size: 18px;">
        Your One-Time Password (OTP) is:
        <br />
        <strong style="font-size: 24px; color: #e67e22;">${otp}</strong>
      </p>
      <p>This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
      <p>If you did not request this, you can safely ignore this email.</p>
      <br />
      <p style="font-size: 14px; color: #999;">Thanks,<br />Team OLX Clone</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"OLX Clone" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: htmlContent,
  });
};

module.exports = sendEmail;
