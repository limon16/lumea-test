'use client';

import { Fragment, useRef, useState, type CSSProperties } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { usePagedCatalog } from '@/components/products/usePagedCatalog';
import type { CatalogPage } from '@/lib/catalog';
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
  selectedCategoryId?: number;
  initialProducts: CatalogPage<Product>;
  initialCategories: CatalogPage<Category>;
}

const STACK_TOP_MOBILE = 16;
const STACK_STEP = 24;
const PANEL_H = 754;
const COLLAPSED_PEEK = 24;
const CARD_H = 546;
const MOBILE_CARD_H = 420;
const CARD_GAP = 24;
const STICKY_TOP = 40;
const SCROLL_PER_CARD = 420;
const SCROLL_DISTANCE = (STEPS.length - 1) * SCROLL_PER_CARD;

function cardPosition(index: number, active: number, height = CARD_H): number {
  return index <= active
    ? index * COLLAPSED_PEEK
    : active * COLLAPSED_PEEK + (index - active) * (height + CARD_GAP);
}

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function HowItWorks({ initialProducts, initialCategories, selectedCategoryId }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetStep, setSheetStep] = useState(0);
  const initialId = selectedCategoryId ?? initialCategoryId(initialCategories.items);
  const [chosenCategoryId, setChosenCategoryId] = useState(initialId);
  const selectCategory = (id: number) => {
    setChosenCategoryId(id);
    document.cookie = `lumea-category=${id}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
  };
  const categoryPage = usePagedCatalog<Category>('/api/catalog?kind=categories', initialCategories);
  const categories = categoryPage.items;
  // Поки користувач нічого не обрав, а категорії довантажилися пізніше — беремо першу.
  const categoryId = chosenCategoryId || initialCategoryId(categories);
  const initialUrl = `/api/catalog?kind=products${initialId ? `&category=${initialId}` : ''}`;
  const productPage = usePagedCatalog<Product>(`/api/catalog?kind=products${categoryId ? `&category=${categoryId}` : ''}`, initialProducts, initialUrl);
  const products = productPage.items;
  const productPagination = { hasMore: productPage.hasMore, loading: productPage.loading, error: productPage.error, onLoadMore: productPage.loadMore };
  const categoryPagination = { hasMore: categoryPage.hasMore, loading: categoryPage.loading, error: categoryPage.error, onLoadMore: categoryPage.loadMore };
  const anchorRefs = useRef<(HTMLLIElement | null)[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
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

    mm.add({ desktop: DESKTOP_QUERY, mobile: '(width < 1024px)', reduce: '(prefers-reduced-motion: reduce)' }, (context) => {
      if (context.conditions?.reduce) {
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
      if (!context.conditions?.desktop) {
        const list = cards[0]?.parentElement;
        if (!list) return;
        const sync = () => {
          const index = Math.min(cards.length - 1, Math.floor((list.scrollTop + 1) / (MOBILE_CARD_H + CARD_GAP)));
          activate(index);
        };
        list.addEventListener('scroll', sync, { passive: true });
        sync();
        return () => list.removeEventListener('scroll', sync);
      }
      // Висота панелі товарів лише резервує місце в документі. Вона не має
      // зсувати sticky-верх чи позиції карток, які вже стали на місце.
      const measurePanel = () => {
        const height = Math.max(PANEL_H, Math.ceil(panelRef.current?.getBoundingClientRect().height ?? PANEL_H));
        track.style.setProperty('--panel-height', `${height}px`);
      };
      measurePanel();

      // Усі позиції виводяться з одного значення прогресу. Ланцюжок fromTo-твінів
      // на одній CSS-властивості під час refresh перезаписує початкові значення
      // один одному, тому твіни тут не потрібні.
      const renderProgress = (progress: number) => {
        const step = Math.max(0, Math.min(1, progress)) * (STEPS.length - 1);
        const from = Math.min(Math.floor(step), STEPS.length - 1);
        const to = Math.min(from + 1, STEPS.length - 1);
        const fraction = step - from;
        cards.forEach((card, index) => {
          const start = cardPosition(index, from);
          const end = cardPosition(index, to);
          card.style.setProperty('--card-y', `${start + (end - start) * fraction}px`);
        });
        activate(Math.min(Math.floor(step + 0.00001), STEPS.length - 1));
      };
      const trigger = ScrollTrigger.create({
        trigger: track,
        start: `top ${STICKY_TOP}px`,
        end: `+=${SCROLL_DISTANCE}`,
        onUpdate: (self) => renderProgress(self.progress),
        onRefresh: (self) => renderProgress(self.progress),
      });
      scrollTriggerRef.current = trigger;

      const syncRestoredScroll = () => {
        trigger.refresh();
        trigger.update();
        renderProgress(trigger.progress);
      };
      syncRestoredScroll();
      let frame = 0;
      const onPageShow = () => {
        window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(syncRestoredScroll);
      };
      window.addEventListener('pageshow', onPageShow);
      const observer = new ResizeObserver(measurePanel);
      if (panelRef.current) observer.observe(panelRef.current);

      return () => {
        observer.disconnect();
        window.cancelAnimationFrame(frame);
        window.removeEventListener('pageshow', onPageShow);
        cards.forEach((card) => card.style.removeProperty('--card-y'));
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
    if (!window.matchMedia(DESKTOP_QUERY).matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const list = cardRefs.current[0]?.parentElement;
      list?.scrollTo({ top: index * (MOBILE_CARD_H + CARD_GAP), behavior: 'smooth' });
      return;
    }
    const trigger = scrollTriggerRef.current;

    if (trigger !== null) {
      const top = trigger.start
        + (trigger.end - trigger.start) * index / (STEPS.length - 1);
      window.scrollTo({ top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      return;
    }

    const node = anchorRefs.current[index];
    if (node === null || node === undefined) return;
    const top = node.getBoundingClientRect().top + window.scrollY
      - STACK_TOP_MOBILE - index * STACK_STEP;
    window.scrollTo({ top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    setActiveIndex(index);
  };

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="mt-[137px] flex flex-col gap-10 md:mt-25.5 md:gap-20"
    >
      <header
        className="mx-auto flex w-full max-w-[661px] flex-col items-center
                   justify-center gap-3 rounded-[20px] px-0 py-0 text-center
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
        <p className="max-w-[219px] text-[18px]/[22px] font-medium md:leading-[1.2] text-[#505050]
                      md:max-w-none md:font-bold">
          4 simple steps to healthier-looking skin
        </p>
      </header>

      <div
        ref={trackRef}
        className="steps-track relative lg:h-(--track-height) [overflow-anchor:none]"
        style={{
          '--panel-height': `${PANEL_H}px`,
          '--track-height': `calc(var(--panel-height) + ${SCROLL_DISTANCE}px)`,
          '--sticky-top': `${STICKY_TOP}px`,
          '--mobile-card-height': `${MOBILE_CARD_H}px`,
        } as CSSProperties}
      >
        <div className="steps-stage flex flex-col gap-10 lg:sticky lg:top-(--sticky-top) lg:min-h-(--panel-height) lg:flex-row
                        lg:items-start lg:gap-10">
          <ol className="steps-list relative flex w-full list-none flex-col
                         lg:h-(--panel-height) lg:w-[500px] lg:shrink-0
                         lg:overflow-clip lg:[overflow-clip-margin:96px]">
            {STEPS.map((step, index) => (
              <Fragment key={step.number}>
                <li aria-hidden="true" ref={(node) => { anchorRefs.current[index] = node; }} className="step-anchor h-0 lg:hidden" />
                <li
                  ref={(node) => {
                    cardRefs.current[index] = node;
                  }}
                  className="step-card-row sticky top-(--stack-top) lg:absolute lg:inset-x-0 lg:top-0 lg:h-(--card-height)"
                  style={{
                    '--stack-top': `${STACK_TOP_MOBILE + index * STACK_STEP}px`,
                    '--card-height': `${CARD_H}px`,
                    '--initial-y': `${cardPosition(index, 0)}px`,
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
              </Fragment>
            ))}
          </ol>

          <div ref={panelRef} className="hidden min-w-0 flex-1 lg:block">
            <ProductsPanel
              products={products}
              categories={categories}
              activeId={categoryId}
              onSelect={selectCategory}
              productPagination={productPagination}
              categoryPagination={categoryPagination}
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
        productPagination={productPagination}
        categoryPagination={categoryPagination}
        activeCategoryId={categoryId}
        onCategoryChange={selectCategory}
        steps={STEPS}
        activeStepIndex={sheetStep}
        onStepChange={setSheetStep}
      />
    </section>
  );
}
