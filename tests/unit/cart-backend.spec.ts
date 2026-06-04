/**
 * Backend UNIT tests for the ShoppingCart domain model — no browser involved.
 *
 * These run in milliseconds and prove the cart *rules* in isolation. Pairing fast
 * unit tests with slower end-to-end tests is a core QA strategy: catch logic bugs
 * here, reserve E2E for user-flow coverage.
 */

import { test, expect } from '@playwright/test';
import { ShoppingCart } from '../../src/cart';
import { PRODUCTS, productByName } from '../../src/data/products';

const backpack  = productByName('Trailblazer Backpack');  // $29.99
const bikeLight = productByName('Beacon Bike Light');      // $9.99
const onesie    = productByName('Cozy Onesie');            // $7.99

test.describe('ShoppingCart — Backend Unit Tests', { tag: '@unit' }, () => {

  let cart: ShoppingCart;
  test.beforeEach(() => { cart = new ShoppingCart(); });

  // ── Item Management ──────────────────────────────────────────────────────
  test('addItem: adds a single product to an empty cart', () => {
    cart.addItem(backpack);
    expect(cart.getItemCount()).toBe(1);
    expect(cart.getItem(backpack.id)).toBeDefined();
  });

  test('addItem: adding the same product twice increments quantity', () => {
    cart.addItem(backpack);
    cart.addItem(backpack);
    expect(cart.getItem(backpack.id)?.quantity).toBe(2);
    expect(cart.getItemCount()).toBe(2);
  });

  test('addItem: adding a quantity greater than 1 sets correct quantity', () => {
    cart.addItem(bikeLight, 3);
    expect(cart.getItem(bikeLight.id)?.quantity).toBe(3);
  });

  test('addItem: throws for zero quantity', () => {
    expect(() => cart.addItem(backpack, 0)).toThrow('Quantity must be positive');
  });

  test('addItem: throws for negative quantity', () => {
    expect(() => cart.addItem(backpack, -1)).toThrow('Quantity must be positive');
  });

  test('removeItem: removes an existing product entirely', () => {
    cart.addItem(backpack);
    cart.removeItem(backpack.id);
    expect(cart.getItem(backpack.id)).toBeUndefined();
    expect(cart.getItemCount()).toBe(0);
  });

  test('removeItem: is a no-op for a product not in the cart', () => {
    cart.addItem(backpack);
    cart.removeItem(onesie.id);
    expect(cart.getItemCount()).toBe(1);
  });

  // ── Totals & Counts ──────────────────────────────────────────────────────
  test('getTotal: returns 0 for empty cart', () => {
    expect(cart.getTotal()).toBe(0);
  });

  test('getTotal: returns correct sum for single item', () => {
    cart.addItem(backpack);
    expect(cart.getTotal()).toBeCloseTo(29.99, 2);
  });

  test('getTotal: returns correct sum for multiple items', () => {
    cart.addItem(backpack);   // $29.99
    cart.addItem(bikeLight);  // $9.99
    expect(cart.getTotal()).toBeCloseTo(39.98, 2);
  });

  test('getTotal: accounts for quantity', () => {
    cart.addItem(bikeLight, 2);  // $9.99 x2
    expect(cart.getTotal()).toBeCloseTo(19.98, 2);
  });

  test('getItemCount: returns 0 for empty cart', () => {
    expect(cart.getItemCount()).toBe(0);
  });

  test('getItemCount: returns total units, not distinct products', () => {
    cart.addItem(backpack);
    cart.addItem(bikeLight, 3);
    expect(cart.getItemCount()).toBe(4);
  });

  // ── Retrieval ────────────────────────────────────────────────────────────
  test('getItems: returns empty array for empty cart', () => {
    expect(cart.getItems()).toEqual([]);
  });

  test('getItems: returns all added items', () => {
    cart.addItem(backpack);
    cart.addItem(onesie);
    const items = cart.getItems();
    expect(items).toHaveLength(2);
    expect(items.map(i => i.product.id)).toContain(backpack.id);
    expect(items.map(i => i.product.id)).toContain(onesie.id);
  });

  test('getItem: returns undefined for non-existent product', () => {
    expect(cart.getItem('non-existent-id')).toBeUndefined();
  });

  // ── Clear ────────────────────────────────────────────────────────────────
  test('clear: empties a populated cart', () => {
    cart.addItem(backpack);
    cart.addItem(bikeLight);
    cart.clear();
    expect(cart.getItemCount()).toBe(0);
    expect(cart.getItems()).toEqual([]);
    expect(cart.getTotal()).toBe(0);
  });

  test('clear: is safe to call on an already-empty cart', () => {
    expect(() => cart.clear()).not.toThrow();
  });

  // ── Product Data Integrity ────────────────────────────────────────────────
  test('PRODUCTS array contains exactly 6 products', () => {
    expect(PRODUCTS).toHaveLength(6);
  });

  test('all products have positive prices', () => {
    PRODUCTS.forEach(p => expect(p.price).toBeGreaterThan(0));
  });

  test('all products have unique ids', () => {
    const ids = PRODUCTS.map(p => p.id);
    expect(new Set(ids).size).toBe(PRODUCTS.length);
  });

  test('all products have non-empty names and descriptions', () => {
    PRODUCTS.forEach(p => {
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.description.length).toBeGreaterThan(0);
    });
  });

  test('productByName: throws for unknown product name', () => {
    expect(() => productByName('Does Not Exist')).toThrow('Product not found in test data');
  });

});
