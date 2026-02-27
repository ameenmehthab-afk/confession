import React, { useState, useEffect } from 'react';
import { Check, X, Trash2, ShieldAlert } from 'lucide-react';
import { Confession, CATEGORIES } from '../types';

export default function AdminPanel() {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reported' | 'approved' | 'rejected'>('all');

  const fetchAll = async () => {
    try {
      const res = await fetch('/api/admin/confessions');
      if (!res.ok) throw new Error('Failed to fetch confessions');
      const data = await res.json();
      if (Array.isArray(data)) {
        setConfessions(data);
      } else {
        console.error('Expected array but got:', data);
        setConfessions([]);
      }
    } catch (err) {
      console.error('Admin fetch error:', err);
      setConfessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filteredConfessions = confessions.filter(c => {
    if (filter === 'pending') return c.status === 'pending';
    if (filter === 'reported') return c.reports_count > 0;
    if (filter === 'approved') return c.status === 'approved';
    if (filter === 'rejected') return c.status === 'rejected';
    return true;
  });

  const updateStatus = async (id: number, status: string) => {
    try {
      console.log(`Updating status for ${id} to ${status}`);
      const res = await fetch(`/api/admin/confessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setConfessions(prev => prev.map(c => c.id === id ? { ...c, status: status as any } : c));
      } else {
        const errorData = await res.json();
        alert(`Failed to update: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Status update fetch error:', err);
      alert('Network error while updating status.');
    }
  };

  const deleteConfession = async (id: number) => {
    if (!confirm('Are you sure you want to delete this permanently?')) return;
    try {
      console.log(`Sending delete request for ID: ${id}`);
      const res = await fetch(`/api/admin/confessions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConfessions(prev => prev.filter(c => c.id !== id));
      } else {
        const errorData = await res.json();
        alert(`Failed to delete: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Delete fetch error:', err);
      alert('Network error while deleting.');
    }
  };

  if (loading) return <div className="text-center py-20 text-neon-purple">Loading moderation queue...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ShieldAlert className="text-neon-purple" />
          Moderation Dashboard
        </h2>
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
          {(['all', 'pending', 'reported', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                filter === f ? 'bg-neon-purple text-slate-950' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredConfessions.map((confession) => (
          <div 
            key={confession.id} 
            className={`p-6 rounded-2xl border transition-all ${
              confession.status === 'pending' ? 'bg-slate-900 border-amber-500/20' : 
              confession.status === 'approved' ? 'bg-slate-900/40 border-emerald-500/20' : 
              'bg-slate-900/40 border-rose-500/20 opacity-50'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-500">#{confession.id}</span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${CATEGORIES.find(c => c.id === confession.category)?.color.replace('text-', 'border-').replace('text-', 'text-') || 'border-slate-700 text-slate-500'}`}>
                  {confession.category}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  confession.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                  confession.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                  'bg-rose-500/10 text-rose-500'
                }`}>
                  {confession.status}
                </span>
                {confession.reports_count > 0 && (
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-600 text-white animate-pulse">
                    Reports: {confession.reports_count}
                  </span>
                )}
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-neon-pink/10 text-neon-pink border border-neon-pink/20">
                  Likes: {confession.likes}
                </span>
              </div>
              <span className="text-xs text-slate-500">{new Date(confession.created_at).toLocaleString()}</span>
            </div>

            <p className="text-slate-300 mb-6">{confession.content}</p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 italic">By: {confession.nickname}</span>
              <div className="flex gap-2">
                {confession.status !== 'approved' && (
                  <button 
                    onClick={() => updateStatus(confession.id, 'approved')}
                    className="p-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-slate-950 rounded-lg transition-all"
                    title="Approve"
                  >
                    <Check size={18} />
                  </button>
                )}
                {confession.status !== 'rejected' && (
                  <button 
                    onClick={() => updateStatus(confession.id, 'rejected')}
                    className="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-slate-950 rounded-lg transition-all"
                    title="Reject"
                  >
                    <X size={18} />
                  </button>
                )}
                <button 
                  onClick={() => deleteConfession(confession.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white rounded-xl transition-all font-bold text-xs uppercase tracking-widest border border-rose-500/20"
                  title="Delete Permanently"
                >
                  <Trash2 size={14} />
                  Delete Post
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
