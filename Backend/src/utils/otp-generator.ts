//Security-nestjs\Backend\backend\src\utils\otp-generator.ts

export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
