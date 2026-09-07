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
          setImportMessage('Import failed. Check your CSV format.');
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

  function masteryLabel(level: string) {
    if (level === 'Mastered') return { text: 'Mastered', color: 'text-[var(--moss)]' };
    if (level === 'Learning') return { text: 'Learning', color: 'text-[var(--rust)]' };
    return { text: 'New', color: 'text-[var(--muted)]' };
  }

  useEffect(() => {
    fetchWords();
  }, []);

  const inputClass =
    'w-full bg-transparent border-b border-[var(--clay)] px-1 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--rust)] transition-colors';

  return (
    <main className="min-h-screen bg-[var(--cream)] px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-baseline justify-between border-b border-[var(--clay)] pb-6 mb-8">
          <h1 className="font-display text-3xl text-[var(--ink)]">
            Woordenschat
          </h1>
          
          <a
            href="/words/review"
            className="text-sm text-[var(--rust)] hover:text-[var(--rust-dark)] font-medium"
          >
            Review words
          </a>
        </div>

        <section className="mb-10">
          <h2 className="text-sm text-[var(--muted)] mb-4">Add a word</h2>
          <form onSubmit={handleAddWord} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
            <input
              type="text"
              placeholder="Dutch word"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              required
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Turkish translation"
              value={translationTr}
              onChange={(e) => setTranslationTr(e.target.value)}
              required
              className={inputClass}
            />
            <input
              type="text"
              placeholder="English translation (optional)"
              value={translationEn}
              onChange={(e) => setTranslationEn(e.target.value)}
              className={inputClass}
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`${inputClass} bg-[var(--cream)]`}
            >
              <option value="Vocabulary">Vocabulary</option>
              <option value="Grammar">Grammar</option>
              <option value="Expression">Expression</option>
              <option value="Mistake">Mistake</option>
            </select>
            <input
              type="text"
              placeholder="Example sentence (optional)"
              value={exampleSentence}
              onChange={(e) => setExampleSentence(e.target.value)}
              className={`${inputClass} sm:col-span-2`}
            />
            <button
              type="submit"
              disabled={submitting}
              className="sm:col-span-2 justify-self-start bg-[var(--rust)] hover:bg-[var(--rust-dark)] disabled:bg-[var(--clay)] disabled:text-[var(--muted)]
                         text-[var(--cream)] font-medium py-2 px-5 rounded-full transition-colors"
            >
              {submitting ? 'Adding…' : 'Add word'}
            </button>
          </form>
        </section>

        <section className="mb-10 pt-6 border-t border-[var(--clay)]">
          <h2 className="text-sm text-[var(--muted)] mb-3">Import from CSV</h2>
          <input
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            disabled={importing}
            className="text-sm text-[var(--ink)] file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-[var(--clay)] file:text-[var(--ink)] file:text-sm hover:file:bg-[var(--rust)] hover:file:text-[var(--cream)] file:transition-colors"
          />
          {importing && <p className="text-[var(--rust)] text-sm mt-2">Importing…</p>}
          {importMessage && <p className="text-sm mt-2 text-[var(--ink)]">{importMessage}</p>}
        </section>

        <section className="pt-6 border-t border-[var(--clay)]">
          <h2 className="text-sm text-[var(--muted)] mb-3">
            {words.length} {words.length === 1 ? 'word' : 'words'}
          </h2>

          {loading && <p className="text-[var(--muted)]">Loading…</p>}
          {error && <p className="text-[var(--rust-dark)]">{error}</p>}

          <div>
            {words.map((w) => {
              const mastery = masteryLabel(w.masteryLevel);
              return (
                <div
                  key={w._id}
                  className="flex justify-between items-start py-4 border-b border-[var(--clay)]"
                >
                  <div>
                    <div className="flex items-baseline gap-3">
                      <p className="font-display text-lg text-[var(--ink)]">{w.word}</p>
                      <span className={`text-xs ${mastery.color}`}>{mastery.text}</span>
                    </div>
                    <p className="text-[var(--muted)] text-sm mt-0.5">
                      {w.translationTr}
                      {w.translationEn && ` / ${w.translationEn}`}
                    </p>
                    {w.exampleSentence && (
                      <p className="text-[var(--muted)] text-sm mt-1 italic">{w.exampleSentence}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(w._id)}
                    className="text-[var(--muted)] hover:text-[var(--rust-dark)] text-sm ml-4 shrink-0"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}