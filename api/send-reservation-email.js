import { getReplyToAddress, getSenderAddress, sendEmail, splitEmails } from "./email-provider.js";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatStartTime = (time = "") => {
  if (!time) return "";
  const [hourText, minuteText = "00"] = String(time).split(":");
  const hour = Number(hourText);
  if (!Number.isFinite(hour)) return time;
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minuteText.padStart(2, "0")} ${suffix}`;
};

const getPublicSiteUrl = () =>
  (process.env.PUBLIC_SITE_URL || "https://tournaments.bowlerbuildersproshop.com").replace(/\/$/, "");

const infoRow = (label, value) => `
  <tr>
    <td style="padding:11px 12px;border-bottom:1px solid #dbeafe;color:#475569;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;width:34%">${escapeHtml(label)}</td>
    <td style="padding:11px 12px;border-bottom:1px solid #dbeafe;color:#0f172a;font-size:15px;font-weight:700">${escapeHtml(value || "")}</td>
  </tr>
`;

const reservationHtml = ({ reservation = {}, tournament = {} }) => {
  const confirmationNumber = reservation.registrationNumber || reservation.confirmationNumber || "Pending";
  const status = reservation.status || "Registered";
  const displayName = reservation.nickname || reservation.name || "Bowler";
  const eventDate = tournament.date || reservation.tournamentDate || "";
  const startTime = formatStartTime(tournament.startTime || reservation.tournamentStartTime || "");
  const center = tournament.center || reservation.tournamentCenter || "";
  const address = tournament.address || tournament.location || reservation.tournamentAddress || "";
  const siteUrl = getPublicSiteUrl();
  const logoUrl = `${siteUrl}/favicon.jpeg`;
  const tournamentName = tournament.name || reservation.tournament || "Tournament";
  const statusColor = String(status).toLowerCase().includes("wait") ? "#b45309" : "#047857";

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
                        <div style="font-size:24px;font-weight:900;line-height:1.15;color:#ffffff">Reservation Confirmation</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:24px 24px 10px">
                  <div style="font-size:14px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#0f3f86">${escapeHtml(tournamentName)}</div>
                  <h1 style="margin:6px 0 8px;color:#0f172a;font-size:28px;line-height:1.15">Confirmation #${escapeHtml(confirmationNumber)}</h1>
                  <p style="margin:0 0 18px;font-size:16px;color:#334155">Thanks, <strong>${escapeHtml(displayName)}</strong>. Your reservation has been received.</p>
                  <div style="display:inline-block;margin:0 0 20px;padding:8px 13px;background:#eff6ff;border:1px solid #bfdbfe;color:${statusColor};font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:.06em">${escapeHtml(status)}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:0 24px 22px">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border-top:1px solid #dbeafe;background:#f8fbff">
                    <tbody>
                      ${infoRow("Tournament", tournamentName)}
                      ${infoRow("Date", eventDate || "TBD")}
                      ${infoRow("Start Time", startTime || "TBD")}
                      ${infoRow("Center", center || "TBD")}
                      ${infoRow("Address", address || "TBD")}
                      ${infoRow("Name", reservation.name || "")}
                      ${infoRow("Nickname", reservation.nickname || "")}
                      ${infoRow("Phone", reservation.phone || "")}
                      ${infoRow("Email", reservation.email || "")}
                      ${reservation.note ? infoRow("Note", reservation.note) : ""}
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:0 24px 24px">
                  <p style="margin:0 0 16px;color:#475569;font-size:14px">If you need to withdraw, please email bowlerbuildersproshop@yahoo.com as soon as possible.</p>
                  <a href="${siteUrl}" style="display:inline-block;background:#0f3f86;color:#ffffff;text-decoration:none;font-weight:900;padding:12px 16px;border:1px solid #0f3f86">View Tournament Hub</a>
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

  try {
    const body = request.body || {};
    const reservation = body.reservation || {};
    const tournament = body.tournament || {};
    const notificationEmails = [...new Set([
      ...splitEmails(process.env.RESERVATION_NOTIFICATION_EMAILS),
      ...splitEmails(body.notificationEmails),
    ])];
    const to = splitEmails(reservation.email);

    if (!to.length && !notificationEmails.length) {
      return response.status(400).json({ error: "No email recipients were provided." });
    }

    const confirmationNumber = reservation.registrationNumber || reservation.confirmationNumber || "";
    const subject = `Reservation ${confirmationNumber ? `#${confirmationNumber} ` : ""}${reservation.status || "Confirmed"} - ${tournament.name || reservation.tournament || "Tournament"}`;
    const from = getSenderAddress();
    const replyTo = getReplyToAddress();
    const html = reservationHtml({ reservation, tournament });
    const sendProviderEmail = async ({ recipients, emailSubject }) =>
      sendEmail({
        from,
        to: recipients,
        subject: emailSubject,
        html,
        replyTo,
      });

    const sends = [];
    if (to.length) sends.push({ kind: "entrant", result: await sendProviderEmail({ recipients: to, emailSubject: subject }) });
    if (notificationEmails.length) sends.push({ kind: "copy", result: await sendProviderEmail({ recipients: notificationEmails, emailSubject: `Copy: ${subject}` }) });

    const skipped = sends.find((item) => item.result?.skipped);
    if (skipped) {
      return response.status(200).json({ sent: false, skipped: true, reason: skipped.result.reason, results: sends });
    }

    const results = sends.map(({ kind, result }) => ({
      kind,
      provider: result.provider,
      ok: result.response.ok,
      status: result.response.status,
      result: result.result,
    }));
    const failed = results.find((item) => !item.ok);
    if (failed) {
      return response.status(failed.status).json({
        error: failed.result?.Messages?.[0]?.Errors?.[0]?.ErrorMessage || failed.result?.message || `${failed.kind} email could not be sent.`,
        details: failed.result,
        provider: failed.provider,
        results,
      });
    }

    return response.status(200).json({ sent: true, provider: results[0]?.provider || "none", results });
  } catch (error) {
    return response.status(500).json({ error: error.message || "Email could not be sent." });
  }
}
