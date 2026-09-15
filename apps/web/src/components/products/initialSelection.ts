import { subKey, type Variation } from '@lumea/types';

export function initialSelection(variations: Variation[]): Record<string, string> {
  const entries: [string, string][] = [];

  variations.forEach((variation) => {
    const first = variation.values[0];
    if (first !== undefined) entries.push([variation.label, first.label]);

    variation.values.forEach((value) => {
      const firstSub = value.subValues[0];
      if (firstSub !== undefined) {
        entries.push([subKey(variation.label, value.label), firstSub.label]);
      }
    });
  });

  return Object.fromEntries(entries);
}
