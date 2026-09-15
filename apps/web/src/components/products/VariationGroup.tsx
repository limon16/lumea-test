import { subKey, type Variation } from '@lumea/types';

interface Props {
  variation: Variation;
  selected: Record<string, string>;
  onSelect: (key: string, value: string) => void;
}

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
      <div role="radiogroup" aria-label={variation.label} className="flex flex-col gap-3">
        <span className="text-[14px]/[1] font-bold text-(--color-muted)">
          {variation.label}:
        </span>
        <div className="flex flex-wrap gap-2">
          {variation.values.map((value) => (
            <Chip
              key={value.label}
              label={value.label}
              discountPercent={value.discountPercent}
              isSelected={value.label === activeLabel}
              onClick={() => onSelect(variation.label, value.label)}
            />
          ))}
        </div>
      </div>

      {activeValue !== undefined && activeValue.subValues.length > 0 && (
        <div
          role="radiogroup"
          aria-label={activeValue.subLabel ?? `${activeValue.label} options`}
          className="flex flex-col gap-3"
        >
          {activeValue.subLabel !== null && (
            <span className="text-[14px]/[1] font-bold text-(--color-muted)">
              {activeValue.subLabel}:
            </span>
          )}
          <div className="flex flex-wrap gap-2">
            {activeValue.subValues.map((option) => (
              <Chip
                key={option.label}
                label={option.label}
                discountPercent={option.discountPercent}
                isSelected={option.label === nestedSelected}
                onClick={() => onSelect(nestedKey, option.label)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface ChipProps {
  label: string;
  discountPercent: number | null;
  isSelected: boolean;
  onClick: () => void;
}

function Chip({ label, discountPercent, isSelected, onClick }: ChipProps) {
  const hasDiscount = discountPercent !== null && discountPercent > 0;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={onClick}
      className={`flex h-10 items-center gap-1.5 rounded-(--radius-sm)
                  px-3 text-[14px]/[1] font-bold transition-colors
                  focus-visible:outline-2 focus-visible:outline-offset-2
                  focus-visible:outline-(--color-accent)
                  ${isSelected
                    ? 'bg-(--color-subtle) text-[#1b3829]'
                    : 'bg-(--color-paper) text-(--color-ink)'}`}
    >
      {label}
      {hasDiscount && (
        <span
          className="flex h-[22px] w-11 shrink-0 items-center justify-center
                     rounded-(--radius-pill-lg) bg-(--color-ink) text-[14px]/[1]
                     font-bold text-(--color-paper)"
        >
          -{discountPercent}%
        </span>
      )}
    </button>
  );
}
