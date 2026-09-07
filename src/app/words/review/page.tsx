'use client';

import { useState, useEffect } from 'react';

interface Word {
  _id: string;
  word: string;
  translationTr: string;
  translationEn: string;
  exampleSentence: string;
  masteryLevel: string;
}

export default function ReviewPage() {
  const [dueWords, setDueWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  async function fetchDueWords() {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/words/due`);
      const data = await res.json();
      setDueWords(data);
      setCurrentIndex(0);
      setShowAnswer(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDueWords();
  }, []);

  async function handleAnswer(correct: boolean) {
    setSubmitting(true);
    const currentWord = dueWords[currentIndex];
    try {
      await fetch(`${backendUrl}/api/words/${currentWord._id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correct }),
      });
      setShowAnswer(false);
      setCurrentIndex((prev) => prev + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--cream)]">
        <p className="text-[var(--muted)]">Loading…</p>
      </main>
    );
  }

  if (dueWords.length === 0 || currentIndex >= dueWords.length) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--cream)] px-6">
        <div className="max-w-sm text-center">
          <p className="font-display text-2xl text-[var(--ink)] mb-2">
            {dueWords.length === 0 ? 'Nothing due right now' : 'Session complete'}
          </p>
          <p className="text-[var(--muted)] mb-6">
            {dueWords.length === 0
              ? 'Come back later, or add more words to build your list.'
              : `You reviewed ${dueWords.length} ${dueWords.length === 1 ? 'word' : 'words'}.`}
          </p>
          <a href="/words" className="text-[var(--rust)] hover:text-[var(--rust-dark)] font-medium">
            Back to word list
          </a>
        </div>
      </main>
    );
  }

  const currentWord = dueWords[currentIndex];

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--cream)] px-6">
      <div className="max-w-sm w-full text-center">
        <p className="text-sm text-[var(--muted)] mb-8">
          {currentIndex + 1} of {dueWords.length}
        </p>

        <h2 className="font-display text-4xl text-[var(--ink)] mb-10">
          {currentWord.word}
        </h2>

        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="bg-[var(--rust)] hover:bg-[var(--rust-dark)] text-[var(--cream)] font-medium py-2.5 px-6 rounded-full transition-colors"
          >
            Show answer
          </button>
        ) : (
          <>
            <div className="border-t border-[var(--clay)] pt-6 mb-8">
              <p className="text-lg text-[var(--ink)]">{currentWord.translationTr}</p>
              {currentWord.translationEn && (
                <p className="text-sm text-[var(--muted)] mt-1">{currentWord.translationEn}</p>
              )}
              {currentWord.exampleSentence && (
                <p className="text-sm text-[var(--muted)] italic mt-3">{currentWord.exampleSentence}</p>
              )}
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => handleAnswer(false)}
                disabled={submitting}
                className="border border-[var(--clay)] hover:border-[var(--rust-dark)] hover:text-[var(--rust-dark)] text-[var(--ink)] font-medium py-2 px-6 rounded-full transition-colors"
              >
                Didn&apos;t know it
              </button>
              <button
                onClick={() => handleAnswer(true)}
                disabled={submitting}
                className="bg-[var(--moss)] hover:opacity-90 text-[var(--cream)] font-medium py-2 px-6 rounded-full transition-colors"
              >
                Knew it
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}