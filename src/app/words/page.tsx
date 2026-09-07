'use client';

import { useState, useEffect } from 'react';
import Papa from 'papaparse';

interface Word {
  _id: string;
  word: string;
  translationTr: string;
  translationEn: string;
  category: string;
  exampleSentence: string;
  masteryLevel: string;
  nextReviewDate: string;
}

export default function WordsPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [word, setWord] = useState('');
  const [translationTr, setTranslationTr] = useState('');
  const [translationEn, setTranslationEn] = useState('');
  const [category, setCategory] = useState('Vocabulary');
  const [exampleSentence, setExampleSentence] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  async function fetchWords() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${backendUrl}/api/words`);
      if (!res.ok) throw new Error('Failed to fetch words');
      const data = await res.json();
      setWords(data);
    } catch (err) {
      setError('Could not load words');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddWord(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${backendUrl}/api/words`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, translationTr, translationEn, category, exampleSentence }),
      });
      if (!res.ok) throw new Error('Failed to add word');
      setWord('');
      setTranslationTr('');
      setTranslationEn('');
      setExampleSentence('');
      await fetchWords();
    } catch (err) {
      setError('Could not add word');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`${backendUrl}/api/words/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete word');
      await fetchWords();
    } catch (err) {
      setError('Could not delete word');
    }
  }

  function handleCSVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportMessage(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await fetch(`${backendUrl}/api/words/import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ words: results.data }),
          });
          if (!res.ok) throw new Error('Import failed');
          const data = await res.json();
          setImportMessage(data.message);
          await fetchWords();
        } catch (err) {
          setImportMessage('Import failed. Please check your CSV format.');
        } finally {
          setImporting(false);
          e.target.value = '';
        }
      },
      error: () => {
        setImportMessage('Could not read CSV file.');
        setImporting(false);
      },
    });
  }

  function masteryColor(level: string) {
    if (level === 'Mastered') return 'bg-green-100 text-green-700';
    if (level === 'Learning') return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-600';
  }

  useEffect(() => {
    fetchWords();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Dutch Vocabulary Tracker
        </h1>

        <a
          href="/words/review"
          className="inline-block mb-6 text-sm text-blue-600 hover:underline"
        >
          Start Review Session →
        </a>

        <form onSubmit={handleAddWord} className="bg-white rounded-xl shadow p-4 mb-6 space-y-3">
          <input
            type="text"
            placeholder="Dutch word"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
          />
          <input
            type="text"
            placeholder="Turkish translation"
            value={translationTr}
            onChange={(e) => setTranslationTr(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
          />
          <input
            type="text"
            placeholder="English translation (optional)"
            value={translationEn}
            onChange={(e) => setTranslationEn(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
          />
          <input
            type="text"
            placeholder="Example sentence (optional)"
            value={exampleSentence}
            onChange={(e) => setExampleSentence(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900 bg-white"
          >
            <option value="Vocabulary">Vocabulary</option>
            <option value="Grammar">Grammar</option>
            <option value="Expression">Expression</option>
            <option value="Mistake">Mistake</option>
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 rounded-lg transition-colors"
          >
            {submitting ? 'Adding...' : 'Add Word'}
          </button>
        </form>

        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Import from CSV
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            disabled={importing}
            className="text-sm text-gray-600"
          />
          {importing && <p className="text-blue-600 text-sm mt-2">Importing...</p>}
          {importMessage && <p className="text-sm mt-2 text-gray-700">{importMessage}</p>}
        </div>

        {loading && <p className="text-gray-500">Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}

        <div className="space-y-3">
          {words.map((w) => (
            <div key={w._id} className="bg-white rounded-xl shadow p-4 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900">{w.word}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${masteryColor(w.masteryLevel)}`}>
                    {w.masteryLevel}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  {w.translationTr}
                  {w.translationEn && ` / ${w.translationEn}`}
                </p>
                {w.exampleSentence && (
                  <p className="text-gray-400 text-xs mt-1 italic">{w.exampleSentence}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(w._id)}
                className="text-red-500 hover:text-red-700 text-sm font-medium ml-3"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}