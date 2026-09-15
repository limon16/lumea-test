interface Props {
  state: 'loading' | 'unavailable' | 'empty';
  onRetry?: () => void;
}

export function CatalogState({ state, onRetry }: Props) {
  const loading = state === 'loading';
  const title = loading ? 'Finding your skincare essentials'
    : state === 'unavailable' ? 'A little pause in your routine' : 'No products here yet';
  const description = loading ? 'Your products will appear in a moment.'
    : state === 'unavailable' ? 'We couldn’t load the collection right now. Please try again in a moment.'
      : 'Please choose another category or check back soon.';

  return (
    <div aria-busy={loading}
      className="relative flex min-h-[360px] w-full flex-col items-center justify-center gap-5
                 overflow-hidden rounded-[32px] border border-(--color-border)/60
                 bg-[linear-gradient(145deg,#f3f5f5,#f3faf6)] px-6 py-10 text-center">
      <div aria-hidden="true" className="flex size-16 items-center justify-center rounded-full bg-white text-(--color-accent) shadow-sm">
        <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-8">
          <path d="M10 11V8a6 6 0 0 1 12 0v3M7 11h18l2 17H5l2-17Z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m12 19 3 3 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div role="status" aria-live="polite" className="flex max-w-[350px] flex-col gap-2">
        <h3 className="text-[22px]/[1.2] font-bold text-(--color-ink)">{title}</h3>
        <p className="text-[15px]/[1.5] text-[#565b5a]">{description}</p>
      </div>
      {loading ? (
        <div aria-hidden="true" className="flex gap-2 motion-safe:animate-pulse">
          <span className="size-2 rounded-full bg-(--color-accent)" />
          <span className="size-2 rounded-full bg-(--color-accent)/60" />
          <span className="size-2 rounded-full bg-(--color-accent)/30" />
        </div>
      ) : onRetry && (
        <button type="button" onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-full bg-(--color-ink) px-6 py-3
                     text-[15px] font-bold text-white transition-colors hover:bg-[#385342]
                     focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-ink)">
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
            <path d="M16 7a6.5 6.5 0 1 0 .4 5M16 3v4h-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Try again
        </button>
      )}
    </div>
  );
}
