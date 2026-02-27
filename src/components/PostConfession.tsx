import React, { useState } from 'react';
import { Send, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { CATEGORIES } from '../types';

interface PostConfessionProps {
  onSuccess: () => void;
}

export default function PostConfession({ onSuccess }: PostConfessionProps) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [nickname, setNickname] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || !category) {
      setMessage({ type: 'error', text: 'Please select a category and write your confession.' });
      return;
    }

    if (content.length < 10) {
      setMessage({ type: 'error', text: 'Confession must be at least 10 characters long.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/confessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, category, nickname }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Confession submitted! It will appear after moderation.' });
        setContent('');
        setCategory('');
        setNickname('');
        setTimeout(() => {
          setMessage(null);
          onSuccess();
        }, 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to submit. Please try again.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-neon-blue/10 rounded-lg">
          <ShieldCheck className="text-neon-blue" size={24} />
        </div>
        <h2 className="text-2xl font-bold text-white">Share Your Story</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Category *</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                  category === cat.id 
                    ? `bg-slate-800 border-neon-blue ${cat.color} shadow-[0_0_10px_rgba(0,243,255,0.2)]` 
                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Your Confession *</label>
          <textarea
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind? Be honest, be bold..."
            className="w-full h-40 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-200 focus:ring-2 focus:ring-neon-blue/50 focus:border-neon-blue outline-none transition-all resize-none"
          />
          <div className="flex justify-between mt-1">
             <span className="text-[10px] text-slate-600 uppercase tracking-widest">Minimum 10 characters</span>
             <span className="text-[10px] text-slate-600">{content.length} / 2000</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Nickname (Optional)</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="e.g. SecretAdmirer22"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-neon-blue/50 focus:border-neon-blue outline-none transition-all"
          />
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg ${
            isSubmitting || content.length < 10 || !category
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
              : 'bg-neon-blue hover:bg-cyan-400 text-slate-950 shadow-neon-blue/20'
          }`}
        >
          {isSubmitting ? 'Sending...' : (
            <>
              <Send size={18} />
              Submit Anonymously
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500 leading-relaxed">
        By submitting, you agree to our community guidelines. <br />
        Your identity is 100% protected.
      </p>
    </motion.div>
  );
}
