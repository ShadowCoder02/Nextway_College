export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function isOtpCodeValid(expectedOtp: string, submittedOtp: string): boolean {
  return expectedOtp.trim() === submittedOtp.trim();
}
