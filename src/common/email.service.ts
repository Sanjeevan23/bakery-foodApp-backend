//src/common/email.service.ts
import * as nodemailer from 'nodemailer';

export const sendOtpEmail = async (email: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: '"Pizza Casa" <no-reply@pizza-casa.com>',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
  });
};
