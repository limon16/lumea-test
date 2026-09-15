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
      <main className="pb-32">
        <Hero header={<Header messages={announcements} />} />
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <HowItWorks products={products} categories={categories} />
        </div>
      </main>
    </div>
  );
}
