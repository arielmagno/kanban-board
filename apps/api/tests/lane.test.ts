import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { createUser, loginAs } from './helpers/factories';

const app = createApp();

async function setupBoard(token: string, title = 'Test Board') {
  const res = await request(app)
    .post('/api/boards')
    .set('Authorization', `Bearer ${token}`)
    .send({ title });
  return res.body as { id: string; lanes: Array<{ id: string; title: string; position: number; isDefault: boolean }> };
}

async function getBoard(token: string, boardId: string) {
  const res = await request(app)
    .get(`/api/boards/${boardId}`)
    .set('Authorization', `Bearer ${token}`);
  return res.body as {
    lanes: Array<{ id: string; title: string; position: number; isDefault: boolean }>;
    cards: Array<{ id: string }>;
  };
}

describe('Lane API', () => {
  let token: string;
  let user2Token: string;
  let boardId: string;
  let laneIds: string[];

  beforeEach(async () => {
    const userA = await createUser('lane@test.com');
    const userB = await createUser('lane2@test.com');
    token = loginAs(userA);
    user2Token = loginAs(userB);
    const board = await setupBoard(token);
    boardId = board.id;

    const fullBoard = await getBoard(token, boardId);
    laneIds = fullBoard.lanes
      .sort((a, b) => a.position - b.position)
      .map((l) => l.id);
  });

  describe('POST /api/boards/:boardId/lanes', () => {
    it('creates a custom lane appended at the end', async () => {
      const res = await request(app)
        .post(`/api/boards/${boardId}/lanes`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Backlog' });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Backlog');
      expect(res.body.isDefault).toBe(false);
      expect(res.body.position).toBe(3); // after the 3 default lanes
    });

    it('trims whitespace from title', async () => {
      const res = await request(app)
        .post(`/api/boards/${boardId}/lanes`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '  Review  ' });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Review');
    });

    it('returns 400 for empty title', async () => {
      const res = await request(app)
        .post(`/api/boards/${boardId}/lanes`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '' });
      expect(res.status).toBe(400);
    });

    it('returns 400 for whitespace-only title', async () => {
      const res = await request(app)
        .post(`/api/boards/${boardId}/lanes`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '   ' });
      expect(res.status).toBe(400);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app)
        .post(`/api/boards/${boardId}/lanes`)
        .send({ title: 'Ghost' });
      expect(res.status).toBe(401);
    });

    it('returns 403 when creating lane in another tenant board', async () => {
      const res = await request(app)
        .post(`/api/boards/${boardId}/lanes`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ title: 'Injected' });
      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/lanes/:id (rename)', () => {
    it('renames a lane and returns updated title', async () => {
      const laneId = laneIds[0];
      const res = await request(app)
        .patch(`/api/lanes/${laneId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Renamed' });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Renamed');
    });

    it('returns 400 for empty title', async () => {
      const res = await request(app)
        .patch(`/api/lanes/${laneIds[0]}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '' });
      expect(res.status).toBe(400);
    });

    it('returns 403 for another tenant', async () => {
      const res = await request(app)
        .patch(`/api/lanes/${laneIds[0]}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ title: 'Hack' });
      expect(res.status).toBe(403);
    });

    it('returns 404 for a valid UUID that does not exist', async () => {
      const res = await request(app)
        .patch('/api/lanes/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Whatever' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/lanes/:id', () => {
    it('deletes a custom lane and returns 204', async () => {
      const createRes = await request(app)
        .post(`/api/boards/${boardId}/lanes`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'To Remove' });

      const res = await request(app)
        .delete(`/api/lanes/${createRes.body.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(204);

      const board = await getBoard(token, boardId);
      expect(board.lanes.find((l) => l.id === createRes.body.id)).toBeUndefined();
    });

    it('returns 403 when deleting a default lane', async () => {
      const board = await getBoard(token, boardId);
      const defaultLane = board.lanes.find((l) => l.isDefault)!;

      const res = await request(app)
        .delete(`/api/lanes/${defaultLane.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it('returns 403 for another tenant', async () => {
      const createRes = await request(app)
        .post(`/api/boards/${boardId}/lanes`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Target' });

      const res = await request(app)
        .delete(`/api/lanes/${createRes.body.id}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(403);
    });

    it('cascades deletion — cards in the lane are also removed', async () => {
      const laneRes = await request(app)
        .post(`/api/boards/${boardId}/lanes`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'With Cards' });
      const newLaneId: string = laneRes.body.id;

      await request(app)
        .post(`/api/lanes/${newLaneId}/cards`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Card A' });
      await request(app)
        .post(`/api/lanes/${newLaneId}/cards`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Card B' });

      await request(app)
        .delete(`/api/lanes/${newLaneId}`)
        .set('Authorization', `Bearer ${token}`);

      const board = await getBoard(token, boardId);
      expect(board.lanes.find((l) => l.id === newLaneId)).toBeUndefined();
    });
  });

  describe('PATCH /api/boards/:boardId/lanes/reorder', () => {
    it('reorders lanes and assigns sequential positions', async () => {
      const reversed = [...laneIds].reverse();

      const res = await request(app)
        .patch(`/api/boards/${boardId}/lanes/reorder`)
        .set('Authorization', `Bearer ${token}`)
        .send({ orderedIds: reversed });

      expect(res.status).toBe(204);

      const board = await getBoard(token, boardId);
      const sorted = board.lanes.sort((a, b) => a.position - b.position);
      expect(sorted.map((l) => l.id)).toEqual(reversed);
    });

    it('produces no duplicate positions after reorder', async () => {
      const reversed = [...laneIds].reverse();
      await request(app)
        .patch(`/api/boards/${boardId}/lanes/reorder`)
        .set('Authorization', `Bearer ${token}`)
        .send({ orderedIds: reversed });

      const board = await getBoard(token, boardId);
      const positions = board.lanes.map((l) => l.position);
      expect(new Set(positions).size).toBe(positions.length);
    });

    it('returns 403 when reordering lanes in another tenant board', async () => {
      const res = await request(app)
        .patch(`/api/boards/${boardId}/lanes/reorder`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ orderedIds: laneIds });
      expect(res.status).toBe(403);
    });

    it('returns 400 for empty orderedIds array', async () => {
      const res = await request(app)
        .patch(`/api/boards/${boardId}/lanes/reorder`)
        .set('Authorization', `Bearer ${token}`)
        .send({ orderedIds: [] });
      expect(res.status).toBe(400);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app)
        .patch(`/api/boards/${boardId}/lanes/reorder`)
        .send({ orderedIds: laneIds });
      expect(res.status).toBe(401);
    });
  });
});
