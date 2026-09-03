import { sentrySvelteKit } from '@sentry/sveltekit';
import tailwindcss from '@tailwindcss/vite';
import devtoolsJson from 'vite-plugin-devtools-json';
import { sveltekit } from '@sveltejs/kit/vite';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		// Must come before sveltekit(). Uploads the source maps produced below so that
		// browser stack traces in Sentry point at our Svelte components rather than at
		// the minified bundle. Without a SENTRY_AUTH_TOKEN the plugin warns and skips
		// the upload, which keeps the build working for contributors without a token.
		sentrySvelteKit({
			sourceMapsUploadOptions: {
				org: 'mental-desk-ltd',
				project: 'truman',
				authToken: process.env.SENTRY_AUTH_TOKEN,
				// The plugin reports its own build telemetry to Sentry by default.
				telemetry: false
			}
		}),
		tailwindcss(),
		sveltekit(),
		devtoolsJson()
	],
	server: {
		port: 3000,
		host: true
	},
	build: {
		// 'hidden' still emits the .map files for the plugin to upload, but leaves the
		// //# sourceMappingURL= comment out of the bundle, so the maps are not advertised
		// to browsers. Sentry resolves them by debug ID, not by that comment.
		sourcemap: 'hidden'
	},
	optimizeDeps: {
		force: true
	},
	test: {
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium' }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
					setupFiles: ['./vitest-setup-client.ts']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
