import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getEmailDeliveryPolicy, sendEmail } from "./email-provider.js";
import sendReservationEmail from "./send-reservation-email.js";
import sendAnnouncementEmail from "./send-announcement-email.js";
import sendAdminRequestEmail from "./send-admin-request-email.js";

const emailEnvironmentKeys = [
  "VERCEL_ENV",
  "EMAIL_DELIVERY_ENABLED",
  "BOWLER_BUILDERS_PRODUCTION_SUPABASE_PROJECT_REF",
  "SUPABASE_URL",
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "MAILJET_API_KEY",
  "MAILJET_SECRET_KEY",
  "RESEND_API_KEY",
  "ADMIN_APPROVAL_EMAILS",
  "RESERVATION_NOTIFICATION_EMAILS",
];

const withEnvironment = async (values, callback) => {
  const original = Object.fromEntries(emailEnvironmentKeys.map((key) => [key, process.env[key]]));
  const originalFetch = globalThis.fetch;
  try {
    emailEnvironmentKeys.forEach((key) => delete process.env[key]);
    Object.assign(process.env, values);
    return await callback({ originalFetch });
  } finally {
    emailEnvironmentKeys.forEach((key) => {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    });
    globalThis.fetch = originalFetch;
  }
};

const responseRecorder = () => {
  const state = { statusCode: null, body: null, headers: {} };
  return {
    state,
    response: {
      setHeader(name, value) { state.headers[name] = value; },
      status(code) { state.statusCode = code; return this; },
      json(body) { state.body = body; return body; },
      send(body) { state.body = body; return body; },
    },
  };
};

const jsonResponse = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

test("email delivery fails closed in Preview even when provider credentials exist", async () => {
  await withEnvironment({
    VERCEL_ENV: "preview",
    EMAIL_DELIVERY_ENABLED: "true",
    BOWLER_BUILDERS_PRODUCTION_SUPABASE_PROJECT_REF: "production-project",
    VITE_SUPABASE_URL: "https://production-project.supabase.co",
    MAILJET_API_KEY: "synthetic-key",
    MAILJET_SECRET_KEY: "synthetic-secret",
  }, async () => {
    let fetchCalls = 0;
    globalThis.fetch = async () => {
      fetchCalls += 1;
      throw new Error("Provider fetch must not run outside verified production.");
    };

    const result = await sendEmail({ from: "sender@example.invalid", to: "recipient@example.invalid", subject: "test", html: "<p>test</p>" });
    assert.equal(result.provider, "blocked");
    assert.equal(result.skipped, true);
    assert.equal(result.blocked, true);
    assert.equal(fetchCalls, 0);
  });
});

test("email delivery fails closed when a production deployment targets a non-production Supabase project", async () => {
  const policy = getEmailDeliveryPolicy({
    VERCEL_ENV: "production",
    EMAIL_DELIVERY_ENABLED: "true",
    BOWLER_BUILDERS_PRODUCTION_SUPABASE_PROJECT_REF: "production-project",
    VITE_SUPABASE_URL: "https://staging-project.supabase.co",
    VITE_SUPABASE_PUBLISHABLE_KEY: "synthetic-publishable-key",
  });
  assert.equal(policy.allowed, false);
});

test("verified production can still invoke the configured provider", async () => {
  await withEnvironment({
    VERCEL_ENV: "production",
    EMAIL_DELIVERY_ENABLED: "true",
    BOWLER_BUILDERS_PRODUCTION_SUPABASE_PROJECT_REF: "production-project",
    VITE_SUPABASE_URL: "https://production-project.supabase.co",
    MAILJET_API_KEY: "synthetic-key",
    MAILJET_SECRET_KEY: "synthetic-secret",
  }, async () => {
    let fetchCalls = 0;
    globalThis.fetch = async () => {
      fetchCalls += 1;
      return { ok: true, status: 200, json: async () => ({ Messages: [{ Status: "success" }] }) };
    };

    const result = await sendEmail({ from: "sender@example.invalid", to: "recipient@example.invalid", subject: "test", html: "<p>test</p>" });
    assert.equal(result.provider, "mailjet");
    assert.equal(fetchCalls, 1);
  });
});

test("every current delivery endpoint uses the centralized guarded sender", async () => {
  const endpoints = ["send-reservation-email.js", "send-announcement-email.js", "send-admin-request-email.js"];
  for (const endpoint of endpoints) {
    const source = await readFile(new URL(`./${endpoint}`, import.meta.url), "utf8");
    assert.match(source, /from\s+["']\.\/email-provider\.js["']/);
    assert.match(source, /sendEmail\s*\(/);
    assert.doesNotMatch(source, /api\.mailjet\.com|api\.resend\.com/);
  }
});

test("all delivery endpoints report blocked delivery in Preview without contacting an email provider", async () => {
  await withEnvironment({
    VERCEL_ENV: "preview",
    EMAIL_DELIVERY_ENABLED: "true",
    BOWLER_BUILDERS_PRODUCTION_SUPABASE_PROJECT_REF: "production-project",
    VITE_SUPABASE_URL: "https://staging-project.supabase.co",
    VITE_SUPABASE_PUBLISHABLE_KEY: "synthetic-publishable-key",
    MAILJET_API_KEY: "synthetic-key",
    MAILJET_SECRET_KEY: "synthetic-secret",
    ADMIN_APPROVAL_EMAILS: "admin@example.invalid",
  }, async () => {
    const providerUrls = [];
    globalThis.fetch = async (url) => {
      const address = String(url);
      if (/api\.mailjet\.com|api\.resend\.com/.test(address)) {
        providerUrls.push(address);
        throw new Error("Email provider must not be called from Preview.");
      }
      if (address.endsWith("/auth/v1/user")) return jsonResponse({ id: "synthetic-admin" });
      if (address.endsWith("/rest/v1/rpc/my_admin_profile")) return jsonResponse([{ user_id: "synthetic-admin", role: "owner" }]);
      if (address.includes("announcement_unsubscribes") || address.includes("announcement_suppressed_emails")) return jsonResponse([]);
      throw new Error(`Unexpected network request: ${address}`);
    };

    const reservation = responseRecorder();
    await sendReservationEmail({
      method: "POST",
      body: { reservation: { email: "bowler@example.invalid", name: "Synthetic Bowler" }, tournament: { name: "Synthetic Tournament" } },
    }, reservation.response);
    assert.equal(reservation.state.statusCode, 200);
    assert.equal(reservation.state.body.blocked, undefined);
    assert.equal(reservation.state.body.skipped, true);

    const adminRequest = responseRecorder();
    await sendAdminRequestEmail({ method: "POST", body: { email: "requester@example.invalid" } }, adminRequest.response);
    assert.equal(adminRequest.state.statusCode, 200);
    assert.equal(adminRequest.state.body.skipped, true);

    const announcement = responseRecorder();
    await sendAnnouncementEmail({
      method: "POST",
      headers: { authorization: "Bearer synthetic-token" },
      body: {
        subject: "Synthetic announcement",
        message: "This is a local test only.",
        recipients: [{ email: "bowler@example.invalid", name: "Synthetic Bowler" }],
      },
    }, announcement.response);
    assert.equal(announcement.state.statusCode, 200);
    assert.equal(announcement.state.body.skipped, true);
    assert.equal(announcement.state.body.blocked, true);
    assert.deepEqual(providerUrls, []);
  });
});
