'use client';

import Image from 'next/image';

import type { Step } from './stepsData';

interface Props {
  step: Step;
  isActive: boolean;
  onSelect: () => void;
  onShop: () => void;
}

export function StepCard({ step, isActive, onSelect, onShop }: Props) {
  return (
    <article
      aria-current={isActive ? 'step' : undefined}
      className={`flex w-full flex-col gap-2.5 rounded-[32px] p-6 md:p-10
                  transition-colors duration-300
                  ${isActive
                    ? 'bg-(--color-paper) shadow-[0_8px_40px_rgba(33,39,33,0.08)]'
                    : 'bg-(--color-surface)'}`}
    >
      {}
      <button
        type="button"
        onClick={onSelect}
        aria-expanded={isActive}
        className="flex flex-col gap-8 text-left focus-visible:outline-2
                   focus-visible:outline-offset-4
                   focus-visible:outline-(--color-accent)"
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <span className="text-[32px]/[1] font-bold text-(--color-accent)">
              {step.number}
            </span>
            <h3 className="text-[32px]/[1] font-bold text-(--color-ink)">
              {step.title}
            </h3>
          </div>
          {}
          <p className="font-(family-name:--font-accent) text-[26px]/[1]
                        font-bold text-(--color-grey-green) md:text-[32px]/[1]">
            {step.headline}
          </p>
        </div>

        <p className="max-w-[46ch] text-[16px]/[1.3] font-bold
                      text-(--color-muted) md:text-[18px]/[1.3]">
          {step.description}
        </p>
      </button>

      {}
      <button
        type="button"
        onClick={onShop}
        hidden={!isActive}
        className="group flex w-fit items-center gap-2 text-[20px]/[1]
                   font-bold text-(--color-ink) underline-offset-8
                   transition-transform duration-200 hover:translate-x-1
                   focus-visible:outline-2 focus-visible:outline-offset-4
                   focus-visible:outline-(--color-accent)
                   motion-reduce:transform-none md:text-[24px]/[1]"
      >
        {step.cta}
        <span aria-hidden="true" className="text-(--color-accent)">→</span>
      </button>

      <div className="relative mt-2 aspect-[320/213] w-full overflow-hidden
                      rounded-[30px] bg-(--color-border)">
        <Image
          src={step.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 420px, 100vw"
          className="object-cover"
        />
      </div>
    </article>
  );
}
