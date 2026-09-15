'use client';

import { useEffect, useRef, useState } from 'react';

import type { Category, Product } from '@lumea/types';

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

const STACK_TOP = 96;
const STACK_STEP = 16;

export function HowItWorks({ products, categories }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetStep, setSheetStep] = useState(0);
  const [categoryId, setCategoryId] = useState(() =>
    initialCategoryId(categories));
  const cardRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const nodes = cardRefs.current.filter((n): n is HTMLLIElement => n !== null);
    if (nodes.length === 0) return;

    const line = stackLine(nodes.length, STACK_TOP, STACK_STEP);

    const recompute = () => {
      const tops = nodes.map((node) => node.getBoundingClientRect().top);
      setActiveIndex(pickActiveStep(tops, line));
    };

    const observer = new IntersectionObserver(recompute, {
      rootMargin: `-${line}px 0px 0px 0px`,
      threshold: [0, 1],
    });

    nodes.forEach((node) => observer.observe(node));
    recompute();

    let frame = 0;
    const onScroll = () => {
      if (frame !== 0) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        recompute();
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', recompute, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', recompute);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, []);

  const openSheet = (index: number) => {
    if (window.matchMedia(DESKTOP_QUERY).matches) {
      scrollToCard(index);
      return;
    }
    setSheetStep(index);
    setSheetOpen(true);
  };

  const scrollToCard = (index: number) => {
    const node = cardRefs.current[index];
    if (node === null || node === undefined) return;
    const top = node.getBoundingClientRect().top + window.scrollY - STACK_TOP;
    window.scrollTo({ top, behavior: 'smooth' });
    setActiveIndex(index);
  };

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="mt-24 flex flex-col gap-20 md:mt-40"
    >
      <header className="flex flex-col gap-3">
        <h2
          id="how-it-works-heading"
          className="flex items-center gap-1.5 text-[32px]/[1] font-bold
                     text-(--color-ink) md:text-[38px]/[1]"
        >
          How it
          <span aria-hidden="true" className="text-(--color-accent)">✦</span>
          works
        </h2>
        <p className="text-[16px]/[1.4] font-medium text-(--color-muted)
                      md:text-[18px]/[1.4]">
          4 simple steps to healthier-looking skin
        </p>
      </header>

      <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
        {}
        <ol className="flex w-full list-none flex-col lg:w-[500px] lg:shrink-0">
          {STEPS.map((step, index) => (
            <li
              key={step.number}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              className="sticky motion-reduce:static"
              style={{ top: `${STACK_TOP + index * STACK_STEP}px` }}
            >
              <div className="pb-4">
                <StepCard
                  step={step}
                  isActive={index === activeIndex}
                  onSelect={() => scrollToCard(index)}
                  onShop={() => openSheet(index)}
                />
              </div>
            </li>
          ))}

          {}
          <li aria-hidden="true" className="h-[60vh] shrink-0" />
        </ol>

        {}
        <div className="hidden min-w-0 flex-1 lg:block">
          <ProductsPanel
            products={products}
            categories={categories}
            activeId={categoryId}
            onSelect={setCategoryId}
          />
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
