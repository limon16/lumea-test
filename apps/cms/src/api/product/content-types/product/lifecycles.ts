import { errors } from '@strapi/utils';

const { ApplicationError } = errors;

interface SubValue {
  label?: string;
  priceOverride?: number | string | null;
}

interface VariationValue {
  label?: string;
  priceOverride?: number | string | null;
  subValues?: SubValue[];
}

interface Variation {
  label?: string;
  values?: VariationValue[];
}

interface ProductData {
  priceMode?: string;
  price?: number | string | null;
  variations?: Variation[];
}

const isFilled = (value: unknown): boolean =>
  value !== null && value !== undefined && value !== '';

function validate(data: ProductData): void {
  if (data.priceMode === undefined) return;

  const variations = Array.isArray(data.variations) ? data.variations : [];
  const values: (VariationValue | SubValue)[] = variations.flatMap((v) => [
    ...(Array.isArray(v.values) ? v.values : []),
    ...(Array.isArray(v.values) ? v.values : []).flatMap((value) =>
      Array.isArray(value.subValues) ? value.subValues : []),
  ]);

  if (data.priceMode === 'single') {
    if (!isFilled(data.price)) {
      throw new ApplicationError(
        'Заповніть поле «Ціна»: тип ціни — «Одна ціна на весь товар».',
      );
    }
    const withOwnPrice = values.filter((v) => isFilled(v.priceOverride));
    if (withOwnPrice.length > 0) {
      const labels = withOwnPrice.map((v) => v.label ?? '—').join(', ');
      throw new ApplicationError(
        `Варіанти «${labels}» мають власну ціну, але тип ціни — «Одна ціна на весь товар». `
        + 'Приберіть ціну з варіантів або змініть тип ціни на «Ціна залежить від варіації».',
      );
    }
    return;
  }

  if (isFilled(data.price)) {
    throw new ApplicationError(
      'Тип ціни — «Ціна залежить від варіації», тому поле «Ціна» має бути порожнім. '
      + 'Ціну задавайте всередині кожного значення варіації.',
    );
  }
  const withoutPrice = values.filter((v) => {
    if (isFilled(v.priceOverride)) return false;
    const nested = (v as VariationValue).subValues;
    return !(Array.isArray(nested) && nested.length > 0);
  });
  if (withoutPrice.length > 0) {
    const labels = withoutPrice.map((v) => v.label ?? '—').join(', ');
    throw new ApplicationError(
      `Вкажіть ціну для варіантів: «${labels}». `
      + 'Тип ціни — «Ціна залежить від варіації», тому кожен варіант потребує власної ціни.',
    );
  }
}

export default {
  beforeCreate(event: { params: { data: ProductData } }) {
    validate(event.params.data);
  },
  beforeUpdate(event: { params: { data: ProductData } }) {
    validate(event.params.data);
  },
};
