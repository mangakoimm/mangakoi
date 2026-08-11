'use client';

import { useState } from 'react';

const faqData = [
  { q: 'Is MangaKoi free to use?', a: 'Yes. Every title in the library is free to read. An optional supporter tier removes ads and unlocks early chapter access.' },
  { q: 'Can I read offline?', a: 'Downloaded chapters are saved to your device from the Downloaded Chapters tab in your dashboard.' },
  { q: 'How often are chapters updated?', a: 'Most ongoing series update weekly. Follow a title to get notified the moment a new chapter is published.' },
  { q: 'How do I report a broken chapter or image?', a: 'Open the chapter, tap the flag icon in the reader controls, and describe the issue.' }
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-[820px]">
      {faqData.map((f, i) => (
        <div key={f.q} className="border-b border-black/[0.08] py-4.5 py-[18px] dark:border-white/10">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between text-left text-[15.5px] font-semibold"
          >
            {f.q}
            <span className={`transition-transform ${open === i ? 'rotate-180' : ''}`}>⌄</span>
          </button>
          {open === i && <p className="max-w-[640px] pt-3 text-[14.5px] leading-relaxed text-ink-soft dark:text-white/60">{f.a}</p>}
        </div>
      ))}
    </div>
  );
}
