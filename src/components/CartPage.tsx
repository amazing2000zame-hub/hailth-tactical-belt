import { useState, useEffect } from "react";
import { getCurrentCart, removeItem, updateQuantity, checkout } from "../lib/cart";
import type { Cart, CartItem } from "../lib/api";

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<number | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState("");

  const loadCart = async () => {
    setLoading(true);
    try {
      const c = await getCurrentCart();
      setCart(c);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Cart>).detail;
      setCart(detail);
    };
    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, []);

  const handleRemove = async (itemId: number) => {
    setRemoving(itemId);
    try {
      const updated = await removeItem(itemId);
      setCart(updated);
    } catch {
      setError("Failed to remove item");
    } finally {
      setRemoving(null);
    }
  };

  const handleQuantityChange = async (item: CartItem, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) {
      await handleRemove(item.id);
      return;
    }
    if (newQty > 10) return;
    try {
      const updated = await updateQuantity(item.variant_id, newQty);
      setCart(updated);
    } catch {
      setError("Failed to update quantity");
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    setError("");
    try {
      const url = await checkout();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 0" }}>
        <div
          style={{
            width: 32,
            height: 32,
            border: "2px solid #e5e5e5",
            borderTopColor: "#c8a97e",
            borderRadius: "50%",
            animation: "spin 0.6s linear infinite",
            margin: "0 auto 1rem",
          }}
        />
        <p style={{ color: "#737373", fontSize: "0.875rem" }}>Loading cart...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return null; // Let the Astro empty state show
  }

  return (
    <div>
      {error && (
        <div
          style={{
            padding: "0.75rem 1rem",
            marginBottom: "1.5rem",
            borderRadius: "0.75rem",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            fontSize: "0.875rem",
          }}
        >
          {error}
          <button
            onClick={() => setError("")}
            style={{ float: "right", background: "none", border: "none", cursor: "pointer", color: "#dc2626" }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Cart Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {cart.items.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              gap: "1.5rem",
              padding: "1.5rem",
              borderRadius: "1rem",
              background: "#fafafa",
              border: "1px solid #f0f0f0",
              alignItems: "center",
              opacity: removing === item.id ? 0.5 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {/* Product image placeholder */}
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "0.75rem",
                background: "#e5e5e5",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.625rem",
                color: "#a3a3a3",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {item.color}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  color: "#0a0a0a",
                  marginBottom: "0.25rem",
                }}
              >
                {item.name}
              </h3>
              <p style={{ fontSize: "0.8125rem", color: "#737373" }}>
                {item.color} / {item.size}
              </p>

              {/* Quantity controls */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  borderRadius: "0.5rem",
                  border: "1px solid #e5e5e5",
                  marginTop: "0.75rem",
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => handleQuantityChange(item, -1)}
                  style={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "white",
                    border: "none",
                    cursor: "pointer",
                    color: "#525252",
                    fontSize: "1rem",
                  }}
                >
                  -
                </button>
                <span
                  style={{
                    width: 36,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    borderLeft: "1px solid #e5e5e5",
                    borderRight: "1px solid #e5e5e5",
                    background: "white",
                  }}
                >
                  {item.quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(item, 1)}
                  disabled={item.quantity >= 10}
                  style={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "white",
                    border: "none",
                    cursor: item.quantity >= 10 ? "not-allowed" : "pointer",
                    color: item.quantity >= 10 ? "#d4d4d4" : "#525252",
                    fontSize: "1rem",
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Price + remove */}
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                  color: "#0a0a0a",
                }}
              >
                ${(item.price * item.quantity).toFixed(2)}
              </p>
              {item.quantity > 1 && (
                <p style={{ fontSize: "0.6875rem", color: "#a3a3a3", marginTop: "0.125rem" }}>
                  ${item.price.toFixed(2)} each
                </p>
              )}
              <button
                onClick={() => handleRemove(item.id)}
                disabled={removing === item.id}
                style={{
                  marginTop: "0.75rem",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  color: "#a3a3a3",
                  textDecoration: "underline",
                  textUnderlineOffset: "2px",
                }}
              >
                {removing === item.id ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div
        style={{
          marginTop: "2rem",
          padding: "1.5rem",
          borderRadius: "1rem",
          border: "1px solid #f0f0f0",
          background: "#fafafa",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.75rem",
          }}
        >
          <span style={{ fontSize: "0.875rem", color: "#737373" }}>
            Subtotal ({cart.itemCount} {cart.itemCount === 1 ? "item" : "items"})
          </span>
          <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>
            ${cart.total.toFixed(2)}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <span style={{ fontSize: "0.875rem", color: "#737373" }}>Shipping</span>
          <span
            style={{ fontSize: "0.875rem", fontWeight: 500, color: "#34c759" }}
          >
            Free
          </span>
        </div>
        <div
          style={{
            borderTop: "1px solid #e5e5e5",
            paddingTop: "1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "1rem", fontWeight: 700, color: "#0a0a0a" }}>
            Total
          </span>
          <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0a0a0a" }}>
            ${cart.total.toFixed(2)}
          </span>
        </div>

        <button
          onClick={handleCheckout}
          disabled={checkingOut}
          style={{
            width: "100%",
            marginTop: "1.5rem",
            padding: "1rem 2rem",
            borderRadius: "9999px",
            background: checkingOut ? "#a3a3a3" : "#c8a97e",
            color: "#0a0a0a",
            fontFamily: "inherit",
            fontSize: "0.875rem",
            fontWeight: 700,
            textTransform: "uppercase" as const,
            letterSpacing: "0.1em",
            border: "none",
            cursor: checkingOut ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
          }}
        >
          {checkingOut ? "Redirecting to Checkout..." : "Proceed to Checkout"}
        </button>

        <a
          href="/product"
          style={{
            display: "block",
            textAlign: "center",
            marginTop: "1rem",
            fontSize: "0.8125rem",
            color: "#737373",
            textDecoration: "underline",
            textUnderlineOffset: "2px",
          }}
        >
          Continue Shopping
        </a>
      </div>
    </div>
  );
}
