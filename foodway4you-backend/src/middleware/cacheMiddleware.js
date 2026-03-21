import { createClient } from 'redis';
import logger from '../utils/logger.js';

let redisClient = null;
let redisConnecting = null;

const isRedisEnabled = () => {
  if (process.env.REDIS_ENABLED && process.env.REDIS_ENABLED.toLowerCase() === 'false') return false;
  return Boolean(process.env.REDIS_URL);
};

const getRedis = async () => {
  if (!isRedisEnabled()) return null;
  if (redisClient && redisClient.isOpen) return redisClient;
  if (redisConnecting) return redisConnecting;

  redisClient = createClient({ url: process.env.REDIS_URL });
  redisClient.on('error', (err) => {
    logger.error('Redis error', { message: err?.message || String(err) });
  });

  redisConnecting = redisClient
    .connect()
    .then(() => redisClient)
    .catch((err) => {
      logger.error('Redis connect failed', { message: err?.message || String(err) });
      try {
        redisClient.quit();
      } catch (quitErr) {
        logger.error('Redis quit failed', { message: quitErr?.message || String(quitErr) });
      }
      redisClient = null;
      return null;
    })
    .finally(() => {
      redisConnecting = null;
    });

  return redisConnecting;
};

const getNamespaceVersion = async (redis, namespace) => {
  const key = `cache:ns:${namespace}`;
  const existing = await redis.get(key);
  if (existing) return existing;
  await redis.set(key, '1', { NX: true });
  return '1';
};

const makeCacheKey = ({ namespace, version, url, userId }) => {
  const ns = namespace || 'global';
  const userPart = userId ? `:u:${userId}` : '';
  return `cache:v${version}:${ns}:${url}${userPart}`;
};

const cache = ({ namespace, ttlSeconds = 60, varyByUser = false } = {}) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') return next();

    const redis = await getRedis();
    if (!redis) return next();

    const userId = varyByUser && req.user?.id ? String(req.user.id) : null;

    try {
      const version = namespace ? await getNamespaceVersion(redis, namespace) : '1';
      const key = makeCacheKey({ namespace, version, url: req.originalUrl, userId });
      const cached = await redis.get(key);

      if (cached) {
        res.set('X-Cache', 'HIT');
        res.type('application/json');
        return res.status(200).send(cached);
      }

      res.set('X-Cache', 'MISS');

      const originalJson = res.json.bind(res);
      const originalSend = res.send.bind(res);

      const writeCache = async (payload) => {
        if (res.statusCode < 200 || res.statusCode >= 300) return;
        const cacheValue =
          typeof payload === 'string' ? payload : Buffer.isBuffer(payload) ? payload.toString('utf8') : JSON.stringify(payload);
        await redis.set(key, cacheValue, { EX: ttlSeconds });
      };

      res.json = (body) => {
        writeCache(body).catch((err) => logger.error('Redis set failed', { message: err?.message || String(err) }));
        return originalJson(body);
      };

      res.send = (body) => {
        writeCache(body).catch((err) => logger.error('Redis set failed', { message: err?.message || String(err) }));
        return originalSend(body);
      };
    } catch (err) {
      logger.error('Redis cache read failed', { message: err?.message || String(err) });
    }

    return next();
  };
};

const bumpNamespaces = (namespaces = []) => {
  return async (req, res, next) => {
    if (!namespaces.length) return next();

    const redis = await getRedis();
    if (!redis) return next();

    const bump = async () => {
      await Promise.all(namespaces.map((ns) => redis.incr(`cache:ns:${ns}`)));
    };

    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        bump().catch((err) => logger.error('Redis invalidation failed', { message: err?.message || String(err) }));
      }
      return originalJson(body);
    };

    res.send = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        bump().catch((err) => logger.error('Redis invalidation failed', { message: err?.message || String(err) }));
      }
      return originalSend(body);
    };

    return next();
  };
};

export { cache, bumpNamespaces };
