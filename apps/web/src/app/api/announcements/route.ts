import { getAnnouncements } from '@/lib/strapi';

export async function GET() {
  const messages = await getAnnouncements();
  return Response.json(messages, {
    status: messages === null ? 503 : 200,
    headers: { 'Cache-Control': 'no-store' },
  });
}
