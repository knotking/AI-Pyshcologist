
import React, { useEffect, useRef, useState } from 'react';
import { useGeminiLive } from './hooks/useGeminiLive';
import StatusIndicator from './components/StatusIndicator';
import TranscriptionDisplay from './components/TranscriptionDisplay';
import ActionButton from './components/ActionButton';
import ResumeUpload from './components/ResumeUpload';
import SkillSelector from './components/SkillSelector';
import { AppState, ResumeAnalysis } from './types';

const App: React.FC = () => {
  const {
    connectionState,
    transcriptionHistory,
    currentTranscription,
    connect,
    disconnect,
  } = useGeminiLive();

  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [resumeData, setResumeData] = useState<ResumeAnalysis | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string>('');

  const transcriptionEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptionEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptionHistory, currentTranscription]);

  const handleAnalysisStart = () => {
    setAppState(AppState.ANALYZING);
  };

  const handleAnalysisComplete = (data: ResumeAnalysis) => {
    setResumeData(data);
    setAppState(AppState.SELECTION);
  };

  const handleSkillSelection = (skill: string) => {
    setSelectedSkill(skill);
    setAppState(AppState.INTERVIEW);
  };

  const handleBackToSelection = () => {
    disconnect();
    setAppState(AppState.SELECTION);
  };

  const startInterview = () => {
    if (resumeData && selectedSkill) {
      connect(resumeData.summary, selectedSkill);
    }
  };

  return (
    <main className="h-screen w-screen flex flex-col font-sans text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 p-4">
      <header className="w-full max-w-4xl mx-auto flex-shrink-0 mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
            AI Technical Interviewer
          </h1>
          {selectedSkill && appState === AppState.INTERVIEW && (
             <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Topic: {selectedSkill}</p>
          )}
        </div>
        {appState === AppState.INTERVIEW && (
            <button 
                onClick={handleBackToSelection}
                className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
                Change Topic
            </button>
        )}
      </header>

      <div className="flex-grow w-full max-w-4xl mx-auto flex flex-col items-center justify-center overflow-hidden relative">
        
        {appState === AppState.UPLOAD && (
            <ResumeUpload 
                onAnalysisStart={handleAnalysisStart} 
                onAnalysisComplete={handleAnalysisComplete} 
            />
        )}

        {appState === AppState.ANALYZING && (
             <div className="flex flex-col items-center space-y-4 animate-pulse">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-lg font-medium text-slate-600 dark:text-slate-300">Analyzing resume...</p>
             </div>
        )}

        {appState === AppState.SELECTION && resumeData && (
            <SkillSelector 
                skills={resumeData.skills} 
                summary={resumeData.summary} 
                onSelectSkill={handleSkillSelection} 
            />
        )}

        {appState === AppState.INTERVIEW && (
            <>
                <TranscriptionDisplay
                    history={transcriptionHistory}
                    current={currentTranscription}
                />
                <div ref={transcriptionEndRef} />
            </>
        )}
      </div>

      <footer className="w-full max-w-4xl mx-auto flex-shrink-0 mt-4 flex flex-col items-center justify-center space-y-3">
        {appState === AppState.INTERVIEW && (
            <>
                <StatusIndicator state={connectionState} />
                <ActionButton
                state={connectionState}
                onStart={startInterview}
                onStop={disconnect}
                />
            </>
        )}
        
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center px-4">
            {appState === AppState.INTERVIEW 
                ? "Speak clearly. The AI interviewer will listen and respond." 
                : "Powered by Gemini 2.5 Flash & Gemini Live API"}
        </p>
      </footer>
    </main>
  );
};

export default App;
