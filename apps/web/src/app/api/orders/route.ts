const BASE = process.env.STRAPI_URL
  ?? process.env.NEXT_PUBLIC_STRAPI_URL
  ?? 'http://127.0.0.1:1337';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }

  try {
    const response = await fetch(`${BASE}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Strapi очікує дані в обгортці data; ціни та суму рахує сам.
      body: JSON.stringify({ data: body }),
      signal: AbortSignal.timeout(15000),
    });

    const payload = await response.json().catch(() => null) as
      { data?: unknown; error?: { message?: string } } | null;

    if (!response.ok) {
      return Response.json(
        { error: payload?.error?.message ?? 'Could not place the order.' },
        { status: response.status === 400 ? 400 : 502 },
      );
    }
    return Response.json({ data: payload?.data ?? null }, { status: 201 });
  } catch {
    return Response.json({ error: 'The shop is unavailable. Please try again.' }, { status: 503 });
  }
}
