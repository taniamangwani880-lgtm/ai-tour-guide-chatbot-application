
import React, { useState } from 'react';
import { UserPreferences } from '../types';

interface PreferenceModalProps {
  preferences: UserPreferences;
  onSave: (prefs: UserPreferences) => void;
  onClose: () => void;
}

const PreferenceModal: React.FC<PreferenceModalProps> = ({ preferences, onSave, onClose }) => {
  const [localPrefs, setLocalPrefs] = useState<UserPreferences>(preferences);

  const interestOptions = ['History', 'Food', 'Nightlife', 'Nature', 'Art', 'Shopping', 'Adventure'];

  const toggleInterest = (interest: string) => {
    setLocalPrefs(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
        <h2 className="text-xl font-bold mb-4 text-emerald-800">Customize Your Experience</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Budget</label>
          <div className="flex gap-2">
            {(['budget', 'mid-range', 'luxury'] as const).map(b => (
              <button
                key={b}
                onClick={() => setLocalPrefs({ ...localPrefs, budget: b })}
                className={`flex-1 py-2 rounded-lg border text-sm capitalize transition ${localPrefs.budget === b ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Travel Style</label>
          <div className="grid grid-cols-2 gap-2">
            {(['solo', 'couple', 'family', 'group'] as const).map(s => (
              <button
                key={s}
                onClick={() => setLocalPrefs({ ...localPrefs, travelStyle: s })}
                className={`py-2 rounded-lg border text-sm capitalize transition ${localPrefs.travelStyle === s ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Interests</label>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map(i => (
              <button
                key={i}
                onClick={() => toggleInterest(i)}
                className={`px-3 py-1 rounded-full border text-xs transition ${localPrefs.interests.includes(i) ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 text-slate-500 font-medium">Cancel</button>
          <button 
            onClick={() => onSave(localPrefs)} 
            className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-100"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferenceModal;
