export type PostgresSsl = false | { rejectUnauthorized: false }

/**
 * Choose TLS settings for node-postgres.
 *
 * Railway's private `DATABASE_URL` host (`*.railway.internal`) does not use TLS.
 * Public proxy hosts do. `DB_SSL=true` or `DB_SSL=false` overrides detection.
 * When TLS is enabled, certificate verification is relaxed because hosted
 * proxy certificates are not pinned in this app.
 */
export function resolvePostgresSsl(
  databaseUrl: string | undefined,
  explicitSsl: boolean | undefined
): PostgresSsl {
  if (explicitSsl === true) {
    return { rejectUnauthorized: false }
  }

  if (explicitSsl === false || !databaseUrl) {
    return false
  }

  let hostname = ''
  let sslmode: string | null = null

  try {
    const url = new URL(databaseUrl)
    hostname = url.hostname
    sslmode = url.searchParams.get('sslmode')
  } catch {
    return false
  }

  if (sslmode === 'disable') {
    return false
  }

  if (
    sslmode === 'require' ||
    sslmode === 'prefer' ||
    sslmode === 'verify-ca' ||
    sslmode === 'verify-full'
  ) {
    return { rejectUnauthorized: false }
  }

  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.endsWith('.railway.internal')
  ) {
    return false
  }

  return { rejectUnauthorized: false }
}
