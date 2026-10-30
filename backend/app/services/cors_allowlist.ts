const VERCEL_PROJECT_HOST = 'project-wwc99.vercel.app'
const VERCEL_SUFFIX = '.vercel.app'

/**
 * Production browser origins.
 *
 * `CORS_ORIGIN` is a comma-separated list of exact origins (a custom domain,
 * for example). The Vercel production app and its preview hosts
 * (`project-wwc99-*.vercel.app`) are always allowed. Other `*.vercel.app`
 * sites are not, because credentialed CORS cannot safely use a blanket wildcard.
 */
export function isAllowedProductionOrigin(
  requestOrigin: string,
  corsOriginEnv: string | undefined
): boolean {
  const request = normalizeOrigin(requestOrigin)
  if (!request) {
    return false
  }

  if (configuredOrigins(corsOriginEnv).includes(request)) {
    return true
  }

  return isProjectVercelOrigin(request)
}

function configuredOrigins(corsOriginEnv: string | undefined): string[] {
  if (!corsOriginEnv) {
    return []
  }

  const origins: string[] = []
  for (const part of corsOriginEnv.split(',')) {
    const origin = normalizeOrigin(part.trim())
    if (origin) {
      origins.push(origin)
    }
  }
  return origins
}

function isProjectVercelOrigin(origin: string): boolean {
  let url: URL
  try {
    url = new URL(origin)
  } catch {
    return false
  }

  if (url.protocol !== 'https:') {
    return false
  }

  const host = url.hostname
  if (host === VERCEL_PROJECT_HOST) {
    return true
  }

  if (!host.endsWith(VERCEL_SUFFIX)) {
    return false
  }

  const label = host.slice(0, -VERCEL_SUFFIX.length)
  return label.startsWith('project-wwc99-') && !label.includes('.')
}

function normalizeOrigin(value: string): string | null {
  if (!value) {
    return null
  }

  try {
    const url = new URL(value)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null
    }
    return url.origin
  } catch {
    return null
  }
}
