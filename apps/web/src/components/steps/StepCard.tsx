'use client';

import Image from 'next/image';

import { ArrowUpRight } from '@/components/ui/ArrowUpRight';

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
      className={`relative mx-auto flex w-full flex-col gap-2.5 md:max-w-[500px]
                  rounded-[32px] p-6 ring-1 ring-[#63cc96]/40
                  md:p-10 ${step.background}
                  lg:h-[546px] lg:w-[500px] lg:shrink-0
                  shadow-[1px_2px_4px_0px_#9CB6BA14,-8px_12px_12px_0px_#9CB6BA17,12px_20px_16px_0px_#9CB6BA17,8px_26px_14px_0px_#9CB6BA17,-20px_40px_30px_0px_#9CB6BA0F]`}
    >
      <button type="button" onClick={onSelect}
        aria-label={`Show step ${step.number}: ${step.title}`}
        className="absolute inset-x-0 top-0 z-10 h-6 rounded-t-[32px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink)" />
      <div className="flex flex-col gap-8 text-left">
        <div className="flex flex-col gap-2">
          <div className="flex items-end gap-2.5">
            <span
              aria-hidden="true"
              className="relative block h-[30px] w-[62px] shrink-0 overflow-hidden
                         md:h-[42px] md:w-[88px]"
            >
              <span
                className="absolute -left-[5px] -top-[8px] font-bold
                           text-[#bfbfbf] text-[56px]/[1]
                           md:-left-[7px] md:-top-[11px] md:text-[80px]/[1]"
              >
                {step.number}
              </span>
            </span>
            <h3 className="text-[34px]/[1] font-bold text-(--color-accent)
                           md:text-[50px]/[1]">
              <button type="button" onClick={onSelect} aria-expanded={isActive}
                className="text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-accent)">
                {step.title}
              </button>
            </h3>
          </div>
          <p className="font-(family-name:--font-accent) text-[26px]/[1]
                        font-bold text-[#9aada7] md:text-[32px]/[1]">
            {step.headline}
          </p>
        </div>

        <p className="max-w-[360px] text-[16px]/[1.3] font-bold text-[#565b5a]
                      md:text-[18px]/[1.3]">
          {step.description}
        </p>
      </div>

      <button
        type="button"
        onClick={onShop}
        tabIndex={isActive ? 0 : -1}
        aria-hidden={!isActive}
        style={{ visibility: isActive ? 'visible' : 'hidden' }}
        className="flex w-fit items-center gap-2 border-b
                   border-(--color-ink) pb-1 text-[20px]/[1.2] font-bold
                   text-(--color-ink) transition-transform duration-200
                   hover:translate-x-1 focus-visible:outline-2
                   focus-visible:outline-offset-4
                   focus-visible:outline-(--color-accent)
                   motion-reduce:transform-none md:text-[24px]/[1.2]"
      >
        {step.cta}
        <ArrowUpRight className="size-[22px] shrink-0" />
      </button>

      <div className="relative mt-auto aspect-[391/194] w-full min-h-0 shrink
                      overflow-hidden rounded-[30px] bg-(--color-border)">
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
