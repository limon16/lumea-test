import { applyPromo, PROMO_UID } from '../../../validation/promo';
import { factories } from '@strapi/strapi';
import { buildOrder, parseOrderInput } from '../../../validation/order';

export default factories.createCoreController('api::order.order', ({ strapi }) => ({
  async quote(ctx) {
    const raw = (ctx.request.body as { data?: Record<string, unknown> } | undefined)?.data;
    const input = parseOrderInput({ ...raw, customerName: 'Quote', phone: 'Quote' });
    const { total, unavailableItems } = await buildOrder(strapi, input, { skipUnavailable: true });
    return { data: { ...await applyPromo(strapi, input.promoCode, total), unavailableItems } };
  },
  async create(ctx) {
    const input = parseOrderInput((ctx.request.body as { data?: unknown } | undefined)?.data);
    const result = await strapi.db.transaction(async ({ trx }: { trx: Parameters<ReturnType<typeof strapi.db.getConnection>['transacting']>[0] }) => {
      // Serialize redemption of a code; the lock lasts until the order commits.
      if (input.promoCode) {
        await strapi.db.getConnection('promo_codes').transacting(trx)
          .where({ code: input.promoCode }).forUpdate().first();
      }
      const { items, total, stockUpdates } = await buildOrder(strapi, input);

      const pricing = await applyPromo(strapi, input.promoCode, total);

      const order = await strapi.documents('api::order.order').create({
        data: {
          customerName: input.customerName,
          phone: input.phone,
          email: input.email,
          comment: input.comment,
          status: 'new',
          items,
          ...pricing,
        } as never,
      });

      for (const update of stockUpdates) {
        await strapi.documents('api::product.product').update({
          documentId: update.documentId,
          data: update.data as never,
        });
      }

      if (input.promoCode) {
        const promo = await strapi.db.query(PROMO_UID).findOne({ where: { code: input.promoCode } });
        if (promo?.singleUse) {
          await strapi.db.query(PROMO_UID).update({ where: { id: promo.id }, data: { usedAt: new Date().toISOString() } });
        }
      }
      return { id: order.id, ...pricing, status: 'new' };
    });

    ctx.status = 201;
    return { data: result };
  },
}));
