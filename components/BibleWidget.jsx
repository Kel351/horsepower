'use client';
import { useState, useEffect } from 'react';
import { BookOpen, RefreshCw } from 'lucide-react';

export default function BibleWidget() {
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRandomVerse = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://bible-api.com/?random=verse');
      const data = await res.json();
      setVerse(data);
    } catch (err) {
      console.error('Failed to fetch verse:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomVerse();
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 text-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-indigo-600 font-semibold">
          <BookOpen className="w-5 h-5" />
          <span>Scripture Visualizer</span>
        </div>
        <button
          onClick={fetchRandomVerse}
          disabled={loading}
          className="flex items-center gap-1 text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Generate New
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-slate-400">Loading verse...</div>
      ) : verse ? (
        <div>
          <blockquote className="text-lg italic text-slate-700 mb-3 font-serif">
            "{verse.text?.trim()}"
          </blockquote>
          <p className="text-right font-semibold text-slate-900 text-sm">
            — {verse.reference} ({verse.translation_name || 'KJV'})
          </p>
        </div>
      ) : (
        <p className="text-slate-500 text-sm">Unable to load scripture right now.</p>
      )}
    </div>
  );
}