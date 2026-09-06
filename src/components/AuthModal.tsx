import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, Heart, Stethoscope, GraduationCap, AlertCircle, Loader2, Copy, Check, AlertTriangle, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { 
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail, 
    switchRoleDemo, 
    loginAsPreset,
    isUnauthorizedDomain, 
    currentHost, 
    error, 
    clearError 
  } = useAuth();

  const [tab, setTab] = useState<'login' | 'signup' | 'demo'>('login');
  
  // Login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Sign up form
  const [name, setName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('parent');
  const [roleTitle, setRoleTitle] = useState('Família / Pai / Mãe');

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyHost = () => {
    const host = currentHost || (typeof window !== 'undefined' ? window.location.hostname : '');
    if (host && navigator.clipboard) {
      navigator.clipboard.writeText(host);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleQuickLogin = (role: UserRole, loginName?: string, loginEmail?: string, title?: string) => {
    loginAsPreset(role, loginEmail, loginName, title);
    if (onSuccess) onSuccess();
    onClose();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();
    if (!email || !password) {
      setFormError('Preencha seu e-mail e sua senha.');
      return;
    }

    try {
      setLoading(true);
      await signInWithEmail(email, password);
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setLoading(false);
      setFormError(err.message || 'Falha na autenticação.');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();
    if (!name || !signupEmail || !signupPassword) {
      setFormError('Por favor preencha todos os campos obrigatórios.');
      return;
    }
    if (signupPassword.length < 6) {
      setFormError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    try {
      setLoading(true);
      await signUpWithEmail(name, signupEmail, signupPassword, selectedRole, roleTitle);
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setLoading(false);
      setFormError(err.message || 'Falha no cadastro.');
    }
  };

  const handleGoogleLogin = async () => {
    setFormError(null);
    clearError();
    try {
      setLoading(true);
      await signInWithGoogle();
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setLoading(false);
      const isDomainErr = err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain');
      if (!isDomainErr) {
        setFormError('Não foi possível conectar com o Google no momento.');
      }
    }
  };

  const handleDemoAccess = (role: UserRole, demoName: string, demoTitle: string) => {
    switchRoleDemo(role, demoName, demoTitle);
    if (onSuccess) onSuccess();
    onClose();
  };

  const activeHost = currentHost || (typeof window !== 'undefined' ? window.location.hostname : '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl border-2 border-sky-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-sky-400 via-sky-500 to-indigo-600 p-6 text-white shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 rounded-2xl bg-white/20">
              <Lock className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold font-kids tracking-wider uppercase bg-white/20 px-3 py-1 rounded-full">
              Autenticação Segura
            </span>
          </div>
          
          <h3 className="text-2xl font-black font-kids">Área do Ian & Acompanhamento</h3>
          <p className="text-sky-100 text-xs mt-1">
            Acesse prontuário, relatórios de terapia, metas e evolução diária.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50/80 px-6 pt-3 text-sm font-bold font-kids shrink-0">
          <button
            onClick={() => { setTab('login'); setFormError(null); }}
            className={`pb-3 px-4 border-b-2 transition-all ${
              tab === 'login' 
                ? 'border-sky-500 text-sky-600 font-extrabold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => { setTab('signup'); setFormError(null); }}
            className={`pb-3 px-4 border-b-2 transition-all ${
              tab === 'signup' 
                ? 'border-sky-500 text-sky-600 font-extrabold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Criar Conta
          </button>
          <button
            onClick={() => { setTab('demo'); setFormError(null); }}
            className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-1.5 ${
              tab === 'demo' 
                ? 'border-amber-400 text-amber-600 font-extrabold' 
                : 'border-transparent text-amber-700/80 hover:text-amber-800'
            }`}
          >
            <span>⚡ Perfis Rápidos</span>
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="p-6 overflow-y-auto">
          {/* UNAUTHORIZED DOMAIN BANNER */}
          {isUnauthorizedDomain && (
            <div className="mb-4 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 animate-fadeIn">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="w-full">
                  <h4 className="font-bold text-xs uppercase tracking-wide text-amber-900 font-kids">
                    Domínio Não Autorizado no Firebase
                  </h4>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    O Firebase exige que o domínio do ambiente de visualização esteja na lista de domínios autorizados para o login com popup do Google.
                  </p>
                  
                  {/* Host display & copy */}
                  <div className="mt-2 flex items-center gap-2 bg-white/80 p-2 rounded-xl border border-amber-200">
                    <code className="text-[11px] font-mono font-bold text-slate-800 flex-1 truncate select-all">
                      {activeHost}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyHost}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-amber-700 mt-1.5">
                    <strong>Como liberar no Firebase:</strong> Acesse Firebase Console → <em>Authentication</em> → <em>Settings</em> → <em>Authorized domains</em> e adicione o domínio copiado.
                  </p>

                  {/* Instant 1-click fallback button */}
                  <div className="mt-3 pt-2.5 border-t border-amber-200">
                    <p className="text-[11px] font-bold text-amber-900 mb-1.5">
                      Enquanto isso, você pode entrar imediatamente com 1 clique:
                    </p>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('admin', 'Marcos Paterra', 'ianzinhopaterraoficial@gmail.com', 'Pai do Ian & Administrador')}
                      className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all font-kids"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Entrar Agora como Marcos Paterra (Pai & Admin)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Standard Form Error */}
          {!isUnauthorizedDomain && (formError || error) && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{formError || error}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 px-4 rounded-2xl border-2 border-slate-200 hover:border-sky-400 bg-white hover:bg-slate-50 flex items-center justify-center gap-3 text-slate-700 font-bold font-kids transition-all shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continuar com Google</span>
              </button>

              <div className="flex items-center my-3">
                <div className="flex-1 border-t border-slate-200"></div>
                <span className="px-3 text-xs text-slate-400 font-bold uppercase tracking-wider">ou com e-mail e senha</span>
                <div className="flex-1 border-t border-slate-200"></div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 font-kids">E-mail</label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ianzinhopaterraoficial@gmail.com"
                    className="w-full pl-11 pr-4 py-2.5 rounded-2xl border-2 border-slate-200 focus:border-sky-500 focus:outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 font-kids">Senha</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-2.5 rounded-2xl border-2 border-slate-200 focus:border-sky-500 focus:outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="blob-button bg-sky-500 hover:bg-sky-600 text-white w-full !py-3 font-bold shadow-lg shadow-sky-500/20 mt-2 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Entrar na Área do Ian</span>}
              </button>
            </form>
          )}

          {/* TAB 2: SIGNUP */}
          {tab === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 font-kids">Nome Completo</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Alessandra Paterra"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 font-kids">E-mail</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input 
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 font-kids">Senha (mínimo 6 dígitos)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input 
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-sky-500 focus:outline-none text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 font-kids">Seu Papel / Relação</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => { setSelectedRole('parent'); setRoleTitle('Família / Pai / Mãe'); }}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 font-bold text-left transition-all ${
                      selectedRole === 'parent' ? 'border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-300' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>Família (Pais)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setSelectedRole('therapist'); setRoleTitle('Profissional / Terapeuta'); }}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 font-bold text-left transition-all ${
                      selectedRole === 'therapist' ? 'border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-300' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Stethoscope className="w-4 h-4 text-indigo-500" />
                    <span>Terapeuta / Saúde</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setSelectedRole('school'); setRoleTitle('Professora / Escola'); }}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 font-bold text-left transition-all ${
                      selectedRole === 'school' ? 'border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-300' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-amber-500" />
                    <span>Escola / Professor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setSelectedRole('admin'); setRoleTitle('Administrador / Marcos Paterra'); }}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 font-bold text-left transition-all ${
                      selectedRole === 'admin' ? 'border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-300' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Administrador</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="blob-button bg-sky-500 hover:bg-sky-600 text-white w-full !py-2.5 font-bold shadow-md shadow-sky-500/20 mt-3 flex items-center justify-center gap-2 text-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Cadastrar e Acessar</span>}
              </button>
            </form>
          )}

          {/* TAB 3: DEMO QUICK ACCESS */}
          {tab === 'demo' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 mb-2">
                <p className="font-bold">Acesso Instantâneo para Demonstração:</p>
                <p className="text-[11px] mt-0.5">Clique em um dos perfis para entrar instantaneamente no sistema com todas as permissões correspondentes:</p>
              </div>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'Marcos Paterra', 'ianzinhopaterraoficial@gmail.com', 'Pai do Ian & Administrador Geral')}
                className="w-full p-3 rounded-2xl border-2 border-slate-100 hover:border-emerald-400 bg-white hover:bg-emerald-50/40 flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                    MP
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 group-hover:text-emerald-800">Marcos Paterra (Pai & Admin)</h4>
                    <p className="text-xs text-slate-500">Acesso total: Prontuário, Gestão e Edição</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-kids flex items-center gap-1">
                  <span>Acessar</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('parent', 'Alessandra Paterra', 'pais@ianzinhopaterraoficial.com.br', 'Mãe do Ian (Família)')}
                className="w-full p-3 rounded-2xl border-2 border-slate-100 hover:border-rose-400 bg-white hover:bg-rose-50/40 flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-bold">
                    AP
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 group-hover:text-rose-800">Alessandra Paterra (Mãe)</h4>
                    <p className="text-xs text-slate-500">Diário de rotina, fotos e acompanhamento familiar</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-kids flex items-center gap-1">
                  <span>Acessar</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('therapist', 'Dra. Karen Camargo', 'dra.karen@mundoazul.com.br', 'Neuropediatra')}
                className="w-full p-3 rounded-2xl border-2 border-slate-100 hover:border-sky-400 bg-white hover:bg-sky-50/40 flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold">
                    KC
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 group-hover:text-sky-800">Dra. Karen Camargo (Neuropediatra)</h4>
                    <p className="text-xs text-slate-500">Registro clínico e laudos neurológicos</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 font-kids flex items-center gap-1">
                  <span>Acessar</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('therapist', 'Letícia Onari', 'leticia.fono@mundoazul.com.br', 'Fonoaudióloga')}
                className="w-full p-3 rounded-2xl border-2 border-slate-100 hover:border-indigo-400 bg-white hover:bg-indigo-50/40 flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                    LO
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 group-hover:text-indigo-800">Letícia Onari (Fonoaudióloga)</h4>
                    <p className="text-xs text-slate-500">Evolução de linguagem e metas de comunicação</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 font-kids flex items-center gap-1">
                  <span>Acessar</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('school', 'Profª Mariana', 'escola@reinodasletras.com.br', 'Escola Reino das Letras')}
                className="w-full p-3 rounded-2xl border-2 border-slate-100 hover:border-amber-400 bg-white hover:bg-amber-50/40 flex items-center justify-between text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
                    PM
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 group-hover:text-amber-800">Profª Mariana (Pedagógico)</h4>
                    <p className="text-xs text-slate-500">Anotações de sala, socialização e recados</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-kids flex items-center gap-1">
                  <span>Acessar</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
