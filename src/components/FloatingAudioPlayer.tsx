import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Disc, Volume2, VolumeX } from 'lucide-react';

export const FloatingAudioPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.35);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;

    // Browser user interaction trigger
    const handleFirstClick = () => {
      if (audio && audio.paused) {
        audio.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {});
      }
      window.removeEventListener('click', handleFirstClick);
    };

    window.addEventListener('click', handleFirstClick, { once: true });
    return () => {
      window.removeEventListener('click', handleFirstClick);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.volume = isMuted ? 0 : volume;
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.log('Autoplay blocked:', err);
      });
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;

    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audio.muted = newMuted;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
      audioRef.current.muted = false;
      setIsMuted(false);
    }
  };

  return (
    <div 
      id="ian-widget-audio-player"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white/95 backdrop-blur-xl border-2 border-sky-400/40 p-2.5 pr-5 rounded-full shadow-2xl transition-all hover:scale-105 group font-sans select-none"
    >
      <audio 
        ref={audioRef}
        src="http://ianzinhopaterraoficial.com.br/wp-content/uploads/2026/07/the_mountain-kids-522483.mp3" 
        loop 
        preload="auto" 
      />

      {/* Main Play/Pause button */}
      <button 
        id="ian-widget-audio-toggle"
        onClick={togglePlay}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
          isPlaying 
            ? 'bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white shadow-lg shadow-sky-500/40 scale-105' 
            : 'bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/30'
        }`}
        title={isPlaying ? "Pausar música ambiente" : "Tocar música ambiente"}
      >
        <div className="relative flex items-center justify-center">
          {isPlaying ? (
            <>
              <Pause className="w-5 h-5 relative z-10 fill-white" />
              <span className="absolute -inset-1.5 rounded-full bg-sky-400/40 animate-ping opacity-75"></span>
            </>
          ) : (
            <Play className="w-5 h-5 ml-0.5 fill-white" />
          )}
        </div>
      </button>

      {/* Label and Equalizer */}
      <div className="flex flex-col text-left cursor-pointer" onClick={togglePlay}>
        <div className="flex items-center gap-1.5 text-xs font-black text-sky-900 font-kids">
          <Disc className={`w-4 h-4 text-sky-500 ${isPlaying ? 'animate-spin' : ''}`} />
          <span>Música do Ian</span>
          
          {isPlaying && (
            <span className="flex items-end gap-0.5 ml-1 h-3">
              <span className="w-1 bg-sky-500 rounded-full animate-bounce h-3"></span>
              <span className="w-1 bg-pink-500 rounded-full animate-bounce h-2 delay-100"></span>
              <span className="w-1 bg-amber-400 rounded-full animate-bounce h-3.5 delay-200"></span>
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold text-slate-500">
          {isPlaying ? '♪ Tocando Melodia Suave' : 'Clique para tocar som'}
        </span>
      </div>

      {/* Volume controls */}
      <div className="flex items-center gap-2 border-l border-slate-200 pl-3 ml-1">
        <button 
          onClick={toggleMute}
          className="text-slate-500 hover:text-sky-600 transition-colors p-1"
          title={isMuted ? "Ativar som" : "Mudo"}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-red-500" />
          ) : (
            <Volume2 className="w-4 h-4 text-slate-700" />
          )}
        </button>
        <input 
          type="range" 
          min="0" 
          max="0.8" 
          step="0.05" 
          value={isMuted ? 0 : volume} 
          onChange={handleVolumeChange}
          className="w-14 sm:w-16 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
          title="Ajustar Volume"
        />
      </div>
    </div>
  );
};
