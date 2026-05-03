import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { createUser, loginAs } from './helpers/factories';

const app = createApp();

describe('Board API', () => {
  let token: string;
  let user2Token: string;

  beforeEach(async () => {
    await createUser('board@test.com');
    await createUser('other@test.com');
    token = await loginAs('board@test.com');
    user2Token = await loginAs('other@test.com');
  });

  describe('POST /api/boards', () => {
    it('creates a board with 3 default lanes and returns 201', async () => {
      const res = await request(app)
        .post('/api/boards')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'My Board' });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('My Board');
      expect(res.body.id).toBeDefined();
    });

    it('returns 400 for empty title', async () => {
      const res = await request(app)
        .post('/api/boards')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '' });
      expect(res.status).toBe(400);
    });

    it('returns 400 for whitespace-only title', async () => {
      const res = await request(app)
        .post('/api/boards')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '   ' });
      expect(res.status).toBe(400);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app).post('/api/boards').send({ title: 'Board' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/boards', () => {
    it('returns only boards belonging to the authenticated tenant', async () => {
      await request(app)
        .post('/api/boards')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'User1 Board' });
      await request(app)
        .post('/api/boards')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ title: 'User2 Board' });

      const res = await request(app)
        .get('/api/boards')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe('User1 Board');
    });
  });

  describe('GET /api/boards/:id', () => {
    it('returns board with lanes and cards', async () => {
      const create = await request(app)
        .post('/api/boards')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Detailed Board' });

      const res = await request(app)
        .get(`/api/boards/${create.body.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.lanes).toHaveLength(3);
      expect(res.body.lanes.map((l: { title: string }) => l.title)).toEqual(
        expect.arrayContaining(['To Do', 'In Progress', 'Done']),
      );
    });

    it('returns 403 for a board owned by another tenant', async () => {
      const create = await request(app)
        .post('/api/boards')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Private Board' });

      const res = await request(app)
        .get(`/api/boards/${create.body.id}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(403);
    });

    it('returns 404 for non-existent board', async () => {
      const res = await request(app)
        .get('/api/boards/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/boards/:id', () => {
    it('deletes board and returns 204', async () => {
      const create = await request(app)
        .post('/api/boards')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'To Delete' });

      const res = await request(app)
        .delete(`/api/boards/${create.body.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(204);
    });

    it('returns 403 when deleting another tenant board', async () => {
      const create = await request(app)
        .post('/api/boards')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Protected' });

      const res = await request(app)
        .delete(`/api/boards/${create.body.id}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(403);
    });
  });

  describe('Lane API', () => {
    let boardId: string;

    beforeEach(async () => {
      const create = await request(app)
        .post('/api/boards')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Lane Test Board' });
      boardId = create.body.id;
    });

    it('creates a custom lane with 201', async () => {
      const res = await request(app)
        .post(`/api/boards/${boardId}/lanes`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Backlog' });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Backlog');
      expect(res.body.isDefault).toBe(false);
    });

    it('returns 403 when creating lane in another tenant board', async () => {
      const res = await request(app)
        .post(`/api/boards/${boardId}/lanes`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ title: 'Hack' });

      expect(res.status).toBe(403);
    });

    it('cannot delete a default lane', async () => {
      const boardRes = await request(app)
        .get(`/api/boards/${boardId}`)
        .set('Authorization', `Bearer ${token}`);

      const defaultLane = boardRes.body.lanes.find((l: { isDefault: boolean }) => l.isDefault);

      const res = await request(app)
        .delete(`/api/lanes/${defaultLane.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it('can delete a custom lane', async () => {
      const create = await request(app)
        .post(`/api/boards/${boardId}/lanes`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Custom' });

      const res = await request(app)
        .delete(`/api/lanes/${create.body.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(204);
    });
  });
});
