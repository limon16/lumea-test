import type { CSSProperties, ComponentPropsWithoutRef, ReactNode } from 'react';

type Variant = 'primary' | 'secondary';

interface Props extends ComponentPropsWithoutRef<'button'> {
  variant?: Variant;
  children: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-(--color-ink) text-(--color-paper)',
  secondary:
    'bg-(--color-surface) text-(--color-ink) hover:text-[#1b3829] focus-visible:text-[#1b3829]',
};

const PRIMARY_WAVES = [
  { color: '#e5f7ed', start: 256.88, end: 1200 },
  { color: '#d1f0e0', start: 203.83, end: 952.2 },
  { color: '#92dbb6', start: 155.83, end: 727.97 },
  { color: '#63cc96', start: 110.88, end: 517.97 },
];

const SECONDARY_WAVES = [
  {
    color: 'radial-gradient(circle closest-side, #d9e1e2 0%, #bcc9c5 100%)',
    start: 216,
    end: 250,
  },
];

export function Button({
  variant = 'primary',
  children,
  className = '',
  type = 'button',
  ...rest
}: Props) {
  const waves = variant === 'primary' ? PRIMARY_WAVES : SECONDARY_WAVES;

  return (
    <button
      type={type}
      className={`group/button relative isolate inline-flex items-center
                  justify-center gap-2 overflow-hidden rounded-full px-8 py-4
                  text-[18px]/[1.2] font-bold transition-colors duration-400
                  ease-[cubic-bezier(0.42,0,0.58,1)] motion-reduce:transition-none
                  focus-visible:outline-2
                  focus-visible:outline-offset-4
                  focus-visible:outline-(--color-accent)
                  md:px-[74px] md:py-[30px] md:text-[24px]/[1.2]
                  ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
        >
          {waves.map(({ color, start, end }) => (
            <span
              key={color}
              className="absolute left-1/2 top-(--wave-start-top)
                         size-(--start) -translate-x-1/2 -translate-y-1/2
                         rounded-full
                         transition-[top,width,height] duration-400
                         ease-[cubic-bezier(0.42,0,0.58,1)]
                         group-hover/button:top-[calc(50%+var(--wave-end-y))]
                         group-hover/button:size-(--end)
                         group-focus-visible/button:top-[calc(50%+var(--wave-end-y))]
                         group-focus-visible/button:size-(--end)
                         motion-reduce:transition-none"
              style={{
                background: color,
                '--wave-start-top': variant === 'primary'
                  ? 'calc(50% + 190px)'
                  : `calc(100% + ${start / 2 + 2}px)`,
                '--wave-end-y': variant === 'primary' ? '0.44px' : '3px',
                '--start': `${start}px`,
                '--end': `${end}px`,
              } as CSSProperties}
            />
          ))}
        </span>
      <span className="relative inline-flex items-center gap-2">
        {children}
      </span>
    </button>
  );
}
