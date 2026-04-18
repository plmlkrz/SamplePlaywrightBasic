export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  /** SauceDemo's internal numeric id used in localStorage cart-contents */
  cartIndex: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export class ShoppingCart {
  private items: Map<string, CartItem> = new Map();

  addItem(product: Product, quantity: number = 1): void {
    if (quantity <= 0) throw new Error('Quantity must be positive');
    const existing = this.items.get(product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.set(product.id, { product, quantity });
    }
  }

  removeItem(productId: string): void {
    this.items.delete(productId);
  }

  getItems(): CartItem[] {
    return Array.from(this.items.values());
  }

  getTotal(): number {
    return Array.from(this.items.values()).reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  }

  getItemCount(): number {
    return Array.from(this.items.values()).reduce(
      (sum, item) => sum + item.quantity,
      0
    );
  }

  clear(): void {
    this.items.clear();
  }

  getItem(productId: string): CartItem | undefined {
    return this.items.get(productId);
  }
}
