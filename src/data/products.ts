import { Product } from '../cart';

/**
 * The demo store's product catalog — the single source of truth shared by the
 * web app (served via GET /api/products) and the tests. `cartIndex` is the
 * 0-based position used when a cart is persisted to localStorage as an array of
 * indices (the seam the API/hybrid tests use to set up state quickly).
 */
export const PRODUCTS: Product[] = [
  {
    id: 'trailblazer-backpack',
    name: 'Trailblazer Backpack',
    price: 29.99,
    cartIndex: 0,
    description: 'A sleek, streamlined pack that carries everything you need for a day on the trail.',
  },
  {
    id: 'beacon-bike-light',
    name: 'Beacon Bike Light',
    price: 9.99,
    cartIndex: 1,
    description: 'A bright rechargeable LED light so you stay visible on every night ride.',
  },
  {
    id: 'bolt-t-shirt',
    name: 'Bolt T-Shirt',
    price: 15.99,
    cartIndex: 2,
    description: 'A soft cotton tee with a bold lightning graphic. Wear your speed.',
  },
  {
    id: 'summit-fleece-jacket',
    name: 'Summit Fleece Jacket',
    price: 49.99,
    cartIndex: 3,
    description: 'A midweight quarter-zip fleece that keeps you warm without the bulk.',
  },
  {
    id: 'cozy-onesie',
    name: 'Cozy Onesie',
    price: 7.99,
    cartIndex: 4,
    description: 'A rib-snap infant onesie for the junior automation engineer in development.',
  },
  {
    id: 'red-label-t-shirt',
    name: 'Red Label T-Shirt',
    price: 15.99,
    cartIndex: 5,
    description: 'A classic crew-neck tee in signature red. Perfect for cozying up to a test report.',
  },
];

export const productByName = (name: string): Product => {
  const product = PRODUCTS.find(p => p.name === name);
  if (!product) throw new Error(`Product not found in test data: "${name}"`);
  return product;
};

export const productByIndex = (cartIndex: number): Product => {
  const product = PRODUCTS.find(p => p.cartIndex === cartIndex);
  if (!product) throw new Error(`Product not found in test data for cartIndex: ${cartIndex}`);
  return product;
};
