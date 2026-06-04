/**
 * PURE API TESTS — Playwright's `request` fixture.
 *
 * These hit the demo store's own REST API (no browser, very fast). The base URL
 * comes from the env profile, so the same tests run against any environment.
 */

import { test, expect } from '../../src/fixtures/test-fixtures';
import { getEnv } from '../../config/env';

const { accounts } = getEnv();

test.describe('Demo Store API', { tag: '@api' }, () => {

  test('GET /api/products returns the catalog as JSON', { tag: '@smoke' }, async ({ request }) => {
    const response = await request.get('/api/products');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(6);
    expect(body[0]).toHaveProperty('id');
    expect(body[0]).toHaveProperty('price');
  });

  test('POST /api/login with valid credentials returns a token', async ({ request }) => {
    const response = await request.post('/api/login', {
      data: { username: accounts.standard.username, password: accounts.standard.password },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body).toHaveProperty('token');
  });

  test('POST /api/login with a bad password returns 401', async ({ request }) => {
    const response = await request.post('/api/login', {
      data: { username: accounts.wrongPassword.username, password: accounts.wrongPassword.password },
    });
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toContain('do not match');
  });

  test('POST /api/login for a locked account returns 403', async ({ request }) => {
    const response = await request.post('/api/login', {
      data: { username: accounts.locked.username, password: accounts.locked.password },
    });
    expect(response.status()).toBe(403);
    expect((await response.json()).error).toContain('locked out');
  });

  test('POST /api/orders creates an order and returns 201', async ({ request }) => {
    const response = await request.post('/api/orders', {
      data: { items: ['trailblazer-backpack'], total: 29.99 },
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body.status).toBe('confirmed');
  });

  test('POST /api/orders with no items returns 400', async ({ request }) => {
    const response = await request.post('/api/orders', { data: { items: [] } });
    expect(response.status()).toBe(400);
  });

});
