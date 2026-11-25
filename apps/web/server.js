const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request', err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    path: '/socket.io',
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  // roomId -> Map(userId -> socketId)
  const rooms = new Map();

  io.on('connection', (socket) => {
    console.log(`[+] Socket connected: ${socket.id}`);

    socket.on('join-room', ({ roomId, userId, participant }) => {
      if (!roomId || !userId) return;

      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.userId = userId;

      if (!rooms.has(roomId)) rooms.set(roomId, new Map());
      const room = rooms.get(roomId);

      // Send existing peers to the new user
      const existing = [];
      for (const [uid, sid] of room.entries()) {
        existing.push({ userId: uid, socketId: sid });
      }
      socket.emit('existing-peers', { peers: existing });

      // Store this user
      room.set(userId, socket.id);

      // Notify others
      socket.to(roomId).emit('user-joined', { userId, participant, socketId: socket.id });

      console.log(`[JOIN] ${userId} joined ${roomId} (${room.size} users)`);
    });

    socket.on('signal', ({ to, type, data }) => {
      // Relay offer / answer / ice to specific user
      const roomId = socket.data.roomId;
      if (!roomId) return;
      const room = rooms.get(roomId);
      if (!room) return;

      // 'to' can be userId or socketId — we store by userId
      const targetSocketId = room.get(to) || to;
      io.to(targetSocketId).emit('signal', {
        from: socket.data.userId,
        type,
        data,
      });
    });

    socket.on('media-state', (payload) => {
      const roomId = socket.data.roomId;
      if (roomId) {
        socket.to(roomId).emit('media-state', {
          userId: socket.data.userId,
          ...payload,
        });
      }
    });

    socket.on('chat', (payload) => {
      const roomId = socket.data.roomId;
      if (roomId) {
        io.to(roomId).emit('chat', {
          from: payload.from || socket.data.userId,
          text: payload.text,
          time: payload.time,
          userId: socket.data.userId,
        });
      }
    });

    socket.on('raise-hand', (raised) => {
      const roomId = socket.data.roomId;
      if (roomId) {
        socket.to(roomId).emit('raise-hand', {
          userId: socket.data.userId,
          raised,
        });
      }
    });

    socket.on('disconnect', () => {
      const roomId = socket.data.roomId;
      const userId = socket.data.userId;
      if (roomId && userId) {
        const room = rooms.get(roomId);
        if (room) {
          room.delete(userId);
          if (room.size === 0) rooms.delete(roomId);
          socket.to(roomId).emit('user-left', { userId });
          console.log(`[LEAVE] ${userId} left ${roomId}`);
        }
      }
      console.log(`[-] Socket disconnected: ${socket.id}`);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.io signaling ready at /socket.io`);
    });
});
