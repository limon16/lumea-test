'use client';

import { useShop } from '@/components/products/shopContext';
import { AnnouncementBar } from './AnnouncementBar';
import { NavLink } from './NavLink';
import {
  BurgerIcon, CartIcon, HeartIcon, SearchIcon,
} from './icons';

interface Props {
  messages: string[];
}

const NAV_ITEMS = ['Shop', 'Skincare', 'Sets', 'About'];

const ICON_BUTTON_CLASS =
  'flex size-10 shrink-0 items-center justify-center rounded-full bg-(--color-paper) shadow-soft'
  + ' text-(--color-ink) transition-colors hover:text-(--color-accent) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink)';

export function Header({ messages }: Props) {
  const shop = useShop();
  return (
    <header className="relative z-20 flex flex-col gap-2 md:gap-3">
      <AnnouncementBar messages={messages} />
      <div
        className="mx-[3.5px] flex h-[50px] items-center justify-between md:mx-0 md:h-[78px]"
      >
        <a
          href="#top"
          className="hidden shrink-0 font-(family-name:--font-wordmark)
                     text-[28px] tracking-normal md:block md:text-[40px] font-bold
                     text-(--color-ink) focus-visible:outline-2"
        >
          LUMEA
        </a>

        <nav
          aria-label="Primary"
          className="hidden md:flex md:items-center md:gap-10"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink key={item} href={item === 'About' ? '#hero-heading' : '#how-it-works'}>
              {item}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1 md:ml-0 md:gap-2">
          <button
            type="button"
            aria-label="Menu"
            onClick={() => shop.show('menu')}
            className={`${ICON_BUTTON_CLASS} size-11 bg-[#bcc9c5] md:hidden`}
          >
            <BurgerIcon className="size-6" />
          </button>
          <button
            type="button"
            aria-label="Search"
            onClick={() => shop.show('search')}
            className={`${ICON_BUTTON_CLASS} hidden md:flex`}
          >
            <SearchIcon className="size-[22px]" />
          </button>
          <button
            type="button"
            aria-label={shop.restored ? `Wishlist, ${shop.wishlist.length} items` : 'Wishlist'}
            onClick={() => shop.show('wishlist')}
            className={`${ICON_BUTTON_CLASS} relative`}
          >
            <HeartIcon className="size-[22px]" />
            {shop.restored && shop.wishlist.length > 0 && (
              <span
                aria-hidden="true"
                className="absolute -bottom-1 -right-1 flex size-5
                           items-center justify-center rounded-full
                           bg-(--color-ink) text-[14px]/[1] font-bold
                           text-(--color-paper)"
              >
                {shop.wishlist.length}
              </span>
            )}
          </button>
          <button
            type="button"
            aria-label={shop.restored ? `Cart, ${shop.count} items` : 'Cart'}
            onClick={() => shop.show('cart')}
            className={`${ICON_BUTTON_CLASS} relative size-11 md:size-10`}
          >
            <CartIcon className="size-[22px]" />
            <span
              aria-hidden="true"
              style={{ visibility: shop.restored ? 'visible' : 'hidden' }}
              className="absolute -bottom-1 -right-1 flex size-5
                         items-center justify-center rounded-full
                         bg-(--color-ink) text-[14px]/[1] font-bold
                         text-(--color-paper)"
            >
              {shop.count}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
