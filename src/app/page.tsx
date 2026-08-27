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
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          DevOps Project — Frontend
        </h1>
        <p className="text-gray-500 mb-6">Backend connection test</p>

        <button
          onClick={checkBackend}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300
                    text-white font-medium py-2.5 px-4 rounded-lg
                    transition-colors duration-200 cursor-pointer
                    disabled:cursor-not-allowed"
        >
          {loading ? 'Checking...' : 'Check Backend'}
        </button>

        {backendMessage && (
          <p className="mt-4 text-green-700 bg-green-50 rounded-lg py-2 px-3 text-sm">
            Backend says: {backendMessage}
          </p>
        )}
        {error && (
          <p className="mt-4 text-red-700 bg-red-50 rounded-lg py-2 px-3 text-sm">
            {error}
          </p>
        )}

        <footer className="mt-6 text-xs text-gray-400">
          Version: {version ?? 'Not fetched yet'}
        </footer>
      </div>
    </main>
  );
}