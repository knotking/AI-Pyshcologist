
import React from 'react';
import { TranscriptionEntry, CurrentTranscription } from '../types';

interface TranscriptionDisplayProps {
  history: TranscriptionEntry[];
  current: CurrentTranscription;
}

const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({ history, current }) => {
  return (
    <div className="flex-grow w-full max-w-4xl p-4 md:p-6 space-y-6 overflow-y-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg">
      {history.map((entry, index) => (
        <div key={index} className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-md p-3 rounded-2xl ${entry.speaker === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'}`}>
            <p className="text-sm">{entry.text}</p>
          </div>
        </div>
      ))}
      {current.user && (
        <div className="flex justify-end">
          <div className="max-w-md p-3 rounded-2xl bg-blue-500 text-white rounded-br-none opacity-60">
            <p className="text-sm italic">{current.user}</p>
          </div>
        </div>
      )}
      {current.model && (
        <div className="flex justify-start">
          <div className="max-w-md p-3 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none opacity-60">
            <p className="text-sm italic">{current.model}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranscriptionDisplay;
