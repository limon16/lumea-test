'use client';

import { LoadMore, type LoadMoreProps } from './LoadMore';

import type { Category } from '@lumea/types';

interface Props extends LoadMoreProps {
  categories: Category[];
  activeId: number;
  onSelect: (id: number) => void;
  compact?: boolean;
}

export function CategoryTabs({ categories, activeId, onSelect, compact = false, ...pagination }: Props) {
  return (
    <div className={`relative z-10 shrink-0 ${compact ? '-ml-3 pb-1' : '-ml-10 pb-3'}`}>
      {/* Плашка прокручується цілою і заходить за край скролера, тож текст
          обрізає край екрана чи панелі, а не її заокруглення. Поля скролера
          лишають місце тіні; pointer-events-none пропускає кліки крізь них.
          Градієнтна обводка через два фони, бо border-color градієнта не вміє. */}
      <div data-scroll-root
        className="pointer-events-none -my-6 overflow-x-auto overscroll-x-contain py-6
                   [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className={`w-fit ${compact ? 'px-3' : 'pl-10 pr-2.5'}`}>
          <div
            role="group"
            aria-label="Product categories"
            className={`pointer-events-auto flex w-fit items-center rounded-(--radius-pill-lg) shadow-soft
                       border border-transparent
                       [background:linear-gradient(var(--color-paper),var(--color-paper))_padding-box,linear-gradient(to_top,#f3f5f5,#f5fcfd)_border-box]
                       ${compact ? 'gap-3 p-[3px]' : 'gap-6 p-[3px]'}`}
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
                              ${compact ? `h-[47px] px-3 ${isActive ? 'font-medium' : 'font-normal'}` : 'h-[68px] px-8 font-bold'}
                              transition-colors focus-visible:outline-2
                              focus-visible:-outline-offset-2
                              focus-visible:outline-(--color-accent)
                              ${isActive
                                ? `bg-(--color-ink) text-[#fcfcfc] ${compact ? 'tracking-normal' : 'tracking-[-0.02em]'}`
                                : 'text-(--color-ink) hover:text-(--color-muted)'}`}
                >
                  {category.name}
                </button>
              );
            })}
            <LoadMore {...pagination} />
          </div>
        </div>
      </div>
    </div>
  );
}
