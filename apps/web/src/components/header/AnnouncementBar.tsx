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
      className="relative mx-auto grid w-full min-h-11 max-w-full
                 place-items-center overflow-hidden bg-(--color-ink) px-5
                 py-[10px] text-center text-[16px]/[1.1] font-bold tracking-normal
                 text-(--color-paper)
                 md:w-[458px] md:max-w-full"
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
