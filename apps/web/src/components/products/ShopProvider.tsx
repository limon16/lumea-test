'use client';

import { useEffect, useLayoutEffect, useState, type ReactNode } from 'react';
import { formatPrice, resolvePrice, resolveStock, type Product } from '@lumea/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Checkout } from './Checkout';
import { ProductCard } from './ProductCard';
import { ShopContext, type CartItem, type Selection, type View } from './shopContext';
import { activeSelection } from './activeSelection';
import { cartKey } from './cartKey';
import { readShop, writeShop } from './storage';

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [restored, setRestored] = useState(false);
  const [view, show] = useState<View>(null);
  const [notice, setNotice] = useState('');

  // Читаємо після монтування: на сервері localStorage немає, і різний
  // перший рендер зламав би гідрацію.
  useLayoutEffect(() => {
    const saved = readShop<CartItem, Product>();
    if (saved !== null) {
      setCart(saved.cart);
      setWishlist(saved.wishlist);
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (restored) writeShop({ cart, wishlist });
  }, [restored, cart, wishlist]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);
  const addToBag = (product: Product, selected: Selection) => {
    selected = activeSelection(product, selected);
    const stock = resolveStock(product, selected);
    const key = cartKey(product.id, selected);
    const current = cart.find((item) => item.key === key)?.quantity ?? 0;
    if (stock !== null && current >= stock) { setNotice('No more of this option is available.'); return; }
    setCart((items) => {
      const existing = items.find((item) => item.key === key);
      if (existing) return items.map((item) => item.key === key ? { ...item, quantity: Math.min(item.quantity + 1, stock ?? Infinity) } : item);
      return [...items, { key, product, selected: { ...selected }, quantity: 1, unitPrice: Math.round(resolvePrice(product, selected).final), stock }];
    });
    setNotice(`${product.name} added to your bag.`);
  };
  const removeFromBag = (key: string) => setCart((items) => items.filter((item) => item.key !== key));
  // Остання одиниця прибирає позицію з кошика.
  const decreaseInBag = (key: string) => setCart((items) => items.flatMap((item) =>
    item.key !== key ? [item] : item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : []));
  const toggleWishlist = (product: Product) => setWishlist((items) => items.some((item) => item.id === product.id)
    ? items.filter((item) => item.id !== product.id) : [...items, product]);
  const browse = () => { show(null); requestAnimationFrame(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })); };
  const total = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const title = view === 'cart' ? 'Your bag' : view === 'checkout' ? 'Checkout' : view === 'placed' ? 'Order placed' : view === 'menu' ? 'Explore LUMEA' : typeof view === 'object' && view ? view.product.name : '';
  return (
    <ShopContext.Provider value={{ restored, count: cart.reduce((sum, item) => sum + item.quantity, 0), cart, wishlist, toggleWishlist, addToBag, removeFromBag, decreaseInBag, show }}>
      {children}
      <div role="status" aria-live="polite" className={`fixed bottom-5 left-1/2 z-50 max-w-[calc(100%-32px)] -translate-x-1/2 rounded-full bg-(--color-ink) px-5 py-3 text-center text-white ${notice ? '' : 'sr-only'}`}>{notice}</div>
      {view !== null && (
        <Modal title={title} onClose={() => show(null)}>
          {notice && <p role="status" className="mb-5 rounded-2xl border border-[#d8e8dc] bg-[#ecf5ee] px-4 py-3 text-[14px]/[1.5]">{notice}</p>}
          {view === 'cart' && (
            <div className="flex flex-col gap-5">
              {cart.length === 0 ? <ShopEmpty title="A little space for your essentials" description="Your bag is empty. Find your next skincare favourite." /> : <ul className="flex flex-col gap-4">
                {cart.map((item) => <li key={item.key} className="flex flex-wrap items-center justify-between gap-5 rounded-[24px] border border-(--color-border)/70 bg-white p-5 shadow-[0_4px_20px_-12px_#9aada766]">
                  <div className="min-w-0 flex-1 basis-[200px]"><h3 className="break-words text-[17px]/[1.4] font-bold">{item.product.name}</h3><p className="mt-1 text-[13px]/[1.5] text-[#68746b]">{Object.values(item.selected).join(' · ')}</p><p className="mt-3 text-[15px] font-bold">{formatPrice(item.unitPrice)} <span className="font-normal text-[#68746b]">each</span></p></div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button type="button" aria-label={`Decrease quantity of ${item.product.name}`} onClick={() => decreaseInBag(item.key)} className="size-11 shrink-0 rounded-full border border-(--color-border) bg-[#f3f5f3] transition-colors hover:bg-[#e5eee7] focus-visible:outline-2">−</button>
                    <span className="min-w-4 text-center text-[14px] font-bold tabular-nums">{item.quantity}</span>
                    <button type="button" disabled={item.stock !== null && item.quantity >= item.stock} aria-label={`Increase quantity of ${item.product.name}`} onClick={() => addToBag(item.product, item.selected)} className="size-11 shrink-0 rounded-full border border-(--color-border) bg-[#f3f5f3] transition-colors hover:bg-[#e5eee7] disabled:opacity-40 focus-visible:outline-2">+</button>
                    <button type="button" onClick={() => removeFromBag(item.key)} className="text-[13px] text-[#68746b] underline underline-offset-4 hover:text-(--color-ink) focus-visible:outline-2">Remove</button>
                  </div>
                </li>)}
              </ul>}
              <p className="flex items-center justify-between border-t border-(--color-border) pt-5 text-[20px] font-bold"><span>Total</span><span>{formatPrice(total)}</span></p>
              <div className="flex flex-wrap gap-3">
                {cart.length > 0 && (
                  <Button onClick={() => show('checkout')} variant="primary" size="dialog" className="w-full sm:w-auto">Checkout</Button>
                )}
                <Button type="button" onClick={browse} variant="secondary" size="dialog" className="w-full sm:w-auto">Continue shopping</Button>
              </div>
            </div>
          )}
          {view === 'checkout' && (
            <Checkout
              cart={cart}
              total={total}
              onBack={() => show('cart')}
              onPlaced={() => { setCart([]); show('placed'); }}
            />
          )}
          {view === 'placed' && (
            <div className="flex flex-col gap-4">
              <p>Thank you — your order is with us. We will call you to confirm the details.</p>
              <Button type="button" onClick={browse} variant="secondary" size="dialog" className="w-full sm:w-auto">Continue shopping</Button>
            </div>
          )}
          {view === 'menu' && <nav aria-label="Mobile navigation" className="flex flex-col gap-4"><Button onClick={browse} variant="secondary" size="dialog" className="w-full sm:w-auto">Shop skincare</Button><Button disabled variant="secondary" size="dialog" className="w-full sm:w-auto">Search products</Button><Button disabled variant="secondary" size="dialog" className="w-full sm:w-auto">Wishlist</Button></nav>}
          {typeof view === 'object' && view && <div className="flex min-w-0 justify-center py-5 sm:px-5"><ProductCard key={view.product.id} product={view.product} initialSelected={view.selected} details /></div>}
        </Modal>
      )}
    </ShopContext.Provider>
  );
}

function ShopEmpty({ title, description, onBrowse }: { title: string; description: string; onBrowse?: () => void }) {
  return <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-[24px] bg-[linear-gradient(145deg,#f0f4f2,#eaf5ee)] px-6 py-8 text-center">
    <span aria-hidden="true" className="flex size-14 items-center justify-center rounded-full bg-white text-(--color-accent)">
      <svg width="26" height="26" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 11V8a6 6 0 0 1 12 0v3M7 11h18l2 17H5l2-17Z" strokeLinejoin="round" /></svg>
    </span>
    <h3 className="max-w-[320px] text-[22px]/[1.25] font-bold">{title}</h3>
    <p className="max-w-[320px] text-[14px]/[1.6] text-[#68746b]">{description}</p>
    {onBrowse && <Button type="button" onClick={onBrowse} variant="primary" size="dialog" className="w-full sm:w-auto">Explore skincare</Button>}
  </div>;
}
