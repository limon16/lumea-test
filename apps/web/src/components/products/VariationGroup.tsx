import { optionKeys } from '@/components/ui/optionKeys';
import { isSizeGroup, subKey, type Variation } from '@lumea/types';

interface Props {
  variation: Variation;
  selected: Record<string, string>;
  onSelect: (key: string, value: string) => void;
}

/** Короткі значення (ємність, тип шкіри) стають у ряд компактними чипами; решта — на всю ширину. */
const isInlineGroup = (label: string): boolean => isSizeGroup(label) || /skin type/i.test(label);

export function VariationGroup({ variation, selected, onSelect }: Props) {
  const activeLabel = selected[variation.label] ?? '';
  const activeValue = variation.values.find((v) => v.label === activeLabel)
    ?? variation.values[0];

  const nestedKey = activeValue !== undefined
    ? subKey(variation.label, activeValue.label)
    : '';
  const nestedSelected = selected[nestedKey] ?? '';

  return (
    <div className="flex flex-col gap-3">
      <div role="radiogroup" onKeyDown={optionKeys} aria-label={variation.label} className="flex flex-col gap-1">
        <span className="text-[14px]/[1] font-bold text-(--color-muted)">
          {variation.label}:
        </span>
        <ChipRow label={variation.label}>
          {variation.values.map((value, index) => (
            <Chip
              key={value.label}
              depth={index}
              label={value.label}
              discountPercent={value.discountPercent}
              isSelected={value.label === activeLabel}
              wide={!isInlineGroup(variation.label)}
              onClick={() => onSelect(variation.label, value.label)}
            />
          ))}
        </ChipRow>
      </div>

      {activeValue !== undefined && activeValue.subValues.length > 0 && (
        <div
          role="radiogroup" onKeyDown={optionKeys}
          aria-label={activeValue.subLabel ?? `${activeValue.label} options`}
          className="flex flex-col gap-1"
        >
          {activeValue.subLabel !== null && (
            <span className="text-[14px]/[1] font-bold text-(--color-muted)">
              {activeValue.subLabel}:
            </span>
          )}
          <ChipRow label={activeValue.subLabel ?? ''}>
            {activeValue.subValues.map((option, index) => (
              <Chip
                key={option.label}
                depth={index}
                label={option.label}
                discountPercent={option.discountPercent}
                isSelected={option.label === nestedSelected}
                wide={!isInlineGroup(activeValue.subLabel ?? '')}
                onClick={() => onSelect(nestedKey, option.label)}
              />
            ))}
          </ChipRow>
        </div>
      )}
    </div>
  );
}

interface RowProps {
  label: string;
  children: React.ReactNode;
}

function ChipRow({ label, children }: RowProps) {
  return isInlineGroup(label) ? (
    <div className="flex flex-wrap gap-1">{children}</div>
  ) : (
    <div className="flex flex-col gap-1.5">{children}</div>
  );
}

interface ChipProps {
  label: string;
  discountPercent: number | null;
  isSelected: boolean;
  wide: boolean;
  depth: number;
  onClick: () => void;
}

function Chip({
  label, discountPercent, isSelected, wide, depth, onClick,
}: ChipProps) {
  const hasDiscount = discountPercent !== null && discountPercent > 0;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      tabIndex={isSelected ? 0 : -1}
      onClick={onClick}
      style={{ zIndex: depth }}
      className={`relative flex min-h-10 items-center gap-1 rounded-(--radius-sm)
                  border border-[#bfbfbf] text-[14px]/[1] font-bold
                  transition-colors focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-(--color-accent)
                  ${wide
                    ? 'w-full justify-start p-1.5 shadow-soft tracking-[-0.02em]'
                    : 'justify-center px-3'}
                  ${isSelected
                    ? 'bg-(--color-subtle) text-[#1b3829]'
                    : 'bg-(--color-paper) text-(--color-ink)'}`}
    >
      {label}
      {hasDiscount && (
        <span
          className="absolute -top-2.5 left-1/2 flex h-[22px] w-11 shrink-0
                     items-center justify-center rounded-(--radius-pill-lg)
                     bg-(--color-ink) text-[14px]/[1] font-bold tracking-[-0.02em]
                     text-(--color-paper)"
          style={{ transform: 'translateX(-10%) rotate(-3deg)' }}
        >
          -{discountPercent}%
        </span>
      )}
    </button>
  );
}
