import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { S3Client } from '@aws-sdk/client-s3';
import { TranscribeClient } from '@aws-sdk/client-transcribe';
import { env } from './env.js';

export const bedrockClient = new BedrockRuntimeClient({
  region: env.AWS_REGION,
});

export const s3Client = new S3Client({
  region: env.AWS_REGION,
});

export const transcribeClient = new TranscribeClient({
  region: env.AWS_REGION,
});
