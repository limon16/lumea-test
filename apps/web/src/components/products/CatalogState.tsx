interface Props {
  state: 'loading' | 'unavailable' | 'empty';
  onRetry?: () => void;
  retrying?: boolean;
}

export function CatalogState({ state, onRetry, retrying = false }: Props) {
  const loading = state === 'loading';
  const messages = {
    loading: { title: 'Loading products…', description: 'Your products will appear in a moment.' },
    unavailable: { title: 'A little pause in your routine', description: 'We couldn’t load the collection right now. Please try again in a moment.' },
    empty: { title: 'No products here yet', description: 'Please choose another category or check back soon.' },
  };

  return (
    <div aria-busy={loading || retrying}
      className="relative flex min-h-[360px] w-full flex-col items-center justify-center gap-5
                 overflow-hidden rounded-[32px] border border-(--color-border)/60
                 bg-[linear-gradient(145deg,#f3f5f5,#f3faf6)] px-6 py-10 text-center">
      <div aria-hidden="true" className="flex size-16 shrink-0 items-center justify-center rounded-full bg-white text-(--color-accent) shadow-sm">
        <svg width="24" height="24" viewBox="0 0 32 32" fill="none"
          stroke="currentColor" strokeWidth="1.5"
          className={`block size-6 shrink-0 ${loading ? 'motion-safe:animate-spin' : ''}`}>
          {loading ? (
            <>
              <circle cx="16" cy="16" r="12" opacity="0.2" />
              <path d="M16 4a12 12 0 0 1 12 12" strokeLinecap="round" />
            </>
          ) : (
            <>
              <path d="M10 11V8a6 6 0 0 1 12 0v3M7 11h18l2 17H5l2-17Z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="m12 19 3 3 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </>
          )}
        </svg>
      </div>
      {/* Overlapping text reserves the tallest message at every width and zoom level. */}
      <div role="status" aria-live="polite" className="flex w-full max-w-[350px] flex-col gap-2">
        <h3 className="grid text-[22px]/[1.2] font-bold text-(--color-ink)">
          {Object.entries(messages).map(([key, message]) => (
            <span key={key} aria-hidden={key !== state ? true : undefined}
              className={`col-start-1 row-start-1 ${key === state ? '' : 'invisible'}`}>
              {message.title}
            </span>
          ))}
        </h3>
        <p className="grid text-[15px]/[1.5] text-[#565b5a]">
          {Object.entries(messages).map(([key, message]) => (
            <span key={key} aria-hidden={key !== state ? true : undefined}
              className={`col-start-1 row-start-1 ${key === state ? '' : 'invisible'}`}>
              {message.description}
            </span>
          ))}
        </p>
      </div>
      <div className="flex h-[46px] shrink-0 items-center justify-center">
      {onRetry && (
        <button type="button" onClick={onRetry} disabled={retrying} aria-busy={retrying}
          className="inline-flex h-[46px] min-w-[164px] items-center justify-center gap-2 rounded-full bg-(--color-ink) px-6 py-3
                     text-[15px] font-bold text-white transition-colors hover:bg-[#385342]
                     focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-ink)">
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-4">
            <path d="M16 7a6.5 6.5 0 1 0 .4 5M16 3v4h-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {retrying ? 'Trying again…' : 'Try again'}
        </button>
      )}
      </div>
    </div>
  );
}
