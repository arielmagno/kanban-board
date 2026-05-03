import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';

let io: Server | null = null;

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Per-board room for card/lane real-time updates
    socket.on('board:join', (boardId: string) => {
      void socket.join(boardId);
    });
    socket.on('board:leave', (boardId: string) => {
      void socket.leave(boardId);
    });

    // Global boards room for the /boards list page
    socket.on('boards:join', () => {
      void socket.join('__boards__');
    });
    socket.on('boards:leave', () => {
      void socket.leave('__boards__');
    });
  });

  return io;
}

/**
 * Emit to all clients subscribed to a specific board room (for card/lane changes).
 * Safe to call when Socket.io is not initialized (e.g. in tests).
 */
export function emitBoardUpdate(boardId: string): void {
  if (!io) return;
  io.to(boardId).emit('board:update', { boardId });
}

/**
 * Emit to all clients on the /boards list page (for board create/update/delete).
 */
export function emitBoardsUpdate(): void {
  if (!io) return;
  io.to('__boards__').emit('boards:update');
}
