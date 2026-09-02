import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export function errorHandler(error: FastifyError, req: FastifyRequest, reply: FastifyReply) {
  req.log.error(error);

  const statusCode = error.statusCode || 500;
  const message = statusCode >= 500 && process.env.NODE_ENV === 'production'
    ? 'Internal Server Error'
    : error.message;

  reply.status(statusCode).send({
    statusCode,
    error: error.name || 'Error',
    message,
    timestamp: new Date().toISOString(),
  });
}
