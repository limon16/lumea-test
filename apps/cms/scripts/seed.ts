
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
  volumeMode: 'single' | 'byVariation';
  volume?: string;
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
    volumeMode: 'single', volume: '30 ml',
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
    volumeMode: 'byVariation',
    priceMode: 'byVariation',
    badges: ['New', 'Bestseller'],
    variations: [{
      label: 'Skin type',
      values: [
        {
          label: 'Dry', subLabel: 'Size',
          subValues: [{ label: '40 ml', priceOverride: 24, stock: 0 }],
        },
        {
          label: 'Normal', subLabel: 'Size',
          subValues: [
            { label: '50 ml', priceOverride: 32, discountPercent: 10, stock: 3 },
            { label: '100 ml', priceOverride: 52, stock: 18 },
          ],
        },
        {
          label: 'Sensitive', subLabel: 'Size',
          subValues: [{ label: '50 ml', priceOverride: 34, stock: 11 }],
        },
      ],
    }],
    categories: ['cleansers', 'face-wash'],
  },
  {
    name: 'Daily Face Cleanser',
    volumeMode: 'single', volume: '150 ml',
    priceMode: 'single', price: 20, discountedPrice: 17, stock: 2,
    badges: ['Bestseller'],
    variations: [],
    categories: ['face-wash'],
  },
  {
    name: 'Gentle Micellar Water',
    volumeMode: 'single', volume: '200 ml',
    priceMode: 'single', price: 15, stock: 40,
    badges: [],
    variations: [],
    categories: ['makeup-removers'],
  },
  {
    name: 'Vitamin C Brightening Serum',
    volumeMode: 'single', volume: '30 ml',
    priceMode: 'byVariation',
    badges: ['Sale', 'New'],
    variations: [{
      label: 'Strength',
      values: [
        { label: '10%', priceOverride: 45, discountPercent: 20, stock: 9 },
        { label: '15%', priceOverride: 52, stock: 0 },
      ],
    }],
    categories: ['cleansers', 'makeup-removers'],
  },
  {
    name: 'Overnight Repair Mask',
    volumeMode: 'single', volume: '75 ml',
    priceMode: 'single', price: 38, stock: 6,
    badges: [],
    variations: [{
      label: 'Skin type',
      values: [{ label: 'Normal' }, { label: 'Sensitive' }],
    }],
    categories: ['face-wash'],
  },
];

const MESSAGES = [
  { text: 'Get 15% off with code LUMEAFIRST15', order: 1 },
  { text: 'Free delivery on orders over £40', order: 2 },
  { text: 'New: Vitamin C Brightening Serum', order: 3 },
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
