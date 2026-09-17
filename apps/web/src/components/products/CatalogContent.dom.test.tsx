import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { CatalogContent } from './CatalogContent';

afterEach(cleanup);

it('keeps the retry button mounted and shows neutral loading text during retry', () => {
  const onLoadMore = vi.fn();
  const props = { products: [], categories: [], activeId: 0, onSelect: vi.fn() };
  const pagination = { error: 'Unavailable', onLoadMore };
  const { rerender } = render(<CatalogContent {...props} categoryPagination={pagination} />);
  const heading = screen.getByRole('heading', { name: 'A little pause in your routine' });
  const button = screen.getByRole('button', { name: 'Try again' });
  fireEvent.click(button);
  expect(onLoadMore).toHaveBeenCalledOnce();
  rerender(<CatalogContent {...props} categoryPagination={{ ...pagination, loading: true }} />);
  expect(screen.getByRole('heading', { name: 'Loading products…' })).toBe(heading);
  expect(screen.queryByRole('heading', { name: 'A little pause in your routine' })).toBeNull();
  expect(screen.getByRole('button', { name: 'Trying again…' })).toBe(button);
  expect((button as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(button);
  expect(onLoadMore).toHaveBeenCalledOnce();
  rerender(<CatalogContent {...props} categoryPagination={{ ...pagination, loading: false }} />);
  expect(screen.getByRole('button', { name: 'Try again' })).toBe(button);
  expect((button as HTMLButtonElement).disabled).toBe(false);
});

it('shows loading first and an empty state only after a successful empty response', () => {
  const props = { products: [], categories: [], activeId: 0, onSelect: vi.fn() };
  const { rerender } = render(<CatalogContent {...props} categoryPagination={{ loading: true }} />);
  expect(screen.getByRole('heading', { name: 'Loading products…' })).toBeDefined();
  expect(screen.queryByRole('heading', { name: 'No products here yet' })).toBeNull();
  expect(screen.queryByRole('heading', { name: 'A little pause in your routine' })).toBeNull();
  rerender(<CatalogContent {...props} categoryPagination={{ loading: false, hasMore: false }} />);
  expect(screen.getByRole('heading', { name: 'No products here yet' })).toBeDefined();
  expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
});
