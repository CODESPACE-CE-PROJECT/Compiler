import { createClient } from "redis";
import { environment } from "../config/environment";
import log from "../utils/logger.util";

export const redisClient = createClient({ url: `redis://${environment.REDISHOST}:6379` })
redisClient.on('error', (err) => log.error('Redis Client Error', err))

export const checkRedisHealth = async (): Promise<boolean> => {
  try {
    await redisClient.set('health', 'ok');
    const reply = await redisClient.get('health');
    return reply === 'ok';
  } catch (error) {
    console.error('Redis Health Check Failed:', error);
    return false;
  }
};
