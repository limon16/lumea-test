'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';

import { ArrowUpRight } from '@/components/ui/ArrowUpRight';
import { Button } from '@/components/ui/Button';

const TRUST_LABEL = 'Dermatologist-inspired care';

interface Props {
  header: ReactNode;
}

export function Hero({ header }: Props) {
  const browse = () => document.getElementById('how-it-works')?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  });
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden bg-[#fdfdfd]
                 pt-6.5 pb-12 md:pt-11 md:pb-7.5"
    >
      <div aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[url('/images/hero-blur-ellipses-mobile.svg')] bg-cover bg-center md:bg-[url('/images/hero-blur-ellipses.svg')]" />

      <div className="mx-auto w-full max-w-[1280px]">
        <div className="px-[10.5px]">
          {header}
        </div>

        <div className="px-[22px] text-center md:px-3.5 md:text-left">
          <h1
            id="hero-heading"
            className="mt-6 text-[40px]/[0.8] font-bold text-(--color-ink)
                       md:mt-2 md:text-[clamp(64px,8.68vw,125px)]/[0.8]"
            style={{ letterSpacing: '-0.02em' }}
          >
            <span className="block">Skincare made</span>

            <span className="block md:flex md:items-center
                             md:justify-between md:gap-8">
              <span
                className="mt-[15px] mb-[25px] mx-auto block max-w-[24ch]
                           text-[18px]/[1] font-bold tracking-normal text-black
                           md:mx-0 md:my-0 md:shrink
                           md:text-[28px]/[1] md:text-[#00c3d0]"
              >
                Thoughtful formulas for{' '}
                <span className="inline md:block">healthy, glowing skin</span>
              </span>
              <span className="block text-[#00c3d0] md:text-[#00c0e8]">
                simple
              </span>
            </span>
          </h1>
        </div>

        <div className="mt-6 flex flex-col gap-8 px-[22px] md:mt-[58px]
                        md:grid md:grid-cols-[minmax(0,1fr)_246px] md:items-start
                        md:gap-x-10 md:gap-y-0 md:px-3.5
                        lg:grid-cols-[minmax(0,365px)_minmax(0,1fr)_246px]">
          <div className="flex flex-col gap-[34px] md:gap-8
                          md:col-span-2 lg:col-span-1 lg:col-start-1">
            <div className="flex w-fit flex-col items-center gap-2
                            mx-auto md:mx-0">
              <p className="text-[18px]/[1.3] font-bold text-black">
                Not sure what your skin needs?
              </p>
              <Button
                onClick={browse}
                className="w-full whitespace-nowrap
                           lg:!px-[clamp(24px,4vw,74px)] lg:!py-[30px] lg:!text-[24px]/[1.2]"
              >
                Find your routine
                <ArrowUpRight className="size-[22px]" />
              </Button>
            </div>

            <div className="w-full max-w-[353px] rounded-xl
                            border border-white/80 p-2.5 mx-auto md:hidden">
              <p className="flex h-[58px] w-full max-w-[331px] items-center justify-center
                            rounded-xl bg-(--color-paper) px-5
                            text-[16px]/[1.1] font-bold text-[#505050]">
                {TRUST_LABEL}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-8 md:col-start-1 md:row-start-2
                          lg:contents">
            <div className="relative aspect-[562/374] w-full overflow-hidden
                            rounded-[30px] bg-(--color-border)">
              <Image
                src="/images/hero-main.jpg"
                alt="Woman with glowing skin in daylight"
                fill
                priority
                sizes="(min-width: 768px) 562px, 100vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="hidden md:flex md:flex-col md:items-center
                          md:col-start-2 md:row-start-2 md:w-[246px]
                          md:self-center lg:col-start-3 lg:row-start-1
                          lg:self-start">
            <div className="relative aspect-[184/129] w-[184px]
                            overflow-hidden rounded-2xl bg-(--color-border)">
              <Image
                src="/images/hero-product.jpg"
                alt="Serum being applied to skin"
                fill
                sizes="184px"
                className="object-cover"
              />
            </div>

            <article className="flex w-[246px] flex-col gap-3 rounded-[32px]
                                bg-(--color-paper) px-5 py-6">
              <h2 className="text-[24px]/[1.1] font-bold text-(--color-ink)">
                LUMEA essentials
              </h2>
              <p className="text-[16px]/[1.16] font-medium text-(--color-ink)">
                Simple formulas. Thoughtful ingredients. Everyday results.
              </p>
              <Button
                onClick={browse}
                variant="secondary"
                className="h-[54px] w-full whitespace-nowrap px-8 py-0
                           text-[18px]/[1] md:px-8 md:py-0 md:text-[18px]/[1]"
              >
                Shop now
                <ArrowUpRight className="size-[22px]" />
              </Button>
            </article>
          </div>
        </div>

        <div className="hidden md:block mr-23">
          <div className="mt-4.5 w-full max-w-[353px] rounded-xl border border-white/80
                          p-2.5 ml-auto">
            <p className="flex h-[58px] w-full max-w-[331px] items-center justify-center
                          rounded-xl bg-(--color-paper) px-5
                          text-[16px]/[1.1] font-bold text-[#505050]">
              {TRUST_LABEL}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
