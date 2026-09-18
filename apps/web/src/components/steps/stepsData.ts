export interface Step {
  number: string;
  title: string;
  headline: string;
  description: string;
  cta: string;
  image: string;
  background: string;
}

export const STEPS: readonly Step[] = [
  {
    number: '01',
    title: 'Cleanse',
    headline: 'Start with a fresh canvas.',
    description:
      'Gently remove makeup, SPF and daily impurities without stripping your skin.',
    cta: 'Shop cleansers',
    image: '/images/01.webp',
    background: 'bg-(--color-surface)',
  },
  {
    number: '02',
    title: 'Treat',
    headline: 'Target what your skin needs.',
    description:
      'Serums and treatments deliver targeted ingredients to help with dryness, dullness, texture and blemishes.',
    cta: 'Shop treatments',
    image: '/images/02.webp',
    background: 'bg-[linear-gradient(135deg,#e5f7ed,#92dbb6)]',
  },
  {
    number: '03',
    title: 'Moisturise',
    headline: 'Lock in lasting hydration.',
    description:
      'Moisturisers help strengthen the skin barrier, lock in hydration and leave skin soft and balanced.',
    cta: 'Shop moisturisers',
    image: '/images/03.webp',
    background: 'bg-(--color-surface)',
  },
  {
    number: '04',
    title: 'Protect',
    headline: 'Your essential final step.',
    description:
      'Daily SPF helps protect your skin from UV damage and keeps it looking healthy every day.',
    cta: 'Shop SPF',
    image: '/images/04.webp',
    background: 'bg-[radial-gradient(circle_at_50%_50%,#fecbe4,#f5dfe3)]',
  },
];
