'use client';

import { LoadMore, type LoadMoreProps } from './LoadMore';

import type { Category } from '@lumea/types';

interface Props extends LoadMoreProps {
  categories: Category[];
  activeId: number;
  onSelect: (id: number) => void;
  compact?: boolean;
}

const MENU_SHADOW = [
  '1px 2px 4px 0px #9CB6BA1A',
  '2px 6px 7px 0px #9CB6BA17',
  '5px 14px 9px 0px #9CB6BA0D',
  '8px 26px 11px 0px #9CB6BA03',
  '13px 40px 12px 0px #9CB6BA00',
  '-12px -8px 16px 0px #9AADA729',
].join(', ');

export function CategoryTabs({ categories, activeId, onSelect, compact = false, ...pagination }: Props) {
  return (
    <div className="w-full shrink-0">
      {/* Падінги дають тіні місце: overflow-x:auto робить overflow-y теж
          скрольним, тож без запасу її зрізало б. Відступ до вкладок при цьому
          лишається 12px — решту з'їдає сама тінь. */}
      <div data-scroll-root
        className="relative w-full overflow-x-auto
                   pt-10 pr-3 pb-[5px] pl-3 scroll-pl-3 overscroll-x-contain
                   [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
      <div
        role="group"
        aria-label="Product categories"
        className={`flex w-fit items-center rounded-(--radius-pill-lg)
                   bg-(--color-paper) ${compact ? 'gap-3 p-1' : 'gap-6 p-1'}`}
        style={{ boxShadow: MENU_SHADOW }}
      >
        {categories.map((category) => {
          const isActive = category.id === activeId;

          return (
            <button
              key={category.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(category.id)}
              className={`flex shrink-0 items-center whitespace-nowrap
                          rounded-(--radius-pill-lg) text-[18px]/[1.3]
                          ${compact ? 'p-3' : 'h-[68px] px-8'}
                          font-bold transition-colors focus-visible:outline-2
                          focus-visible:outline-offset-2
                          focus-visible:outline-(--color-accent)
                          ${isActive
                            ? 'bg-(--color-ink) text-[#fcfcfc]'
                            : 'text-(--color-ink) hover:text-(--color-muted)'}`}
              style={isActive
                ? { letterSpacing: '-0.02em', boxShadow: MENU_SHADOW }
                : undefined}
            >
              {category.name}
            </button>
          );
        })}
          <LoadMore {...pagination} />
        </div>
      </div>
    </div>
  );
}
