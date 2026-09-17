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
    <div className={`relative z-10 w-full shrink-0 ${compact ? 'pb-1' : 'pb-3'}`}>
      {/* Фон, обводка й тінь — на обгортці: скролер нижче має overflow-x,
          а він робить скрольною й вертикаль і зрізав би тінь. Градієнтна
          обводка через два фони, бо border-color градієнта не вміє. */}
      <div className="w-fit max-w-full rounded-(--radius-pill-lg) shadow-soft
                      border border-transparent
                      [background:linear-gradient(var(--color-paper),var(--color-paper))_padding-box,linear-gradient(to_top,#f3f5f5,#f5fcfd)_border-box]">
        <div data-scroll-root
          className="relative w-full overflow-x-auto rounded-(--radius-pill-lg)
                     overscroll-x-contain
                     [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div
            role="group"
            aria-label="Product categories"
            className={`flex w-fit items-center rounded-(--radius-pill-lg)
                       ${compact ? 'gap-3 p-1' : 'gap-6 p-1'}`}
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
                              focus-visible:-outline-offset-2
                              focus-visible:outline-(--color-accent)
                              ${isActive
                                ? 'bg-(--color-ink) text-[#fcfcfc] tracking-[-0.02em]'
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
