import { z } from "zod";

export const environmentSchema = z.object({
  PORT: z.string().regex(/^\d+$/).default("3003").transform(Number),
  RMQUSER: z.string(),
  RMQPASS: z.string(),
  RMQHOST: z.string(),
  REDISHOST: z.string(),
  BACKEND_URL: z.string(),
  JWT_SECRET: z.string(),
  LEARNIFY_TOKEN_API: z.string()
});
