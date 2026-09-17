'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';

export function Modal({ title, onClose, children, wide = false, compact = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean; compact?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  // Закриття з нашого ж cleanup не має рахуватися за дію користувача.
  const closing = useRef(false);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const previous = document.body.style.overflow;
    // Strict Mode монтує двічі: повторний showModal() на вже відкритому
    // діалозі кидає помилку, тому перевіряємо стан.
    if (!dialog.open) dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      if (dialog.open) {
        closing.current = true;
        dialog.close();
      }
      document.body.style.overflow = previous;
    };
  }, []);
  return (
    <dialog ref={ref} aria-labelledby={id}
      onClose={() => { if (closing.current) closing.current = false; else onClose(); }}
      onClick={(event) => { if (event.target === ref.current) onClose(); }}
      className={`shop-dialog m-auto ${compact ? 'max-h-[calc(100dvh-16px)] overflow-hidden' : 'max-h-[90dvh] overflow-y-auto'} ${wide ? 'w-[min(960px,calc(100%-24px))]' : 'w-[min(640px,calc(100%-24px))]'} overscroll-contain rounded-[32px] border border-white/80 bg-[#f8faf8] p-0 text-(--color-ink) shadow-[0_24px_100px_-24px_#21272166] backdrop:bg-[#18271f]/40 backdrop:backdrop-blur-sm`}>
      <div className="sticky top-0 z-20 flex items-start justify-between gap-5 border-b border-(--color-border)/70 bg-[#f8faf8]/95 px-4 py-5 backdrop-blur-md sm:px-8 sm:py-6">
        <div className="min-w-0">
          <p className="mb-2 text-[11px] font-bold tracking-[0.2em] text-[#687e70]">LUMEA</p>
          <h2 id={id} className="break-words text-[28px]/[1.15] font-bold tracking-[-0.03em] sm:text-[34px]">{title}</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close dialog"
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-(--color-border) bg-white transition-colors hover:bg-[#e5eee7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-ink)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" /></svg>
        </button>
      </div>
      <div className={`px-4 sm:px-8 ${compact ? 'pt-0 pb-[max(12px,env(safe-area-inset-bottom))]' : 'pt-6 pb-[max(24px,env(safe-area-inset-bottom))] sm:py-8'}`}>{children}</div>
    </dialog>
  );
}
