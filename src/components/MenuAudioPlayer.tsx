import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Disc, Volume2, VolumeX } from 'lucide-react';

interface MenuAudioPlayerProps {
  variant?: 'navbar' | 'mobile';
  className?: string;
}

export const MenuAudioPlayer: React.FC<MenuAudioPlayerProps> = ({ 
  variant = 'navbar',
  className = '' 
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.35);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

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
        console.log('Audio play notice:', err);
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
    e.stopPropagation();
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
      audioRef.current.muted = false;
      setIsMuted(false);
    }
  };

  if (variant === 'mobile') {
    return (
      <div 
        id="ian-mobile-menu-audio"
        className={`p-3 bg-gradient-to-r from-sky-50 to-indigo-50/70 rounded-2xl border border-sky-100 flex items-center justify-between gap-3 ${className}`}
      >
        <audio 
          ref={audioRef}
          src="http://ianzinhopaterraoficial.com.br/wp-content/uploads/2026/07/the_mountain-kids-522483.mp3" 
          loop 
          preload="auto" 
        />

        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={togglePlay}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isPlaying 
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/30 scale-105' 
                : 'bg-sky-500 hover:bg-sky-600 text-white shadow-sm'
            }`}
            title={isPlaying ? "Pausar música" : "Tocar música"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 ml-0.5 fill-white" />
            )}
          </button>

          <div className="text-left cursor-pointer" onClick={togglePlay}>
            <div className="flex items-center gap-1.5 text-xs font-black text-sky-900 font-kids">
              <Disc className={`w-3.5 h-3.5 text-sky-500 ${isPlaying ? 'animate-spin' : ''}`} />
              <span>Música do Ian</span>
              {isPlaying && (
                <span className="flex items-end gap-0.5 ml-1 h-2.5">
                  <span className="w-1 bg-sky-500 rounded-full animate-bounce h-2.5"></span>
                  <span className="w-1 bg-pink-500 rounded-full animate-bounce h-1.5 delay-100"></span>
                  <span className="w-1 bg-amber-400 rounded-full animate-bounce h-2 delay-200"></span>
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              {isPlaying ? '♪ Tocando Melodia Suave' : 'Toque para ouvir'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 pr-1">
          <button 
            type="button"
            onClick={toggleMute}
            className="text-slate-500 hover:text-sky-600 p-1"
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
            className="w-14 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
            title="Ajustar Volume"
          />
        </div>
      </div>
    );
  }

  // Desktop Navbar Player (pill format)
  return (
    <div 
      id="ian-navbar-audio-player"
      className={`inline-flex items-center gap-2.5 bg-sky-50/90 hover:bg-sky-100/80 border border-sky-200/80 px-2.5 py-1.5 rounded-full transition-all duration-200 select-none ${className}`}
    >
      <audio 
        ref={audioRef}
        src="http://ianzinhopaterraoficial.com.br/wp-content/uploads/2026/07/the_mountain-kids-522483.mp3" 
        loop 
        preload="auto" 
      />

      {/* Play/Pause Button */}
      <button 
        type="button"
        onClick={togglePlay}
        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
          isPlaying 
            ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-sm scale-105' 
            : 'bg-sky-500 hover:bg-sky-600 text-white shadow-sm'
        }`}
        title={isPlaying ? "Pausar música do Ian" : "Tocar música do Ian"}
      >
        {isPlaying ? (
          <Pause className="w-3 h-3 fill-white" />
        ) : (
          <Play className="w-3 h-3 ml-0.5 fill-white" />
        )}
      </button>

      {/* Label and Equalizer */}
      <div className="flex flex-col text-left cursor-pointer" onClick={togglePlay}>
        <div className="flex items-center gap-1 text-[11px] font-black text-sky-900 font-kids leading-none">
          <Disc className={`w-3 h-3 text-sky-500 ${isPlaying ? 'animate-spin' : ''}`} />
          <span>Música do Ian</span>
          
          {isPlaying && (
            <span className="flex items-end gap-0.5 ml-0.5 h-2.5">
              <span className="w-0.5 bg-sky-500 rounded-full animate-bounce h-2.5"></span>
              <span className="w-0.5 bg-pink-500 rounded-full animate-bounce h-1.5 delay-100"></span>
              <span className="w-0.5 bg-amber-400 rounded-full animate-bounce h-2 delay-200"></span>
            </span>
          )}
        </div>
        <span className="text-[9px] font-bold text-slate-500 leading-tight mt-0.5">
          {isPlaying ? '♪ Melodia Suave' : 'Clique p/ som'}
        </span>
      </div>

      {/* Volume slider & mute */}
      <div className="flex items-center gap-1 border-l border-sky-200/80 pl-2 ml-0.5">
        <button 
          type="button"
          onClick={toggleMute}
          className="text-slate-500 hover:text-sky-600 transition-colors p-0.5"
          title={isMuted ? "Ativar som" : "Mudo"}
        >
          {isMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-red-500" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-slate-600" />
          )}
        </button>
        <input 
          type="range" 
          min="0" 
          max="0.8" 
          step="0.05" 
          value={isMuted ? 0 : volume} 
          onChange={handleVolumeChange}
          className="w-12 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
          title="Ajustar Volume"
        />
      </div>
    </div>
  );
};
