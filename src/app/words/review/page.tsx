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
    return <main className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></main>;
  }

  if (dueWords.length === 0 || currentIndex >= dueWords.length) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-900 mb-2">
            {dueWords.length === 0 ? 'No words due for review!' : 'Review session complete!'}
          </p>
          <p className="text-gray-500 mb-4">
            {dueWords.length === 0 ? "Check back later." : `You reviewed ${dueWords.length} words.`}
          </p>
          <a href="/words" className="text-blue-600 hover:underline">Back to word list</a>
        </div>
      </main>
    );
  }

  const currentWord = dueWords[currentIndex];

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <p className="text-sm text-gray-400 mb-4">
          {currentIndex + 1} / {dueWords.length}
        </p>

        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          {currentWord.word}
        </h2>

        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            Show Answer
          </button>
        ) : (
          <>
            <p className="text-lg text-gray-700 mb-1">{currentWord.translationTr}</p>
            {currentWord.translationEn && (
              <p className="text-sm text-gray-400 mb-2">{currentWord.translationEn}</p>
            )}
            {currentWord.exampleSentence && (
              <p className="text-sm text-gray-400 italic mb-6">{currentWord.exampleSentence}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => handleAnswer(false)}
                disabled={submitting}
                className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2.5 rounded-lg transition-colors"
              >
                Wrong
              </button>
              <button
                onClick={() => handleAnswer(true)}
                disabled={submitting}
                className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 font-medium py-2.5 rounded-lg transition-colors"
              >
                Correct
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}