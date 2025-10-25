
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
    if (isConnected) return "End Session";
    if (isConnecting) return "Connecting...";
    return "Start Session";
  };
  
  const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  );

  const StopIcon = () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6" />
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
      {isConnected ? <StopIcon /> : <MicIcon />}
      <span>{getButtonText()}</span>
    </button>
  );
};

export default ActionButton;
