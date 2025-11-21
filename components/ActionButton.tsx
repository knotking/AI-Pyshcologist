
import React from 'react';
import { ConnectionState } from '../types';

interface ActionButtonProps {
  state: ConnectionState;
  onStart: () => void;
  onStop: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ state, onStart, onStop }) => {
  const isConnecting = state === ConnectionState.CONNECTING;
  const isConnected = state === ConnectionState.CONNECTED;

  const getButtonText = () => {
    if (isConnected) return "End Interview & Get Feedback";
    if (isConnecting) return "Connecting...";
    return "Start Interview";
  };
  
  const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  );

  const ReportIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
  );


  return (
    <button
      onClick={isConnected ? onStop : onStart}
      disabled={isConnecting}
      className={`flex items-center justify-center space-x-3 px-8 py-4 text-lg font-bold text-white rounded-full shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-4
      ${isConnected ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300'}
      ${isConnecting ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      {isConnected ? <ReportIcon /> : <MicIcon />}
      <span>{getButtonText()}</span>
    </button>
  );
};

export default ActionButton;
