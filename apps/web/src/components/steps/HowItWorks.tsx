'use client';

import { useRef, useState, type CSSProperties } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import type { Category, Product } from '@lumea/types';

import { StarIcon } from '@/components/header/icons';
import { MobileSheet } from '@/components/products/MobileSheet';
import { ProductsPanel } from '@/components/products/ProductsPanel';
import {
  DESKTOP_QUERY,
  initialCategoryId,
  sheetTitle,
} from '@/components/products/sheetState';

import { pickActiveStep, stackLine } from './activeStep';
import { StepCard } from './StepCard';
import { STEPS } from './stepsData';

interface Props {
  products: Product[];
  categories: Category[];
}

const STACK_TOP_MOBILE = 16;
const STACK_STEP = 24;
const PANEL_H = 754;
const COLLAPSED_PEEK = 24;
const CARD_H = 546;
const CARD_GAP = 24;
const STICKY_TOP = 40;
const SCROLL_PER_CARD = 420;
const SCROLL_DISTANCE = (STEPS.length - 1) * SCROLL_PER_CARD;

function cardPosition(index: number, active: number): number {
  return index <= active
    ? index * COLLAPSED_PEEK
    : active * COLLAPSED_PEEK + (index - active) * (CARD_H + CARD_GAP);
}

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function HowItWorks({ products, categories }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetStep, setSheetStep] = useState(0);
  const [categoryId, setCategoryId] = useState(() =>
    initialCategoryId(categories));
  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  useGSAP(() => {
    const track = trackRef.current;
    if (track === null) return;

    const cards = cardRefs.current.filter((node) => node !== null);
    const mm = gsap.matchMedia();
    let lastActiveIndex = -1;
    const activate = (index: number) => {
      if (index === lastActiveIndex) return;
      lastActiveIndex = index;
      setActiveIndex(index);
    };

    mm.add({ desktop: DESKTOP_QUERY, mobile: '(width < 1024px)' }, (context) => {
      if (!context.conditions?.desktop) {
        const line = stackLine(cards.length, STACK_TOP_MOBILE, STACK_STEP);
        const syncActive = () => activate(pickActiveStep(
          cards.map((card) => card.getBoundingClientRect().top), line,
        ));
        ScrollTrigger.create({
          trigger: track,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: syncActive,
          onRefresh: syncActive,
        });
        syncActive();
        return;
      }
      // CSS owns the transform from the first render. GSAP only updates its
      // offset, without replacing or decomposing the initial CSS transform.
      const timeline = gsap.timeline({ paused: true });
      for (let active = 1; active < STEPS.length; active += 1) {
        timeline.fromTo(cards, {
          '--card-y': (index: number) => `${cardPosition(index, active - 1)}px`,
        }, {
          '--card-y': (index: number) => `${cardPosition(index, active)}px`,
          duration: 1,
          ease: 'none',
          immediateRender: false,
        });
      }

      const syncActive = (progress: number) => {
        // Switch the active content when the incoming card reaches its stack position.
        activate(Math.min(
          Math.floor(progress * (STEPS.length - 1) + 0.00001), STEPS.length - 1,
        ));
      };
      const trigger = ScrollTrigger.create({
        trigger: track,
        start: `top ${STICKY_TOP}px`,
        end: `+=${SCROLL_DISTANCE}`,
        animation: timeline,
        scrub: true,
        onUpdate: (self) => syncActive(self.progress),
        onRefresh: (self) => syncActive(self.progress),
      });
      scrollTriggerRef.current = trigger;

      // Apply the current scroll position during layout initialization;
      // never hide the content while waiting for load events or fonts.
      const syncRestoredScroll = () => {
        trigger.refresh();
        trigger.update();
        timeline.progress(trigger.progress);
        syncActive(trigger.progress);
      };
      syncRestoredScroll();

      // The browser can restore history scroll after pageshow is dispatched.
      let frame = 0;
      const onPageShow = () => {
        window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(syncRestoredScroll);
      };
      window.addEventListener('pageshow', onPageShow);

      return () => {
        window.cancelAnimationFrame(frame);
        window.removeEventListener('pageshow', onPageShow);
        scrollTriggerRef.current = null;
      };
    });

    return () => mm.revert();
  }, { scope: trackRef });

  const openSheet = (index: number) => {
    if (window.matchMedia(DESKTOP_QUERY).matches) {
      scrollToCard(index);
      return;
    }
    setSheetStep(index);
    setSheetOpen(true);
  };

  const scrollToCard = (index: number) => {
    const trigger = scrollTriggerRef.current;

    if (trigger !== null && window.matchMedia(DESKTOP_QUERY).matches) {
      const top = trigger.start
        + (trigger.end - trigger.start) * index / (STEPS.length - 1);
      window.scrollTo({ top, behavior: 'smooth' });
      return;
    }

    const node = cardRefs.current[index];
    if (node === null || node === undefined) return;
    const top = node.getBoundingClientRect().top + window.scrollY
      - STACK_TOP_MOBILE;
    window.scrollTo({ top, behavior: 'smooth' });
    setActiveIndex(index);
  };

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="mt-24 flex flex-col gap-10 md:mt-25.5 md:gap-20"
    >
      <header
        className="mx-auto flex w-full max-w-[661px] flex-col items-center
                   justify-center gap-3 rounded-[20px] px-4 py-3 text-center
                   md:shadow-[1px_2px_4px_0px_#9CB6BA14,-8px_12px_12px_0px_#9CB6BA17,12px_20px_16px_0px_#9CB6BA17,8px_26px_14px_0px_#9CB6BA17,-20px_40px_30px_0px_#9CB6BA0F,-12px_-40px_30px_0px_#9CB6BA1A]
                   md:h-32 md:rounded-(--radius-pill-lg) md:px-40 md:py-7
                   md:bg-[linear-gradient(to_right,#f3f5f5,#f5fcfd)]"
      >
        <h2
          id="how-it-works-heading"
          className="flex items-center gap-1.5 text-[30px]/[1] font-normal
                     text-(--color-ink) md:text-[38px]/[1] md:font-bold"
        >
          How it
          <StarIcon className="size-8 shrink-0" />
          <span className="text-(--color-accent)">works</span>
        </h2>
        <p className="max-w-[219px] text-[18px]/[1.2] font-medium text-[#505050]
                      md:max-w-none md:font-bold">
          4 simple steps to healthier-looking skin
        </p>
      </header>

      <div
        ref={trackRef}
        className="relative lg:h-(--track-height) [overflow-anchor:none]"
        style={{
          '--track-height': `${PANEL_H + SCROLL_DISTANCE}px`,
        } as CSSProperties}
      >
        <div className="flex flex-col gap-10 lg:sticky lg:top-10 lg:h-[754px] lg:flex-row
                        lg:items-start lg:gap-10">
          <ol className="relative flex w-full list-none flex-col
                         lg:h-[754px] lg:w-[500px] lg:shrink-0
                         lg:overflow-clip lg:[overflow-clip-margin:96px]">
            {STEPS.map((step, index) => (
                <li
                  key={step.number}
                  ref={(node) => {
                    cardRefs.current[index] = node;
                  }}
                  className="sticky top-(--stack-top) lg:absolute lg:inset-x-0 lg:top-0 lg:h-(--card-height) lg:[transform:translateY(var(--card-y))]"
                  style={{
                    '--stack-top': `${STACK_TOP_MOBILE + index * STACK_STEP}px`,
                    '--card-height': `${CARD_H}px`,
                    '--card-y': `${cardPosition(index, 0)}px`,
                    zIndex: index,
                  } as CSSProperties}
                >
                  <div className={`${index === STEPS.length - 1 ? '' : 'pb-6'} lg:h-full lg:pb-0`}>
                    <StepCard
                      step={step}
                      isActive={index === activeIndex}
                      onSelect={() => scrollToCard(index)}
                      onShop={() => openSheet(index)}
                    />
                  </div>
                </li>
            ))}
          </ol>

          <div className="hidden min-w-0 flex-1 lg:block lg:h-[754px]">
            <ProductsPanel
              products={products}
              categories={categories}
              activeId={categoryId}
              onSelect={setCategoryId}
            />
          </div>
        </div>
      </div>

      <MobileSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={sheetTitle(STEPS, sheetStep)}
        products={products}
        categories={categories}
        activeCategoryId={categoryId}
        onCategoryChange={setCategoryId}
        steps={STEPS}
        activeStepIndex={sheetStep}
        onStepChange={setSheetStep}
      />
    </section>
  );
}
