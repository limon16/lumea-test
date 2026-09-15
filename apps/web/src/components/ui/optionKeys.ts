import type { KeyboardEvent } from 'react';

export function optionKeys(event: KeyboardEvent<HTMLElement>) {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
  const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button[role="radio"]:not(:disabled)'));
  const index = buttons.indexOf(event.target as HTMLButtonElement);
  if (index < 0 || buttons.length === 0) return;
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1
    : (index + (['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1) + buttons.length) % buttons.length;
  event.preventDefault();
  buttons[next].focus({ preventScroll: true });
  buttons[next].click();
  buttons[next].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
}
