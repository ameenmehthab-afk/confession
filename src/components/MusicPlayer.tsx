import React, { useState, useRef, useEffect } from 'react';
import { Music, Volume2, VolumeX, Play, Pause } from 'lucide-react';

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Using a royalty-free emotional piano track from a public source
  const musicUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; // Placeholder for emotional track

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
    }
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log("Autoplay blocked, user interaction needed"));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-800 p-2 rounded-full shadow-2xl">
      <audio ref={audioRef} src={musicUrl} loop />
      
      <button 
        onClick={togglePlay}
        className={`p-2 rounded-full transition-all ${isPlaying ? 'bg-neon-blue text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
        title={isPlaying ? "Pause Music" : "Play Emotional Music"}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </button>

      <button 
        onClick={toggleMute}
        className="p-2 text-slate-400 hover:text-white transition-colors"
      >
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>

      <div className="pr-3 flex items-center gap-2">
        <Music size={12} className={isPlaying ? "text-neon-blue animate-pulse" : "text-slate-600"} />
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hidden sm:inline">
          {isPlaying ? "Emotional Piano" : "Music Off"}
        </span>
      </div>
    </div>
  );
}
