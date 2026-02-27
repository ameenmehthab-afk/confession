import React, { useState } from 'react';
import { Ghost, PlusCircle, LayoutDashboard, Sparkles } from 'lucide-react';
import ConfessionFeed from './components/ConfessionFeed';
import PostConfession from './components/PostConfession';
import AdminPanel from './components/AdminPanel';
import MusicPlayer from './components/MusicPlayer';

type View = 'feed' | 'post' | 'admin';

export default function App() {
  const [view, setView] = useState<View>('feed');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setView('feed')}
          >
            <div className="p-1.5 bg-neon-blue rounded-lg group-hover:rotate-12 transition-transform">
              <Ghost className="text-slate-950" size={20} />
            </div>
            <h1 className="text-xl font-black tracking-tighter text-white">
              CONFESS<span className="text-neon-blue">LY</span>
            </h1>
          </div>

          <nav className="flex items-center gap-1 sm:gap-4">
            <button 
              onClick={() => setView('feed')}
              className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${view === 'feed' ? 'text-neon-blue bg-neon-blue/10' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Feed
            </button>
            <button 
              onClick={() => setView('post')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${view === 'post' ? 'bg-neon-blue text-slate-950 shadow-[0_0_15px_rgba(0,243,255,0.4)]' : 'bg-slate-900 text-slate-200 hover:bg-slate-800 border border-slate-800'}`}
            >
              <PlusCircle size={18} />
              <span className="hidden sm:inline">Confess</span>
            </button>
            <button 
              onClick={() => setView('admin')}
              className={`p-2 rounded-xl transition-all ${view === 'admin' ? 'text-neon-purple bg-neon-purple/10' : 'text-slate-600 hover:text-slate-400'}`}
              title="Admin Panel"
            >
              <LayoutDashboard size={20} />
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {view === 'feed' && (
          <div className="space-y-12">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                College <span className="neon-text-blue">Secrets</span> Unveiled.
              </h2>
              <p className="text-slate-500 text-lg">Read what your campus is really thinking.</p>
            </div>
            
            <div className="mb-16">
              <PostConfession onSuccess={() => setView('feed')} />
            </div>

            <div className="pt-8 border-t border-slate-900">
              <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
                <Sparkles className="text-neon-blue" size={20} />
                Recent Confessions
              </h3>
              <ConfessionFeed />
            </div>
          </div>
        )}

        {view === 'post' && (
          <div className="py-8">
            <PostConfession onSuccess={() => setView('feed')} />
          </div>
        )}

        {view === 'admin' && (
          <div className="py-8">
            <AdminPanel />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-900">
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Sparkles size={16} className="text-neon-blue" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Built for the bold.</span>
          </div>
          <p className="text-slate-600 text-xs text-center">
            Confessly is an anonymous platform. We do not track IP addresses or user data. <br />
            Please be respectful and follow community guidelines.
          </p>
        </div>
      </footer>

      <MusicPlayer />
    </div>
  );
}
