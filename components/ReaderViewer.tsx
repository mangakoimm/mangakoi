'use client';

import { useState } from 'react';

type PageItem = { id: string; page_number: number; image_url?: string };

export default function ReaderViewer({ pages, isMock }: { pages: PageItem[]; isMock: boolean }) {
  const [zoom, setZoom] = useState(100); // percent, relative to a 760px baseline width

  function zoomIn() {
    setZoom((z) => Math.min(200, z + 10));
  }
  function zoomOut() {
    setZoom((z) => Math.max(50, z - 10));
  }
  function resetZoom() {
    setZoom(100);
  }

  const widthPx = Math.round(760 * (zoom / 100));

  return (
    <div>
      <div className="sticky top-3 z-20 mx-auto mb-5 flex w-fit items-center gap-3 rounded-full bg-black/70 px-4 py-2 text-sm text-white backdrop-blur-sm">
        <button
          onClick={zoomOut}
          aria-label="Zoom out"
          disabled={zoom <= 50}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-lg font-bold hover:bg-white/20 disabled:opacity-30"
        >
          −
        </button>
        <button onClick={resetZoom} className="min-w-[48px] text-center font-semibold" title="Reset zoom">
          {zoom}%
        </button>
        <button
          onClick={zoomIn}
          aria-label="Zoom in"
          disabled={zoom >= 200}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-lg font-bold hover:bg-white/20 disabled:opacity-30"
        >
          +
        </button>
      </div>

      <div className="w-full overflow-x-auto">
        <div className="flex min-w-full flex-col items-center gap-1.5">
          {isMock
            ? pages.map((p) => (
                <div
                  key={p.id}
                  style={{ width: `${widthPx}px`, flexShrink: 0 }}
                  className="flex h-[560px] flex-col items-center justify-center gap-2 rounded bg-gradient-to-br from-[#2a2320] to-[#1a1512] font-display font-bold text-white/25"
                >
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  Page {p.page_number}
                </div>
              ))
            : pages.map((p) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={p.id}
                  src={p.image_url}
                  alt={`Page ${p.page_number}`}
                  style={{ width: `${widthPx}px`, flexShrink: 0 }}
                  loading="lazy"
                />
              ))}
        </div>
      </div>
    </div>
  );
}
