import nodemailer from 'nodemailer';

export async function sendEmail(email: string, otp: string) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true', 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"OTP Service" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}`,
      html: `<h2>Your OTP is: <b>${otp}</b></h2>`,
    });

    console.log("Email sent:", info.messageId);
  } catch (err) {
    console.error("Email sending failed:", err);
    throw new Error("Unable to send OTP email");
  }
}
