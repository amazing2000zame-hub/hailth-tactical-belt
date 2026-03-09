const API_BASE = 'http://localhost:4322/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `API error ${res.status}`);
  }
  return res.json();
}

// Types
export interface ProductVariant {
  id: number;
  color: string;
  size: string;
  sku: string;
  stock: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_price: number;
  currency: string;
  image: string;
  variants: ProductVariant[];
  colors: string[];
  sizes: string[];
}

export interface CartItem {
  id: number;
  quantity: number;
  variant_id: number;
  color: string;
  size: string;
  sku: string;
  name: string;
  price: number;
  compare_price: number;
  image: string;
  slug: string;
}

export interface Cart {
  sessionId: string;
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface CheckoutResult {
  url: string;
  sessionId: string;
}

// Products
export function getProducts(): Promise<Product[]> {
  return request('/products');
}

export function getProduct(idOrSlug: string | number): Promise<Product> {
  return request(`/products/${idOrSlug}`);
}

// Cart
export function createCart(variantId?: number, quantity?: number): Promise<Cart> {
  return request('/cart', {
    method: 'POST',
    body: JSON.stringify({ variantId, quantity }),
  });
}

export function getCart(sessionId: string): Promise<Cart> {
  return request(`/cart/${sessionId}`);
}

export function updateCart(sessionId: string, variantId: number, quantity?: number): Promise<Cart> {
  return request(`/cart/${sessionId}`, {
    method: 'PUT',
    body: JSON.stringify({ variantId, quantity }),
  });
}

export function removeCartItem(sessionId: string, itemId: number): Promise<Cart> {
  return request(`/cart/${sessionId}/${itemId}`, { method: 'DELETE' });
}

// Checkout
export function createCheckout(sessionId: string, email?: string): Promise<CheckoutResult> {
  return request('/checkout', {
    method: 'POST',
    body: JSON.stringify({ sessionId, email }),
  });
}

// Contact
export function submitContact(data: { name: string; email: string; subject?: string; message: string }) {
  return request<{ success: boolean; message: string }>('/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Newsletter
export function subscribeNewsletter(email: string) {
  return request<{ success: boolean; message: string }>('/newsletter', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}
