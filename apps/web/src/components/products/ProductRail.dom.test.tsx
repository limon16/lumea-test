import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ProductRail } from './ProductRail';

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', class {
    observe() {}
    disconnect() {}
  });
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function rail() {
  render(<ProductRail products={[]} label="Products" detachedShadows />);
  const viewport = screen.getByRole('region');
  Object.defineProperties(viewport, {
    clientWidth: { value: 400 },
    scrollWidth: { value: 1000 },
  });
  return viewport;
}

function wheel(viewport: HTMLElement, options: WheelEventInit) {
  const event = new WheelEvent('wheel', { bubbles: true, cancelable: true, ...options });
  viewport.dispatchEvent(event);
  return event;
}

it('leaves vertical wheel scrolling to the page at every rail position', () => {
  const viewport = rail();
  for (const position of [0, 250, 600]) {
    viewport.scrollLeft = position;
    for (const deltaMode of [0, 1, 2]) {
      for (const deltaY of [-20, 20]) {
        expect(wheel(viewport, { deltaY, deltaMode }).defaultPrevented).toBe(false);
        expect(viewport.scrollLeft).toBe(position);
      }
    }
  }
});

it('preserves zoom, horizontal gestures and mobile scrolling', () => {
  const viewport = rail();
  for (const options of [{ deltaY: 20, ctrlKey: true }, { deltaY: 20, shiftKey: true }, { deltaX: 30, deltaY: 2 }]) {
    expect(wheel(viewport, options).defaultPrevented).toBe(false);
  }
  expect(viewport.scrollLeft).toBe(0);
  cleanup();
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
  const mobile = rail();
  expect(wheel(mobile, { deltaY: 20 }).defaultPrevented).toBe(false);
  expect(mobile.scrollLeft).toBe(0);
});

it('drags from a card button, follows the mouse outside the rail, and suppresses the drag click', () => {
  const viewport = rail();
  const button = document.createElement('button');
  viewport.append(button);
  const clicked = vi.fn();
  button.addEventListener('click', clicked);
  button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0, clientX: 200 }));
  window.dispatchEvent(new MouseEvent('mousemove', { buttons: 1, clientX: 140 }));
  expect(viewport.scrollLeft).toBe(60);
  window.dispatchEvent(new MouseEvent('mouseup'));
  button.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
  expect(clicked).not.toHaveBeenCalled();
  expect(viewport.scrollLeft).toBe(60);
  // A subsequent ordinary click still activates the button.
  button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0, clientX: 140 }));
  window.dispatchEvent(new MouseEvent('mousemove', { buttons: 1, clientX: 142 }));
  window.dispatchEvent(new MouseEvent('mouseup'));
  button.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
  expect(clicked).toHaveBeenCalledOnce();
  expect(viewport.scrollLeft).toBe(60);
});
