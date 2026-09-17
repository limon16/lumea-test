import { randomBytes } from 'node:crypto';
import { errors } from '@strapi/utils';
import type { Core } from '@strapi/strapi';

const { ApplicationError } = errors;
export const PROMO_UID = 'api::promo-code.promo-code' as const;
export function normalizePromo(value: unknown): string {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value !== 'string') throw new ApplicationError('Invalid promo code.');
  const code = value.trim().toUpperCase();
  if (code && !/^[A-Z0-9-]{3,40}$/.test(code)) throw new ApplicationError('Use 3–40 letters, numbers or hyphens for the promo code.');
  return code;
}
export function preparePromo(data: Record<string, unknown>) {
  data.code = normalizePromo(data.code) || `LUMEA-${randomBytes(6).toString('hex').toUpperCase()}`;
  if (data.startsAt && data.expiresAt && new Date(String(data.startsAt)) >= new Date(String(data.expiresAt))) {
    throw new ApplicationError('The expiry date must be after the start date.');
  }
}
export async function applyPromo(strapi: Core.Strapi, rawCode: unknown, subtotal: number) {
  const code = normalizePromo(rawCode);
  if (!code) return { promoCode: null, discountAmount: 0, subtotal, total: subtotal };
  const promos = await strapi.documents(PROMO_UID).findMany({ filters: { code }, limit: 1 });
  const promo = promos[0];
  const now = Date.now();
  if (!promo || !promo.enabled || (promo.singleUse && promo.usedAt) || (promo.startsAt && Date.parse(String(promo.startsAt)) > now)
    || (promo.expiresAt && Date.parse(String(promo.expiresAt)) <= now)) {
    throw new ApplicationError('This promo code is invalid, expired or already used.');
  }
  if (subtotal < Number(promo.minimumSubtotal ?? 0)) throw new ApplicationError(`This code requires a subtotal of £${Number(promo.minimumSubtotal).toFixed(2)}.`);
  const percent = Number(promo.discountPercent);
  if (!Number.isFinite(percent) || percent < 1 || percent > 100) throw new ApplicationError('This promo code is unavailable.');
  const discountAmount = Math.round(subtotal * percent) / 100;
  return { promoCode: code, discountAmount, subtotal, total: Math.round((subtotal - discountAmount) * 100) / 100 };
}
