'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCoinStore } from '@/lib/coinStore';

const packages = [
  { coins: 50, price: '2,500 MMK' },
  { coins: 100, price: '5,000 MMK' },
  { coins: 250, price: '12,000 MMK' },
  { coins: 500, price: '23,000 MMK' },
  { coins: 1000, price: '45,000 MMK' }
];

export default function TopUpPage() {
  const router = useRouter();
  const { submitTopUp } = useCoinStore();
  const [step, setStep] = useState<'package' | 'payment'>('package');
  const [selected, setSelected] = useState<(typeof packages)[number] | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [screenshot, setScreenshot] = useState<{ name: string; dataUrl: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => setScreenshot({ name: file.name, dataUrl: reader.result as string });
    reader.readAsDataURL(file);
  }

  function handleSubmit() {
    if (!selected || !fullName || !email || !screenshot) return;
    submitTopUp({
      packageCoins: selected.coins,
      priceLabel: selected.price,
      fullName,
      email,
      transactionId,
      notes,
      screenshotName: screenshot.name,
      screenshotDataUrl: screenshot.dataUrl
    });
    router.push('/topup/success');
  }

  const canSubmit = Boolean(selected && fullName && email && screenshot);

  return (
    <main className="mx-auto max-w-[720px] px-6 py-14 sm:px-8">
      <h1 className="mb-2 font-display text-3xl font-extrabold">Buy Manga Coins</h1>
      <p className="mb-10 text-ink-soft dark:text-white/50">
        Top up is processed manually after payment verification.
      </p>

      {step === 'package' && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {packages.map((p) => (
            <div
              key={p.coins}
              className="flex flex-col items-center gap-3 rounded-lg border border-black/10 bg-white p-6 text-center dark:border-white/10 dark:bg-[#1f1a16]"
            >
              <div className="font-display text-2xl font-extrabold">🪙 {p.coins}</div>
              <div className="text-sm text-ink-soft dark:text-white/50">{p.price}</div>
              <button
                onClick={() => {
                  setSelected(p);
                  setStep('payment');
                }}
                className="mt-2 w-full rounded-full bg-gradient-to-br from-coral to-coral-deep py-2 text-xs font-bold text-white"
              >
                Select Package
              </button>
            </div>
          ))}
        </div>
      )}

      {step === 'payment' && selected && (
        <div>
          <button onClick={() => setStep('package')} className="mb-6 text-sm font-semibold text-coral-deep">
            ← Change package
          </button>

          <div className="mb-8 rounded-lg border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-[#1f1a16]">
            <h2 className="mb-4 font-display text-lg font-bold">Payment Method</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                ['KBZPay', '09xxxxxxxx'],
                ['WavePay', '09xxxxxxxx'],
                ['AYA Pay', '09xxxxxxxx']
              ].map(([name, number]) => (
                <div key={name} className="rounded-md border border-black/10 p-4 text-center dark:border-white/10">
                  <div className="font-semibold">{name}</div>
                  <div className="text-sm text-ink-soft dark:text-white/50">{number}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex h-40 items-center justify-center rounded-md border border-dashed border-black/15 text-sm text-ink-soft dark:border-white/15 dark:text-white/40">
              QR Image Placeholder
            </div>
          </div>

          <div className="rounded-lg border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-[#1f1a16]">
            <h2 className="mb-4 font-display text-lg font-bold">Submit Payment Details</h2>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFile(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`mb-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-8 text-center text-sm transition-colors ${
                dragOver ? 'border-coral bg-blush-soft' : 'border-black/15 dark:border-white/15'
              }`}
            >
              {screenshot ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={screenshot.dataUrl} alt="Payment screenshot" className="max-h-40 rounded" />
              ) : (
                <>
                  <span className="font-semibold">Upload Payment Screenshot</span>
                  <span className="text-ink-soft dark:text-white/40">Drag & drop, or click to browse</span>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="rounded-md border border-black/10 px-3.5 py-2.5 text-sm outline-none focus:border-coral dark:border-white/10 dark:bg-white/5"
              />
              <input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-md border border-black/10 px-3.5 py-2.5 text-sm outline-none focus:border-coral dark:border-white/10 dark:bg-white/5"
              />
              <input
                value={`${selected.coins} Coins — ${selected.price}`}
                disabled
                className="rounded-md border border-black/10 bg-black/[0.03] px-3.5 py-2.5 text-sm text-ink-soft dark:border-white/10 dark:bg-white/5 dark:text-white/50"
              />
              <input
                placeholder="Transaction ID (optional)"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="rounded-md border border-black/10 px-3.5 py-2.5 text-sm outline-none focus:border-coral dark:border-white/10 dark:bg-white/5"
              />
            </div>
            <textarea
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-3 w-full rounded-md border border-black/10 px-3.5 py-2.5 text-sm outline-none focus:border-coral dark:border-white/10 dark:bg-white/5"
            />

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="mt-5 w-full rounded-full bg-gradient-to-br from-coral to-coral-deep py-3 text-sm font-bold text-white disabled:opacity-40"
            >
              Submit Request
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
