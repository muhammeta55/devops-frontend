'use client';

import { useState } from 'react';

export default function Home() {
  const [backendMessage, setBackendMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState<string | null>(null);

  async function checkBackend() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/`);
      const data = await res.json();
      setBackendMessage(data.message);

      const infoRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/info`);
      const infoData = await infoRes.json();
      setVersion(infoData.version);
    } catch (err) {
      setError('Could not reach backend');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--cream)] flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <p className="text-sm text-[var(--muted)] mb-2">DevOps Project</p>
        <h1 className="font-display text-4xl text-[var(--ink)] mb-6">
          Frontend and backend, talking to each other
        </h1>

        <div className="border-t border-[var(--clay)] pt-6">
          <button
            onClick={checkBackend}
            disabled={loading}
            className="bg-[var(--rust)] hover:bg-[var(--rust-dark)] disabled:bg-[var(--clay)] disabled:text-[var(--muted)]
                       text-[var(--cream)] font-medium py-2.5 px-5 rounded-full
                       transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? 'Checking…' : 'Check backend'}
          </button>

          {backendMessage && (
            <p className="mt-5 text-[var(--ink)]">
              <span className="text-[var(--moss)] font-medium">Connected. </span>
              {backendMessage}
            </p>
          )}
          {error && <p className="mt-5 text-[var(--rust-dark)]">{error}</p>}

          <p className="mt-8 text-xs text-[var(--muted)]">
            Version {version ?? '— not fetched yet'}
          </p>
        </div>
      </div>
    </main>
  );
}