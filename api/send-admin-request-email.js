const RESEND_ENDPOINT = "https://api.resend.com/emails";

const splitEmails = (value = "") =>
  String(value)
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const getSenderAddress = () => {
  const configuredSender = process.env.RESERVATION_EMAIL_FROM || "";
  const unverifiedPublicDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "icloud.com"];
  const usesPublicDomain = unverifiedPublicDomains.some((domain) => configuredSender.toLowerCase().includes(`@${domain}`));
  return configuredSender && !usesPublicDomain
    ? configuredSender
    : "Bowler Builders <onboarding@resend.dev>";
};

const getReplyToAddress = () => {
  const configuredReplyTo = process.env.RESERVATION_REPLY_TO || "";
  return configuredReplyTo.trim() || undefined;
};

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

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return response.status(200).json({ sent: false, skipped: true, reason: "RESEND_API_KEY is not configured" });
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
    const sent = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getSenderAddress(),
        to: notificationEmails,
        subject: `Admin access request - ${email}`,
        html: requestHtml({ email, createdAt: body.createdAt || "" }),
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    const result = await sent.json().catch(() => ({}));
    if (!sent.ok) {
      return response.status(sent.status).json({ error: result.message || "Admin request email could not be sent.", details: result });
    }

    return response.status(200).json({ sent: true, result });
  } catch (error) {
    return response.status(500).json({ error: error.message || "Admin request email could not be sent." });
  }
}
