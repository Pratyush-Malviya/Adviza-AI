import { FastifyRequest, FastifyReply } from 'fastify';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 120; // 120 requests / minute per IP/Client

// Automatic cleanup every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export async function rateLimitGuard(req: FastifyRequest, reply: FastifyReply) {
  const clientIp = req.ip || req.headers['x-forwarded-for']?.toString() || 'anonymous';
  const now = Date.now();

  let record = rateLimitMap.get(clientIp);

  if (!record || now > record.resetAt) {
    record = {
      count: 1,
      resetAt: now + WINDOW_MS,
    };
    rateLimitMap.set(clientIp, record);
  } else {
    record.count += 1;
  }

  const remaining = Math.max(0, MAX_REQUESTS - record.count);
  const resetSeconds = Math.ceil((record.resetAt - now) / 1000);

  reply.header('X-RateLimit-Limit', MAX_REQUESTS);
  reply.header('X-RateLimit-Remaining', remaining);
  reply.header('X-RateLimit-Reset', resetSeconds);

  if (record.count > MAX_REQUESTS) {
    return reply.status(429).send({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please retry in ' + resetSeconds + ' seconds.',
      retryAfter: resetSeconds,
    });
  }
}
