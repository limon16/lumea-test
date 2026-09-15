'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { formatPrice, resolvePrice, resolveStock, type Product } from '@lumea/types';
import { Modal } from '@/components/ui/Modal';
import { ProductCard } from './ProductCard';
import { ProductRail } from './ProductRail';
import { usePagedCatalog } from './usePagedCatalog';
import { ShopContext, type CartItem, type Selection, type View } from './shopContext';
import { activeSelection } from './activeSelection';

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [view, show] = useState<View>(null);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);
  const addToBag = (product: Product, selected: Selection) => {
    selected = activeSelection(product, selected);
    const stock = resolveStock(product, selected);
    const key = `${product.id}:${JSON.stringify(Object.entries(selected).sort(([a], [b]) => a.localeCompare(b)))}`;
    const current = cart.find((item) => item.key === key)?.quantity ?? 0;
    if (stock !== null && current >= stock) { setNotice('No more of this option is available.'); return; }
    setCart((items) => {
      const existing = items.find((item) => item.key === key);
      if (existing) return items.map((item) => item.key === key ? { ...item, quantity: Math.min(item.quantity + 1, stock ?? Infinity) } : item);
      return [...items, { key, product, selected: { ...selected }, quantity: 1, unitPrice: Math.round(resolvePrice(product, selected).final), stock }];
    });
    setNotice(`${product.name} added to your bag.`);
  };
  const toggleWishlist = (product: Product) => setWishlist((items) => items.some((item) => item.id === product.id)
    ? items.filter((item) => item.id !== product.id) : [...items, product]);
  const browse = () => { show(null); requestAnimationFrame(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })); };
  const title = view === 'cart' ? 'Your bag' : view === 'wishlist' ? 'Your wishlist' : view === 'search' ? 'Search products' : view === 'menu' ? 'Explore LUMEA' : typeof view === 'object' && view ? view.product.name : '';
  return (
    <ShopContext.Provider value={{ count: cart.reduce((sum, item) => sum + item.quantity, 0), wishlist, toggleWishlist, addToBag, show }}>
      {children}
      <div role="status" aria-live="polite" className={`fixed bottom-5 left-1/2 z-50 max-w-[calc(100%-32px)] -translate-x-1/2 rounded-full bg-(--color-ink) px-5 py-3 text-center text-white ${notice ? '' : 'sr-only'}`}>{notice}</div>
      {view !== null && (
        <Modal title={title} onClose={() => show(null)}>
          {notice && <p role="status" className="mb-4 rounded-xl bg-(--color-surface) p-3">{notice}</p>}
          {view === 'cart' && (
            <div className="flex flex-col gap-5">
              {cart.length === 0 ? <p>Your bag is empty.</p> : <ul className="flex flex-col gap-4">
                {cart.map((item) => <li key={item.key} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-(--color-surface) p-4">
                  <div><h3 className="font-bold">{item.product.name}</h3><p className="text-sm">{Object.values(item.selected).join(' · ')}</p><p>{formatPrice(item.unitPrice)} each</p></div>
                  <div className="flex items-center gap-3">
                    <button type="button" aria-label={`Decrease quantity of ${item.product.name}`} onClick={() => setCart((items) => items.flatMap((entry) => entry.key !== item.key ? [entry] : entry.quantity > 1 ? [{ ...entry, quantity: entry.quantity - 1 }] : []))} className="size-10 rounded-full border focus-visible:outline-2">−</button>
                    <span>{item.quantity}</span>
                    <button type="button" disabled={item.stock !== null && item.quantity >= item.stock} aria-label={`Increase quantity of ${item.product.name}`} onClick={() => addToBag(item.product, item.selected)} className="size-10 rounded-full border disabled:opacity-40 focus-visible:outline-2">+</button>
                    <button type="button" onClick={() => setCart((items) => items.filter((entry) => entry.key !== item.key))} className="underline focus-visible:outline-2">Remove</button>
                  </div>
                </li>)}
              </ul>}
              <p className="text-xl font-bold">Total: {formatPrice(cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0))}</p>
              <p className="text-sm text-(--color-muted)">Demo bag — checkout is not available.</p>
              <button type="button" onClick={browse} className="self-start rounded-full bg-(--color-ink) px-6 py-3 text-white focus-visible:outline-2">Continue shopping</button>
            </div>
          )}
          {view === 'wishlist' && (wishlist.length ? <ProductRail products={wishlist} label="Wishlist products" compact /> : <p>Your wishlist is empty. Save a product using its heart button.</p>)}
          {view === 'search' && <SearchProducts />}
          {view === 'menu' && <nav aria-label="Mobile navigation" className="flex flex-col gap-4"><button onClick={browse} className="rounded-full border p-4 text-left focus-visible:outline-2">Shop skincare</button><button onClick={() => show('search')} className="rounded-full border p-4 text-left focus-visible:outline-2">Search products</button><button onClick={() => show('wishlist')} className="rounded-full border p-4 text-left focus-visible:outline-2">Wishlist</button></nav>}
          {typeof view === 'object' && view && <div className="flex justify-center p-5"><ProductCard key={view.product.id} product={view.product} initialSelected={view.selected} details /></div>}
        </Modal>
      )}
    </ShopContext.Provider>
  );
}

function SearchProducts() {
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  useEffect(() => { const timer = window.setTimeout(() => setSearch(query.trim()), 300); return () => window.clearTimeout(timer); }, [query]);
  const results = usePagedCatalog<Product>(`/api/catalog?kind=products&search=${encodeURIComponent(search)}`);
  return <div className="flex flex-col gap-5"><label className="flex flex-col gap-2 font-bold">Product name<input autoFocus type="search" maxLength={100} value={query} onChange={(event) => setQuery(event.target.value)} className="rounded-full border px-5 py-3 font-normal focus-visible:outline-2" /></label><ProductRail key={search} compact label="Search results" products={results.items} hasMore={results.hasMore} loading={results.loading} error={results.error} onLoadMore={results.loadMore} /></div>;
}
