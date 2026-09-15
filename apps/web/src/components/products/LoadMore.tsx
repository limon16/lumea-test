'use client';

import { useEffect, useRef } from 'react';

export interface LoadMoreProps {
  hasMore?: boolean;
  loading?: boolean;
  error?: string;
  onLoadMore?: () => void;
}

export function LoadMore({ hasMore, loading, error, onLoadMore }: LoadMoreProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || !hasMore || loading || error || !onLoadMore) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) onLoadMore();
    }, { root: node.closest('[data-scroll-root]'), rootMargin: '0px 160px', threshold: 0 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading, error, onLoadMore]);
  if (!hasMore && !error && !loading) return null;
  return (
    <div ref={ref} className="flex min-w-36 shrink-0 items-center justify-center px-3">
      {loading ? <span role="status">Loading…</span> : (
        <div className="flex flex-col gap-2 text-sm">
          {error && <p role="status">{error}</p>}
          <button type="button" onClick={onLoadMore}
            className="rounded-full border border-current px-4 py-2 focus-visible:outline-2 focus-visible:outline-offset-2">
            {error ? 'Try again' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}
