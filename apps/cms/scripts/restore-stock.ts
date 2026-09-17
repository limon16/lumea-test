import { createStrapi } from '@strapi/strapi';

// Відновлення залишків, стертих під час backfill-volume: update() перезаписав
// компоненти variations, бо їх не було в переданому data. Значення — зі seed.ts.
const PRODUCT_STOCK: Record<string, number | null> = {
  'Hyaluronic Acid Serum': 24,
  'Daily Moisturiser': null,
  'Daily Face Cleanser': 2,
  'Gentle Micellar Water': 40,
  'Vitamin C Brightening Serum': null,
  'Overnight Repair Mask': 6,
};

// Ключ — "товар / значення" або "товар / значення / вкладений варіант".
const VARIANT_STOCK: Record<string, number> = {
  'Daily Moisturiser/Dry/40 ml': 0,
  'Daily Moisturiser/Normal/50 ml': 3,
  'Daily Moisturiser/Normal/100 ml': 18,
  'Daily Moisturiser/Sensitive/50 ml': 11,
  'Vitamin C Brightening Serum/10%': 9,
  'Vitamin C Brightening Serum/15%': 0,
};

type Data = Record<string, unknown>;
const list = (value: unknown): Data[] => Array.isArray(value) ? value as Data[] : [];

let app: Awaited<ReturnType<typeof createStrapi>> | undefined;

async function run() {
  app = await createStrapi({ appDir: process.cwd(), distDir: './dist' }).load();

  for (const product of await app.documents('api::product.product').findMany({
    populate: { variations: { populate: { values: { populate: ['subValues'] } } }, categories: true, badges: true },
  })) {
    const name = String(product.name ?? '');
    if (!(name in PRODUCT_STOCK)) {
      console.log(`− ${name}: немає у списку, пропускаю`);
      continue;
    }

    const variations = list(product.variations).map((group) => ({
      ...group,
      values: list(group.values).map((value) => {
        const valueKey = `${name}/${String(value.label)}`;
        const subValues = list(value.subValues).map((sub) => ({
          ...sub,
          stock: VARIANT_STOCK[`${valueKey}/${String(sub.label)}`] ?? sub.stock ?? null,
        }));
        return {
          ...value,
          stock: VARIANT_STOCK[valueKey] ?? value.stock ?? null,
          ...(subValues.length > 0 ? { subValues } : {}),
        };
      }),
    }));

    await app.documents('api::product.product').update({
      documentId: product.documentId,
      // Структура зібрана з уже збережених даних, тож типізацію Strapi обходимо свідомо.
      data: {
        stock: PRODUCT_STOCK[name],
        variations,
        // Передаємо явно — інакше update() знову їх обнулить.
        categories: list(product.categories).map((c) => Number(c.id)),
        badges: list(product.badges).map((b) => Number(b.id)),
      } as never,
    });
    console.log(`✓ ${name}: stock=${PRODUCT_STOCK[name]}`);
  }

  console.log('restore-stock: готово');
  await app.destroy();
  process.exit(0);
}

run().catch(async (e) => {
  console.error(e);
  await app?.destroy();
  process.exit(1);
});
