import { getReplyToAddress, getSenderAddress, sendEmail, splitEmails } from "./email-provider.js";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const getPublicSiteUrl = () =>
  (process.env.PUBLIC_SITE_URL || "https://tournaments.bowlerbuildersproshop.com").replace(/\/$/, "");

const requestHtml = ({ email = "", createdAt = "" }) => `
  <div style="margin:0;padding:0;background:#e2effc;font-family:Arial,sans-serif;color:#0f172a;line-height:1.5">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#e2effc">
      <tr>
        <td align="center" style="padding:24px 12px">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;max-width:680px;background:#ffffff;border:1px solid #bfdbfe">
            <tr>
              <td style="background:#08111f;padding:18px 22px;color:#ffffff">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">
                  <tr>
                    <td style="vertical-align:middle;width:92px">
                      <img src="${getPublicSiteUrl()}/favicon.jpeg" alt="Bowler Builders" width="76" style="display:block;width:76px;height:auto;border:0">
                    </td>
                    <td style="vertical-align:middle">
                      <div style="font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#93c5fd">Bowler Builders</div>
                      <div style="font-size:24px;font-weight:900;line-height:1.15;color:#ffffff">Admin Account Request</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px">
                <p style="margin:0 0 18px;font-size:16px;color:#334155">A new account requested Bowler Builders Tournament Hub admin access.</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border-top:1px solid #dbeafe;background:#f8fbff">
                  <tbody>
                    <tr>
                      <td style="padding:11px 12px;border-bottom:1px solid #dbeafe;color:#475569;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;width:34%">Email</td>
                      <td style="padding:11px 12px;border-bottom:1px solid #dbeafe;color:#0f172a;font-size:15px;font-weight:700">${escapeHtml(email)}</td>
                    </tr>
                    <tr>
                      <td style="padding:11px 12px;border-bottom:1px solid #dbeafe;color:#475569;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;width:34%">Requested</td>
                      <td style="padding:11px 12px;border-bottom:1px solid #dbeafe;color:#0f172a;font-size:15px;font-weight:700">${escapeHtml(createdAt || new Date().toLocaleString("en-US", { timeZone: "America/New_York" }))}</td>
                    </tr>
                  </tbody>
                </table>
                <p style="margin:18px 0 0;color:#475569;font-size:14px">Approve this user by adding their email to <strong>public.admin_profiles</strong> in Supabase.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
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
