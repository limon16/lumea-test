'use client';

import { createContext, useContext } from 'react';
import type { Product } from '@lumea/types';

export type Selection = Record<string, string>;
export type View = 'search' | 'wishlist' | 'cart' | 'checkout' | 'placed' | 'menu' | { product: Product; selected: Selection } | null;
export interface CartItem { key: string; product: Product; selected: Selection; quantity: number; unitPrice: number; stock: number | null }
interface Shop {
  restored: boolean;
  count: number;
  cart: CartItem[];
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  addToBag: (product: Product, selected: Selection) => void;
  removeFromBag: (key: string) => void;
  decreaseInBag: (key: string) => void;
  show: (view: View) => void;
}
export const ShopContext = createContext<Shop | null>(null);
export function useShop() {
  const shop = useContext(ShopContext);
  if (!shop) throw new Error('ShopProvider is required.');
  return shop;
}

