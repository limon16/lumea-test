'use client';

import { useEffect, useState } from 'react';

const INTERVAL_MS = 4000;

interface Props {
  messages: string[];
}

export function AnnouncementBar({ messages: initialMessages }: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let loading = false;
    let loaded = false;

    async function load() {
      if (loading || loaded) return;
      loading = true;
      try {
        const response = await fetch('/api/announcements', {
          cache: 'no-store', signal: controller.signal,
        });
        if (!response.ok) throw new Error('Announcements unavailable');
        const next: string[] = await response.json();
        if (controller.signal.aborted) return;
        loaded = true;
        setMessages(next);
        setIndex(0);
      } catch {
        // A successful manual catalogue retry can request the banner again.
      } finally {
        loading = false;
      }
    }

    window.addEventListener('lumea:catalog-recovered', load);
    void load();
    return () => {
      controller.abort();
      window.removeEventListener('lumea:catalog-recovered', load);
    };
  }, []);

  useEffect(() => {
    if (messages.length < 2) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % messages.length),
      INTERVAL_MS,
    );
    return () => clearInterval(id);
  }, [messages.length]);

  return (
    <div
      className={`relative mx-auto grid w-full min-h-11 max-w-full
                 place-items-center overflow-hidden bg-(--color-ink) px-5
                 py-[10px] text-center text-[16px]/[1.1] font-normal md:font-bold tracking-normal
                 text-(--color-paper)
                 md:w-[458px] md:max-w-full ${messages.length === 0 ? 'invisible' : ''}`}
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
