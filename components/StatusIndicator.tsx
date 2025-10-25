
import React from 'react';
import { ConnectionState } from '../types';

interface StatusIndicatorProps {
  state: ConnectionState;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ state }) => {
  const getStatusInfo = () => {
    switch (state) {
      case ConnectionState.CONNECTING:
        return {
          text: 'Connecting...',
          color: 'bg-yellow-500',
          pulse: true,
        };
      case ConnectionState.CONNECTED:
        return { text: 'Listening...', color: 'bg-green-500', pulse: true };
      case ConnectionState.ERROR:
        return { text: 'Error', color: 'bg-red-500', pulse: false };
      case ConnectionState.CLOSED:
        return { text: 'Session Ended', color: 'bg-gray-500', pulse: false };
      case ConnectionState.IDLE:
      default:
        return { text: 'Not Connected', color: 'bg-gray-500', pulse: false };
    }
  };

  const { text, color, pulse } = getStatusInfo();

  return (
    <div className="flex items-center justify-center space-x-2 p-2 rounded-full">
      <div
        className={`w-3 h-3 rounded-full ${color} ${pulse ? 'animate-pulse' : ''
          }`}
      ></div>
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {text}
      </span>
    </div>
  );
};

export default StatusIndicator;
