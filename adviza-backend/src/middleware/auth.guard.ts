import { FastifyRequest, FastifyReply } from 'fastify';
import { getSupabaseAdmin } from '../config/supabase.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  firm_id: string;
  role: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Missing or malformed Authorization Bearer token',
    });
  }

  const token = authHeader.split(' ')[1];

  // In non-production, allow test tokens or Supabase service role key for automated integration tests
  if (process.env.NODE_ENV !== 'production' && (token === 'test-token' || token === process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    req.user = {
      id: 'test-user-id',
      email: 'advisor@adviza.ai',
      firm_id: '00000000-0000-0000-0000-000000000000',
      role: 'advisor',
    };
    return;
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid or expired session token',
      });
    }

    // Fetch user profile to resolve multi-tenant firm_id and role
    const { data: profile } = await supabase
      .from('profiles')
      .select('firm_id, role')
      .eq('id', user.id)
      .maybeSingle();

    req.user = {
      id: user.id,
      email: user.email || '',
      firm_id: profile?.firm_id || user.user_metadata?.firm_id || 'default-firm',
      role: profile?.role || 'advisor',
    };
  } catch (err: any) {
    req.log.error(err, 'Auth verification error');
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Failed to verify session token',
    });
  }
}
