
import { createStrapi } from '@strapi/strapi';

const CATEGORIES = [
  { name: 'Cleansers', slug: 'cleansers', order: 1 },
  { name: 'Face Wash', slug: 'face-wash', order: 2 },
  { name: 'Makeup Removers', slug: 'makeup-removers', order: 3 },
];

const BADGES = [
  { name: 'Sale', order: 1 },
  { name: 'New', order: 2 },
  { name: 'Bestseller', order: 3 },
];

interface SubValue {
  label: string;
  priceOverride?: number;
  discountPercent?: number;
  discountedPrice?: number;
  stock?: number;
}

interface Value {
  label: string;
  priceOverride?: number;
  discountPercent?: number;
  discountedPrice?: number;
  stock?: number;
  subLabel?: string;
  subValues?: SubValue[];
}

interface SeedProduct {
  name: string;
  subtitleMode: 'single' | 'byVariation';
  subtitle?: string;
  priceMode: 'single' | 'byVariation';
  price?: number;
  discountPercent?: number;
  discountedPrice?: number;
  stock?: number;
  badges: string[];
  variations: { label: string; values: Value[] }[];
  categories: string[];
}

const PRODUCTS: SeedProduct[] = [
  {
    name: 'Hyaluronic Acid Serum',
    subtitleMode: 'single', subtitle: '30 ml',
    priceMode: 'single', price: 28, discountPercent: 15, stock: 24,
    badges: ['Sale'],
    variations: [{
      label: 'Choose formula',
      values: [
        { label: 'Hyaluronic Acid 2%' },
        { label: 'Hyaluronic + B5' },
      ],
    }],
    categories: ['cleansers'],
  },
  {
    name: 'Daily Moisturiser',
    subtitleMode: 'byVariation',
    priceMode: 'single', price: 32, stock: 18,
    badges: ['New', 'Bestseller'],
    variations: [
      {
        label: 'Skin type',
        values: [
          { label: 'Dry' },
          { label: 'Normal' },
          { label: 'Sensitive' },
        ],
      },
      {
        label: 'Size',
        values: [
          { label: '30 ml' },
          { label: '50 ml', discountPercent: 10 },
          { label: '100 ml', discountPercent: 20 },
        ],
      },
    ],
    categories: ['cleansers', 'face-wash'],
  },
  {
    name: 'Daily Face Cleanser',
    subtitleMode: 'single', subtitle: '150 ml',
    priceMode: 'single', price: 20, discountPercent: 15, stock: 2,
    badges: ['Bestseller'],
    variations: [{
      label: 'Choose formula',
      values: [
        { label: 'Gentle Hydrating' },
        { label: 'Deep Cleansing' },
      ],
    }],
    categories: ['face-wash'],
  },
  {
    name: 'Cleanse + Treat + Hydrate',
    subtitleMode: 'single', subtitle: '3 products',
    priceMode: 'single', price: 65, discountPercent: 15, stock: 12,
    badges: ['Bestseller'],
    variations: [{
      label: 'Set includes',
      values: [
        { label: 'Cleanser + Serum + Cream' },
        { label: 'Cleanser + Serum + SPF' },
      ],
    }],
    categories: ['cleansers', 'face-wash'],
    // Картинки варіантів («Set includes») додайте вручну в адмінці Strapi —
    // seed медіафайли не завантажує.
  },
  {
    name: 'Daily Sun Protection',
    subtitleMode: 'single', subtitle: '50 ml',
    priceMode: 'single', price: 26, discountPercent: 15, stock: 20,
    badges: ['Sale'],
    variations: [{
      label: 'Finish',
      values: [
        { label: 'Invisible Finish' },
        { label: 'Tinted Finish' },
      ],
    }],
    categories: ['face-wash', 'makeup-removers'],
    // Картинки варіантів («Finish») додайте вручну в адмінці Strapi —
    // seed медіафайли не завантажує.
  },
];

const MESSAGES = [
  { text: 'Get 15% off with code LUMEAFIRST15', order: 1 },
  { text: 'Free delivery on orders over £40', order: 2 },
  { text: 'New: Daily Sun Protection', order: 3 },
];

let app: Awaited<ReturnType<typeof createStrapi>> | undefined;

async function run() {
  app = await createStrapi({ appDir: process.cwd(),
    distDir: './dist' }).load();

  const bySlug: Record<string, number> = {};
  for (const c of CATEGORIES) {
    const existing = await app.documents('api::category.category')
      .findMany({ filters: { slug: c.slug } });
    const doc = existing[0]
      ?? await app.documents('api::category.category').create({ data: c });
    bySlug[c.slug] = Number(doc.id);
  }

  const byBadge: Record<string, number> = {};
  for (const b of BADGES) {
    const existing = await app.documents('api::badge.badge')
      .findMany({ filters: { name: b.name } });
    const doc = existing[0]
      ?? await app.documents('api::badge.badge').create({ data: b });
    byBadge[b.name] = Number(doc.id);
  }

  for (const p of PRODUCTS) {
    const { categories, badges, ...rest } = p;
    const existing = await app.documents('api::product.product')
      .findMany({ filters: { name: p.name } });
    if (existing.length > 0) continue;
    await app.documents('api::product.product').create({
      data: {
        ...rest,
        categories: categories.map((s) => bySlug[s]),
        badges: badges.map((b) => byBadge[b]),
      },
    });
  }

  const existingBar = await app.documents('api::announcement-bar.announcement-bar')
    .findFirst();
  if (existingBar) {
    await app.documents('api::announcement-bar.announcement-bar').update({
      documentId: existingBar.documentId, data: { messages: MESSAGES },
    });
  } else {
    await app.documents('api::announcement-bar.announcement-bar')
      .create({ data: { messages: MESSAGES } });
  }

  console.log('seed: готово');
  await app.destroy();
  process.exit(0);
}

run().catch(async (e) => {
  console.error(e);
  await app?.destroy();
  process.exit(1);
});
