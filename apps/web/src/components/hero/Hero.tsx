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
                 min-h-[807px] rounded-b-[30px] pt-6.5 pb-12 md:min-h-0 md:rounded-none md:pt-11 md:pb-7.5"
    >
      <div aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[url('/images/hero-background-mobile.webp')] bg-size-[100%_100%] bg-top bg-no-repeat md:bg-[url('/images/hero-background.webp')]" />

      <div className="mx-auto w-full max-w-[1301px] px-[10.5px]">

        {header}

        <div className="text-center px-[17.5px] md:px-5 md:text-left">
          <h1
            id="hero-heading"
            className="mt-[34px] text-[clamp(32px,10.667vw,40px)]/[0.9] font-bold tracking-[-0.02em] text-(--color-ink)
                       md:mt-2 md:text-[clamp(64px,8.68vw,125px)]/[0.8]"
          >
            <span className="block">Skincare made</span>

            <span className="flex flex-col-reverse md:flex-row md:items-center
                             md:justify-between md:gap-8 md:-mt-1.5">
              <span
                className="mt-[15px] mb-0 mx-auto block w-full max-w-[231px]
                           text-[18px]/[1] font-bold tracking-normal text-black
                           md:mx-0 md:my-0 md:shrink-0
                           md:text-[28px]/[1] md:text-[#00c3d0]
                           md:pl-[10px]
                           md:w-[391px] md:max-w-none md:translate-x-4 md:translate-y-[19px]"
              >
                Thoughtful formulas for{' '}
                <span className="inline md:block">healthy, glowing skin</span>
              </span>
              <span className="block text-[#00c3d0] md:text-[#00c0e8] md:mr-[14px]">
                simple
              </span>
            </span>
          </h1>
        </div>

        <div className="mt-[25px] flex flex-col md:grid md:grid-cols-[auto_1fr] md:items-start gap-[34.5px] px-[17.5px] md:gap-8 md:mt-[58px]
                        lg:grid-cols-[minmax(234px,clamp(234px,-88.46px+31.4904vw,365px))_minmax(0,1fr)_246px]
                        md:gap-x-10 md:gap-y-0 lg:gap-x-0 md:px-3.5">
          <div className="flex flex-col items-center gap-2 mx-auto md:mx-0
                          w-full max-w-[234px] md:max-w-none md:w-auto md:pt-[60px]
                          md:col-start-1 md:row-start-1
                          lg:col-span-1">
            <p className="whitespace-nowrap text-[14px]/[1] md:text-[18px]/[1.3] font-bold text-black">
              Not sure what your skin needs?
            </p>
            <Button
              onClick={browse}
              className="h-[54px] w-full whitespace-nowrap !px-8 font-normal md:h-auto md:font-bold
                         md:!px-[clamp(24px,4vw,74px)] md:!py-[30px] md:!text-[24px]/[1.2]"
            >
              Find your routine
              <ArrowUpRight className="size-[22px]" />
            </Button>
          </div>

          <div className="relative order-2 md:order-none aspect-[562/374] w-full overflow-hidden
                          rounded-[30px] bg-(--color-border)
                          md:col-start-2 md:row-start-1
                          lg:ml-[20px] lg:mr-[46px]
                          lg:w-[calc(100%-66px)] lg:h-[374px]">
            <Image
              src="/images/hero-main.webp"
              alt="Woman with glowing skin in daylight"
              fill
              priority
              sizes="(min-width: 768px) 562px, 100vw"
              className="object-cover"
            />
          </div>

          <div className="order-1 md:order-none w-full max-w-[258px] rounded-xl border border-white/80 px-[6px] py-3 mx-auto md:max-w-[353px] md:p-2.5
                          md:col-span-full md:row-start-2 md:ml-auto md:mr-[78px] md:mt-4.5 md:py-2">
            <p className="flex h-[50px] md:h-[58px] w-full max-w-[331px] items-center justify-center
                          rounded-xl bg-(--color-paper) px-2 md:px-5
                          text-[16px]/[1.1] font-semibold md:font-bold text-[#505050]">
              {TRUST_LABEL}
            </p>
          </div>

          <div className="hidden lg:flex lg:flex-col lg:items-center
                          lg:col-start-3 lg:row-start-1 lg:w-[246px]
                          lg:self-center pr-[20px]">
            <div className="relative aspect-[184/129] w-[184px]
                            translate-y-[8px] overflow-hidden rounded-2xl
                            bg-(--color-border)">
              <Image
                src="/images/hero-product.webp"
                alt="Serum being applied to skin"
                fill
                sizes="184px"
                className="object-cover"
              />
            </div>

            <article className="relative z-10 flex w-[246px] flex-col gap-3
                                rounded-[32px] bg-(--color-paper) px-2 md:px-5 py-6">
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
      </div>
    </section>
  );
}
