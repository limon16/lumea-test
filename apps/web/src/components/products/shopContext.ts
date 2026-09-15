'use client';

import { createContext, useContext } from 'react';
import type { Product } from '@lumea/types';

export type Selection = Record<string, string>;
export type View = 'cart' | 'wishlist' | 'search' | 'menu' | { product: Product; selected: Selection } | null;
export interface CartItem { key: string; product: Product; selected: Selection; quantity: number; unitPrice: number; stock: number | null }
interface Shop {
  count: number;
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  addToBag: (product: Product, selected: Selection) => void;
  show: (view: View) => void;
}
export const ShopContext = createContext<Shop | null>(null);
export function useShop() {
  const shop = useContext(ShopContext);
  if (!shop) throw new Error('ShopProvider is required.');
  return shop;
}

