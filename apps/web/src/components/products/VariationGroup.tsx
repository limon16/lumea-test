import { subKey, type Variation } from '@lumea/types';

interface Props {
  variation: Variation;
  selected: Record<string, string>;
  onSelect: (key: string, value: string) => void;
}

const SIZED_GROUP = /size|skin type|volume/i;

const CHIP_SHADOW = [
  '1px 2px 4px 0px #9CB6BA1A',
  '2px 6px 7px 0px #9CB6BA17',
  '5px 14px 9px 0px #9CB6BA0D',
  '8px 26px 11px 0px #9CB6BA03',
  '13px 40px 12px 0px #9CB6BA00',
  '-12px -8px 16px 0px #9AADA729',
].join(', ');

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
      <div role="radiogroup" aria-label={variation.label} className="flex flex-col gap-1">
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
              wide={!SIZED_GROUP.test(variation.label)}
              onClick={() => onSelect(variation.label, value.label)}
            />
          ))}
        </ChipRow>
      </div>

      {activeValue !== undefined && activeValue.subValues.length > 0 && (
        <div
          role="radiogroup"
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
                wide={!SIZED_GROUP.test(activeValue.subLabel ?? '')}
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
  const sized = SIZED_GROUP.test(label);

  return sized ? (
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
      onClick={onClick}
      style={{
        zIndex: depth,
        ...(wide ? { boxShadow: CHIP_SHADOW, letterSpacing: '-2%' } : {}),
      }}
      className={`relative flex h-10 items-center gap-1 rounded-(--radius-sm)
                  border border-[#bfbfbf] text-[14px]/[1] font-bold
                  transition-colors focus-visible:outline-2
                  focus-visible:outline-offset-2
                  focus-visible:outline-(--color-accent)
                  ${wide
                    ? 'w-full justify-start p-1.5'
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
                     bg-(--color-ink) text-[14px]/[1] font-bold
                     text-(--color-paper)"
          style={{
            letterSpacing: '-2%',
            transform: 'translateX(-10%) rotate(-3deg)',
          }}
        >
          -{discountPercent}%
        </span>
      )}
    </button>
  );
}
