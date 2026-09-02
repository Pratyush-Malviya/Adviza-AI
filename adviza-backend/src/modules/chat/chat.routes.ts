import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth.guard.js';
import { runAgentGraph, streamAgentGraph } from './agent-graph/graph.js';
import { getSupabaseAdmin, scopeFirm } from '../../config/supabase.js';
import { AVAILABLE_MODELS } from '../../config/ai-client.js';
import { getDailyUsage, recordUsage } from './usage.service.js';

export async function chatRoutes(fastify: FastifyInstance) {
  // GET /v1/chat/models - List available LLMs with capabilities & multipliers
  fastify.get('/chat/models', { preHandler: [requireAuth] }, async (_req, reply) => {
    return reply.send({
      models: AVAILABLE_MODELS,
      defaultModel: 'claude-3-5-sonnet',
    });
  });

  // GET /v1/chat/usage - Get today's credit and token consumption
  fastify.get('/chat/usage', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = req.user!;
    const usage = await getDailyUsage(user.id, user.firm_id);
    return reply.send(usage);
  });

  // POST /v1/chat/stream (Real-Time SSE Multi-Agent Stream)
  fastify.post('/chat/stream', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = req.user!;
    const body = (req.body as any) || {};
    const { message, messages = [], sessionId, ambientContext, appSnapshot, modelId = 'claude-3-5-sonnet' } = body;

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
      sendEvent('status', { message: `Initiating LangGraph execution via ${modelId}...`, step: 'init', modelId });

      let accumulatedState: any = {};

      for await (const chunk of streamAgentGraph({
        message,
        messages,
        userId: user.id,
        userName: user.email.split('@')[0],
        sessionId,
        ambientContext,
        appSnapshot,
        modelId,
      })) {
        const nodeName = Object.keys(chunk)[0];
        const nodeOutput = (chunk as any)[nodeName];
        accumulatedState = { ...accumulatedState, ...nodeOutput };

        sendEvent('node_event', {
          node: nodeName,
          output: nodeOutput,
        });
      }

      // Record daily credit consumption
      const inputChars = message.length + JSON.stringify(messages).length;
      const outputChars = (accumulatedState.finalResponse || '').length;
      const updatedUsage = await recordUsage(user.id, user.firm_id, modelId, inputChars, outputChars);

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
              modelId,
              creditsUsed: updatedUsage.creditsUsedToday,
            },
          },
          user.firm_id
        );

        await supabase.from('chat_messages').insert([userMsg, assistantMsg]);
      }

      sendEvent('usage_update', updatedUsage);
      sendEvent('final_response', { ...accumulatedState, usage: updatedUsage });
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
    const { message, messages = [], sessionId, ambientContext, appSnapshot, modelId = 'claude-3-5-sonnet' } = body;

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
        modelId,
      });

      // Record daily usage
      const inputChars = message.length + JSON.stringify(messages).length;
      const outputChars = (result.finalResponse || '').length;
      const usage = await recordUsage(user.id, user.firm_id, modelId, inputChars, outputChars);

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
              modelId,
              creditsUsed: usage.creditsUsedToday,
            },
          },
          user.firm_id
        );

        await supabase.from('chat_messages').insert([userMsg, assistantMsg]);
      }

      return reply.send({
        ...result,
        usage,
      });
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

  // GET /v1/chat/sessions/:sessionId/messages
  fastify.get('/chat/sessions/:sessionId/messages', { preHandler: [requireAuth] }, async (req, reply) => {
    const { sessionId } = req.params as { sessionId: string };
    const supabase = getSupabaseAdmin();

    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      return reply.status(500).send({ error: error.message });
    }

    return reply.send({ messages: messages || [] });
  });

  // DELETE /v1/chat/sessions/:sessionId
  fastify.delete('/chat/sessions/:sessionId', { preHandler: [requireAuth] }, async (req, reply) => {
    const { sessionId } = req.params as { sessionId: string };
    const supabase = getSupabaseAdmin();

    await supabase.from('chat_messages').delete().eq('session_id', sessionId);
    const { error } = await supabase.from('chat_sessions').delete().eq('id', sessionId);

    if (error) {
      return reply.status(500).send({ error: error.message });
    }

    return reply.send({ success: true });
  });
}
