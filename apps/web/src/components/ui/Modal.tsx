'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const previous = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = previous; };
  }, []);
  return (
    <dialog ref={ref} aria-labelledby={id} onClose={onClose}
      onClick={(event) => { if (event.target === ref.current) onClose(); }}
      className="m-auto max-h-[90dvh] w-[min(960px,calc(100%-32px))] overflow-y-auto rounded-[32px] bg-white p-6 text-(--color-ink) backdrop:bg-black/40">
      <div className="mb-6 flex items-start justify-between gap-4">
        <h2 id={id} className="text-2xl font-bold">{title}</h2>
        <button type="button" onClick={onClose} aria-label="Close dialog" className="size-10 shrink-0 rounded-full bg-(--color-surface) text-2xl focus-visible:outline-2">×</button>
      </div>
      {children}
    </dialog>
  );
}
