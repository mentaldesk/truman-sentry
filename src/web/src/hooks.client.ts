import { API_URL, SENTRY_DSN, ENVIRONMENT, SENTRY_TRACES_SAMPLE_RATE } from '$lib/config';
import * as Sentry from '@sentry/sveltekit';

// This file runs in the browser before anything else in the app, which makes it the right
// place to bring Sentry up. It is also where SvelteKit looks for the handleError hook, which
// is the only way to see the errors SvelteKit catches for itself (see below).
Sentry.init({
  dsn: SENTRY_DSN,
  environment: ENVIRONMENT,

  // Route events through our own API rather than sentry.io directly, so ad blockers and
  // strict Content Security Policies do not silently drop them.
  tunnel: API_URL + '/tunnel',

  // Supplied by the API via /config.js so the browser and the backend make the same sampling
  // decision. The browser is the head of the trace, so its decision is the one that counts —
  // a trace sampled out here is not recorded by the API either.
  tracesSampleRate: SENTRY_TRACES_SAMPLE_RATE,

  // Only propagate trace headers to our own API.
  tracePropagationTargets: ['localhost', '127.0.0.1', API_URL],

  // Browser-side structured logs, linked to the trace they happened inside — the same
  // feature the API and job runner enable, so one trace carries logs from both ends.
  enableLogs: true,

  integrations: [
    // Registering the integration is not enough on its own: both sample rates default
    // to 0, so a replay integration with no rates set records nothing at all and gives
    // no indication that it isn't working.
    Sentry.replayIntegration(),
  ],

  // Buffers roughly the last minute in memory and only uploads it when something
  // actually breaks, which is cheap enough to leave at 1.0 — these are the replays
  // anyone actually watches.
  replaysOnErrorSampleRate: 1.0,

  // A sample of sessions where nothing goes wrong. Kept low: this is closer to product
  // analytics than debugging, and every recorded session is data leaving the building.
  replaysSessionSampleRate: 0.1,
});

// SvelteKit catches errors thrown in load functions and during component rendering and routes
// them here instead of letting them reach window.onerror. Sentry's global handlers only see
// window.onerror, so without this hook that entire class of error — the ones that break a page
// rather than a background task — is invisible. Leave the export out and SvelteKit installs a
// default handler that calls console.error and nothing else.
export const handleError = Sentry.handleErrorWithSentry();
