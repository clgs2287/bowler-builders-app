import { getReplyToAddress, getSenderAddress, sendEmail, splitEmails } from "./email-provider.js";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const requestHtml = ({ email = "", createdAt = "" }) => `
  <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.5">
    <h1 style="color:#0f3f86;margin-bottom:4px">Admin Account Request</h1>
    <p>A new account requested Bowler Builders Tournament Hub admin access.</p>
    <table style="border-collapse:collapse;margin-top:18px;width:100%;max-width:640px">
      <tbody>
        <tr><td style="padding:8px;border-bottom:1px solid #dbeafe"><strong>Email</strong></td><td style="padding:8px;border-bottom:1px solid #dbeafe">${escapeHtml(email)}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #dbeafe"><strong>Requested</strong></td><td style="padding:8px;border-bottom:1px solid #dbeafe">${escapeHtml(createdAt || new Date().toLocaleString("en-US", { timeZone: "America/New_York" }))}</td></tr>
      </tbody>
    </table>
    <p style="margin-top:18px">Approve this user by adding their email to <strong>public.admin_profiles</strong> in Supabase.</p>
  </div>
`;

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = request.body || {};
    const email = String(body.email || "").trim();
    const notificationEmails = [...new Set([
      ...splitEmails(process.env.ADMIN_APPROVAL_EMAILS),
      ...splitEmails(process.env.RESERVATION_NOTIFICATION_EMAILS),
    ])];

    if (!email) {
      return response.status(400).json({ error: "Request email is required." });
    }
    if (!notificationEmails.length) {
      return response.status(200).json({ sent: false, skipped: true, reason: "No admin approval recipients configured" });
    }

    const replyTo = getReplyToAddress();
    const sent = await sendEmail({
      from: getSenderAddress(),
      to: notificationEmails,
      subject: `Admin access request - ${email}`,
      html: requestHtml({ email, createdAt: body.createdAt || "" }),
      replyTo,
    });

    if (sent.skipped) {
      return response.status(200).json({ sent: false, skipped: true, reason: sent.reason });
    }

    if (!sent.response.ok) {
      return response.status(sent.response.status).json({
        error: sent.result?.Messages?.[0]?.Errors?.[0]?.ErrorMessage || sent.result?.message || "Admin request email could not be sent.",
        details: sent.result,
        provider: sent.provider,
      });
    }

    return response.status(200).json({ sent: true, provider: sent.provider, result: sent.result });
  } catch (error) {
    return response.status(500).json({ error: error.message || "Admin request email could not be sent." });
  }
}
