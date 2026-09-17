import { mergeProduct, validateProduct } from './validation/product';
import { restoreStock } from './validation/order';
import type { Core } from '@strapi/strapi';

const PUBLIC_READ: { uid: string; actions: string[] }[] = [
  { uid: 'api::product.product', actions: ['find', 'findOne'] },
  { uid: 'api::category.category', actions: ['find', 'findOne'] },
  { uid: 'api::badge.badge', actions: ['find', 'findOne'] },
  { uid: 'api::announcement-bar.announcement-bar', actions: ['find'] },
  // Лише create: замовлення покупців не можна читати публічно.
  { uid: 'api::order.order', actions: ['create'] },
];

async function grantPublicRead(strapi: Core.Strapi): Promise<void> {
  const role = await strapi
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });

  if (role === null) return;

  for (const { uid, actions } of PUBLIC_READ) {
    for (const action of actions) {
      const name = `${uid}.${action}`;
      const existing = await strapi
        .query('plugin::users-permissions.permission')
        .findOne({ where: { action: name, role: role.id } });

      if (existing === null) {
        await strapi.query('plugin::users-permissions.permission').create({
          data: { action: name, role: role.id },
        });
        strapi.log.info(`Публічний доступ надано: ${name}`);
      }
    }
  }
}

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    strapi.documents.use(async (context, next) => {
      if (context.uid === 'api::product.product' && ['create', 'update'].includes(context.action)) {
        const params = context.params as { documentId?: string; data?: unknown };
        const previous = context.action === 'update' && params.documentId
          ? await strapi.documents('api::product.product').findOne({
            documentId: params.documentId,
            populate: { variations: { populate: { values: { populate: ['subValues'] } } } },
          }) : {};
        validateProduct(mergeProduct(previous, params.data));
      }

      // Скасування повертає товари на склад, повторне — ні.
      if (context.uid === 'api::order.order' && context.action === 'update') {
        const params = context.params as { documentId?: string; data?: { status?: unknown } };
        if (params.data?.status === 'cancelled' && params.documentId) {
          const order = await strapi.documents('api::order.order').findOne({
            documentId: params.documentId,
            populate: { items: { populate: ['product'] } },
          });
          if (order !== null && order.status !== 'cancelled') {
            await restoreStock(strapi, order as never);
          }
        }
      }
      return next();
    });
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await grantPublicRead(strapi);
  },
};
