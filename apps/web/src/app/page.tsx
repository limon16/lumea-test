import { Header } from '@/components/header/Header';
import { Hero } from '@/components/hero/Hero';
import { HowItWorks } from '@/components/steps/HowItWorks';
import { getAnnouncements, getCategories, getProducts } from '@/lib/strapi';

export default async function Home() {
  const [products, categories, announcements] = await Promise.all([
    getProducts(),
    getCategories(),
    getAnnouncements(),
  ]);

  return (
    <div id="top">
      <main className="pb-[140px]">
        <Hero header={<Header messages={announcements} />} />
        <div className="mx-auto w-full max-w-[1308px] px-[14px]">
          <HowItWorks products={products} categories={categories} />
        </div>
      </main>
    </div>
  );
}
