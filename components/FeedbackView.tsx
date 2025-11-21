
import React from 'react';
import { FeedbackData } from '../types';

interface FeedbackViewProps {
  data: FeedbackData;
  onRestart: () => void;
}

const FeedbackView: React.FC<FeedbackViewProps> = ({ data, onRestart }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500 border-green-500';
    if (score >= 60) return 'text-yellow-500 border-yellow-500';
    return 'text-red-500 border-red-500';
  };

  return (
    <div className="w-full max-w-4xl p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Interview Feedback</h2>
        <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-8 ${getScoreColor(data.score)}`}>
          <span className="text-4xl font-bold text-slate-800 dark:text-slate-200">{data.score}</span>
        </div>
        <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          {data.summary}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Strengths
          </h3>
          <ul className="space-y-2">
            {data.strengths.map((item, i) => (
              <li key={i} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-slate-700 dark:text-slate-200 text-sm">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-amber-600 dark:text-amber-400 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {data.improvements.map((item, i) => (
              <li key={i} className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-slate-700 dark:text-slate-200 text-sm">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          Recommended Learning
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.recommendations.map((item, i) => (
            <div key={i} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
              <p className="text-slate-700 dark:text-slate-200 font-medium">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center pt-6">
        <button
          onClick={onRestart}
          className="px-8 py-3 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-full font-semibold transition-colors shadow-lg"
        >
          Start New Interview
        </button>
      </div>
    </div>
  );
};

export default FeedbackView;
