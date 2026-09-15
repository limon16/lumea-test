import type { Category } from '@lumea/types';

interface Props {
  categories: Category[];
  activeId: number;
  onSelect: (id: number) => void;
}

const MENU_SHADOW = [
  '1px 2px 4px 0px #9CB6BA1A',
  '2px 6px 7px 0px #9CB6BA17',
  '5px 14px 9px 0px #9CB6BA0D',
  '8px 26px 11px 0px #9CB6BA03',
  '13px 40px 12px 0px #9CB6BA00',
  '-12px -8px 16px 0px #9AADA729',
].join(', ');

export function CategoryTabs({ categories, activeId, onSelect }: Props) {
  return (
    <div
      className="relative -my-10 -ml-10 w-[calc(100%+40px)] shrink-0 overflow-x-auto
                 p-10 scroll-px-10 overscroll-x-contain
                 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div
        role="tablist"
        aria-label="Product categories"
        className="flex w-fit items-center gap-6 rounded-(--radius-pill-lg)
                   bg-(--color-paper) p-1"
        style={{ boxShadow: MENU_SHADOW }}
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
              className={`flex h-[68px] shrink-0 items-center whitespace-nowrap
                          rounded-(--radius-pill-lg) px-8 text-[18px]/[1.1]
                          font-bold transition-colors focus-visible:outline-2
                          focus-visible:outline-offset-2
                          focus-visible:outline-(--color-accent)
                          ${isActive
                            ? 'bg-(--color-ink) text-[#fcfcfc]'
                            : 'text-(--color-ink) hover:text-(--color-muted)'}`}
              style={isActive
                ? { letterSpacing: '-2%', boxShadow: MENU_SHADOW }
                : undefined}
            >
              {category.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
