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
      className={`relative mx-auto flex w-full flex-col md:max-w-[500px]
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
                           md:-left-[6px] md:-top-[10px] md:text-[80px]/[1]"
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

        <p className="max-w-[320px] text-[18px]/[1.3] font-bold tracking-normal
                      text-[#858585]">
          {step.description}
        </p>
      </div>

      <button
        type="button"
        onClick={onShop}
        className="mt-8 flex w-fit items-center gap-2 border-b
                   border-(--color-ink) text-[20px]/[1.2] font-bold
                   text-(--color-ink) bg-transparent transition-colors duration-400 ease-out
                   hover:border-(--color-accent) focus-visible:border-(--color-accent) focus-visible:outline-2
                   focus-visible:outline-offset-4
                   focus-visible:outline-(--color-accent)
                   motion-reduce:transition-none md:h-7 md:pb-[8px] md:text-[24px]/[1]"
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
