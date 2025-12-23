
import React, { useState, useRef, useEffect } from 'react';
import { Message, UserPreferences, LocationState, SavedGuide } from './types';
import { QUICK_REPLIES } from './constants';
import { chatWithGuide } from './services/geminiService';
import PreferenceModal from './components/PreferenceModal';
import SavedGuidesModal from './components/SavedGuidesModal';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "👋 Hi there! I'm your **TourGuide AI**. Whether you're a local or just visiting, I can help you find the best spots, hidden gems, and local secrets. \n\nWhere are we exploring today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  
  const [preferences, setPreferences] = useState<UserPreferences>({
    budget: 'mid-range',
    travelStyle: 'solo',
    interests: ['Food', 'History']
  });

  const [location, setLocation] = useState<LocationState>({
    lat: null,
    lng: null,
    address: 'Worldwide',
    isAutoDetected: false
  });

  const [savedGuides, setSavedGuides] = useState<SavedGuide[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    // Initial location check
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation(prev => ({
            ...prev,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            address: 'Your current area',
            isAutoDetected: true
          }));
        },
        (err) => console.log('Location access denied or unavailable')
      );
    }
  }, []);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const response = await chatWithGuide(text, messages, preferences, location);
    
    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.text,
      timestamp: new Date(),
      groundingLinks: response.links
    };

    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  const saveGuide = (message: Message) => {
    const newSaved: SavedGuide = {
      id: message.id,
      title: `Guide to ${location.address}`,
      content: message.content,
      date: new Date().toLocaleDateString()
    };
    setSavedGuides(prev => [...prev, newSaved]);
    alert("Guide saved for offline view!");
  };

  const deleteSavedGuide = (id: string) => {
    setSavedGuides(prev => prev.filter(g => g.id !== id));
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 max-w-2xl mx-auto shadow-xl">
      {/* Header */}
      <header className="bg-emerald-700 text-white p-4 sticky top-0 z-40 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="bg-white p-1 rounded-lg">
              <svg className="w-6 h-6 text-emerald-700" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight">TourGuide AI</h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowSaved(true)} 
              className="p-2 hover:bg-emerald-600 rounded-full transition relative"
              title="Saved Guides"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
              {savedGuides.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full"></span>}
            </button>
            <button 
              onClick={() => setShowPrefs(true)} 
              className="p-2 hover:bg-emerald-600 rounded-full transition"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
            </button>
          </div>
        </div>
        <div className="flex items-center text-xs opacity-90 gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          <span className="truncate">{location.address} {location.isAutoDetected ? '(Auto)' : ''}</span>
          <button 
            className="ml-auto underline decoration-dotted"
            onClick={() => {
              const newAddr = prompt("Enter your location (e.g. Kyoto, Japan)", location.address);
              if (newAddr) setLocation({ ...location, address: newAddr, isAutoDetected: false, lat: null, lng: null });
            }}
          >
            Change
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50"
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
            }`}>
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse"></div>
                  Virtual Guide
                </div>
              )}
              <div className="text-sm whitespace-pre-wrap leading-relaxed prose-sm">
                {msg.content.split('\n').map((line, i) => {
                   // Basic markdown bold/italic support simulation via inline formatting if needed, 
                   // but standard white-space: pre-wrap and tailwind prose is cleaner.
                   return <p key={i} className={line.startsWith('#') ? 'font-bold text-lg mt-2' : 'mb-1'}>{line}</p>;
                })}
              </div>
              
              {/* Grounding Links */}
              {msg.groundingLinks && msg.groundingLinks.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Map & Web Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingLinks.map((link, idx) => (
                      <a 
                        key={idx} 
                        href={link.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded border border-emerald-100 hover:bg-emerald-100 transition"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                        {link.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className={`mt-2 flex items-center justify-between text-[10px] ${msg.role === 'user' ? 'text-emerald-100' : 'text-slate-400'}`}>
                <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {msg.role === 'assistant' && (
                  <button 
                    onClick={() => saveGuide(msg)} 
                    className="flex items-center gap-1 hover:text-emerald-600 transition"
                    title="Save Guide"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                    Save
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span className="text-xs text-slate-400">Guide is checking maps...</span>
            </div>
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-white border-t border-slate-100 safe-bottom">
        {/* Quick Replies */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-2 custom-scrollbar scroll-smooth no-scrollbar">
          {QUICK_REPLIES.map(reply => (
            <button
              key={reply.id}
              onClick={() => handleSend(reply.prompt)}
              className="whitespace-nowrap px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:border-emerald-200 transition"
            >
              {reply.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about attractions, food, transport..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={`p-4 rounded-2xl transition shadow-lg ${
              !input.trim() || isLoading 
                ? 'bg-slate-200 text-slate-400 shadow-none' 
                : 'bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700 active:scale-95'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
          </button>
        </div>
        <p className="text-[10px] text-center text-slate-400 mt-3">
          Information can change. Double check opening hours & local safety.
        </p>
      </footer>

      {/* Modals */}
      {showPrefs && (
        <PreferenceModal 
          preferences={preferences} 
          onSave={(p) => { setPreferences(p); setShowPrefs(false); }}
          onClose={() => setShowPrefs(false)}
        />
      )}
      {showSaved && (
        <SavedGuidesModal 
          guides={savedGuides}
          onClose={() => setShowSaved(false)}
          onDelete={deleteSavedGuide}
        />
      )}
    </div>
  );
};

export default App;
