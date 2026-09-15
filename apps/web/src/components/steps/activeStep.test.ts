import { describe, expect, it } from 'vitest';

import { pickActiveStep, stackLine } from './activeStep';

const LINE = 128;
const STACK_TOP = 96;
const STACK_STEP = 16;

describe('pickActiveStep', () => {
  it('starts on the first step before any card reaches the line', () => {
    expect(pickActiveStep([417, 996, 1596, 2163], LINE)).toBe(0);
  });

  it('activates the second step once it reaches the stack', () => {
    expect(pickActiveStep([96, 112, 496, 1063], LINE)).toBe(1);
  });

  it('activates the third step as the stack grows', () => {
    expect(pickActiveStep([96, 112, 128, 563], LINE)).toBe(2);
  });

  it('activates the last step at the bottom of the section', () => {
    expect(pickActiveStep([96, 112, 128, 127], LINE)).toBe(3);
  });

  it('reverts to an earlier step when scrolling back up', () => {
    expect(pickActiveStep([96, 396, 996, 1563], LINE)).toBe(0);
  });

  it('never returns a negative index for an empty list', () => {
    expect(pickActiveStep([], LINE)).toBe(0);
  });

  it('treats a card exactly on the line as reached', () => {
    expect(pickActiveStep([96, 128], LINE)).toBe(1);
  });
});

describe('stackLine', () => {
  it('clears the deepest card so the last step can activate', () => {
    // Four cards stick at 96, 112, 128 and 144; the line must sit below 144.
    expect(stackLine(4, STACK_TOP, STACK_STEP)).toBeGreaterThan(
      STACK_TOP + 3 * STACK_STEP,
    );
  });

  it('activates the final step at the bottom of the section', () => {
    // Real measurement at the end of the page, which previously left the
    // last card collapsed because the line was pinned to the third card.
    const tops = [96, 112, 128, 144];
    expect(pickActiveStep(tops, stackLine(4, STACK_TOP, STACK_STEP))).toBe(3);
  });

  it('still activates earlier steps mid-scroll', () => {
    const line = stackLine(4, STACK_TOP, STACK_STEP);
    expect(pickActiveStep([96, 112, 496, 1063], line)).toBe(1);
    expect(pickActiveStep([96, 112, 128, 563], line)).toBe(2);
  });

  it('scales with any number of cards', () => {
    expect(stackLine(6, STACK_TOP, STACK_STEP)).toBe(96 + 5 * 16 + 16);
    expect(stackLine(1, STACK_TOP, STACK_STEP)).toBe(96 + 16);
  });

  it('handles an empty list without going below the first card', () => {
    expect(stackLine(0, STACK_TOP, STACK_STEP)).toBe(STACK_TOP + STACK_STEP);
  });

  it('walks 01 → 04 across positions measured in a real browser', () => {
    const line = stackLine(4, STACK_TOP, STACK_STEP);
    const measured: Array<[number[], number]> = [
      [[1217, 1796, 2396, 2963], 0],
      [[96, 649, 1249, 1816], 0],
      [[96, 158, 758, 1325], 1],
      [[96, 112, 267, 834], 1],
      [[96, 112, 128, 342], 2],
      [[96, 112, 128, 144], 3],
    ];
    for (const [tops, expected] of measured) {
      expect(pickActiveStep(tops, line)).toBe(expected);
    }
  });
});
