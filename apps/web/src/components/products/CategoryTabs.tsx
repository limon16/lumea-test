import type { Category } from '@lumea/types';

interface Props {
  categories: Category[];
  activeId: number;
  onSelect: (id: number) => void;
}

export function CategoryTabs({ categories, activeId, onSelect }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Product categories"
      className="-mx-1 flex max-w-full items-center gap-2 overflow-x-auto
                 rounded-(--radius-pill-lg) bg-(--color-paper) p-1
                 sm:gap-6"
    >
      {categories.map((category) => {
        const isActive = category.id === activeId;
        return (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(category.id)}
            className={`shrink-0 whitespace-nowrap rounded-(--radius-pill-lg)
                        px-5 py-3 text-[18px]/[1.2] font-bold transition-colors
                        focus-visible:outline-2 focus-visible:outline-offset-2
                        focus-visible:outline-(--color-accent)
                        sm:px-8
                        ${isActive
                          ? 'bg-(--color-ink) text-(--color-paper)'
                          : 'text-(--color-ink) hover:text-(--color-muted)'}`}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
