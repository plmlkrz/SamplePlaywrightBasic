/* Shared client-side helpers for the demo store.
   Plain browser JS (no modules/build) so the pages stay easy to read.
   Cart state lives in localStorage under `cart-contents` as a JSON array of
   product cartIndex values — the same seam the API/hybrid tests seed directly. */

(function (global) {
  const AUTH_KEY = 'demo-auth';
  const CART_KEY = 'cart-contents';

  function isLoggedIn() {
    return global.localStorage.getItem(AUTH_KEY) === 'true';
  }

  function setLoggedIn(username) {
    global.localStorage.setItem(AUTH_KEY, 'true');
    global.localStorage.setItem('demo-user', username || '');
  }

  function logout() {
    global.localStorage.removeItem(AUTH_KEY);
    global.localStorage.removeItem('demo-user');
  }

  /** Redirect to the login page if not authenticated (mirrors a real guard). */
  function requireAuth() {
    if (!isLoggedIn()) {
      global.location.replace('/');
      return false;
    }
    return true;
  }

  function getCart() {
    try {
      const raw = global.localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function setCart(indices) {
    global.localStorage.setItem(CART_KEY, JSON.stringify(indices));
  }

  function addToCart(index) {
    const cart = getCart();
    if (!cart.includes(index)) cart.push(index);
    setCart(cart);
  }

  function removeFromCart(index) {
    setCart(getCart().filter((i) => i !== index));
  }

  function clearCart() {
    global.localStorage.removeItem(CART_KEY);
  }

  async function fetchProducts() {
    const res = await fetch('/api/products');
    return res.json();
  }

  function formatPrice(n) {
    return '$' + Number(n).toFixed(2);
  }

  /** Update the header cart badge to reflect the current cart count. */
  function renderBadge() {
    const badge = global.document.querySelector('.shopping_cart_badge');
    if (!badge) return;
    const count = getCart().length;
    if (count > 0) {
      badge.textContent = String(count);
      badge.hidden = false;
    } else {
      badge.textContent = '';
      badge.hidden = true;
    }
  }

  global.Store = {
    AUTH_KEY,
    CART_KEY,
    isLoggedIn,
    setLoggedIn,
    logout,
    requireAuth,
    getCart,
    setCart,
    addToCart,
    removeFromCart,
    clearCart,
    fetchProducts,
    formatPrice,
    renderBadge,
  };
})(window);
