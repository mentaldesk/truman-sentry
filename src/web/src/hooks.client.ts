import { API_URL, SENTRY_DSN, ENVIRONMENT } from '$lib/config';
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

  tracesSampleRate: 1.0,

  // Only propagate trace headers to our own API.
  tracePropagationTargets: ['localhost', '127.0.0.1', API_URL],
});

// SvelteKit catches errors thrown in load functions and during component rendering and routes
// them here instead of letting them reach window.onerror. Sentry's global handlers only see
// window.onerror, so without this hook that entire class of error — the ones that break a page
// rather than a background task — is invisible. Leave the export out and SvelteKit installs a
// default handler that calls console.error and nothing else.
export const handleError = Sentry.handleErrorWithSentry();
