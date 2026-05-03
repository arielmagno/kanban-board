import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { createUser, loginAs } from './helpers/factories';

const app = createApp();

async function setupBoard(token: string, title = 'Test Board') {
  const res = await request(app).post('/api/boards').set('Authorization', `Bearer ${token}`).send({ title });
  return res.body;
}

async function getLaneId(token: string, boardId: string, laneTitle = 'To Do') {
  const res = await request(app).get(`/api/boards/${boardId}`).set('Authorization', `Bearer ${token}`);
  return res.body.lanes.find((l: { title: string }) => l.title === laneTitle).id as string;
}

describe('Card API', () => {
  let token: string;
  let user2Token: string;
  let boardId: string;
  let laneId: string;
  let doneLaneId: string;

  beforeEach(async () => {
    await createUser('card@test.com');
    await createUser('card2@test.com');
    token = await loginAs('card@test.com');
    user2Token = await loginAs('card2@test.com');
    const board = await setupBoard(token);
    boardId = board.id;
    laneId = await getLaneId(token, boardId, 'To Do');
    doneLaneId = await getLaneId(token, boardId, 'Done');
  });

  describe('POST /api/lanes/:laneId/cards', () => {
    it('creates a card and returns 201', async () => {
      const res = await request(app)
        .post(`/api/lanes/${laneId}/cards`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'My Card' });
      expect(res.status).toBe(201);
      expect(res.body.title).toBe('My Card');
      expect(res.body.position).toBe(0);
    });

    it('assigns incrementing positions', async () => {
      await request(app).post(`/api/lanes/${laneId}/cards`).set('Authorization', `Bearer ${token}`).send({ title: 'A' });
      await request(app).post(`/api/lanes/${laneId}/cards`).set('Authorization', `Bearer ${token}`).send({ title: 'B' });
      const res = await request(app).post(`/api/lanes/${laneId}/cards`).set('Authorization', `Bearer ${token}`).send({ title: 'C' });
      expect(res.body.position).toBe(2);
    });

    it('returns 400 for empty title', async () => {
      const res = await request(app)
        .post(`/api/lanes/${laneId}/cards`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '' });
      expect(res.status).toBe(400);
    });

    it('returns 400 for whitespace-only title', async () => {
      const res = await request(app)
        .post(`/api/lanes/${laneId}/cards`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '   ' });
      expect(res.status).toBe(400);
    });

    it('returns 403 when creating card in another tenant lane', async () => {
      const res = await request(app)
        .post(`/api/lanes/${laneId}/cards`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ title: 'Hack' });
      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/cards/move', () => {
    let cardId: string;

    beforeEach(async () => {
      const res = await request(app)
        .post(`/api/lanes/${laneId}/cards`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Moveable Card' });
      cardId = res.body.id;
    });

    it('moves card to a different lane', async () => {
      const res = await request(app)
        .patch('/api/cards/move')
        .set('Authorization', `Bearer ${token}`)
        .send({ cardId, toLaneId: doneLaneId, position: 0 });
      expect(res.status).toBe(200);
      expect(res.body.laneId).toBe(doneLaneId);
      expect(res.body.position).toBe(0);
    });

    it('removes card from source lane after move', async () => {
      await request(app)
        .patch('/api/cards/move')
        .set('Authorization', `Bearer ${token}`)
        .send({ cardId, toLaneId: doneLaneId, position: 0 });
      const board = await request(app).get(`/api/boards/${boardId}`).set('Authorization', `Bearer ${token}`);
      const sourceLane = board.body.lanes.find((l: { id: string }) => l.id === laneId);
      expect(sourceLane.cards.map((c: { id: string }) => c.id)).not.toContain(cardId);
    });

    it('same-lane reorder produces no duplicate positions', async () => {
      const r1 = await request(app).post(`/api/lanes/${laneId}/cards`).set('Authorization', `Bearer ${token}`).send({ title: 'B' });
      const r2 = await request(app).post(`/api/lanes/${laneId}/cards`).set('Authorization', `Bearer ${token}`).send({ title: 'C' });
      await request(app).patch('/api/cards/move').set('Authorization', `Bearer ${token}`).send({ cardId: r2.body.id, toLaneId: laneId, position: 0 });
      const board = await request(app).get(`/api/boards/${boardId}`).set('Authorization', `Bearer ${token}`);
      const lane = board.body.lanes.find((l: { id: string }) => l.id === laneId);
      const positions = lane.cards.map((c: { position: number }) => c.position);
      expect(new Set(positions).size).toBe(positions.length);
    });

    it('returns 400 for negative position', async () => {
      const res = await request(app)
        .patch('/api/cards/move')
        .set('Authorization', `Bearer ${token}`)
        .send({ cardId, toLaneId: doneLaneId, position: -1 });
      expect(res.status).toBe(400);
    });

    it('returns 400 for float position', async () => {
      const res = await request(app)
        .patch('/api/cards/move')
        .set('Authorization', `Bearer ${token}`)
        .send({ cardId, toLaneId: doneLaneId, position: 1.5 });
      expect(res.status).toBe(400);
    });

    it('returns 403 when moving card to a lane in a different board', async () => {
      const board2 = await setupBoard(token, 'Board 2');
      const otherLaneId = await getLaneId(token, board2.id, 'To Do');
      const res = await request(app)
        .patch('/api/cards/move')
        .set('Authorization', `Bearer ${token}`)
        .send({ cardId, toLaneId: otherLaneId, position: 0 });
      expect(res.status).toBe(403);
    });

    it('returns 403 when another tenant tries to move the card', async () => {
      const res = await request(app)
        .patch('/api/cards/move')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ cardId, toLaneId: doneLaneId, position: 0 });
      expect(res.status).toBe(403);
    });

    it('returns 400 for non-UUID cardId', async () => {
      const res = await request(app)
        .patch('/api/cards/move')
        .set('Authorization', `Bearer ${token}`)
        .send({ cardId: 'not-a-uuid', toLaneId: doneLaneId, position: 0 });
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/cards/:id', () => {
    it('deletes card and returns 204', async () => {
      const create = await request(app)
        .post(`/api/lanes/${laneId}/cards`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Delete Me' });
      const res = await request(app).delete(`/api/cards/${create.body.id}`).set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(204);
    });

    it('returns 403 for another tenant', async () => {
      const create = await request(app)
        .post(`/api/lanes/${laneId}/cards`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Protected' });
      const res = await request(app).delete(`/api/cards/${create.body.id}`).set('Authorization', `Bearer ${user2Token}`);
      expect(res.status).toBe(403);
    });
  });
});
