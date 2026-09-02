import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth.guard.js';
import {
  getAllMemories,
  searchMemories,
  addMemories,
  deleteMemory,
  exportAdvisorMemoryDossier,
} from './memory.service.js';

export async function memoryRoutes(fastify: FastifyInstance) {
  // GET /v1/memory (Search or List)
  const getMemoryHandler = async (req: any, reply: any) => {
    const user = req.user!;
    const query = req.query?.q || req.query?.query;
    const category = req.query?.category;
    const limit = req.query?.limit ? parseInt(req.query.limit, 10) : 10;

    if (query && typeof query === 'string' && query.trim().length > 0) {
      const results = await searchMemories(user.id, query.trim(), limit, category);
      return reply.send({ memories: results });
    }

    const memories = await getAllMemories(user.id);
    return reply.send({ memories });
  };

  fastify.get('/memory', { preHandler: [requireAuth] }, getMemoryHandler);
  fastify.get('/ai/memory', { preHandler: [requireAuth] }, getMemoryHandler);

  // POST /v1/memory/search or /v1/ai/memory/search
  const searchMemoryHandler = async (req: any, reply: any) => {
    const user = req.user!;
    const body = (req.body as any) || {};
    const { query, q, limit = 5, category } = body;

    const targetQuery = query || q || '';
    if (!targetQuery) {
      return reply.status(400).send({ error: 'Search query is required' });
    }

    const results = await searchMemories(user.id, targetQuery, limit, category);
    return reply.send({ memories: results });
  };

  fastify.post('/memory/search', { preHandler: [requireAuth] }, searchMemoryHandler);
  fastify.post('/ai/memory/search', { preHandler: [requireAuth] }, searchMemoryHandler);

  // GET /v1/ai/memory/dossier (Structured Category Dossier)
  const dossierHandler = async (req: any, reply: any) => {
    const user = req.user!;
    const dossier = await exportAdvisorMemoryDossier(user.id);
    return reply.send(dossier);
  };

  fastify.get('/memory/dossier', { preHandler: [requireAuth] }, dossierHandler);
  fastify.get('/ai/memory/dossier', { preHandler: [requireAuth] }, dossierHandler);

  // POST /v1/memory or /v1/ai/memory (Add memory manually or from messages)
  const addMemoryHandler = async (req: any, reply: any) => {
    const user = req.user!;
    const body = (req.body as any) || {};

    if (body.memory && typeof body.memory === 'string') {
      const created = await addMemories(
        user.id,
        [{ role: 'user', content: body.memory }],
        { firmId: user.firm_id }
      );
      return reply.status(201).send({ success: true, memories: created });
    }

    if (Array.isArray(body.messages)) {
      const created = await addMemories(user.id, body.messages, {
        sessionId: body.session_id,
        firmId: user.firm_id,
      });
      return reply.status(201).send({ success: true, memories: created });
    }

    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Provide a "memory" string or an array of "messages"',
    });
  };

  fastify.post('/memory', { preHandler: [requireAuth] }, addMemoryHandler);
  fastify.post('/ai/memory', { preHandler: [requireAuth] }, addMemoryHandler);

  // DELETE /v1/memory/:id
  const deleteMemoryHandler = async (req: any, reply: any) => {
    const user = req.user!;
    const memoryId = req.params?.id;

    if (!memoryId) {
      return reply.status(400).send({ statusCode: 400, message: 'Memory ID is required' });
    }

    const deleted = await deleteMemory(user.id, memoryId);
    return reply.send({ success: deleted });
  };

  fastify.delete('/memory/:id', { preHandler: [requireAuth] }, deleteMemoryHandler);
  fastify.delete('/ai/memory/:id', { preHandler: [requireAuth] }, deleteMemoryHandler);
}
