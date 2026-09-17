const KEY = 'lumea.shop.v1';

export interface StoredShop<Cart, Wish> {
  cart: Cart[];
  wishlist: Wish[];
}

export function readShop<Cart, Wish>(): StoredShop<Cart, Wish> | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const { cart, wishlist } = parsed as Partial<StoredShop<Cart, Wish>>;
    return {
      cart: Array.isArray(cart) ? cart : [],
      wishlist: Array.isArray(wishlist) ? wishlist : [],
    };
  } catch {
    return null;
  }
}

export function writeShop<Cart, Wish>(value: StoredShop<Cart, Wish>): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // Приватний режим або переповнене сховище — кошик лишається в памʼяті.
  }
}
