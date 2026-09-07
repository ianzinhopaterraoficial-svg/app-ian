import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PublicWebsite } from './components/PublicWebsite';
import { AppDashboard } from './components/AppDashboard';
import { AuthModal } from './components/AuthModal';
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
      <div 
        id="quick-view-switcher"
        className="flex fixed bottom-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] right-3 sm:bottom-6 sm:right-6 z-50 items-center gap-1.5 sm:gap-2 bg-white/95 backdrop-blur-md p-1 sm:p-1.5 rounded-full shadow-xl border border-sky-200 hover:shadow-2xl transition-all"
        style={{
          bottom: 'max(0.75rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))',
        }}
      >
        <button
          onClick={() => setView('site')}
          className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold font-kids transition-all ${
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
          className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold font-kids transition-all ${
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
