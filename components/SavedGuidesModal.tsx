
import React from 'react';
import { SavedGuide } from '../types';

interface SavedGuidesModalProps {
  guides: SavedGuide[];
  onClose: () => void;
  onDelete: (id: string) => void;
}

const SavedGuidesModal: React.FC<SavedGuidesModalProps> = ({ guides, onClose, onDelete }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-emerald-700 text-white">
        <h2 className="text-lg font-bold">My Saved Guides</h2>
        <button onClick={onClose} className="p-2 hover:bg-emerald-600 rounded-lg">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
        {guides.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
            <p>No guides saved yet. Click the bookmark icon on any guide to save it for offline view!</p>
          </div>
        ) : (
          guides.map(guide => (
            <div key={guide.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-800">{guide.title}</h3>
                <button onClick={() => onDelete(guide.id)} className="text-red-400 p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
              <p className="text-xs text-slate-400 mb-3">{guide.date}</p>
              <div className="text-sm text-slate-600 line-clamp-4 whitespace-pre-wrap">
                {guide.content}
              </div>
              <button 
                className="mt-4 text-emerald-600 text-sm font-semibold"
                onClick={() => {
                  alert("Full offline view features coming soon!");
                }}
              >
                View Full Guide
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SavedGuidesModal;
