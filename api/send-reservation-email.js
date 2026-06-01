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

const formatStartTime = (time = "") => {
  if (!time) return "";
  const [hourText, minuteText = "00"] = String(time).split(":");
  const hour = Number(hourText);
  if (!Number.isFinite(hour)) return time;
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minuteText.padStart(2, "0")} ${suffix}`;
};

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

const reservationHtml = ({ reservation = {}, tournament = {} }) => {
  const confirmationNumber = reservation.registrationNumber || reservation.confirmationNumber || "Pending";
  const status = reservation.status || "Registered";
  const displayName = reservation.nickname || reservation.name || "Bowler";
  const eventDate = tournament.date || reservation.tournamentDate || "";
  const startTime = formatStartTime(tournament.startTime || reservation.tournamentStartTime || "");
  const center = tournament.center || reservation.tournamentCenter || "";
  const address = tournament.address || tournament.location || reservation.tournamentAddress || "";

  return `
    <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.5">
      <h1 style="color:#0f3f86;margin-bottom:4px">Reservation Confirmed</h1>
      <p style="font-size:18px;margin-top:0"><strong>Confirmation #${escapeHtml(confirmationNumber)}</strong></p>
      <p>Thanks, ${escapeHtml(displayName)}. Your reservation has been received.</p>
      <table style="border-collapse:collapse;margin-top:18px;width:100%;max-width:640px">
        <tbody>
          <tr><td style="padding:8px;border-bottom:1px solid #dbeafe"><strong>Tournament</strong></td><td style="padding:8px;border-bottom:1px solid #dbeafe">${escapeHtml(tournament.name || reservation.tournament || "Tournament")}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #dbeafe"><strong>Status</strong></td><td style="padding:8px;border-bottom:1px solid #dbeafe">${escapeHtml(status)}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #dbeafe"><strong>Date</strong></td><td style="padding:8px;border-bottom:1px solid #dbeafe">${escapeHtml(eventDate || "TBD")}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #dbeafe"><strong>Start Time</strong></td><td style="padding:8px;border-bottom:1px solid #dbeafe">${escapeHtml(startTime || "TBD")}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #dbeafe"><strong>Center</strong></td><td style="padding:8px;border-bottom:1px solid #dbeafe">${escapeHtml(center || "TBD")}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #dbeafe"><strong>Address</strong></td><td style="padding:8px;border-bottom:1px solid #dbeafe">${escapeHtml(address || "TBD")}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #dbeafe"><strong>Name</strong></td><td style="padding:8px;border-bottom:1px solid #dbeafe">${escapeHtml(reservation.name || "")}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #dbeafe"><strong>Nickname</strong></td><td style="padding:8px;border-bottom:1px solid #dbeafe">${escapeHtml(reservation.nickname || "")}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #dbeafe"><strong>Phone</strong></td><td style="padding:8px;border-bottom:1px solid #dbeafe">${escapeHtml(reservation.phone || "")}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #dbeafe"><strong>Email</strong></td><td style="padding:8px;border-bottom:1px solid #dbeafe">${escapeHtml(reservation.email || "")}</td></tr>
          ${reservation.note ? `<tr><td style="padding:8px;border-bottom:1px solid #dbeafe"><strong>Note</strong></td><td style="padding:8px;border-bottom:1px solid #dbeafe">${escapeHtml(reservation.note)}</td></tr>` : ""}
        </tbody>
      </table>
    </div>
  `;
};

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
    const reservation = body.reservation || {};
    const tournament = body.tournament || {};
    const notificationEmails = [
      ...splitEmails(process.env.RESERVATION_NOTIFICATION_EMAILS),
      ...splitEmails(body.notificationEmails),
    ];
    const to = splitEmails(reservation.email);
    const bcc = [...new Set(notificationEmails.filter((email) => !to.includes(email)))];

    if (!to.length && !bcc.length) {
      return response.status(400).json({ error: "No email recipients were provided." });
    }

    const confirmationNumber = reservation.registrationNumber || reservation.confirmationNumber || "";
    const subject = `Reservation ${confirmationNumber ? `#${confirmationNumber} ` : ""}${reservation.status || "Confirmed"} - ${tournament.name || reservation.tournament || "Tournament"}`;
    const from = getSenderAddress();
    const replyTo = getReplyToAddress();

    const emailResponse = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: to.length ? to : bcc,
        bcc: to.length ? bcc : [],
        subject,
        html: reservationHtml({ reservation, tournament }),
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    const result = await emailResponse.json().catch(() => ({}));
    if (!emailResponse.ok) {
      return response.status(emailResponse.status).json({ error: result.message || "Email could not be sent.", details: result });
    }

    return response.status(200).json({ sent: true, id: result.id || "" });
  } catch (error) {
    return response.status(500).json({ error: error.message || "Email could not be sent." });
  }
}
