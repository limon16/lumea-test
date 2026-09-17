const SIZE_GROUP = /size|volume|ємніст/i;

/** Група варіації, значення якої є ємністю товару: «Size», «Volume», «Ємність». */
export const isSizeGroup = (label: string): boolean => SIZE_GROUP.test(label);
