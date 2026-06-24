/**
 * Cart Context — Global shopping cart state management.
 *
 * Uses React Context + useReducer for predictable state updates.
 * Cart is persisted to localStorage so it survives page refreshes.
 *
 * Usage:
 *   const { cart, addItem, removeItem, updateQuantity, clearCart, totalPrice } = useCart();
 */

"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────
export interface CartItem {
  /** Product ID from the database */
  productId: string;
  /** Product display name */
  productName: string;
  /** Brand name */
  brandName: string;
  /** Selected color */
  color: string;
  /** Selected size */
  size: string;
  /** Quantity in cart */
  quantity: number;
  /** Price per unit in paise */
  price: number;
  /** Image URL for the selected color */
  imageUrl: string;
}

interface CartState {
  items: CartItem[];
}

// ── Actions ───────────────────────────────────────────────────────────────
type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { productId: string; color: string; size: string } }
  | { type: "UPDATE_QUANTITY"; payload: { productId: string; color: string; size: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] };

// ── Reducer ───────────────────────────────────────────────────────────────
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      // Check if item with same product + color + size already exists
      const existingIndex = state.items.findIndex(
        (item) =>
          item.productId === action.payload.productId &&
          item.color === action.payload.color &&
          item.size === action.payload.size
      );

      if (existingIndex >= 0) {
        // Increment quantity of existing item
        const updated = [...state.items];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + action.payload.quantity,
        };
        return { items: updated };
      }

      // Add as new item
      return { items: [...state.items, action.payload] };
    }

    case "REMOVE_ITEM":
      return {
        items: state.items.filter(
          (item) =>
            !(
              item.productId === action.payload.productId &&
              item.color === action.payload.color &&
              item.size === action.payload.size
            )
        ),
      };

    case "UPDATE_QUANTITY": {
      if (action.payload.quantity <= 0) {
        // Remove item if quantity goes to zero
        return {
          items: state.items.filter(
            (item) =>
              !(
                item.productId === action.payload.productId &&
                item.color === action.payload.color &&
                item.size === action.payload.size
              )
          ),
        };
      }
      return {
        items: state.items.map((item) =>
          item.productId === action.payload.productId &&
          item.color === action.payload.color &&
          item.size === action.payload.size
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }

    case "CLEAR_CART":
      return { items: [] };

    case "LOAD_CART":
      return { items: action.payload };

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────
interface CartContextValue {
  cart: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, color: string, size: string) => void;
  updateQuantity: (productId: string, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
  /** Total price in paise */
  totalPrice: number;
  /** Total number of items in cart */
  totalItems: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────
const STORAGE_KEY = "sarina_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CartItem[];
        dispatch({ type: "LOAD_CART", payload: parsed });
      }
    } catch {
      // Ignore parse errors — start with empty cart
    }
  }, []);

  // Persist cart to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // Ignore storage errors (e.g. quota exceeded)
    }
  }, [state.items]);

  // Memoized action dispatchers
  const addItem = useCallback((item: CartItem) => {
    dispatch({ type: "ADD_ITEM", payload: item });
  }, []);

  const removeItem = useCallback((productId: string, color: string, size: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { productId, color, size } });
  }, []);

  const updateQuantity = useCallback(
    (productId: string, color: string, size: string, quantity: number) => {
      dispatch({ type: "UPDATE_QUANTITY", payload: { productId, color, size, quantity } });
    },
    []
  );

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  // Derived values
  const totalPrice = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart: state.items, addItem, removeItem, updateQuantity, clearCart, totalPrice, totalItems }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────
export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a <CartProvider>");
  }
  return context;
}
