import { getReplyToAddress, getSenderAddress, sendEmail } from "./email-provider.js";
import { signEmail } from "./unsubscribe-announcements.js";

const getAnnouncementRecipientLimit = () => {
  const configured = Number(process.env.ANNOUNCEMENT_EMAIL_LIMIT || 500);
  return Number.isFinite(configured) && configured > 0 ? configured : 500;
};

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const splitLines = (value = "") =>
  String(value)
    .split(/\n{2,}/)
    .map((line) => line.trim())
    .filter(Boolean);

const getSupabaseConfig = () => ({
  url: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "",
  key: process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || "",
});

const getPublicSiteUrl = () =>
  (process.env.PUBLIC_SITE_URL || "https://tournaments.bowlerbuildersproshop.com").replace(/\/$/, "");

const normalizeRecipients = (recipients = []) => {
  const byEmail = new Map();
  (Array.isArray(recipients) ? recipients : []).forEach((recipient) => {
    const email = String(recipient?.email || "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    if (!byEmail.has(email)) {
      byEmail.set(email, {
        email,
        name: String(recipient?.name || "").trim(),
      });
    }
  });
  return Array.from(byEmail.values());
};

const verifyAdmin = async (request) => {
  const authHeader = request.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) return { ok: false, status: 401, error: "Admin login is required." };

  const { url, key } = getSupabaseConfig();
  if (!url || !key) return { ok: false, status: 500, error: "Supabase API config is missing." };

  const userResponse = await fetch(`${url.replace(/\/$/, "")}/auth/v1/user`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${token}`,
    },
  });
  const user = await userResponse.json().catch(() => ({}));
  if (!userResponse.ok || !user?.id) return { ok: false, status: 401, error: "Admin login could not be verified." };

  const rpcProfileResponse = await fetch(`${url.replace(/\/$/, "")}/rest/v1/rpc/my_admin_profile`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  const rpcProfiles = await rpcProfileResponse.json().catch(() => []);
  let profile = Array.isArray(rpcProfiles) ? rpcProfiles[0] : null;

  if (!profile) {
    const profileResponse = await fetch(`${url.replace(/\/$/, "")}/rest/v1/admin_profiles?select=user_id,email,role&user_id=eq.${encodeURIComponent(user.id)}`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${token}`,
      },
    });
    const profiles = await profileResponse.json().catch(() => []);
    profile = Array.isArray(profiles) ? profiles[0] : null;
    if (!profileResponse.ok || !profile) return { ok: false, status: 403, error: "Approved admin access is required." };
  }

  return { ok: true, profile, user, token };
};

const loadUnsubscribedEmails = async (accessToken = "") => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key || !accessToken) return new Set();

  const unsubscribeResponse = await fetch(`${url.replace(/\/$/, "")}/rest/v1/announcement_unsubscribes?select=email`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const rows = await unsubscribeResponse.json().catch(() => []);
  if (!unsubscribeResponse.ok || !Array.isArray(rows)) return new Set();
  return new Set(rows.map((row) => String(row.email || "").trim().toLowerCase()).filter(Boolean));
};

const announcementHtml = ({ subject, message, tournament = {}, recipientEmail = "", flyer = null }) => {
  const siteUrl = getPublicSiteUrl();
  const reservationUrl = `${siteUrl}/?view=public&tab=publicreservations`;
  const unsubscribeUrl = `${siteUrl}/api/unsubscribe-announcements?email=${encodeURIComponent(recipientEmail)}&token=${signEmail(recipientEmail)}`;
  const logoUrl = `${siteUrl}/favicon.jpeg`;
  const tournamentName = tournament.name || "Bowler Builders Tournament";
  const eventDate = tournament.date || "";
  const eventTime = tournament.startTime || "";
  const center = tournament.center || "";
  const paragraphs = splitLines(message);
  const flyerSrc = String(flyer?.src || "").trim();
  const flyerAlt = flyer?.name || `${tournamentName} flyer`;

  return `
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
                        <img src="${logoUrl}" alt="Bowler Builders" width="76" style="display:block;width:76px;height:auto;border:0">
                      </td>
                      <td style="vertical-align:middle">
                        <div style="font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#93c5fd">Bowler Builders</div>
                        <div style="font-size:24px;font-weight:900;line-height:1.15;color:#ffffff">Tournament Announcement</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:24px 24px 10px">
                  <div style="font-size:14px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#0f3f86">${escapeHtml(tournamentName)}</div>
                  <h1 style="margin:6px 0 8px;color:#0f172a;font-size:28px;line-height:1.15">${escapeHtml(subject)}</h1>
                  ${paragraphs.map((paragraph) => `<p style="margin:0 0 16px;font-size:16px;color:#334155">${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`).join("")}
                </td>
              </tr>
              ${flyerSrc ? `
              <tr>
                <td style="padding:0 24px 22px">
                  <div style="background:#08111f;border:1px solid #bfdbfe;padding:10px;text-align:center">
                    <img src="${escapeHtml(flyerSrc)}" alt="${escapeHtml(flyerAlt)}" style="display:block;width:100%;max-width:620px;height:auto;margin:0 auto;border:0">
                  </div>
                </td>
              </tr>
              ` : ""}
              <tr>
                <td style="padding:0 24px 22px">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border-top:1px solid #dbeafe;background:#f8fbff">
                    <tbody>
                      <tr><td style="padding:11px 12px;border-bottom:1px solid #dbeafe;color:#475569;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;width:34%">Tournament</td><td style="padding:11px 12px;border-bottom:1px solid #dbeafe;color:#0f172a;font-size:15px;font-weight:700">${escapeHtml(tournamentName)}</td></tr>
                      ${eventDate ? `<tr><td style="padding:11px 12px;border-bottom:1px solid #dbeafe;color:#475569;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;width:34%">Date</td><td style="padding:11px 12px;border-bottom:1px solid #dbeafe;color:#0f172a;font-size:15px;font-weight:700">${escapeHtml(eventDate)}</td></tr>` : ""}
                      ${eventTime ? `<tr><td style="padding:11px 12px;border-bottom:1px solid #dbeafe;color:#475569;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;width:34%">Start Time</td><td style="padding:11px 12px;border-bottom:1px solid #dbeafe;color:#0f172a;font-size:15px;font-weight:700">${escapeHtml(eventTime)}</td></tr>` : ""}
                      ${center ? `<tr><td style="padding:11px 12px;border-bottom:1px solid #dbeafe;color:#475569;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;width:34%">Center</td><td style="padding:11px 12px;border-bottom:1px solid #dbeafe;color:#0f172a;font-size:15px;font-weight:700">${escapeHtml(center)}</td></tr>` : ""}
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:0 24px 24px">
                  <a href="${reservationUrl}" style="display:inline-block;background:#0f3f86;color:#ffffff;text-decoration:none;font-weight:900;padding:12px 16px;border:1px solid #0f3f86">Reserve Your Spot</a>
                  <p style="margin:16px 0 0;color:#64748b;font-size:12px"><a href="${unsubscribeUrl}" style="color:#64748b;text-decoration:underline">Unsubscribe from tournament announcement emails</a></p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
};

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const admin = await verifyAdmin(request);
  if (!admin.ok) return response.status(admin.status).json({ error: admin.error });

  try {
    const body = request.body || {};
    const subject = String(body.subject || "").trim();
    const message = String(body.message || "").trim();
    const tournament = body.tournament || {};
    const flyer = body.flyer || null;
    const testEmail = String(body.testEmail || "").trim();
    const isTest = Boolean(testEmail);
    const recipients = isTest
      ? normalizeRecipients([{ email: testEmail, name: "Test Recipient" }])
      : normalizeRecipients(body.recipients || []);

    if (!subject) return response.status(400).json({ error: "Subject is required." });
    if (!message) return response.status(400).json({ error: "Message is required." });
    if (!recipients.length) return response.status(400).json({ error: "No valid recipients were provided." });
    const unsubscribedEmails = await loadUnsubscribedEmails(admin.token);
    const sendableRecipients = isTest
      ? recipients
      : recipients.filter((recipient) => !unsubscribedEmails.has(recipient.email));
    if (!sendableRecipients.length) return response.status(400).json({ error: "All selected recipients have unsubscribed from announcement emails." });
    const recipientLimit = getAnnouncementRecipientLimit();
    if (sendableRecipients.length > recipientLimit) {
      return response.status(400).json({ error: `Recipient list is limited to ${recipientLimit} emails per send.` });
    }

    const from = getSenderAddress();
    const replyTo = getReplyToAddress();
    const sent = [];
    const failed = [];

    for (const recipient of sendableRecipients) {
      const result = await sendEmail({
        from,
        to: [recipient.email],
        subject: isTest ? `[Test] ${subject}` : subject,
        html: announcementHtml({ subject, message, tournament, recipientEmail: recipient.email, flyer }),
        replyTo,
      });

      if (result.skipped) {
        failed.push({ email: recipient.email, error: result.reason, provider: result.provider });
        continue;
      }

      if (!result.response.ok) {
        failed.push({
          email: recipient.email,
          provider: result.provider,
          status: result.response.status,
          error: result.result?.Messages?.[0]?.Errors?.[0]?.ErrorMessage || result.result?.message || "Email could not be sent.",
        });
        continue;
      }

      sent.push({ email: recipient.email, provider: result.provider });
    }

    if (failed.length) {
      return response.status(sent.length ? 207 : 500).json({ sent: sent.length, skippedUnsubscribed: recipients.length - sendableRecipients.length, failed, provider: sent[0]?.provider || failed[0]?.provider || "none" });
    }

    return response.status(200).json({ sent: sent.length, skippedUnsubscribed: recipients.length - sendableRecipients.length, failed: [], provider: sent[0]?.provider || "none" });
  } catch (error) {
    return response.status(500).json({ error: error.message || "Announcement email could not be sent." });
  }
}
