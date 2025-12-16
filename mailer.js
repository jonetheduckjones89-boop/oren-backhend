import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.RESEND_API_KEY) {
  console.error("FATAL: Missing RESEND_API_KEY environment variable");
  process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendClinicEmail({ clinic_name, clinic_type, email }) {
  try {
    const cleanClinicName = clinic_name ? clinic_name.trim() : "your clinic";
    // Normalize clinic type (e.g. "Dental" -> "dental")
    const cleanType = clinic_type ? clinic_type.trim().toLowerCase() : null;

    const subject = `Quick note for ${cleanClinicName}`;

    // Dynamic opening based on whether we know the clinic type
    const introSentence = cleanType
      ? `We work with ${cleanType} clinics to automate patient data securely.`
      : `We help clinics automate patient data and daily operations.`;

    const emailPayload = {
      from: "OREN <onboarding@resend.dev>", // TODO: User should verify this domain in Resend
      to: email,
      subject: subject,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px;">
          <p>Hi ${cleanClinicName},</p>

          <p>${introSentence}</p>

          <p>
            OREN quietly runs workflows in the background — reducing admin load without disrupting your staff.
          </p>

          <p>
            If you're open to it, I can walk you through how it works for your specific setup.
          </p>

          <div style="margin-top: 32px;">
            <p style="margin: 0;">Best,</p>
            <p style="margin: 0; font-weight: 500;">Bexruz</p>
            <p style="margin: 0; color: #666; font-size: 14px;">Founder, OREN</p>
          </div>
        </div>
      `,
      text: `Hi ${cleanClinicName},\n\n${introSentence}\n\nOREN quietly runs workflows in the background — reducing admin load without disrupting your staff.\n\nIf you're open to it, I can walk you through how it works for your specific setup.\n\nBest,\nBexruz\nFounder, OREN` // Plain text fallback
    };

    // Optional: Silent copy to founder for monitoring if configured
    if (process.env.FOUNDER_EMAIL) {
      emailPayload.bcc = process.env.FOUNDER_EMAIL;
    }

    const { data, error } = await resend.emails.send(emailPayload);

    if (error) {
      console.error("Resend Email Error:", error);
      throw new Error("Failed to send email via Resend");
    }

    return { success: true, id: data.id };
  } catch (err) {
    // Log the error securely (server-side only)
    console.error("Email Sending Exception:", err.message);
    // We re-throw or handle based on caller, but prompt requested reliability.
    // If this fails, the detailed error is logged here.
    throw err;
  }
}
