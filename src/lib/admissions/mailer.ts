import nodemailer from "nodemailer";
import type { StudentApplication } from "@/types/admissions";

export function generateVerificationEmail({
  fullName,
  otp,
  expiresInMinutes = 10,
}: {
  fullName: string;
  otp: string;
  expiresInMinutes?: number;
}) {
  const subject = "Verify your Nextway College applicant account";
  const text = [
    `Dear ${fullName},`,
    "",
    "Thank you for registering with Nextway College International.",
    `Your email verification code is: ${otp}`,
    `This code expires in ${expiresInMinutes} minutes.`,
    "", 
    "Please enter this code on the verification page to continue your application.",
    "",
    "Regards,",
    "Nextway College International Admissions Team",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.7; max-width: 640px; margin: 0 auto; padding: 24px;">
      <div style="border: 1px solid #f1c40f; border-radius: 12px; padding: 24px; background: #fffdf5;">
        <h2 style="margin: 0 0 16px; color: #0f172a;">Verify your applicant account</h2>
        <p>Dear <strong>${fullName}</strong>,</p>
        <p>Thank you for registering with Nextway College International.</p>
        <p>Your email verification code is:</p>
        <div style="padding: 16px 20px; background: #0f172a; color: #f8fafc; border-radius: 10px; font-size: 28px; letter-spacing: 6px; text-align: center; font-weight: 700; margin: 16px 0;">${otp}</div>
        <p>This code expires in ${expiresInMinutes} minutes.</p>
        <p>Please enter this code on the verification page to continue your application.</p>
      </div>
      <p style="margin-top: 20px; font-size: 12px; color: #64748b;">Regards,<br />Nextway College International Admissions Team</p>
    </div>
  `;

  return { subject, text, html };
}

function isPlaceholderSmtpValue(value?: string) {
  if (!value) return true;
  const normalized = value.trim().toLowerCase();
  return normalized.includes("your-email") || normalized.includes("your-16-character-app-password") || normalized.includes("example.com") || normalized.includes("placeholder");
}

export function createMailerTransport() {
  const host = process.env.SMTP_HOST || process.env.NEXT_SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || process.env.NEXT_SMTP_PORT || 587);
  const user = process.env.SMTP_USER || process.env.NEXT_SMTP_USER;
  const pass = process.env.SMTP_PASS || process.env.NEXT_SMTP_PASS;

  const hasRealSmtpConfig = !isPlaceholderSmtpValue(host) && !isPlaceholderSmtpValue(user) && !isPlaceholderSmtpValue(pass);

  if (hasRealSmtpConfig) {
    return nodemailer.createTransport({
      host,
      port,
      secure: Number(port) === 465,
      auth: { user, pass },
    });
  }

  return nodemailer.createTransport({
    streamTransport: true,
    newline: "unix",
    buffer: true,
  });
}

export async function sendApplicantVerificationEmail({
  fullName,
  email,
  otp,
}: {
  fullName: string;
  email: string;
  otp: string;
}) {
  const { subject, text, html } = generateVerificationEmail({ fullName, otp });
  const transporter = createMailerTransport();

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || "Nextway College International <noreply@nextwaycollege.com>",
    to: email,
    subject,
    text,
    html,
  });

  if (process.env.NODE_ENV !== "production") {
    console.info("[mailer] Verification email queued:", { to: email, otp, preview: info.messageId || "smtp-stream" });
  }

  return info;
}

export async function sendApplicationConfirmationEmail(
  app: StudentApplication,
  pdfBuffer: Buffer,
) {
  const transporter = createMailerTransport();
  const subject = `Application Submitted - ${app.applicationNumber}`;
  const text = [
    `Dear ${app.personalInfo.fullName},`,
    "",
    `Your application to Nextway College International has been successfully submitted.`,
    `Application ID: ${app.applicationNumber}`,
    `Programme: ${app.programmeChoice.programmeTitle}`,
    `Intake: ${app.programmeChoice.intake}`,
    "",
    "Your submitted application has been attached as a PDF for your records.",
    "",
    "Regards,",
    "Nextway College International Admissions Team",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #1f2937; max-width: 640px; margin: 0 auto; padding: 24px;">
      <div style="border: 1px solid #f1c40f; border-radius: 12px; padding: 24px; background: linear-gradient(135deg, #fffdf5 0%, #f8fafc 100%);">
        <h2 style="margin-top: 0; color: #0f172a;">Application submitted successfully</h2>
        <p>Dear <strong>${app.personalInfo.fullName}</strong>,</p>
        <p>Your application has been received by Nextway College International.</p>
        <p><strong>Application ID:</strong> ${app.applicationNumber}</p>
        <p><strong>Programme:</strong> ${app.programmeChoice.programmeTitle}</p>
        <p><strong>Intake:</strong> ${app.programmeChoice.intake}</p>
        <p>Your application PDF has been attached to this email for your records.</p>
      </div>
      <p style="margin-top: 20px; font-size: 12px; color: #64748b;">Regards,<br />Nextway College International Admissions Team</p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || "Nextway College International <noreply@nextwaycollege.com>",
    to: app.personalInfo.email,
    subject,
    text,
    html,
    attachments: [
      {
        filename: `${app.applicationNumber}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });

  if (process.env.NODE_ENV !== "production") {
    console.info("[mailer] Confirmation email queued:", { to: app.personalInfo.email, appId: app.applicationNumber, preview: info.messageId || "smtp-stream" });
  }

  return info;
}
