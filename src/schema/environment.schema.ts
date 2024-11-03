import { z } from "zod";

export const environmentSchema = z.object({
  PORT: z.string().regex(/^\d+$/).default("3003").transform(Number),
  RMQUSER: z.string(),
  RMQPASS: z.string(),
  RMQHOST: z.string(),
  RMQNAME: z.string(),
  BACKEND_URL: z.string(),
  JWT_SECRET: z.string(),
});
