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
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>DevOps Project — Frontend</h1>
      <p>Backend connection test</p>

      <button onClick={checkBackend} disabled={loading}>
        {loading ? 'Checking...' : 'Check Backend'}
      </button>

      {backendMessage && <p>Backend says: {backendMessage}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <footer style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'gray' }}>
        Version: {version ?? 'Not fetched yet'}
      </footer>
    </main>
  );
}