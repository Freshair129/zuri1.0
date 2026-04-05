import { Redis } from '@upstash/redis'

export let redis = null
export function getRedis() {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
  return redis
}

/**
 * Cache-aside pattern: get from cache or compute + store
 * @param {string} key
 * @param {Function} fn - async function to compute value
 * @param {number} ttl - seconds (default 300 = 5 min)
 */
export async function getOrSet(key, fn, ttl = 300) {
  const r = getRedis()
  const cached = await r.get(key)
  if (cached !== null) return cached

  const value = await fn()
  if (value !== null && value !== undefined) {
    await r.set(key, JSON.stringify(value), { ex: ttl })
  }
  return value
}
