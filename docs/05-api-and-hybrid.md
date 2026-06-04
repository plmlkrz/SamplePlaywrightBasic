# 5. API & Hybrid Testing

UI tests are valuable but slow. Mature suites mix in **API tests** (fast, no
browser) and **hybrid tests** (seed state quickly, then verify the UI). The demo
store ships a small REST API specifically so you can practice all three.

## The demo API

| Method & path | Purpose |
|---|---|
| `GET /api/products` | The product catalog (the inventory page fetches this) |
| `POST /api/login` | Validates credentials; returns the same errors the UI shows |
| `POST /api/orders` | Creates an order, returns `201` with an id |

## Pure API tests — the `request` fixture

`tests/api/api.spec.ts` hits the API directly. No browser is launched, so these
run in milliseconds:

```ts
test('GET /api/products returns the catalog', async ({ request }) => {
  const response = await request.get('/api/products');     // baseURL from env profile
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.length).toBe(6);
});
```

Use these for status codes, response shapes, validation rules, and error paths —
all the things that don't need a rendered page.

## Hybrid tests — seed state, verify UI

Reaching a state through the UI (log in → add three items → ...) is slow and
brittle. Instead, seed the state directly and let the UI test focus on the
behaviour you care about. In this client-side app, the cart lives in
`localStorage`, so we seed that:

```ts
async function seedCart(page, ...names) {
  const indices = names.map(n => productByName(n).cartIndex);
  await page.evaluate(ids => localStorage.setItem('cart-contents', JSON.stringify(ids)), indices);
}

test('cart seeded via localStorage shows in the UI', async ({ loggedInPage, inventoryPage }) => {
  await seedCart(loggedInPage, 'Trailblazer Backpack', 'Beacon Bike Light');
  await loggedInPage.reload();
  expect(await inventoryPage.getCartBadgeCount()).toBe(2);
});
```

In a server-backed app the same idea applies — you'd `POST /api/cart` instead of
writing `localStorage`. The principle is identical: **set up via the fastest
seam, assert through the UI.**

## Network interception — inspect & mock

`page.route()` lets a test intercept HTTP traffic. Two common uses (both in
`tests/api/hybrid.spec.ts`):

```ts
// Mock the catalog so the test is independent of real data:
await loggedInPage.route('**/api/products', route => route.fulfill({
  status: 200, contentType: 'application/json',
  body: JSON.stringify([{ id: 'mock', name: 'Mock Product', price: 1.23, description: '', cartIndex: 0 }]),
}));

// Add artificial latency to test loading states:
await loggedInPage.route('**/api/products', async route => {
  await new Promise(r => setTimeout(r, 300));
  await route.continue();
});
```

You can also *listen* without changing traffic — e.g. assert no request returned
a 4xx/5xx, which is a cheap, powerful smoke check.

Next: [Accessibility testing](06-accessibility.md).
