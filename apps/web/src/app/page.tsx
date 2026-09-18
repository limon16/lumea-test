import type { Metadata } from 'next';
import { cookies } from 'next/headers';
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
  const savedId = Number((await cookies()).get('lumea-category')?.value);
  const [firstCategories, announcements] = await Promise.all([
    getCategoryPage(), getAnnouncements(),
  ]);
  let categories = firstCategories;
  // Довантажуємо сторінки до збереженої категорії, щоб пагінація і порядок вкладок не розійшлися.
  if (Number.isSafeInteger(savedId) && savedId > 0) {
    while (!categories.error && !categories.items.some((item) => item.id === savedId)
      && categories.page < categories.pageCount) {
      const next = await getCategoryPage(categories.page + 1);
      if (next.error) break;
      categories = { ...next, items: [...categories.items, ...next.items] };
    }
  }
  const category = categories.items.find((item) => item.id === savedId) ?? categories.items[0];
  const products = category ? await getProductPage(1, category.id) : { ...emptyPage<Product>(), pageCount: 0 };

  return (
    <ShopProvider>
    <div id="top">
      <main className="pb-[35px] md:pb-[140px] ">
        <Hero header={<Header messages={announcements} />} />
        <div className="mx-auto w-full px-[14px] max-w-[1308px]">
          <HowItWorks initialProducts={products} initialCategories={categories} selectedCategoryId={category?.id} />
        </div>
      </main>
    </div>
    </ShopProvider>
  );
}
