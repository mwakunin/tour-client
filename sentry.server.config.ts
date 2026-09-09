// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  // false, not true. With @sentry/nextjs 10.x this switch sends IP addresses,
  // cookies, request headers and user identifiers to Sentry — for a booking
  // site that means customer names, emails and session cookies leaving the
  // system on every captured event, to a processor nobody agreed to.
  // Attach only what an investigation needs, deliberately, at the capture.
  sendDefaultPii: false,
});
