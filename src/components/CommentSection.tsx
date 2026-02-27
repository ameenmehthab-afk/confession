import React, { useState, useEffect } from 'react';
import { Send, User } from 'lucide-react';
import { Comment } from '../types';

interface CommentSectionProps {
  confessionId: number;
}

export default function CommentSection({ confessionId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/confessions/${confessionId}/comments`);
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [confessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/confessions/${confessionId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment, nickname: nickname || 'Anonymous' }),
      });
      if (res.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="text-xs text-slate-600 animate-pulse">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-xs text-slate-600 italic">No comments yet. Be the first to respond.</div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-neon-blue uppercase tracking-tighter">{comment.nickname}</span>
                <span className="text-[10px] text-slate-600">{new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="text-sm text-slate-300">{comment.content}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <User size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Nickname (optional)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-300 outline-none focus:border-neon-blue/50 transition-colors"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Write a supportive comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-neon-blue/50 transition-colors"
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="p-1.5 bg-neon-blue text-slate-950 rounded-lg hover:bg-cyan-400 disabled:opacity-50 transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      </form>
    </div>
  );
}
