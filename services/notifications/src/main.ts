import { createAdapter } from '@socket.io/redis-adapter';
import {
  createLifecycle,
  createLogger,
  splitOrigins,
  type RequestContext,
} from '@uhs/service-kit';
import { createServer } from 'node:http';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { Redis } from 'ioredis';
import { Server } from 'socket.io';
import { buildApp } from './app.js';
import { canSubscribe, type SubscriptionRequest } from './channels.js';
import { loadRealtimeConfig } from './config.js';

interface AccessTokenClaims {
  sub?: unknown;
  tenant_id?: unknown;
  role?: unknown;
  perm?: unknown;
}

async function main(): Promise<void> {
  const config = loadRealtimeConfig();
  const logger = createLogger({
    service: config.SERVICE_NAME,
    level: config.LOG_LEVEL,
    pretty: config.NODE_ENV === 'development',
  });

  const pubClient = new Redis(config.REDIS_URL);
  const subClient = pubClient.duplicate();
  await Promise.all([pubClient.ping(), subClient.ping()]);

  const { app } = buildApp({
    logger,
    redisReady: () => pubClient.status === 'ready' && subClient.status === 'ready',
    corsOrigins: splitOrigins(config.CORS_ORIGINS),
  });

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    path: '/socket.io',
    cors: { origin: splitOrigins(config.CORS_ORIGINS), credentials: true },
  });
  io.adapter(createAdapter(pubClient, subClient));

  const jwks = createRemoteJWKSet(new URL(config.AUTH_JWKS_URL));

  // Verify the access token on connect; disconnect when it expires (spec §13.1).
  io.use((socket, next) => {
    void (async () => {
      const token =
        typeof socket.handshake.auth?.token === 'string'
          ? socket.handshake.auth.token
          : undefined;

      if (!token) {
        next(new Error('AUTH-001 missing token'));
        return;
      }

      try {
        const { payload } = await jwtVerify(token, jwks, {
          issuer: config.AUTH_ISSUER,
          audience: config.AUTH_AUDIENCE,
          algorithms: [config.AUTH_JWT_ALG],
        });
        const claims = payload as AccessTokenClaims;
        const context: RequestContext = {
          requestId: socket.id,
          correlationId: socket.id,
          permissions: Array.isArray(claims.perm)
            ? (claims.perm.filter((value): value is string => typeof value === 'string') as never)
            : [],
          facilityIds: [],
          isServiceToken: false,
          ...(typeof claims.sub === 'string' ? { userId: claims.sub } : {}),
          ...(typeof claims.tenant_id === 'string' ? { tenantId: claims.tenant_id } : {}),
          ...(typeof claims.role === 'string' ? { role: claims.role } : {}),
        };
        socket.data.context = context;
        next();
      } catch {
        next(new Error('AUTH-002 invalid token'));
      }
    })();
  });

  io.on('connection', (socket) => {
    const context = socket.data.context as RequestContext;

    socket.on('subscribe', (request: SubscriptionRequest) => {
      if (!canSubscribe(context, request)) {
        socket.emit('error', { code: 'AUTH-004', detail: 'subscription denied' });
        return;
      }
      void socket.join(request.channel);
      socket.emit('subscribed', { channel: request.channel });
    });

    socket.on('unsubscribe', (request: SubscriptionRequest) => {
      void socket.leave(request.channel);
    });
  });

  httpServer.listen(config.PORT, '0.0.0.0', () => {
    logger.info({ port: config.PORT }, 'notifications gateway listening');
  });

  const lifecycle = createLifecycle({ logger });
  lifecycle.onShutdown(
    'http',
    () =>
      new Promise<void>((resolve) => {
        io.close(() => resolve());
      }),
  );
  lifecycle.onShutdown('redis', async () => {
    pubClient.disconnect();
    subClient.disconnect();
  });
  lifecycle.installSignalHandlers();
}

main().catch((error: unknown) => {
  process.stderr.write(
    'failed to start notifications: ' + (error instanceof Error ? error.message : String(error)) + '\n',
  );
  process.exit(1);
});
