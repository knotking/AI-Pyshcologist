
import React, { useEffect, useRef } from 'react';
import { useGeminiLive } from './hooks/useGeminiLive';
import StatusIndicator from './components/StatusIndicator';
import TranscriptionDisplay from './components/TranscriptionDisplay';
import ActionButton from './components/ActionButton';

const App: React.FC = () => {
  const {
    connectionState,
    transcriptionHistory,
    currentTranscription,
    connect,
    disconnect,
  } = useGeminiLive();

  const transcriptionEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptionEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptionHistory, currentTranscription]);

  return (
    <main className="h-screen w-screen flex flex-col font-sans text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 p-4">
      <header className="w-full max-w-4xl mx-auto flex-shrink-0 mb-4">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-slate-800 dark:text-slate-200">
          AI Psychologist
        </h1>
        <p className="text-center text-slate-600 dark:text-slate-400 mt-2">
          A safe space to talk. Start a session to begin.
        </p>
      </header>

      <div className="flex-grow w-full max-w-4xl mx-auto flex flex-col items-center justify-center overflow-hidden">
        <TranscriptionDisplay
          history={transcriptionHistory}
          current={currentTranscription}
        />
        <div ref={transcriptionEndRef} />
      </div>

      <footer className="w-full max-w-4xl mx-auto flex-shrink-0 mt-4 flex flex-col items-center justify-center space-y-3">
        <StatusIndicator state={connectionState} />
        <ActionButton
          state={connectionState}
          onStart={connect}
          onStop={disconnect}
        />
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center px-4">
            This is an AI model. It is not a licensed therapist. If you are in crisis, please contact a professional.
        </p>
      </footer>
    </main>
  );
};

export default App;
