
import React from 'react';
import InterviewSettingsSelector from './InterviewSettings';
import { InterviewSettings } from '../types';

interface SkillSelectorProps {
  skills: string[];
  summary: string;
  settings: InterviewSettings;
  onSelectSkill: (skill: string) => void;
  onSettingsChange: (settings: InterviewSettings) => void;
}

const SkillSelector: React.FC<SkillSelectorProps> = ({ skills, summary, settings, onSelectSkill, onSettingsChange }) => {
  return (
    <div className="w-full max-w-4xl p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          Resume Analysis
        </h2>
        <p className="text-slate-600 dark:text-slate-300 italic border-l-4 border-blue-500 pl-4 py-1 bg-slate-50 dark:bg-slate-900 rounded-r">
          "{summary}"
        </p>
      </div>
      
      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">
          Interview Settings
        </h3>
        <InterviewSettingsSelector settings={settings} onSettingsChange={onSettingsChange} />
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">
          Select a topic to start:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <button
              key={skill}
              onClick={() => onSelectSkill(skill)}
              className="p-4 text-left rounded-lg border border-slate-200 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 transition-all group"
            >
              <span className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {skill}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillSelector;
