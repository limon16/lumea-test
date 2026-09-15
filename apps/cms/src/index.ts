import type { Core } from '@strapi/strapi';

const PUBLIC_READ: { uid: string; actions: string[] }[] = [
  { uid: 'api::product.product', actions: ['find', 'findOne'] },
  { uid: 'api::category.category', actions: ['find', 'findOne'] },
  { uid: 'api::badge.badge', actions: ['find', 'findOne'] },
  { uid: 'api::announcement-bar.announcement-bar', actions: ['find'] },
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
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await grantPublicRead(strapi);
  },
};
