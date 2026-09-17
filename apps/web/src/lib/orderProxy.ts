const BASE = process.env.STRAPI_URL
  ?? process.env.NEXT_PUBLIC_STRAPI_URL
  ?? 'http://127.0.0.1:1337';

/** Передає тіло запиту в Strapi як є: ціни та суму рахує сервер. */
export async function forwardOrderRequest(request: Request, path: string, successStatus: number): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }

  try {
    const response = await fetch(`${BASE}/api/orders${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Strapi очікує дані в обгортці data.
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
    return Response.json({ data: payload?.data ?? null }, { status: successStatus });
  } catch {
    return Response.json({ error: 'The shop is unavailable. Please try again.' }, { status: 503 });
  }
}
