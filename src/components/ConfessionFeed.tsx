import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Flag, Clock, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Confession, CATEGORIES } from '../types';
import CommentSection from './CommentSection';

export default function ConfessionFeed() {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeComments, setActiveComments] = useState<number | null>(null);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const [reportedIds, setReportedIds] = useState<Set<number>>(new Set());

  const fetchConfessions = async () => {
    try {
      const res = await fetch('/api/confessions');
      const data = await res.json();
      setConfessions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedLikes = localStorage.getItem('confession_likes');
    if (savedLikes) {
      setLikedIds(new Set(JSON.parse(savedLikes)));
    }
    fetchConfessions();
  }, []);

  const handleLike = async (id: number) => {
    if (likedIds.has(id)) return;

    try {
      const res = await fetch(`/api/confessions/${id}/like`, { method: 'POST' });
      if (res.ok) {
        setConfessions(prev => prev.map(c => c.id === id ? { ...c, likes: c.likes + 1 } : c));
        const newLikedIds = new Set(likedIds).add(id);
        setLikedIds(newLikedIds);
        localStorage.setItem('confession_likes', JSON.stringify(Array.from(newLikedIds)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReport = async (id: number) => {
    if (reportedIds.has(id)) return;
    if (!confirm('Report this confession for inappropriate content?')) return;
    
    try {
      console.log(`Sending report for ID: ${id}`);
      const res = await fetch(`/api/confessions/${id}/report`, { method: 'POST' });
      if (res.ok) {
        setReportedIds(prev => new Set(prev).add(id));
        alert('Thank you. Our moderators will review this post.');
      } else {
        const errorData = await res.json();
        alert(`Failed to report: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Report fetch error:', err);
      alert('Network error while reporting. Please try again.');
    }
  };

  if (loading) return <div className="text-center py-20 text-neon-blue animate-pulse">Loading secrets...</div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {confessions.length === 0 ? (
        <div className="text-center py-20 text-slate-500">No confessions yet. Be the first to share!</div>
      ) : (
        confessions.map((confession) => (
          <motion.div
            key={confession.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-neon-blue/30 transition-colors group"
          >
            <div className="flex justify-between items-start mb-4">
              <span className={`text-xs font-bold uppercase tracking-widest ${CATEGORIES.find(c => c.id === confession.category)?.color || 'text-slate-400'}`}>
                {CATEGORIES.find(c => c.id === confession.category)?.label || confession.category}
              </span>
              <div className="flex items-center text-slate-500 text-xs">
                <Clock size={12} className="mr-1" />
                {new Date(confession.created_at).toLocaleDateString()}
              </div>
            </div>
            
            <p className="text-slate-200 text-lg leading-relaxed mb-6 whitespace-pre-wrap italic">
              "{confession.content}"
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleLike(confession.id)}
                  className={`flex items-center gap-1.5 transition-colors group ${likedIds.has(confession.id) ? 'text-neon-pink' : 'text-slate-400 hover:text-neon-pink'}`}
                >
                  <Heart 
                    size={18} 
                    className={`transition-transform ${likedIds.has(confession.id) ? 'fill-neon-pink scale-110' : 'group-active:scale-125'}`} 
                  />
                  <span className="text-sm font-bold">{confession.likes}</span>
                </button>
                <button 
                  onClick={() => setActiveComments(activeComments === confession.id ? null : confession.id)}
                  className={`flex items-center gap-1.5 transition-colors ${activeComments === confession.id ? 'text-neon-blue' : 'text-slate-400 hover:text-neon-blue'}`}
                >
                  <MessageCircle size={18} />
                  <span className="text-sm">Comments</span>
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 italic">~ {confession.nickname}</span>
                <button 
                  onClick={() => handleReport(confession.id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all text-[10px] font-bold uppercase tracking-tighter ${
                    reportedIds.has(confession.id) 
                      ? 'bg-rose-500/20 text-rose-500' 
                      : 'text-slate-600 hover:bg-rose-500/10 hover:text-rose-500'
                  }`}
                  disabled={reportedIds.has(confession.id)}
                >
                  {reportedIds.has(confession.id) ? (
                    <>
                      <AlertTriangle size={12} />
                      Reported
                    </>
                  ) : (
                    <>
                      <Flag size={12} />
                      Report Vulgar
                    </>
                  )}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {activeComments === confession.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <CommentSection confessionId={confession.id} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))
      )}
    </div>
  );
}
