import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { cartApi, type CartItem } from "../lib/api";
import type { Product } from "../data/products";
import { useAuth } from "./AuthContext";

type CartContextType = { items: CartItem[]; addItem: (product: Product, size: string, petBreed?: string) => Promise<void>; removeItem: (itemId: string) => Promise<void>; updateQuantity: (itemId: string, qty: number) => Promise<void>; clearCart: () => Promise<void>; total: number; count: number; isOpen: boolean; error: string; openCart: () => void; closeCart: () => void };
const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { if (loading) return; if (!user) { setItems([]); return; } void cartApi.get().then(setItems).catch((requestError: Error) => setError(requestError.message)); }, [user, loading]);
  const requireUser = () => { if (!user) throw new Error("Sign in to add items to your cart"); };
  const addItem = async (product: Product, size: string, petBreed?: string) => { requireUser(); setError(""); const updated = await cartApi.add(product.id, size, petBreed); setItems(updated); setIsOpen(true); };
  const removeItem = async (itemId: string) => { setError(""); setItems(await cartApi.remove(itemId)); };
  const updateQuantity = async (itemId: string, qty: number) => { if (qty <= 0) return removeItem(itemId); setError(""); setItems(await cartApi.update(itemId, qty)); };
  const clearCart = async () => { await cartApi.clear(); setItems([]); };
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  return <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, count, isOpen, error, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false) }}>{children}</CartContext.Provider>;
}
export function useCart() { const context = useContext(CartContext); if (!context) throw new Error("useCart must be used within CartProvider"); return context; }
