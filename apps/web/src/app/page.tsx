import type { Metadata } from 'next';
import type { Product } from '@lumea/types';
import { ShopProvider } from '@/components/products/ShopProvider';
import { emptyPage } from '@/lib/catalog';
import { Header } from '@/components/header/Header';
import { Hero } from '@/components/hero/Hero';
import { HowItWorks } from '@/components/steps/HowItWorks';
import { getAnnouncements, getCategoryPage, getProductPage } from '@/lib/strapi';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default async function Home() {
  const [categories, announcements] = await Promise.all([
    getCategoryPage(), getAnnouncements(),
  ]);
  const category = categories.items[0];
  const products = category ? await getProductPage(1, category.id) : { ...emptyPage<Product>(), pageCount: 0 };

  return (
    <ShopProvider>
    <div id="top">
      <main className="pb-[140px]">
        <Hero header={<Header messages={announcements} />} />
        <div className="mx-auto w-full max-w-[1308px] px-[14px]">
          <HowItWorks initialProducts={products} initialCategories={categories} />
        </div>
      </main>
    </div>
    </ShopProvider>
  );
}
