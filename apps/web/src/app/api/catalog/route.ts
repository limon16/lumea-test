import { getCategoryPage, getProductPage } from '@/lib/strapi';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const kind = params.get('kind') ?? 'products';
  const page = Number(params.get('page') ?? 1);
  const category = params.has('category') ? Number(params.get('category')) : undefined;
  const search = params.get('search') ?? '';
  if (!['products', 'categories'].includes(kind) || !Number.isSafeInteger(page) || page < 1
      || (category !== undefined && (!Number.isSafeInteger(category) || category < 1)) || search.length > 100) {
    return Response.json({ error: 'Invalid catalogue request.' }, { status: 400 });
  }
  const result = kind === 'categories' ? await getCategoryPage(page) : await getProductPage(page, category, search);
  return Response.json(result, { status: result.error ? 503 : 200, headers: { 'Cache-Control': 'no-store' } });
}
