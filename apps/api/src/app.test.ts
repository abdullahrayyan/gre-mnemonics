import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';

describe('API application', () => {
  const app = createApp();

  describe('GET /health', () => {
    it('returns 200 with an ok status payload', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ status: 'ok', service: 'mnemonic-api' });
      expect(typeof res.body.uptimeSeconds).toBe('number');
    });

    it('echoes a correlation id header', async () => {
      const res = await request(app).get('/health');
      expect(res.headers['x-request-id']).toBeTruthy();
    });

    it('honors an inbound x-request-id', async () => {
      const res = await request(app).get('/health').set('x-request-id', 'abc-123');
      expect(res.headers['x-request-id']).toBe('abc-123');
    });
  });

  describe('GET /api/v1/health', () => {
    it('is reachable under the versioned prefix', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('unknown routes', () => {
    it('returns a 404 error envelope', async () => {
      const res = await request(app).get('/does-not-exist');

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
      expect(res.body.error.requestId).toBeTruthy();
    });
  });
});
