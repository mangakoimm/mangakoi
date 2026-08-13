import Link from 'next/link';

export default function TopUpSuccessPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-[520px] flex-col items-center justify-center px-6 text-center sm:px-8">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600 dark:bg-emerald-900/40">
        ✓
      </div>
      <h1 className="mb-3 font-display text-2xl font-extrabold">
        Your payment request has been submitted successfully.
      </h1>
      <p className="mb-8 text-ink-soft dark:text-white/50">
        Our admin will verify your payment within 5–30 minutes. Once approved, your Manga Coins will be added
        automatically.
      </p>
      <div className="flex gap-3">
        <Link href="/" className="rounded-full border border-black/10 px-6 py-3 text-sm font-semibold dark:border-white/10">
          Back to Home
        </Link>
        <Link
          href="/topup/history"
          className="rounded-full bg-gradient-to-br from-coral to-coral-deep px-6 py-3 text-sm font-semibold text-white"
        >
          View History
        </Link>
      </div>
    </main>
  );
}
