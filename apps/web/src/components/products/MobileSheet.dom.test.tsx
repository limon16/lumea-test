import { cleanup, fireEvent, render as renderUI, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import type { Category, Product } from '@lumea/types';

import type { ReactElement } from 'react';
import { ShopProvider } from './ShopProvider';

import { MobileSheet } from './MobileSheet';

const render = (ui: ReactElement) => renderUI(ui, { wrapper: ShopProvider });

/**
 * jsdom implements <dialog> only partially: showModal/close exist but do not
 * flip the `open` property in every version. Backing them with the real
 * attribute keeps the component's own logic under test rather than jsdom's.
 */
beforeAll(() => {
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  const proto = window.HTMLDialogElement.prototype;
  proto.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  proto.close = function close(this: HTMLDialogElement) {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
});

afterEach(() => {
  cleanup();
  document.body.style.overflow = '';
});

const CATEGORIES: Category[] = [
  { id: 1, name: 'Cleansers', slug: 'cleansers', order: 1 },
  { id: 2, name: 'Face Wash', slug: 'face-wash', order: 2 },
];

const product = (id: number, name: string, categoryIds: number[]): Product => ({
  id,
  name,
  volumeMode: 'single',
  volume: '30 ml',
  priceMode: 'single',
  stock: null,
  imageUrl: null,
  imageAlt: null,
  price: 20,
  discountPercent: null,
  discountedPrice: null,
  badges: [],
  variations: [],
  categoryIds,
});

const PRODUCTS = [
  product(1, 'Gentle Cleanser', [1]),
  product(2, 'Foaming Wash', [2]),
];

const STEPS = [
  { number: '01', title: 'Cleanse' },
  { number: '02', title: 'Treat' },
];

function renderSheet(overrides: Partial<Parameters<typeof MobileSheet>[0]> = {}) {
  const props = {
    open: true,
    onClose: vi.fn(),
    title: 'Shop cleansers',
    products: PRODUCTS,
    categories: CATEGORIES,
    activeCategoryId: 1,
    onCategoryChange: vi.fn(),
    steps: STEPS,
    activeStepIndex: 0,
    onStepChange: vi.fn(),
    ...overrides,
  };
  render(<MobileSheet {...props} />);
  return props;
}

describe('MobileSheet', () => {
  it('opens the dialog and locks page scroll', () => {
    renderSheet();
    const dialog = screen.getByRole('dialog', { hidden: true });
    expect((dialog as HTMLDialogElement).open).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('releases the scroll lock when closed', () => {
    const { unmount } = render(
      <MobileSheet
        open={false}
        onClose={vi.fn()}
        title="Shop cleansers"
        products={PRODUCTS}
        categories={CATEGORIES}
        activeCategoryId={1}
        onCategoryChange={vi.fn()}
        steps={STEPS}
        activeStepIndex={0}
        onStepChange={vi.fn()}
      />,
    );
    expect(document.body.style.overflow).not.toBe('hidden');
    unmount();
  });

  it('releases the scroll lock when the dialog closes itself (Escape)', () => {
    renderSheet();
    expect(document.body.style.overflow).toBe('hidden');
    const dialog = screen.getByRole('dialog', { hidden: true });
    (dialog as HTMLDialogElement).close();
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('shows only products of the active category', () => {
    renderSheet({ activeCategoryId: 1 });
    expect(screen.getByText(/Gentle Cleanser/)).toBeDefined();
    expect(screen.queryByText(/Foaming Wash/)).toBeNull();
  });

  it('names the dialog after the step that opened it', () => {
    renderSheet({ title: 'Shop moisturisers' });
    expect(screen.getByRole('heading', { name: 'Shop moisturisers' })).toBeDefined();
  });

  it('closes on the × button', () => {
    const props = renderSheet();
    fireEvent.click(screen.getByLabelText('Close products'));
    expect(props.onClose).toHaveBeenCalledOnce();
  });

  it('reports the step switcher as a single-choice group', () => {
    renderSheet({ activeStepIndex: 1 });
    const group = screen.getByRole('radiogroup', { name: 'Care step' });
    const options = screen.getAllByRole('radio');
    expect(group).toBeDefined();
    expect(options).toHaveLength(STEPS.length);
    expect(options.filter((o) => o.getAttribute('aria-checked') === 'true'))
      .toHaveLength(1);
  });

  it('changes step when another one is picked', () => {
    const props = renderSheet();
    fireEvent.click(screen.getAllByRole('radio')[1]!);
    expect(props.onStepChange).toHaveBeenCalledWith(1);
  });

  it('explains an unreachable catalogue instead of an empty category', () => {
    const onRetry = vi.fn();
    renderSheet({
      products: [],
      categories: [],
      categoryPagination: { error: 'Catalogue unavailable', onLoadMore: onRetry },
    });
    expect(screen.getByRole('heading', { name: 'A little pause in your routine' })).toBeDefined();
    expect(screen.queryByRole('heading', { name: 'No products here yet' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('says a category is empty when other products do exist', () => {
    renderSheet({ activeCategoryId: 99 });
    expect(screen.getByRole('heading', { name: 'No products here yet' })).toBeDefined();
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
  });
});
