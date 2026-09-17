import { createStrapi } from '@strapi/strapi';

// Відновлення звʼязків із категоріями, втрачених під час backfill-volume:
// documents().update() перезаписує relations, яких немає в data.
const CATEGORIES: Record<string, string[]> = {
  'Hyaluronic Acid Serum': ['cleansers'],
  'Daily Moisturiser': ['cleansers', 'face-wash'],
  'Daily Face Cleanser': ['face-wash'],
  'Gentle Micellar Water': ['makeup-removers'],
  'Vitamin C Brightening Serum': ['cleansers', 'makeup-removers'],
  'Overnight Repair Mask': ['face-wash'],
};

let app: Awaited<ReturnType<typeof createStrapi>> | undefined;

async function run() {
  app = await createStrapi({ appDir: process.cwd(), distDir: './dist' }).load();

  const bySlug: Record<string, number> = {};
  for (const category of await app.documents('api::category.category').findMany({})) {
    bySlug[String(category.slug)] = Number(category.id);
  }

  for (const product of await app.documents('api::product.product').findMany({
    populate: { categories: true },
  })) {
    const name = String(product.name ?? '');
    const slugs = CATEGORIES[name];
    if (slugs === undefined) {
      console.log(`− ${name}: немає у списку, пропускаю`);
      continue;
    }

    const wanted = slugs.map((slug) => bySlug[slug]).filter((id): id is number => id !== undefined);
    const current = (Array.isArray(product.categories) ? product.categories : [])
      .map((category: { id?: unknown }) => Number(category.id));

    if (wanted.length === current.length && wanted.every((id) => current.includes(id))) {
      console.log(`= ${name}: вже актуально`);
      continue;
    }

    await app.documents('api::product.product').update({
      documentId: product.documentId,
      data: { categories: wanted },
    });
    console.log(`✓ ${name}: ${slugs.join(', ')}`);
  }

  console.log('restore-categories: готово');
  await app.destroy();
  process.exit(0);
}

run().catch(async (e) => {
  console.error(e);
  await app?.destroy();
  process.exit(1);
});
