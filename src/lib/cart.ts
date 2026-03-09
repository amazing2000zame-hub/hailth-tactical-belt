import * as api from './api';
import type { Cart } from './api';

const SESSION_KEY = 'hailth_cart_session';

function getSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_KEY);
}

function setSessionId(id: string): void {
  localStorage.setItem(SESSION_KEY, id);
}

function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

/** Dispatch a custom event so all components can react to cart changes */
function emitCartUpdate(cart: Cart): void {
  window.dispatchEvent(new CustomEvent('cart-updated', { detail: cart }));
}

/** Get or create a cart, returns current cart state */
export async function ensureCart(): Promise<Cart> {
  const sid = getSessionId();
  if (sid) {
    try {
      return await api.getCart(sid);
    } catch {
      // Session expired or invalid, create new
      clearSession();
    }
  }
  const cart = await api.createCart();
  setSessionId(cart.sessionId);
  return cart;
}

/** Add a variant to the cart */
export async function addToCart(variantId: number, quantity: number = 1): Promise<Cart> {
  const sid = getSessionId();
  let cart: Cart;

  if (sid) {
    try {
      cart = await api.updateCart(sid, variantId, undefined);
      // updateCart without quantity adds 1 (or increments by 1 if exists)
      // But we want to set a specific quantity for first add
      // Actually the API increments if no quantity provided, which works for "Add to Cart"
      // For setting exact quantity, we'd use updateCart with quantity param
      if (quantity > 1) {
        // Get current item quantity and adjust
        const item = cart.items.find(i => i.variant_id === variantId);
        if (item && item.quantity !== quantity) {
          cart = await api.updateCart(sid, variantId, quantity);
        }
      }
    } catch {
      clearSession();
      cart = await api.createCart(variantId, quantity);
      setSessionId(cart.sessionId);
    }
  } else {
    cart = await api.createCart(variantId, quantity);
    setSessionId(cart.sessionId);
  }

  emitCartUpdate(cart);
  return cart;
}

/** Update quantity of a specific variant */
export async function updateQuantity(variantId: number, quantity: number): Promise<Cart> {
  const sid = getSessionId();
  if (!sid) throw new Error('No cart session');
  const cart = await api.updateCart(sid, variantId, quantity);
  emitCartUpdate(cart);
  return cart;
}

/** Remove an item from cart by cart item ID */
export async function removeItem(itemId: number): Promise<Cart> {
  const sid = getSessionId();
  if (!sid) throw new Error('No cart session');
  const cart = await api.removeCartItem(sid, itemId);
  emitCartUpdate(cart);
  return cart;
}

/** Get current cart state (or null if no session) */
export async function getCurrentCart(): Promise<Cart | null> {
  const sid = getSessionId();
  if (!sid) return null;
  try {
    return await api.getCart(sid);
  } catch {
    clearSession();
    return null;
  }
}

/** Start checkout */
export async function checkout(email?: string): Promise<string> {
  const sid = getSessionId();
  if (!sid) throw new Error('No cart session');
  const result = await api.createCheckout(sid, email);
  return result.url;
}

/** Clear cart after successful order */
export function clearCart(): void {
  clearSession();
  emitCartUpdate({ sessionId: '', items: [], total: 0, itemCount: 0 });
}

/** Get cart item count from the current session (sync from localStorage event) */
export function getCartSessionId(): string | null {
  return getSessionId();
}
