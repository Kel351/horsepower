'use client';
import { useState } from 'react';
import Link from 'next/link';
import BibleWidget from '@/components/BibleWidget';

// --- BIBLE QUIZ COMPONENT ---
const QUIZ_QUESTIONS = [
  {
    question: "Who was swallowed by a great fish after trying to flee from God's command?",
    options: ["Noah", "Jonah", "Elijah", "Moses"],
    answer: 1,
    explanation: "Jonah 1:17 - Now the Lord provided a huge fish to swallow Jonah, and Jonah was inside the fish three days and three nights."
  },
  {
    question: "Which cell or tribe standard represents royalty and courage in Judah?",
    options: ["Pillars of Zion", "El Roi", "Exouxia", "Lion of Judah"],
    answer: 3,
    explanation: "Revelation 5:5 - See, the Lion of the tribe of Judah, the Root of David, has triumphed."
  },
  {
    question: "How many books are in the New Testament?",
    options: ["39", "27", "66", "12"],
    answer: 1,
    explanation: "The New Testament consists of 27 books, starting from Matthew to Revelation."
  },
  {
    question: "What is the shortest verse in the Bible?",
    options: ["God is love.", "Jesus wept.", "Rejoice always.", "Pray continually."],
    answer: 1,
    explanation: "John 11:35 - 'Jesus wept.'"
  }
];

function BibleQuiz() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);

  const currentQ = QUIZ_QUESTIONS[currentIdx];

  const handleSelect = (index) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQ.answer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setScore(0);
    setShowResult(false);
    setIsAnswered(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-slate-100 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧠</span>
            <h2 className="text-lg font-bold text-white">Daily Bible Quiz</h2>
          </div>
          <span className="text-xs bg-amber-500/10 text-amber-400 font-semibold px-2.5 py-1 rounded-lg border border-amber-500/20">
            Question {currentIdx + 1} / {QUIZ_QUESTIONS.length}
          </span>
        </div>

        {!showResult ? (
          <div>
            <p className="text-sm font-medium text-slate-200 mb-4">{currentQ.question}</p>

            <div className="space-y-2.5 mb-4">
              {currentQ.options.map((opt, i) => {
                let btnStyle = "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800";
                
                if (isAnswered) {
                  if (i === currentQ.answer) {
                    btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold";
                  } else if (i === selectedOption) {
                    btnStyle = "bg-rose-500/20 border-rose-500 text-rose-300 font-semibold";
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    disabled={isAnswered}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswered && i === currentQ.answer && <span>✅</span>}
                    {isAnswered && i === selectedOption && i !== currentQ.answer && <span>❌</span>}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div className="mb-4 p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-400">
                💡 <span className="font-semibold text-slate-300">Explanation:</span> {currentQ.explanation}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <span className="text-4xl block mb-2">🎉</span>
            <h3 className="text-lg font-bold text-white mb-1">Quiz Completed!</h3>
            <p className="text-xs text-slate-400 mb-4">
              You scored <span className="text-amber-400 font-bold">{score}</span> out of {QUIZ_QUESTIONS.length}
            </p>
            <button
              onClick={handleRestart}
              className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold px-4 py-2 rounded-xl text-xs border border-slate-700 transition"
            >
              Play Again 🔄
            </button>
          </div>
        )}
      </div>

      {!showResult && (
        <div className="flex justify-end pt-3 border-t border-slate-800/60 mt-2">
          <button
            onClick={handleNext}
            disabled={!isAnswered}
            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
          >
            {currentIdx + 1 === QUIZ_QUESTIONS.length ? 'See Results' : 'Next Question →'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header / Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center -my-6">
            <img 
              src="/hspwr1.png" 
              alt="HORSEPOWER GLOBAL Logo" 
              className="h-35 w-auto object-contain" 
            />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-slate-900/60 border-b border-slate-800 text-white py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-extrabold mb-4 text-white">Welcome to Our Church Family</h2>
          <p className="text-slate-400 text-lg mb-8">
            Stay connected, view daily scriptures, 
            SHALOM and STAY BLESSED.😇
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/register" 
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-6 py-3 rounded-lg transition shadow-lg shadow-amber-500/10"
            >
              Join / Register Member
            </Link>
            <Link 
              href="/login" 
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 py-3 rounded-lg transition border border-slate-700"
            >
              Leadership Login
            </Link>
          </div>
        </div>
      </section>

      {/* Daily Scripture & Quiz Section */}
      <section className="max-w-6xl mx-auto py-12 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div>
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Daily Scripture🙌 </h3>
            <BibleWidget />
          </div>
          <div className="lg:pt-14">
            <BibleQuiz />
          </div>
        </div>
      </section>
    </main>
  );
}