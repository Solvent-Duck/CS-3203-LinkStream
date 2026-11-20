import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * CWE-770: limits how many requests one client can make in a time window.
 *
 * Clients are keyed by user id when logged in, otherwise by IP address.
 * Counts live in memory (fixed window), so each server process has its own
 * counters. Over the limit, the request gets HTTP 429 with Retry-After.
 *
 * Usage in routes: .use(middleware.throttle({ max: 20, windowMs: 60_000 }))
 */
export type ThrottleOptions = {
  /** Most requests allowed per window. */
  max: number
  /** Window length in milliseconds. */
  windowMs: number
  /** Separates counters for different route groups. */
  name?: string
}

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

// Upper bound on tracked clients so the limiter itself cannot grow without limit.
const MAX_TRACKED_CLIENTS = 10_000

/** Clears all counters. Used by tests. */
export function resetThrottle() {
  buckets.clear()
}

function removeExpired(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key)
    }
  }
}

/**
 * Records one hit for a client and reports whether it is still allowed.
 * Exported so the counting logic can be unit tested without HTTP.
 */
export function hit(key: string, options: ThrottleOptions, now = Date.now()) {
  let bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size >= MAX_TRACKED_CLIENTS) {
      removeExpired(now)
    }
    bucket = { count: 0, resetAt: now + options.windowMs }
    buckets.set(key, bucket)
  }

  bucket.count++
  return {
    allowed: bucket.count <= options.max,
    remaining: Math.max(0, options.max - bucket.count),
    retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
  }
}

export default class ThrottleMiddleware {
  async handle(ctx: HttpContext, next: NextFn, options: ThrottleOptions) {
    const user = ctx.auth?.user
    const client = user ? `user:${user.id}` : `ip:${ctx.request.ip()}`
    const key = `${options.name ?? ctx.route?.pattern ?? 'global'}|${client}`

    const result = hit(key, options)

    ctx.response.header('X-RateLimit-Limit', String(options.max))
    ctx.response.header('X-RateLimit-Remaining', String(result.remaining))

    if (!result.allowed) {
      ctx.response.header('Retry-After', String(result.retryAfterSeconds))
      return ctx.response.tooManyRequests({
        error: 'Too many requests. Please try again later.',
      })
    }

    return next()
  }
}
