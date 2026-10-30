import { isAllowedProductionOrigin } from '#services/cors_allowlist'
import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/cors'

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
  /**
   * Enable or disable CORS handling globally.
   */
  enabled: true,

  /**
   * Development and tests allow every origin so local front/backend setup
   * stays simple. Production reflects an allowlist: CORS_ORIGIN plus the
   * Vercel app (https://project-wwc99.vercel.app and its preview hosts).
   * credentials is true, so a `*` origin is not used.
   */
  origin: app.inProduction
    ? (requestOrigin: string) => isAllowedProductionOrigin(requestOrigin, env.get('CORS_ORIGIN'))
    : true,

  /**
   * HTTP methods accepted for cross-origin requests.
   */
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],

  /**
   * Reflect request headers by default. Use a string array to restrict
   * allowed headers.
   */
  headers: true,

  /**
   * Response headers exposed to the browser.
   */
  exposeHeaders: [],

  /**
   * Allow cookies/authorization headers on cross-origin requests.
   */
  credentials: true,

  /**
   * Cache CORS preflight response for N seconds.
   */
  maxAge: 90,
})

export default corsConfig
