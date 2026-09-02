import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth.guard.js';
import { getSupabaseAdmin, scopeFirm } from '../../config/supabase.js';
import { generateWorkflowGraph, enhanceWorkflowPrompt } from '../agents/workflow-generator.js';

export async function workflowRoutes(fastify: FastifyInstance) {
  // GET /v1/workflows
  fastify.get('/workflows', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = req.user!;
    const supabase = getSupabaseAdmin();

    const { data: workflows, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('firm_id', user.firm_id)
      .order('updated_at', { ascending: false });

    if (error) {
      return reply.status(500).send({ error: error.message });
    }

    return reply.send({ workflows: workflows || [] });
  });

  // POST /v1/workflows
  fastify.post('/workflows', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = req.user!;
    const body = (req.body as any) || {};
    const supabase = getSupabaseAdmin();

    const payload = scopeFirm(
      {
        name: body.name || 'New Advisory Workflow',
        nodes: body.nodes || [],
        edges: body.edges || [],
        status: body.status || 'draft',
      },
      user.firm_id
    );

    const { data: workflow, error } = await supabase
      .from('workflows')
      .insert(payload)
      .select()
      .single();

    if (error) {
      return reply.status(500).send({ error: error.message });
    }

    return reply.status(201).send({ workflow });
  });

  // GET /v1/workflows/:id
  fastify.get('/workflows/:id', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = req.user!;
    const workflowId = (req.params as any)?.id;
    const supabase = getSupabaseAdmin();

    const { data: workflow, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .eq('firm_id', user.firm_id)
      .single();

    if (error || !workflow) {
      return reply.status(404).send({ error: 'Workflow not found' });
    }

    return reply.send({ workflow });
  });

  // PUT /v1/workflows/:id
  fastify.put('/workflows/:id', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = req.user!;
    const workflowId = (req.params as any)?.id;
    const body = (req.body as any) || {};
    const supabase = getSupabaseAdmin();

    const { data: workflow, error } = await supabase
      .from('workflows')
      .update({
        name: body.name,
        nodes: body.nodes,
        edges: body.edges,
        status: body.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', workflowId)
      .eq('firm_id', user.firm_id)
      .select()
      .single();

    if (error) {
      return reply.status(500).send({ error: error.message });
    }

    return reply.send({ workflow });
  });

  // DELETE /v1/workflows/:id
  fastify.delete('/workflows/:id', { preHandler: [requireAuth] }, async (req, reply) => {
    const user = req.user!;
    const workflowId = (req.params as any)?.id;
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', workflowId)
      .eq('firm_id', user.firm_id);

    if (error) {
      return reply.status(500).send({ error: error.message });
    }

    return reply.send({ success: true });
  });

  // POST /v1/workflows/generate (AI Natural Language to Workflow)
  fastify.post('/workflows/generate', { preHandler: [requireAuth] }, async (req, reply) => {
    const body = (req.body as any) || {};
    try {
      const graph = await generateWorkflowGraph(body.prompt);
      return reply.send(graph);
    } catch (err: any) {
      req.log.error(err, 'Workflow generator error');
      return reply.status(500).send({ error: err.message || 'Failed to generate workflow' });
    }
  });

  // POST /v1/workflows/enhance-prompt
  fastify.post('/workflows/enhance-prompt', { preHandler: [requireAuth] }, async (req, reply) => {
    const body = (req.body as any) || {};
    try {
      const enhanced = await enhanceWorkflowPrompt(body.prompt);
      return reply.send({ enhancedPrompt: enhanced });
    } catch (err: any) {
      req.log.error(err, 'Workflow prompt enhancer error');
      return reply.status(500).send({ error: err.message || 'Failed to enhance prompt' });
    }
  });
}
