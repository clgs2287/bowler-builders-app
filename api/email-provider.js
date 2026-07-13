const MAILJET_ENDPOINT = "https://api.mailjet.com/v3.1/send";
const RESEND_ENDPOINT = "https://api.resend.com/emails";

export const splitEmails = (value = "") =>
  String(value)
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

const unverifiedPublicDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "icloud.com"];

const parseAddress = (value = "") => {
  const trimmed = String(value || "").trim();
  const match = trimmed.match(/^(.*?)\s*<([^>]+)>$/);
  if (match) {
    return {
      name: match[1].trim().replace(/^"|"$/g, "") || undefined,
      email: match[2].trim(),
    };
  }
  return { email: trimmed };
};

export const getSenderAddress = () => {
  const configuredSender = process.env.RESERVATION_EMAIL_FROM || "";
  const configuredEmail = parseAddress(configuredSender).email || "";
  const usesPublicDomain = unverifiedPublicDomains.some((domain) => configuredEmail.toLowerCase().endsWith(`@${domain}`));
  return configuredSender && !usesPublicDomain
    ? configuredSender
    : "Bowler Builders <reservations@bowlerbuildersproshop.com>";
};

export const getReplyToAddress = () => {
  const configuredReplyTo = process.env.RESERVATION_REPLY_TO || "";
  return configuredReplyTo.trim() || undefined;
};

const sendMailjetEmail = async ({ from, to, subject, html, replyTo }) => {
  const apiKey = process.env.MAILJET_API_KEY;
  const secretKey = process.env.MAILJET_SECRET_KEY;
  if (!apiKey || !secretKey) return null;

  const sender = parseAddress(from);
  const reply = replyTo ? parseAddress(replyTo) : null;
  const auth = Buffer.from(`${apiKey}:${secretKey}`).toString("base64");

  const response = await fetch(MAILJET_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Messages: [
        {
          From: {
            Email: sender.email,
            ...(sender.name ? { Name: sender.name } : {}),
          },
          To: to.map((email) => ({ Email: email })),
          Subject: subject,
          HTMLPart: html,
          ...(reply?.email ? { ReplyTo: { Email: reply.email, ...(reply.name ? { Name: reply.name } : {}) } } : {}),
        },
      ],
    }),
  });

  const result = await response.json().catch(() => ({}));
  return { provider: "mailjet", response, result };
};

const sendResendEmail = async ({ from, to, subject, html, replyTo }) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  const result = await response.json().catch(() => ({}));
  return { provider: "resend", response, result };
};

export const sendEmail = async ({ from, to, subject, html, replyTo }) => {
  const recipients = splitEmails(Array.isArray(to) ? to.join(",") : to);
  if (!recipients.length) throw new Error("No email recipients were provided.");

  const mailjet = await sendMailjetEmail({ from, to: recipients, subject, html, replyTo });
  if (mailjet) return mailjet;

  const resend = await sendResendEmail({ from, to: recipients, subject, html, replyTo });
  if (resend) return resend;

  return {
    provider: "none",
    skipped: true,
    reason: "MAILJET_API_KEY and MAILJET_SECRET_KEY are not configured",
  };
};
