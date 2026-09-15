
export interface Badge {
  id: number;
  name: string;
  order: number;
}

export type PriceMode = 'single' | 'byVariation';

export interface Priced {
  priceOverride: number | null;
  discountPercent: number | null;
  discountedPrice: number | null;
  stock: number | null;
}

export interface SubValue extends Priced {
  label: string;
}

export interface VariationValue extends Priced {
  label: string;
  subLabel: string | null;
  subValues: SubValue[];
}

export interface Variation {
  label: string;
  values: VariationValue[];
}

export interface Product {
  id: number;
  name: string;
  imageUrl: string | null;
  imageAlt: string | null;
  priceMode: PriceMode;
  price: number | null;
  discountPercent: number | null;
  discountedPrice: number | null;
  stock: number | null;
  badges: Badge[];
  variations: Variation[];
  categoryIds: number[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  order: number;
}
