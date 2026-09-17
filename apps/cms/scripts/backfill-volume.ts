import { createStrapi } from '@strapi/strapi';

// Разова міграція: проставляє ємність товарам, створеним до появи полів
// volumeMode/volume. Запускати один раз — повторний запуск нічого не змінює.
const VOLUMES: Record<string, string> = {
  'Hyaluronic Acid Serum': '30 ml',
  'Daily Face Cleanser': '150 ml',
  'Gentle Micellar Water': '200 ml',
  'Vitamin C Brightening Serum': '30 ml',
  'Overnight Repair Mask': '75 ml',
};

const SIZE_GROUP = /size|volume|ємніст/i;

let app: Awaited<ReturnType<typeof createStrapi>> | undefined;

async function run() {
  app = await createStrapi({ appDir: process.cwd(), distDir: './dist' }).load();

  const products = await app.documents('api::product.product').findMany({
    populate: { variations: { populate: { values: true } } },
    pagination: { pageSize: 200 },
  });

  for (const product of products) {
    const name = String(product.name ?? '');
    const groups = Array.isArray(product.variations) ? product.variations : [];
    const byVariation = groups.some((group: { label?: unknown; values?: unknown }) =>
      SIZE_GROUP.test(String(group.label ?? ''))
      || (Array.isArray(group.values) ? group.values : []).some(
        (value: { subLabel?: unknown }) => SIZE_GROUP.test(String(value.subLabel ?? ''))));

    const volume = VOLUMES[name];
    if (!byVariation && volume === undefined) {
      console.log(`− ${name}: ємність невідома, пропускаю`);
      continue;
    }

    const data = byVariation
      ? { volumeMode: 'byVariation' as const, volume: '' }
      : { volumeMode: 'single' as const, volume };

    if (product.volumeMode === data.volumeMode && (product.volume || '') === data.volume) {
      console.log(`= ${name}: вже актуально`);
      continue;
    }

    await app.documents('api::product.product').update({
      documentId: product.documentId,
      data,
    });
    console.log(`✓ ${name}: ${data.volumeMode}${data.volume ? ` — ${data.volume}` : ''}`);
  }

  console.log('backfill-volume: готово');
  await app.destroy();
  process.exit(0);
}

run().catch(async (e) => {
  console.error(e);
  await app?.destroy();
  process.exit(1);
});
