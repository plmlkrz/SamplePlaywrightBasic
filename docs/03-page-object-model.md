# 3. The Page Object Model (POM)

A **Page Object** wraps one page (or component) behind named action methods, so
tests describe *what the user does*, not *which CSS selector to click*. When the
UI changes, you fix one place — the page object — and every test benefits.

## The shape of a page object

Every POM in `pages/` follows the same five rules:

1. One class per page/component.
2. The constructor takes `page: Page`.
3. Locators are **private readonly** fields, defined once in the constructor.
4. Public **async methods** model user actions and queries.
5. **Assertions live in the test**, not the POM. (Exception: a `waitForLoad()`
   may assert the page actually loaded.)

Example — `pages/LoginPage.ts`:

```ts
export class LoginPage {
  readonly page: Page;
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('#user-name');
    this.passwordInput = page.locator('#password');
    this.loginButton   = page.locator('#login-button');
  }

  async goto() { await this.page.goto('/'); }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
```

The test stays readable:

```ts
await loginPage.goto();
await loginPage.login('standard_user', 'secret_sauce');
```

## Choosing locators (most stable → least)

The demo pages are built with this priority in mind:

1. `[data-test="..."]` — explicit test hooks (most stable).
2. `getByRole('button', { name: 'Login' })` — accessible & semantic.
3. `getByLabel('Username')` — for form inputs.
4. `getByText('Add to cart')` — visible text.
5. `#id` / `.class` — fine for stable ids.
6. CSS attribute selectors like `button[id^="add-to-cart"]` — last resort.

Avoid brittle chains of layout classes. If you keep reaching into the DOM from a
test, that's a signal to add a method to the page object instead.

## Adding a method

Say you want to read the cart link's label. Add it to `InventoryPage`:

```ts
async getCartLabel(): Promise<string> {
  return this.page.locator('.shopping_cart_link').getAttribute('aria-label') ?? '';
}
```

Now any test can call `inventoryPage.getCartLabel()` — and if the markup changes,
you update this one method.

See all the page objects in `pages/` and how they're wired into tests in
[Fixtures & config](04-fixtures-and-config.md).
