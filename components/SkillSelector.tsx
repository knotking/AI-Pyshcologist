
import React from 'react';

interface SkillSelectorProps {
  skills: string[];
  summary: string;
  onSelectSkill: (skill: string) => void;
}

const SkillSelector: React.FC<SkillSelectorProps> = ({ skills, summary, onSelectSkill }) => {
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
      
      <div>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">
          Select a topic for your interview:
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
