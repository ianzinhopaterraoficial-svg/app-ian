import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PublicWebsite } from './components/PublicWebsite';
import { AppDashboard } from './components/AppDashboard';
import { AuthModal } from './components/AuthModal';
import { FloatingAudioPlayer } from './components/FloatingAudioPlayer';
import { Lock, Globe } from 'lucide-react';

function MainContent() {
  const { user, systemUser } = useAuth();
  const [view, setView] = useState<'site' | 'app'>('site');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // Auto-switch to app when user signs in if requested, or user can toggle anytime
  const handleOpenApp = () => {
    if (user || systemUser) {
      setView('app');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setAuthModalOpen(true);
    }
  };

  const handleBackToSite = () => {
    setView('site');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen">
      {/* Quick view switcher toggle pill */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-full shadow-lg border border-sky-200">
        <button
          onClick={() => setView('site')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold font-kids transition-all ${
            view === 'site' 
              ? 'bg-sky-500 text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Site</span>
        </button>

        <button
          onClick={handleOpenApp}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold font-kids transition-all ${
            view === 'app' 
              ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-sm' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Área do Ian</span>
          {(user || systemUser) && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          )}
        </button>
      </div>

      {view === 'site' ? (
        <PublicWebsite 
          onOpenApp={handleOpenApp} 
          onOpenAuthModal={() => setAuthModalOpen(true)} 
        />
      ) : (
        <AppDashboard 
          onBackToSite={handleBackToSite} 
          onOpenAuthModal={() => setAuthModalOpen(true)} 
        />
      )}

      {/* Floating Audio Player */}
      <FloatingAudioPlayer />

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setView('app');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
