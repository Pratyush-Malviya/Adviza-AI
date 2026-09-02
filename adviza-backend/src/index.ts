import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.handler.js';
import { rateLimitGuard } from './middleware/rate-limit.guard.js';
import { healthRoutes } from './modules/health/health.routes.js';
import { memoryRoutes } from './modules/memory/memory.routes.js';
import { chatRoutes } from './modules/chat/chat.routes.js';
import { agentRoutes } from './modules/agents/agents.routes.js';
import { documentRoutes } from './modules/documents/documents.routes.js';
import { workflowRoutes } from './modules/workflows/workflows.routes.js';
import { integrationRoutes } from './modules/integrations/integrations.routes.js';
import { billingRoutes } from './modules/billing/billing.routes.js';
import { communicationRoutes } from './modules/communication/communication.routes.js';
import { portfolioRoutes } from './modules/portfolio/portfolio.routes.js';

async function bootstrap() {
  const fastify = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
    trustProxy: true,
  });

  // Global plugins
  await fastify.register(sensible);
  await fastify.register(cors, {
    origin: [
      env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'https://adviza.ai',
      'https://www.adviza.ai',
      'https://app.adviza.ai',
      'https://adviza-ai.vercel.app',
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  });

  // Security Headers Hook
  fastify.addHook('onRequest', async (req, reply) => {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('X-XSS-Protection', '1; mode=block');
    reply.header('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    reply.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // Apply Rate Limiting
    await rateLimitGuard(req, reply);
  });

  // Global error handling
  fastify.setErrorHandler(errorHandler);

  // Register API routes under /v1 prefix
  await fastify.register(
    async (v1) => {
      await v1.register(healthRoutes);
      await v1.register(memoryRoutes);
      await v1.register(chatRoutes);
      await v1.register(agentRoutes);
      await v1.register(documentRoutes);
      await v1.register(workflowRoutes);
      await v1.register(integrationRoutes);
      await v1.register(billingRoutes);
      await v1.register(communicationRoutes);
      await v1.register(portfolioRoutes);
    },
    { prefix: '/v1' }
  );

  // Root status
  fastify.get('/', async (_req, reply) => {
    return reply.send({
      name: 'Adviza AI Backend API',
      version: '1.0.0',
      status: 'active',
      endpoints: {
        health: '/v1/health',
        memory: '/v1/memory',
        chat: '/v1/chat/orchestrate',
        chatStream: '/v1/chat/stream',
        sessions: '/v1/chat/sessions',
        agents: '/v1/agents/*',
        documents: '/v1/documents/*',
        workflows: '/v1/workflows',
        integrations: '/v1/integrations/*',
        billing: '/v1/billing/*',
        emails: '/v1/emails/*',
        portfolio: '/v1/portfolio/*',
      },
    });
  });

  try {
    const address = await fastify.listen({
      port: env.PORT,
      host: env.HOST,
    });
    fastify.log.info(`🚀 Adviza Backend server listening at ${address}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

bootstrap();
