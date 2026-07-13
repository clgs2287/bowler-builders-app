import { createHmac, timingSafeEqual } from "node:crypto";

const getSupabaseConfig = () => ({
  url: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "",
  key: process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || "",
});

const getSigningSecret = () =>
  process.env.UNSUBSCRIBE_SECRET || process.env.MAILJET_SECRET_KEY || process.env.MAILJET_API_KEY || "bowler-builders-announcements";

const signEmail = (email = "") =>
  createHmac("sha256", getSigningSecret())
    .update(String(email || "").trim().toLowerCase())
    .digest("hex");

const isValidToken = (email = "", token = "") => {
  const expected = signEmail(email);
  const actual = String(token || "");
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(actual));
};

const page = ({ title, message }) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      body { margin: 0; background: #e2effc; color: #0f172a; font-family: Arial, sans-serif; }
      main { max-width: 640px; margin: 48px auto; background: white; border: 1px solid #bfdbfe; padding: 28px; }
      h1 { margin: 0 0 12px; color: #0f3f86; }
      p { line-height: 1.5; }
      a { color: #0f3f86; font-weight: 800; }
    </style>
  </head>
  <body>
    <main>
      <h1>${title}</h1>
      <p>${message}</p>
      <p><a href="https://tournaments.bowlerbuildersproshop.com">Return to Tournament Hub</a></p>
    </main>
  </body>
</html>`;

export default async function handler(request, response) {
  if (!["GET", "POST"].includes(request.method)) {
    response.setHeader("Allow", "GET, POST");
    return response.status(405).send("Method not allowed");
  }

  const query = request.query || {};
  const body = request.body || {};
  const email = String(query.email || body.email || "").trim().toLowerCase();
  const token = String(query.token || body.token || "").trim();

  if (!email || !token || !isValidToken(email, token)) {
    return response.status(400).send(page({
      title: "Unsubscribe link is invalid",
      message: "This unsubscribe link could not be verified. Please email bowlerbuildersproshop@yahoo.com and we will remove you manually.",
    }));
  }

  const { url, key } = getSupabaseConfig();
  if (!url || !key) {
    return response.status(500).send(page({
      title: "Unsubscribe could not be saved",
      message: "The unsubscribe system is not configured. Please email bowlerbuildersproshop@yahoo.com and we will remove you manually.",
    }));
  }

  const unsubscribeResponse = await fetch(`${url.replace(/\/$/, "")}/rest/v1/rpc/unsubscribe_announcement_email`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ target_email: email }),
  });

  if (!unsubscribeResponse.ok) {
    return response.status(500).send(page({
      title: "Unsubscribe could not be saved",
      message: "Please email bowlerbuildersproshop@yahoo.com and we will remove you manually.",
    }));
  }

  return response.status(200).send(page({
    title: "You are unsubscribed",
    message: "You will no longer receive Bowler Builders tournament announcement emails. Reservation confirmation emails for entries you submit may still be sent.",
  }));
}

export { signEmail };
