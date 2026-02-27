export interface Confession {
  id: number;
  content: string;
  category: string;
  nickname: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  likes: number;
  reports_count: number;
}

export interface Comment {
  id: number;
  confession_id: number;
  content: string;
  nickname: string;
  created_at: string;
}

export const CATEGORIES = [
  { id: 'love', label: '❤️ Love & Crush', color: 'text-neon-pink' },
  { id: 'college', label: '🎓 College Life', color: 'text-neon-blue' },
  { id: 'mental', label: '🧠 Mental Health', color: 'text-neon-purple' },
  { id: 'funny', label: '😂 Funny', color: 'text-neon-green' },
  { id: 'secrets', label: '🤫 Secrets', color: 'text-slate-400' },
];
