import { factories } from '@strapi/strapi';
import { buildOrder, parseOrderInput } from '../../../validation/order';

export default factories.createCoreController('api::order.order', ({ strapi }) => ({
  async create(ctx) {
    const input = parseOrderInput((ctx.request.body as { data?: unknown } | undefined)?.data);
    const { items, total, stockUpdates } = await buildOrder(strapi, input);

    const order = await strapi.documents('api::order.order').create({
      data: {
        customerName: input.customerName,
        phone: input.phone,
        email: input.email,
        comment: input.comment,
        status: 'new',
        items,
        total,
      } as never,
    });

    for (const update of stockUpdates) {
      await strapi.documents('api::product.product').update({
        documentId: update.documentId,
        data: update.data as never,
      });
    }

    ctx.status = 201;
    return { data: { id: order.id, total, status: 'new' } };
  },
}));
