
import React, { useState } from 'react';
import { fileToBase64, analyzeResume } from '../utils/resume';
import { ResumeAnalysis } from '../types';

interface ResumeUploadProps {
  onAnalysisComplete: (data: ResumeAnalysis) => void;
  onAnalysisStart: () => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onAnalysisStart, onAnalysisComplete }) => {
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && file.type !== 'text/plain') {
      setError('Please upload a PDF or Text file.');
      return;
    }

    setError(null);
    onAnalysisStart();

    try {
      const base64 = await fileToBase64(file);
      const data = await analyzeResume(base64, file.type);
      onAnalysisComplete(data);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze resume. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-2xl p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg text-center">
      <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-12 flex flex-col items-center justify-center space-y-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors relative">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <div className="space-y-1">
          <p className="text-xl font-medium text-slate-700 dark:text-slate-200">
            Upload your Resume
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            PDF or TXT files accepted
          </p>
        </div>
        <input 
          type="file" 
          accept=".pdf,.txt" 
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      {error && (
        <p className="mt-4 text-red-500 text-sm font-medium">{error}</p>
      )}
    </div>
  );
};

export default ResumeUpload;
