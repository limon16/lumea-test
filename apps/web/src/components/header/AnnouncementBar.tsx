'use client';

import { useEffect, useState } from 'react';

const INTERVAL_MS = 4000;

interface Props {
  messages: string[];
}

export function AnnouncementBar({ messages }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (messages.length < 2) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % messages.length),
      INTERVAL_MS,
    );
    return () => clearInterval(id);
  }, [messages.length]);

  if (messages.length === 0) return null;

  return (
    <div
      className="relative mx-auto grid w-fit min-h-11 max-w-[calc(100vw-2rem)]
                 place-items-center overflow-hidden bg-(--color-ink) px-5
                 py-[10px] text-center text-[16px]/[1.1] font-bold
                 text-(--color-paper)
                 sm:min-w-[458px] sm:max-w-[600px]"
      style={{ letterSpacing: 0 }}
      aria-live="polite"
      aria-atomic="true"
    >
      {messages.map((text, i) => (
        <span
          key={text}
          aria-hidden={i !== index}
          className={`col-start-1 row-start-1 transition-opacity
                      duration-500 ${i === index
                        ? 'opacity-100' : 'opacity-0'}`}
        >
          {text}
        </span>
      ))}
    </div>
  );
}
