
import React from 'react';
import { InterviewSettings } from '../types';

interface InterviewSettingsProps {
  settings: InterviewSettings;
  onSettingsChange: (settings: InterviewSettings) => void;
}

const VOICES = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Hindi', 'Japanese'];

const InterviewSettingsSelector: React.FC<InterviewSettingsProps> = ({ settings, onSettingsChange }) => {
  
  const handleChange = (key: keyof InterviewSettings, value: string) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 mt-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Interviewer Voice
        </label>
        <select
          value={settings.voice}
          onChange={(e) => handleChange('voice', e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {VOICES.map(voice => (
            <option key={voice} value={voice}>{voice}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Language
        </label>
        <select
          value={settings.language}
          onChange={(e) => handleChange('language', e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {LANGUAGES.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default InterviewSettingsSelector;
