import { forwardOrderRequest } from '@/lib/orderProxy';

export function POST(request: Request) {
  return forwardOrderRequest(request, '', 201);
}
