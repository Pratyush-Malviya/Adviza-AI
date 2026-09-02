import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth.guard.js';
import { runAgentGraph, streamAgentGraph } from './agent-graph/graph.js';
import { getSupabaseAdmin, scopeFirm } from '../../config/supabase.js';

export async function chatRoutes(fastify: FastifyInstance) {
  // POST /v1/chat/stream (Real-Time SSE Multi-Agent Stream)
  fastify.post('/chat/stream', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = req.user!;
    const body = (req.body as any) || {};
    const { message, messages = [], sessionId, ambientContext, appSnapshot } = body;

    if (!message || typeof message !== 'string') {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'A "message" string is required.',
      });
    }

    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache, no-transform');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.setHeader('Access-Control-Allow-Origin', '*');

    const sendEvent = (event: string, data: any) => {
      reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    try {
      sendEvent('status', { message: 'Initiating 6-node LangGraph execution...', step: 'init' });

      let accumulatedState: any = {};

      for await (const chunk of streamAgentGraph({
        message,
        messages,
        userId: user.id,
        userName: user.email.split('@')[0],
        sessionId,
        ambientContext,
        appSnapshot,
      })) {
        const nodeName = Object.keys(chunk)[0];
        const nodeOutput = (chunk as any)[nodeName];
        accumulatedState = { ...accumulatedState, ...nodeOutput };

        sendEvent('node_event', {
          node: nodeName,
          output: nodeOutput,
        });
      }

      // Persist conversation to chat_messages if sessionId provided
      if (sessionId && accumulatedState.finalResponse) {
        const supabase = getSupabaseAdmin();
        const userMsg = scopeFirm(
          {
            session_id: sessionId,
            role: 'user',
            content: message,
          },
          user.firm_id
        );
        const assistantMsg = scopeFirm(
          {
            session_id: sessionId,
            role: 'assistant',
            content: accumulatedState.finalResponse,
            capability_calls: accumulatedState.executedResults || [],
            metadata: {
              hitlPrompts: accumulatedState.hitlPrompts,
              missingConnectors: accumulatedState.missingConnectors,
              plan: accumulatedState.plan,
            },
          },
          user.firm_id
        );

        await supabase.from('chat_messages').insert([userMsg, assistantMsg]);
      }

      sendEvent('final_response', accumulatedState);
      sendEvent('done', { completed: true });
      reply.raw.end();
    } catch (err: any) {
      req.log.error(err, 'Chat streaming error');
      sendEvent('error', { message: err.message || 'Failed during chat streaming' });
      reply.raw.end();
    }
  });

  // POST /v1/chat/orchestrate
  fastify.post('/chat/orchestrate', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = req.user!;
    const body = (req.body as any) || {};
    const { message, messages = [], sessionId, ambientContext, appSnapshot } = body;

    if (!message || typeof message !== 'string') {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'A "message" string is required.',
      });
    }

    try {
      const result = await runAgentGraph({
        message,
        messages,
        userId: user.id,
        userName: user.email.split('@')[0],
        sessionId,
        ambientContext,
        appSnapshot,
      });

      // Persist conversation to chat_messages if sessionId provided
      if (sessionId) {
        const supabase = getSupabaseAdmin();
        const userMsg = scopeFirm(
          {
            session_id: sessionId,
            role: 'user',
            content: message,
          },
          user.firm_id
        );
        const assistantMsg = scopeFirm(
          {
            session_id: sessionId,
            role: 'assistant',
            content: result.finalResponse,
            capability_calls: result.executedResults || [],
            metadata: {
              hitlPrompts: result.hitlPrompts,
              missingConnectors: result.missingConnectors,
              plan: result.plan,
            },
          },
          user.firm_id
        );

        await supabase.from('chat_messages').insert([userMsg, assistantMsg]);
      }

      return reply.send(result);
    } catch (err: any) {
      req.log.error(err, 'Chat orchestration error');
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: err.message || 'Failed to orchestrate chat turn',
      });
    }
  });

  // GET /v1/chat/sessions
  fastify.get('/chat/sessions', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = req.user!;
    const supabase = getSupabaseAdmin();

    const { data: sessions, error } = await supabase
      .from('chat_sessions')
      .select('id, title, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      return reply.status(500).send({ error: error.message });
    }

    return reply.send({ sessions: sessions || [] });
  });

  // POST /v1/chat/sessions
  fastify.post('/chat/sessions', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = req.user!;
    const body = (req.body as any) || {};
    const supabase = getSupabaseAdmin();

    const payload = scopeFirm(
      {
        user_id: user.id,
        title: body.title || 'New Advisory Session',
      },
      user.firm_id
    );

    const { data: session, error } = await supabase
      .from('chat_sessions')
      .insert(payload)
      .select()
      .single();

    if (error) {
      return reply.status(500).send({ error: error.message });
    }

    return reply.status(201).send({ session });
  });

  // DELETE /v1/chat/sessions/:id
  fastify.delete('/chat/sessions/:id', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = req.user!;
    const sessionId = (req.params as any)?.id;
    const supabase = getSupabaseAdmin();

    await supabase.from('chat_messages').delete().eq('session_id', sessionId);
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (error) {
      return reply.status(500).send({ error: error.message });
    }

    return reply.send({ success: true });
  });
}
