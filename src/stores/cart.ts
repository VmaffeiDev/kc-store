"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types/store";

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (candidate) => candidate.variantId === item.variantId,
          );
          if (!existing) return { items: [...state.items, item] };
          return {
            items: state.items.map((candidate) =>
              candidate.variantId === item.variantId
                ? {
                    ...candidate,
                    quantity: Math.min(
                      candidate.availableStock,
                      candidate.quantity + item.quantity,
                    ),
                  }
                : candidate,
            ),
          };
        }),
      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.variantId === variantId
                ? {
                    ...item,
                    quantity: Math.max(
                      0,
                      Math.min(item.availableStock, quantity),
                    ),
                  }
                : item,
            )
            .filter((item) => item.quantity > 0),
        })),
      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "kc-store-cart" },
  ),
);
