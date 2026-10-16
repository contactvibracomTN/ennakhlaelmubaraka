"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type PropsWithChildren,
} from "react";
import type { CartItem } from "@/types/cart";
import { emptyCart } from "@/types/cart";

const STORAGE_KEY = "nakhlah.cart.v1";

/** Normalize a persisted (possibly legacy v1) item into the v2 shape. */
function normalizeItem(raw: CartItem): CartItem | null {
  const quantity = Math.max(1, Math.round(raw.quantity) || 1);
  if (raw.kind === "date") {
    // v1 items carried a weight option id — "w-500g" était le seul réel emballage.
    const kgs =
      raw.weightKgs ??
      (raw.weightOptionId === "w-500g"
        ? 0.5
        : raw.weightOptionId
          ? 1
          : undefined);
    if (kgs == null || !Number.isFinite(kgs) || kgs <= 0 || kgs > 1000) {
      return null;
    }
    const gradeId =
      typeof raw.gradeId === "string" && raw.gradeId.length > 0
        ? raw.gradeId
        : undefined;
    return { productId: raw.productId, kind: "date", weightKgs: kgs, gradeId, quantity };
  }
  return { productId: raw.productId, kind: "gift", quantity };
}

const itemKey = (
  productId: string,
  weightKgs?: number | null,
  gradeId?: string | null,
) => `${productId}::${weightKgs ?? "*"}::${gradeId ?? "*"}`;

/* ---------------------------------------------------------------------------
 * Tiny module-level store so the persisted guest cart (brief §37) can be read
 * with useSyncExternalStore — no setState-in-effect, no hydration mismatch.
 * Server renders the empty cart; the client re-renders once hydration is done.
 * ------------------------------------------------------------------------- */
let snapshot: CartItem[] = emptyCart.items;
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): CartItem[] {
  return snapshot;
}

function getServerSnapshot(): CartItem[] {
  return emptyCart.items;
}

/** Read the persisted cart once, at module load on the client. */
function loadPersisted(): CartItem[] {
  if (typeof window === "undefined") return emptyCart.items;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyCart.items;
    const parsed = JSON.parse(raw) as { items?: CartItem[] };
    if (!Array.isArray(parsed.items)) return emptyCart.items;
    return parsed.items
      .map(normalizeItem)
      .filter((i): i is CartItem => i !== null);
  } catch {
    // Corrupted storage — start fresh.
    return emptyCart.items;
  }
}

function updateSnapshot(producer: (prev: CartItem[]) => CartItem[]): void {
  const next = producer(snapshot);
  if (next === snapshot) return;
  snapshot = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: next }));
  } catch {
    // Storage unavailable (private mode) — cart stays in memory.
  }
  for (const listener of listeners) listener();
}

// Hydrate once on the client from localStorage.
if (typeof window !== "undefined") {
  snapshot = loadPersisted();
}

interface CartContextValue {
  items: CartItem[];
  /** Sum of all quantities (for the header badge). */
  count: number;
  /** Sidebar cart (V2 formula) — open/close state. */
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (
    productId: string,
    gradeId: string | null,
    weightKgs: number | null,
    quantity: number,
  ) => void;
  removeItem: (
    productId: string,
    gradeId: string | null,
    weightKgs: number | null,
  ) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Guest cart provider (brief §37) — persisted in localStorage, shared
 * app-wide. Coupon support is architecture-only in V1.
 */
export function CartProvider({ children }: PropsWithChildren) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  // Lock body scroll while the sidebar cart is open.
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      updateSnapshot((prev) => {
        const key = itemKey(item.productId, item.weightKgs, item.gradeId);
        const index = prev.findIndex(
          (i) => itemKey(i.productId, i.weightKgs, i.gradeId) === key,
        );
        if (index === -1) return [...prev, { ...item, quantity }];
        const next = [...prev];
        next[index] = {
          ...next[index],
          quantity: next[index].quantity + quantity,
        };
        return next;
      });
    },
    [],
  );

  const setQuantity = useCallback(
    (
      productId: string,
      gradeId: string | null,
      weightKgs: number | null,
      quantity: number,
    ) => {
      updateSnapshot((prev) =>
        quantity <= 0
          ? prev.filter(
              (i) =>
                itemKey(i.productId, i.weightKgs, i.gradeId) !==
                itemKey(productId, weightKgs, gradeId),
            )
          : prev.map((i) =>
              itemKey(i.productId, i.weightKgs, i.gradeId) ===
              itemKey(productId, weightKgs, gradeId)
                ? { ...i, quantity }
                : i,
            ),
      );
    },
    [],
  );

  const removeItem = useCallback(
    (productId: string, gradeId: string | null, weightKgs: number | null) => {
      updateSnapshot((prev) =>
        prev.filter(
          (i) =>
            itemKey(i.productId, i.weightKgs, i.gradeId) !==
            itemKey(productId, weightKgs, gradeId),
        ),
      );
    },
    [],
  );

  const clear = useCallback(() => {
    updateSnapshot((prev) => (prev.length === 0 ? prev : []));
  }, []);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  const value = useMemo(
    () => ({
      items,
      count,
      isOpen,
      openCart,
      closeCart,
      addItem,
      setQuantity,
      removeItem,
      clear,
    }),
    [
      items,
      count,
      isOpen,
      openCart,
      closeCart,
      addItem,
      setQuantity,
      removeItem,
      clear,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}