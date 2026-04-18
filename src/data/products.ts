import { Product } from '../cart';

// cartIndex values are SauceDemo's internal numeric ids stored in localStorage cart-contents.
// Discovered by inspecting localStorage after adding items: [4,0] = Backpack + Bike Light.
export const PRODUCTS: Product[] = [
  {
    id: 'sauce-labs-backpack',
    name: 'Sauce Labs Backpack',
    price: 29.99,
    cartIndex: 4,
    description: 'carry.allTheThings() with the sleek, streamlined Sly Pack',
  },
  {
    id: 'sauce-labs-bike-light',
    name: 'Sauce Labs Bike Light',
    price: 9.99,
    cartIndex: 0,
    description: "A red light isn't the desired state in testing but it sure helps when riding",
  },
  {
    id: 'sauce-labs-bolt-t-shirt',
    name: 'Sauce Labs Bolt T-Shirt',
    price: 15.99,
    cartIndex: 1,
    description: 'Get your testing superhero on with the Sauce Labs bolt T-shirt',
  },
  {
    id: 'sauce-labs-fleece-jacket',
    name: 'Sauce Labs Fleece Jacket',
    price: 49.99,
    cartIndex: 5,
    description: "It's not every day that you come across a midweight quarter-zip fleece jacket",
  },
  {
    id: 'sauce-labs-onesie',
    name: 'Sauce Labs Onesie',
    price: 7.99,
    cartIndex: 2,
    description: 'Rib snap infant onesie for the junior automation engineer in development',
  },
  {
    id: 'test-allthethings-t-shirt-red',
    name: 'Test.allTheThings() T-Shirt (Red)',
    price: 15.99,
    cartIndex: 3,
    description: 'This classic Sauce Labs t-shirt is perfect to wear when cozying up',
  },
];

export const productByName = (name: string): Product => {
  const product = PRODUCTS.find(p => p.name === name);
  if (!product) throw new Error(`Product not found in test data: "${name}"`);
  return product;
};
