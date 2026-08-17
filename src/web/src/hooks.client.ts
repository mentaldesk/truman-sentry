import { API_URL, SENTRY_DSN, ENVIRONMENT, SENTRY_TRACES_SAMPLE_RATE } from '$lib/config';
import * as Sentry from '@sentry/svelte';
import type { HandleClientError } from '@sveltejs/kit';

// This file runs in the browser before anything else in the app, which makes it the right
// place to bring Sentry up. It also gives us somewhere to export handleError from, which is
// the only way to see the errors SvelteKit catches for itself (see below).
Sentry.init({
  dsn: SENTRY_DSN,
  environment: ENVIRONMENT,

  // Route events through our own API rather than sentry.io directly, so ad blockers and
  // strict Content Security Policies do not silently drop them.
  tunnel: API_URL + '/tunnel',

  // Supplied by the API via /config.js so the browser and the backend make the same
  // sampling decision. The browser is the head of the trace, so its decision is the one that
  // counts — a trace sampled out here is not recorded by the API either.
  tracesSampleRate: SENTRY_TRACES_SAMPLE_RATE,

  // Only propagate trace headers to our own API.
  tracePropagationTargets: ['localhost', '127.0.0.1', API_URL],

  integrations: [Sentry.browserTracingIntegration()],
});

// SvelteKit catches errors thrown in load functions and during component rendering and
// routes them here instead of letting them reach window.onerror. Sentry's global handlers
// only see window.onerror, so without this hook that entire class of error — the ones that
// break a page rather than a background task — is invisible. Leave it out and SvelteKit
// installs a default handler that calls console.error and nothing else.
//
// @sentry/sveltekit ships handleErrorWithSentry for this. @sentry/svelte does not, because
// it has no SvelteKit-specific surface, so we write it out by hand.
export const handleError: HandleClientError = ({ error, event, status, message }) => {
  // Defensive: SvelteKit documents this hook as handling *unexpected* errors, so an
  // expected 404 should not arrive here. Guarding anyway — reporting missing pages as
  // exceptions would be noisy, and the status is part of the hook's contract.
  if (status !== 404) {
    Sentry.captureException(error, {
      extra: { status, message, routeId: event.route?.id },
    });
  }

  return { message };
};
