/**
 * Demo store server — the "system under test".
 *
 * A deliberately tiny Express app that serves the static demo pages and a small
 * in-memory REST API. It has no database and no build step: `npm run app:start`
 * runs this file with tsx. Tests start it automatically via the `webServer`
 * block in playwright.config.ts, so a learner only ever runs `npm test`.
 *
 * Everything here is intentionally readable — it exists to be tested AND to be
 * understood by QA engineers learning how the app behaves.
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { PRODUCTS } from '../src/data/products';
import { accounts } from '../src/data/accounts';

const app = express();
const PORT = Number(process.env.PORT ?? 3100);

app.use(express.json());
// `index: false` so that GET / falls through to the login route below instead of
// being auto-served as public/index.html (which is the practice-page catalog).
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// Avoid a stray 404 from the browser's automatic favicon request.
app.get('/favicon.ico', (_req: Request, res: Response) => res.status(204).end());

// Root serves the login page (mirrors how most apps gate behind auth).
app.get('/', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// ── REST API ────────────────────────────────────────────────────────────────

/** Product catalog — the inventory page fetches this to render the grid. */
app.get('/api/products', (_req: Request, res: Response) => {
  res.json(PRODUCTS);
});

/**
 * Login endpoint. Returns the same validation messages the UI shows, so the
 * login page and the pure-API tests share one source of truth for auth rules.
 */
app.post('/api/login', (req: Request, res: Response) => {
  const { username, password } = req.body ?? {};

  if (!username) return res.status(400).json({ error: 'Username is required' });
  if (!password) return res.status(400).json({ error: 'Password is required' });

  if (username === accounts.locked.username) {
    return res.status(403).json({ error: 'Sorry, this user has been locked out.' });
  }

  const match = username === accounts.standard.username && password === accounts.standard.password;
  if (!match) {
    return res
      .status(401)
      .json({ error: 'Username and password do not match any user in this service' });
  }

  return res.json({ ok: true, token: 'demo-session-token', username });
});

/** Order creation — returns 201 with a generated id, like a real checkout API. */
let nextOrderId = 1000;
app.post('/api/orders', (req: Request, res: Response) => {
  const { items, total } = req.body ?? {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'An order must contain at least one item' });
  }
  const id = nextOrderId++;
  return res.status(201).json({ id, items, total, status: 'confirmed' });
});

// Only listen when run directly (tests import nothing from here, but this keeps
// the module import-safe).
if (require.main === module) {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Demo store running at http://localhost:${PORT}`);
  });
}

export { app };
