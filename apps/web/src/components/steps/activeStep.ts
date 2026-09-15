
export function pickActiveStep(tops: readonly number[], line: number): number {
  let active = 0;
  tops.forEach((top, index) => {
    if (top <= line) active = index;
  });
  return active;
}

export function stackLine(
  count: number,
  stackTop: number,
  stackStep: number,
): number {
  const deepest = stackTop + Math.max(count - 1, 0) * stackStep;
  return deepest + stackStep;
}
