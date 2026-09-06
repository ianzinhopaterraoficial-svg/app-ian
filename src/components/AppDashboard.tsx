import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Smile, 
  Sparkles, 
  FileText, 
  GraduationCap, 
  Stethoscope, 
  Heart, 
  LogOut, 
  Award, 
  Activity, 
  Phone, 
  AlertCircle, 
  ShieldCheck, 
  ChevronRight,
  TrendingUp,
  Music,
  Brain,
  Layers,
  Baby,
  Cloud
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  initialChildData, 
  initialSessions, 
  initialGoals, 
  initialAchievements, 
  initialSchoolRecords, 
  initialAgenda, 
  initialDocuments 
} from '../lib/firebase';
import { 
  seedFirestoreIfEmpty,
  subscribeToChild,
  saveChildToFirestore,
  subscribeToSessions,
  addSessionToFirestore,
  subscribeToGoals,
  addGoalToFirestore,
  updateGoalLevelInFirestore,
  subscribeToSchoolRecords,
  addSchoolRecordToFirestore,
  subscribeToAgenda,
  addAgendaEventToFirestore,
  toggleAgendaInFirestore,
  subscribeToAchievements,
  subscribeToDocuments
} from '../lib/firebaseSync';
import { Child, TherapySession, Goal, Achievement, DiaryRecord, SchoolRecord, AgendaEvent, DocumentRecord, UserRole } from '../types';
import { DailyObservationsDiary } from './DailyObservationsDiary';

interface AppDashboardProps {
  onBackToSite: () => void;
  onOpenAuthModal: () => void;
}

export const AppDashboard: React.FC<AppDashboardProps> = ({ onBackToSite, onOpenAuthModal }) => {
  const { user, systemUser, signOut, switchRoleDemo, isParent, isTherapist, isSchool, isAdmin } = useAuth();
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'prontuario' | 'sessoes' | 'metas' | 'diario' | 'escola' | 'agenda' | 'conquistas' | 'documentos'>('prontuario');

  // Entities state
  const [childData, setChildData] = useState<Child>(initialChildData);
  const [sessions, setSessions] = useState<TherapySession[]>(initialSessions);
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [schoolRecords, setSchoolRecords] = useState<SchoolRecord[]>(initialSchoolRecords);
  const [agenda, setAgenda] = useState<AgendaEvent[]>(initialAgenda);
  const [documents, setDocuments] = useState<DocumentRecord[]>(initialDocuments);
  const [isFirebaseSynced, setIsFirebaseSynced] = useState<boolean>(true);

  // Synchronize with Firebase Firestore on mount
  useEffect(() => {
    // Initial seed if documents are missing
    seedFirestoreIfEmpty();

    // Listeners for live real-time sync across devices
    const unsubChild = subscribeToChild(initialChildData.id, (data) => {
      setChildData(data);
      setIsFirebaseSynced(true);
    });
    const unsubSessions = subscribeToSessions(initialChildData.id, (data) => {
      setSessions(data);
      setIsFirebaseSynced(true);
    });
    const unsubGoals = subscribeToGoals(initialChildData.id, (data) => {
      setGoals(data);
      setIsFirebaseSynced(true);
    });
    const unsubAchievements = subscribeToAchievements(initialChildData.id, (data) => {
      setAchievements(data);
      setIsFirebaseSynced(true);
    });
    const unsubSchool = subscribeToSchoolRecords(initialChildData.id, (data) => {
      setSchoolRecords(data);
      setIsFirebaseSynced(true);
    });
    const unsubAgenda = subscribeToAgenda(initialChildData.id, (data) => {
      setAgenda(data);
      setIsFirebaseSynced(true);
    });
    const unsubDocs = subscribeToDocuments(initialChildData.id, (data) => {
      setDocuments(data);
      setIsFirebaseSynced(true);
    });

    return () => {
      unsubChild();
      unsubSessions();
      unsubGoals();
      unsubAchievements();
      unsubSchool();
      unsubAgenda();
      unsubDocs();
    };
  }, []);

  // Modals for new entries
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [showAgendaModal, setShowAgendaModal] = useState(false);
  const [showEditProntuario, setShowEditProntuario] = useState(false);

  // Forms states
  const [newSession, setNewSession] = useState({
    professionalName: systemUser?.name || 'Dra. Karen Camargo',
    role: systemUser?.roleTitle || 'Neuropediatra',
    date: new Date().toLocaleDateString('pt-BR'),
    time: '14:00',
    goalCategory: 'Comunicação & Comportamento',
    activities: '',
    evolution: '',
    nextGoals: '',
    difficulties: '',
    recommendations: ''
  });

  const [newGoal, setNewGoal] = useState({
    name: '',
    cat: 'Comunicação',
    nivel: 50,
    description: '',
    responsibleProf: systemUser?.name || 'Equipe Multidisciplinar'
  });

  const [newSchool, setNewSchool] = useState({
    date: new Date().toLocaleDateString('pt-BR'),
    teacher: systemUser?.name || 'Profª Mariana',
    atividade: '',
    participacao: 'Boa participação nas atividades em grupo',
    socializacao: 'Interagiu bem com os colegas de sala',
    comunicacao: 'Utilizou apoio visual para pedir lanche',
    autonomia: 'Conseguiu guardar o material',
    conquista: '',
    observacoes: '',
    recadoPais: ''
  });

  const [newAgenda, setNewAgenda] = useState({
    day: 'Segunda-feira',
    date: new Date().toLocaleDateString('pt-BR'),
    time: '14:00',
    tipo: 'Terapia Ocupacional',
    who: 'Edinéia Almeida',
    local: 'Clínica Mundo Azul'
  });

  // Confetti celebration function
  const triggerCelebration = (title: string) => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Handlers for adding new items
  const handleSaveProntuario = async () => {
    await saveChildToFirestore(childData);
    setShowEditProntuario(false);
    triggerCelebration('Prontuário atualizado no Firestore');
  };

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSession.activities || !newSession.evolution) return;
    const sessionPayload = {
      childId: childData.id,
      professionalId: systemUser?.id || 'prof-01',
      professionalName: newSession.professionalName,
      role: newSession.role,
      date: newSession.date,
      time: newSession.time,
      goalCategory: newSession.goalCategory,
      activities: newSession.activities,
      evolution: newSession.evolution,
      nextGoals: newSession.nextGoals,
      behaviorsObserved: 'Participativo e focado.',
      childResponse: 'Boa resposta aos reforçadores.',
      difficulties: newSession.difficulties,
      recommendations: newSession.recommendations,
      createdAt: new Date().toISOString()
    };
    const saved = await addSessionToFirestore(sessionPayload);
    setSessions(prev => [saved, ...prev.filter(s => s.id !== saved.id)]);
    setShowSessionModal(false);
    triggerCelebration('Sessão registrada no Firestore');
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.name) return;
    const goalPayload = {
      childId: childData.id,
      name: newGoal.name,
      cat: newGoal.cat,
      nivel: Number(newGoal.nivel),
      description: newGoal.description,
      responsibleProf: newGoal.responsibleProf,
      status: 'in_progress' as const,
      updatedAt: new Date().toISOString()
    };
    const saved = await addGoalToFirestore(goalPayload);
    setGoals(prev => [...prev.filter(g => g.id !== saved.id), saved]);
    setShowGoalModal(false);
    triggerCelebration('Meta salva no Firestore');
  };

  const handleUpdateGoalLevel = async (goalId: string, delta: number) => {
    const target = goals.find(g => g.id === goalId);
    if (!target) return;
    const next = Math.max(0, Math.min(100, target.nivel + delta));
    setGoals(goals.map(g => g.id === goalId ? { ...g, nivel: next, status: next === 100 ? 'achieved' : 'in_progress', updatedAt: new Date().toISOString() } : g));
    await updateGoalLevelInFirestore(goalId, next);
  };

  const handleAddSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    const schPayload = {
      childId: childData.id,
      date: newSchool.date,
      teacher: newSchool.teacher,
      atividade: newSchool.atividade,
      participacao: newSchool.participacao,
      socializacao: newSchool.socializacao,
      comunicacao: newSchool.comunicacao,
      autonomia: newSchool.autonomia,
      conquista: newSchool.conquista,
      observacoes: newSchool.observacoes,
      recadoPais: newSchool.recadoPais,
      createdAt: new Date().toISOString()
    };
    const saved = await addSchoolRecordToFirestore(schPayload);
    setSchoolRecords(prev => [saved, ...prev.filter(r => r.id !== saved.id)]);
    setShowSchoolModal(false);
    triggerCelebration('Registro escolar salvo no Firestore');
  };

  const handleAddAgenda = async (e: React.FormEvent) => {
    e.preventDefault();
    const agPayload = {
      childId: childData.id,
      day: newAgenda.day,
      date: newAgenda.date,
      time: newAgenda.time,
      tipo: newAgenda.tipo,
      who: newAgenda.who,
      local: newAgenda.local,
      status: 'agendado' as const,
      completed: false
    };
    const saved = await addAgendaEventToFirestore(agPayload);
    setAgenda(prev => [...prev.filter(a => a.id !== saved.id), saved]);
    setShowAgendaModal(false);
    triggerCelebration('Atendimento agendado no Firestore');
  };

  const toggleAgendaCompleted = async (id: string) => {
    const target = agenda.find(a => a.id === id);
    if (!target) return;
    const newCompleted = !target.completed;
    setAgenda(agenda.map(a => a.id === id ? { ...a, completed: newCompleted, status: newCompleted ? 'realizado' : 'agendado' } : a));
    await toggleAgendaInFirestore(id, newCompleted);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAF5FC] via-[#F4FBFF] to-[#EAF5FC] text-slate-800 font-sans pb-20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-sky-100 shadow-sm px-4 md:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToSite}
              className="p-2 rounded-2xl bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors flex items-center gap-1.5 text-xs font-bold font-kids"
              title="Voltar ao portal público"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Site</span>
            </button>

            <div className="h-6 w-px bg-slate-200"></div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                IP
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-black font-kids text-slate-900 leading-none">
                    Central do Ian
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold font-kids">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    <Cloud className="w-2.5 h-2.5" />
                    <span>Firebase Ao Vivo</span>
                  </span>
                </div>
                <span className="text-[10px] text-sky-600 font-bold">Acompanhamento Multidisciplinar</span>
              </div>
            </div>
          </div>

          {/* User Profile & Demo Switcher */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Quick Demo Switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-full text-[11px] font-bold font-kids">
              <span className="px-2 text-slate-400">Ver como:</span>
              <button
                onClick={() => switchRoleDemo('admin', 'Marcos Paterra', 'Pai & Administrador')}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  systemUser?.role === 'admin' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pai (Admin)
              </button>
              <button
                onClick={() => switchRoleDemo('therapist', 'Dra. Karen Camargo', 'Neuropediatra')}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  systemUser?.role === 'therapist' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Terapeuta
              </button>
              <button
                onClick={() => switchRoleDemo('school', 'Profª Mariana', 'Escola')}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  systemUser?.role === 'school' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Escola
              </button>
            </div>

            {/* Current user pill */}
            <div className="flex items-center gap-2 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {systemUser?.name || user?.displayName || 'Marcos Paterra'}
                </p>
                <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-sky-100 text-sky-800">
                  {systemUser?.roleTitle || 'Pai do Ian & Administrador'}
                </span>
              </div>

              <button
                onClick={() => signOut()}
                className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Desconectar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Child Summary Banner */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
        <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border-2 border-sky-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-sky-100/50 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left z-10">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-4 border-white shadow-lg bg-sky-100 shrink-0">
              <img 
                src="https://ianzinhopaterraoficial.com.br/wp-content/uploads/2026/07/ianfone.png" 
                alt="Ian Paterra" 
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                <h2 className="text-2xl sm:text-3xl font-black font-kids text-slate-900">
                  {childData.name}
                </h2>
                <span className="px-3 py-0.5 rounded-full bg-brand-blue-light text-brand-blue-dark font-kids text-xs font-bold">
                  {childData.age}
                </span>
                <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-kids text-xs font-bold">
                  Tipo {childData.bloodType}
                </span>
              </div>

              <p className="text-sm font-semibold text-slate-600 mb-1">
                <strong>Diagnóstico:</strong> {childData.diagnosis}
              </p>
              <p className="text-xs text-slate-500">
                <strong>Pais:</strong> {childData.parents} • <strong>Escola:</strong> {childData.schoolName}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 z-10 w-full sm:w-auto justify-around sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
            <div className="text-center px-3 py-2 rounded-2xl bg-sky-50 border border-sky-100 min-w-20">
              <span className="block text-xl font-black text-sky-600 font-kids">{sessions.length}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Sessões</span>
            </div>
            <div className="text-center px-3 py-2 rounded-2xl bg-emerald-50 border border-emerald-100 min-w-20">
              <span className="block text-xl font-black text-emerald-600 font-kids">{goals.length}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Metas PEI</span>
            </div>
            <div className="text-center px-3 py-2 rounded-2xl bg-pink-50 border border-pink-100 min-w-20">
              <span className="block text-xl font-black text-pink-600 font-kids">{achievements.length}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Marcos</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none font-kids text-xs font-bold">
          <button
            onClick={() => setActiveTab('prontuario')}
            className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'prontuario' 
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' 
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Prontuário & Perfil</span>
          </button>

          <button
            onClick={() => setActiveTab('sessoes')}
            className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'sessoes' 
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' 
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Sessões & Terapias ({sessions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('metas')}
            className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'metas' 
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' 
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Metas PEI ({goals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('diario')}
            className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'diario' 
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' 
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Diário de Observações (Pais & Terapeutas)</span>
          </button>

          <button
            onClick={() => setActiveTab('escola')}
            className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'escola' 
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' 
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-500" />
            <span>Escola & Pedagógico</span>
          </button>

          <button
            onClick={() => setActiveTab('agenda')}
            className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'agenda' 
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' 
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>Agenda ({agenda.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('conquistas')}
            className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'conquistas' 
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' 
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Award className="w-4 h-4 text-pink-500" />
            <span>Conquistas & Celebração</span>
          </button>

          <button
            onClick={() => setActiveTab('documentos')}
            className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'documentos' 
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' 
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Laudos & Documentos</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
        {/* ========================================================================= */}
        {/* TAB 1: PRONTUÁRIO & DADOS CLÍNICOS */}
        {/* ========================================================================= */}
        {activeTab === 'prontuario' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-2xl bg-sky-100 text-sky-700">
                      <Baby className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-xl font-black font-kids text-slate-900">Identificação & Prontuário</h3>
                      <p className="text-xs text-slate-500">Dados cadastrais e referências médicas</p>
                    </div>
                  </div>
                  {isParent && (
                    <button
                      onClick={() => setShowEditProntuario(!showEditProntuario)}
                      className="text-xs font-bold font-kids text-sky-600 hover:text-sky-800 bg-sky-50 px-3 py-1.5 rounded-xl"
                    >
                      {showEditProntuario ? 'Fechar Edição' : 'Editar Dados'}
                    </button>
                  )}
                </div>

                {showEditProntuario ? (
                  <div className="space-y-4 text-xs font-bold font-kids">
                    <div>
                      <label className="text-slate-600 mb-1 block">Nome da Criança</label>
                      <input 
                        type="text" 
                        value={childData.name} 
                        onChange={e => setChildData({ ...childData, name: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 font-sans"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 mb-1 block">Diagnóstico & Responsável</label>
                      <input 
                        type="text" 
                        value={childData.diagnosis} 
                        onChange={e => setChildData({ ...childData, diagnosis: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 font-sans"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 mb-1 block">Contato de Emergência</label>
                      <input 
                        type="text" 
                        value={childData.emergencyContact} 
                        onChange={e => setChildData({ ...childData, emergencyContact: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 font-sans"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 mb-1 block">Alergias & Restrições</label>
                      <input 
                        type="text" 
                        value={childData.allergies} 
                        onChange={e => setChildData({ ...childData, allergies: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 font-sans"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 mb-1 block">Notas do Desenvolvimento</label>
                      <textarea 
                        rows={3}
                        value={childData.notes} 
                        onChange={e => setChildData({ ...childData, notes: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 font-sans"
                      />
                    </div>
                    <button
                      onClick={handleSaveProntuario}
                      className="blob-button bg-emerald-500 text-white !py-2 !px-4 text-xs font-bold font-kids shadow-sm hover:bg-emerald-600 transition-colors"
                    >
                      Salvar Alterações no Firestore
                    </button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 block uppercase">Nascimento</span>
                      <p className="font-bold text-slate-800">{childData.birthDateFull} ({childData.age})</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 block uppercase">Pais / Responsáveis</span>
                      <p className="font-bold text-slate-800">{childData.parents}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 block uppercase">Emergência</span>
                      <p className="font-bold text-slate-800">{childData.emergencyContact}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400 block uppercase">Escola Atual</span>
                      <p className="font-bold text-slate-800">{childData.schoolName}</p>
                    </div>

                    <div className="sm:col-span-2 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60">
                      <span className="text-[11px] font-bold text-amber-700 block uppercase">Alergias & Cuidados</span>
                      <p className="font-medium text-slate-700 text-xs mt-0.5">{childData.allergies}</p>
                    </div>

                    <div className="sm:col-span-2 p-4 rounded-2xl bg-sky-50/50 border border-sky-100">
                      <span className="text-[11px] font-bold text-sky-700 block uppercase">Perfil e Estilo de Aprendizagem</span>
                      <p className="font-medium text-slate-700 text-xs mt-0.5 leading-relaxed">{childData.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Equipe Multidisciplinar vinculada */}
              <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-black font-kids text-slate-900 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-sky-500" />
                  <span>Equipe Multidisciplinar Responsável</span>
                </h3>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-3">
                    <img src="http://ianzinhopaterraoficial.com.br/wp-content/uploads/2026/07/karen-1.jpg" className="w-10 h-10 rounded-full object-cover" alt="" />
                    <div>
                      <p className="font-bold text-slate-800">Dra. Karen Camargo</p>
                      <span className="text-[11px] text-sky-600 font-bold">Neuropediatra (Diagnóstico)</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-3">
                    <img src="http://ianzinhopaterraoficial.com.br/wp-content/uploads/2026/07/leticia-fono-1.jpg" className="w-10 h-10 rounded-full object-cover" alt="" />
                    <div>
                      <p className="font-bold text-slate-800">Letícia Onari</p>
                      <span className="text-[11px] text-sky-600 font-bold">Fonoaudióloga</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-3">
                    <img src="http://ianzinhopaterraoficial.com.br/wp-content/uploads/2026/07/edneia-TO-1.jpg" className="w-10 h-10 rounded-full object-cover" alt="" />
                    <div>
                      <p className="font-bold text-slate-800">Edinéia Almeida</p>
                      <span className="text-[11px] text-sky-600 font-bold">Terapeuta Ocupacional (T.O.)</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-3">
                    <img src="http://ianzinhopaterraoficial.com.br/wp-content/uploads/2026/07/barbara-musiciterapia-1.jpg" className="w-10 h-10 rounded-full object-cover" alt="" />
                    <div>
                      <p className="font-bold text-slate-800">Barbara Momberg</p>
                      <span className="text-[11px] text-sky-600 font-bold">Musicoterapeuta</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-3 sm:col-span-2">
                    <img src="http://ianzinhopaterraoficial.com.br/wp-content/uploads/2026/07/marcelo-psicologo-1.jpg" className="w-10 h-10 rounded-full object-cover" alt="" />
                    <div>
                      <p className="font-bold text-slate-800">Marcelo Cardoso</p>
                      <span className="text-[11px] text-sky-600 font-bold">Psicólogo ABA & Comportamental</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar with Quick Actions & Highlights */}
            <div className="space-y-6">
              <div className="bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-[2rem] p-6 text-white shadow-lg">
                <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 px-3 py-1 rounded-full font-kids">
                  Acompanhamento Integrado
                </span>
                <h4 className="text-xl font-black font-kids mt-3">Comunicação Unificada</h4>
                <p className="text-sky-100 text-xs mt-2 leading-relaxed">
                  Todas as anotações feitas aqui são acessíveis imediatamente pelos pais Marcos e Alessandra e por toda a equipe que cuida do Ian.
                </p>
                <div className="mt-4 pt-4 border-t border-white/20 flex flex-col gap-2">
                  <button
                    onClick={() => setActiveTab('sessoes')}
                    className="w-full py-2 px-3 rounded-xl bg-white text-indigo-900 font-bold font-kids text-xs hover:bg-sky-50 transition-colors text-center"
                  >
                    Registrar Evolução →
                  </button>
                  <button
                    onClick={() => setActiveTab('diario')}
                    className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold font-kids text-xs transition-colors text-center"
                  >
                    Preencher Diário de Hoje
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm">
                <h4 className="font-black font-kids text-slate-800 text-sm mb-3">
                  Próximos Compromissos
                </h4>
                <div className="space-y-2.5">
                  {agenda.slice(0, 3).map(ag => (
                    <div key={ag.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-700">
                        <span>{ag.tipo}</span>
                        <span className="text-sky-600 font-kids">{ag.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{ag.who} • {ag.day}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SESSÕES & EVOLUÇÃO MULTIDISCIPLINAR */}
        {/* ========================================================================= */}
        {activeTab === 'sessoes' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200">
              <div>
                <h3 className="text-2xl font-black font-kids text-slate-900">Histórico de Atendimentos & Terapias</h3>
                <p className="text-xs text-slate-500 mt-0.5">Evoluções registradas pela Neuropediatria, Fonoaudiologia, T.O., Musicoterapia e Psicologia</p>
              </div>

              {(isTherapist || isAdmin) && (
                <button
                  onClick={() => setShowSessionModal(true)}
                  className="blob-button bg-sky-500 text-white !py-2.5 !px-5 text-xs font-bold shadow-md shadow-sky-500/20"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  <span>Novo Registro de Atendimento</span>
                </button>
              )}
            </div>

            {/* Sessions List */}
            <div className="space-y-4">
              {sessions.map(sess => (
                <div key={sess.id} className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm hover:border-sky-300 transition-all">
                  <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold font-kids text-sm">
                        {sess.professionalName.split(' ')[0][0]}
                        {sess.professionalName.split(' ')[1] ? sess.professionalName.split(' ')[1][0] : ''}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black font-kids text-base text-slate-900">{sess.professionalName}</h4>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-kids">
                            {sess.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">Área: {sess.goalCategory}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-bold font-kids text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {sess.date}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {sess.time}</span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4 text-xs">
                    <div className="space-y-3">
                      <div>
                        <span className="font-bold text-slate-400 uppercase text-[10px] block">Atividades Realizadas</span>
                        <p className="text-slate-700 leading-relaxed mt-0.5">{sess.activities}</p>
                      </div>
                      <div>
                        <span className="font-bold text-sky-600 uppercase text-[10px] block">Evolução Observada</span>
                        <p className="text-slate-800 font-medium leading-relaxed mt-0.5 bg-sky-50/60 p-3 rounded-xl border border-sky-100">
                          {sess.evolution}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {sess.difficulties && (
                        <div>
                          <span className="font-bold text-amber-600 uppercase text-[10px] block">Desafios / Dificuldades</span>
                          <p className="text-slate-700 leading-relaxed mt-0.5">{sess.difficulties}</p>
                        </div>
                      )}
                      {sess.recommendations && (
                        <div>
                          <span className="font-bold text-emerald-600 uppercase text-[10px] block">Orientações para a Família & Escola</span>
                          <p className="text-slate-700 leading-relaxed mt-0.5 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                            {sess.recommendations}
                          </p>
                        </div>
                      )}
                      {sess.nextGoals && (
                        <div>
                          <span className="font-bold text-indigo-600 uppercase text-[10px] block">Próximos Objetivos da Terapia</span>
                          <p className="text-slate-700 leading-relaxed mt-0.5">{sess.nextGoals}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: METAS & PEI */}
        {/* ========================================================================= */}
        {activeTab === 'metas' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200">
              <div>
                <h3 className="text-2xl font-black font-kids text-slate-900">Plano Educacional Individualizado (PEI)</h3>
                <p className="text-xs text-slate-500 mt-0.5">Metas terapêuticas e acompanhamento de progresso em porcentagem</p>
              </div>

              {(isTherapist || isAdmin || isParent) && (
                <button
                  onClick={() => setShowGoalModal(true)}
                  className="blob-button bg-emerald-500 text-white !py-2.5 !px-5 text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  <span>Adicionar Nova Meta</span>
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {goals.map(goal => (
                <div key={goal.id} className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold font-kids bg-sky-100 text-sky-800">
                        {goal.cat}
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        goal.status === 'achieved' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {goal.status === 'achieved' ? 'Conquistado 🎉' : 'Em Progresso'}
                      </span>
                    </div>

                    <h4 className="text-lg font-black font-kids text-slate-900 mb-1">{goal.name}</h4>
                    <p className="text-xs text-slate-600 mb-4 leading-relaxed">{goal.description}</p>
                    <p className="text-[11px] text-slate-400 mb-4 font-bold">Responsável: {goal.responsibleProf}</p>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold font-kids mb-1.5">
                      <span className="text-slate-500">Progresso atual</span>
                      <span className="text-sky-600 text-sm">{goal.nivel}%</span>
                    </div>

                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          goal.nivel >= 90 ? 'bg-emerald-500' : goal.nivel >= 60 ? 'bg-sky-500' : 'bg-amber-400'
                        }`}
                        style={{ width: `${goal.nivel}%` }}
                      ></div>
                    </div>

                    {/* Progress adjustments */}
                    {(isTherapist || isAdmin || isParent) && (
                      <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => handleUpdateGoalLevel(goal.id, -5)}
                          className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold"
                          title="Diminuir 5%"
                        >
                          -5%
                        </button>
                        <button
                          onClick={() => handleUpdateGoalLevel(goal.id, 5)}
                          className="px-2 py-1 rounded-lg bg-sky-100 text-sky-700 hover:bg-sky-200 text-xs font-bold"
                          title="Aumentar 5%"
                        >
                          +5%
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: DIÁRIO DE OBSERVAÇÕES DIÁRIAS (PAIS & TERAPEUTAS) COM FIRESTORE */}
        {/* ========================================================================= */}
        {activeTab === 'diario' && (
          <DailyObservationsDiary childId={childData.id} childName={childData.name} />
        )}

        {/* ========================================================================= */}
        {/* TAB 5: ESCOLA & PEDAGÓGICO */}
        {/* ========================================================================= */}
        {activeTab === 'escola' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200">
              <div>
                <h3 className="text-2xl font-black font-kids text-slate-900">Comunicação Escola & Família</h3>
                <p className="text-xs text-slate-500 mt-0.5">Caderno pedagógico virtual — registros da equipe escolar ({childData.schoolName})</p>
              </div>

              {(isSchool || isAdmin) && (
                <button
                  onClick={() => setShowSchoolModal(true)}
                  className="blob-button bg-amber-500 text-white !py-2.5 !px-5 text-xs font-bold shadow-md shadow-amber-500/20"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  <span>Novo Registro Escolar</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {schoolRecords.map(sch => (
                <div key={sch.id} className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="font-black font-kids text-slate-900 text-sm">{sch.teacher}</h4>
                      <span className="text-[11px] text-slate-400">Data: {sch.date}</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold font-kids">
                      Escola Reino das Letras
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mt-4 text-xs">
                    <div>
                      <span className="font-bold text-slate-400 block uppercase text-[10px]">Atividades Pedagógicas</span>
                      <p className="text-slate-700 mt-0.5">{sch.atividade}</p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-400 block uppercase text-[10px]">Socialização & Colegas</span>
                      <p className="text-slate-700 mt-0.5">{sch.socializacao}</p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-400 block uppercase text-[10px]">Comunicação em Sala</span>
                      <p className="text-slate-700 mt-0.5">{sch.comunicacao}</p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-400 block uppercase text-[10px]">Autonomia</span>
                      <p className="text-slate-700 mt-0.5">{sch.autonomia}</p>
                    </div>

                    {sch.conquista && (
                      <div className="sm:col-span-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                        <span className="font-bold text-amber-800 block uppercase text-[10px]">Conquista Escolar</span>
                        <p className="text-slate-800 font-medium mt-0.5">{sch.conquista}</p>
                      </div>
                    )}

                    {sch.recadoPais && (
                      <div className="sm:col-span-2 p-3 bg-sky-50 rounded-xl border border-sky-200">
                        <span className="font-bold text-sky-800 block uppercase text-[10px]">Recado para os Pais</span>
                        <p className="text-slate-800 mt-0.5">{sch.recadoPais}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: AGENDA DE TERAPIAS */}
        {/* ========================================================================= */}
        {activeTab === 'agenda' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200">
              <div>
                <h3 className="text-2xl font-black font-kids text-slate-900">Agenda de Terapias & Consultas</h3>
                <p className="text-xs text-slate-500 mt-0.5">Programação semanal de atendimentos e compromissos</p>
              </div>

              {(isParent || isTherapist || isAdmin) && (
                <button
                  onClick={() => setShowAgendaModal(true)}
                  className="blob-button bg-indigo-500 text-white !py-2.5 !px-5 text-xs font-bold shadow-md shadow-indigo-500/20"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  <span>Agendar Atendimento</span>
                </button>
              )}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {agenda.map(item => (
                <div key={item.id} className="bg-white rounded-[2rem] p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full font-kids">
                        {item.day}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.completed ? 'Realizado ✓' : 'Agendado'}
                      </span>
                    </div>

                    <h4 className="text-base font-black font-kids text-slate-900">{item.tipo}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{item.who}</p>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-medium">
                      <span>{item.local}</span>
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-sky-600 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {item.time} ({item.date})
                    </span>

                    <button
                      onClick={() => toggleAgendaCompleted(item.id)}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                        item.completed ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      title="Marcar como realizado"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: ÁLBUM DE CONQUISTAS & CELEBRAÇÃO */}
        {/* ========================================================================= */}
        {activeTab === 'conquistas' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200">
              <div>
                <h3 className="text-2xl font-black font-kids text-slate-900">Marcos & Conquistas Comemoradas</h3>
                <p className="text-xs text-slate-500 mt-0.5">Cada passo do Ian é uma vitória enorme cheia de orgulho e esperança</p>
              </div>

              <button
                onClick={() => triggerCelebration('Parabéns Ian!')}
                className="blob-button bg-gradient-to-r from-pink-500 to-amber-500 text-white !py-2.5 !px-5 text-xs font-bold shadow-lg"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                <span>Soltar Chuva de Confetes 🎊</span>
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {achievements.map(ach => (
                <div key={ach.id} className="kid-card flex flex-col justify-between">
                  <div>
                    {ach.photoUrl && (
                      <div className="relative aspect-4/3 rounded-2xl overflow-hidden mb-4 border border-slate-100 shadow-inner">
                        <img src={ach.photoUrl} alt={ach.title} className="w-full h-full object-cover" />
                        <div className="absolute top-3 right-3 text-xl bg-white/90 p-1 rounded-xl shadow-sm">
                          {ach.emoji}
                        </div>
                      </div>
                    )}
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 font-kids">
                      {ach.cat}
                    </span>
                    <h4 className="text-lg font-black font-kids text-slate-900 mt-2 mb-1">{ach.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{ach.desc}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold">{ach.date}</span>
                    <button
                      onClick={() => triggerCelebration(ach.title)}
                      className="text-xs font-bold font-kids text-pink-600 hover:text-pink-800 bg-pink-50 px-2.5 py-1 rounded-xl"
                    >
                      Comemorar 🎉
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: DOCUMENTOS & LAUDOS */}
        {/* ========================================================================= */}
        {activeTab === 'documentos' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200">
              <h3 className="text-2xl font-black font-kids text-slate-900">Laudos Médicos, Relatórios & PEI</h3>
              <p className="text-xs text-slate-500 mt-0.5">Armazenamento digital seguro de documentos clínicos e pedagógicos</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map(doc => (
                <div key={doc.id} className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mb-3">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-kids">
                      {doc.cat}
                    </span>
                    <h4 className="text-base font-black font-kids text-slate-900 mt-2">{doc.nome}</h4>
                    <p className="text-xs text-slate-500 mt-1">Autor: {doc.author}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Emitido em: {doc.data}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => alert(`Documento "${doc.nome}" arquivado com segurança na nuvem.`)}
                      className="w-full py-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold font-kids text-xs transition-colors text-center"
                    >
                      Visualizar Arquivo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* Modal: Nova Sessão de Atendimento */}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-6 shadow-2xl border border-slate-100 overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-black font-kids text-slate-900 mb-1">Registrar Atendimento Terapêutico</h3>
            <p className="text-xs text-slate-500 mb-4">Insira o relatório da sessão realizada com o Ian.</p>

            <form onSubmit={handleAddSession} className="space-y-3 text-xs font-bold font-kids">
              <div>
                <label className="text-slate-600 block mb-1">Profissional Responsável</label>
                <input 
                  type="text" 
                  value={newSession.professionalName} 
                  onChange={e => setNewSession({ ...newSession, professionalName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-sans"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 block mb-1">Especialidade / Cargo</label>
                  <input 
                    type="text" 
                    value={newSession.role} 
                    onChange={e => setNewSession({ ...newSession, role: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-sans"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Área / Categoria</label>
                  <input 
                    type="text" 
                    value={newSession.goalCategory} 
                    onChange={e => setNewSession({ ...newSession, goalCategory: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-sans"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 block mb-1">Data</label>
                  <input 
                    type="text" 
                    value={newSession.date} 
                    onChange={e => setNewSession({ ...newSession, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-sans"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Horário</label>
                  <input 
                    type="text" 
                    value={newSession.time} 
                    onChange={e => setNewSession({ ...newSession, time: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Atividades Desenvolvidas</label>
                <textarea 
                  rows={2}
                  value={newSession.activities} 
                  onChange={e => setNewSession({ ...newSession, activities: e.target.value })}
                  placeholder="Ex: Treino de apontar com figuras, circuito motor..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-sans"
                  required
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Evolução Clínica & Resposta do Ian</label>
                <textarea 
                  rows={2}
                  value={newSession.evolution} 
                  onChange={e => setNewSession({ ...newSession, evolution: e.target.value })}
                  placeholder="Ex: Manteve foco por 10 min, apontou espontaneamente..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-sans"
                  required
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Recomendações para a Família</label>
                <input 
                  type="text" 
                  value={newSession.recommendations} 
                  onChange={e => setNewSession({ ...newSession, recommendations: e.target.value })}
                  placeholder="Ex: Aguardar 5 segundos de espera antes de entregar o brinquedo"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-sans"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSessionModal(false)}
                  className="blob-button bg-slate-100 text-slate-700 w-1/2 !py-2.5 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="blob-button bg-sky-500 text-white w-1/2 !py-2.5 text-xs font-bold"
                >
                  Salvar Atendimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nova Meta PEI */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-xl font-black font-kids text-slate-900 mb-1">Nova Meta do PEI</h3>
            <p className="text-xs text-slate-500 mb-4">Defina um novo objetivo para o plano de desenvolvimento.</p>

            <form onSubmit={handleAddGoal} className="space-y-3 text-xs font-bold font-kids">
              <div>
                <label className="text-slate-600 block mb-1">Título da Meta</label>
                <input 
                  type="text" 
                  value={newGoal.name} 
                  onChange={e => setNewGoal({ ...newGoal, name: e.target.value })}
                  placeholder="Ex: Segurar colher com autonomia"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-sans"
                  required
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Área / Categoria</label>
                <select 
                  value={newGoal.cat}
                  onChange={e => setNewGoal({ ...newGoal, cat: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-sans"
                >
                  <option value="Comunicação">Comunicação & Linguagem</option>
                  <option value="Sensorial & Motor">Sensorial & Motor</option>
                  <option value="Cognição & ABA">Cognição & ABA</option>
                  <option value="Musicoterapia">Musicoterapia</option>
                  <option value="Autonomia & Rotina">Autonomia & Rotina</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Nível de Progresso Inicial: {newGoal.nivel}%</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="5"
                  value={newGoal.nivel} 
                  onChange={e => setNewGoal({ ...newGoal, nivel: Number(e.target.value) })}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Critério de Sucesso / Descrição</label>
                <textarea 
                  rows={2}
                  value={newGoal.description} 
                  onChange={e => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Ex: Realizar em pelo menos 80% das refeições diárias."
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-sans"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="blob-button bg-slate-100 text-slate-700 w-1/2 !py-2.5 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="blob-button bg-emerald-500 text-white w-1/2 !py-2.5 text-xs font-bold"
                >
                  Salvar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Novo Registro Escolar */}
      {showSchoolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-xl font-black font-kids text-slate-900 mb-1">Registro Pedagógico da Escola</h3>
            <p className="text-xs text-slate-500 mb-4">Comunicação e observações de sala de aula.</p>

            <form onSubmit={handleAddSchool} className="space-y-3 text-xs font-bold font-kids">
              <div>
                <label className="text-slate-600 block mb-1">Professor(a) / Mediador(a)</label>
                <input 
                  type="text" 
                  value={newSchool.teacher} 
                  onChange={e => setNewSchool({ ...newSchool, teacher: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-sans"
                  required
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Atividade Realizada</label>
                <input 
                  type="text" 
                  value={newSchool.atividade} 
                  onChange={e => setNewSchool({ ...newSchool, atividade: e.target.value })}
                  placeholder="Ex: Roda de música e pintura a dedo"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-sans"
                  required
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Participação & Socialização</label>
                <input 
                  type="text" 
                  value={newSchool.socializacao} 
                  onChange={e => setNewSchool({ ...newSchool, socializacao: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-sans"
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Recado aos Pais (Marcos & Alessandra)</label>
                <textarea 
                  rows={2}
                  value={newSchool.recadoPais} 
                  onChange={e => setNewSchool({ ...newSchool, recadoPais: e.target.value })}
                  placeholder="Ex: Ian estava muito feliz hoje..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-sans"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSchoolModal(false)}
                  className="blob-button bg-slate-100 text-slate-700 w-1/2 !py-2.5 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="blob-button bg-amber-500 text-white w-1/2 !py-2.5 text-xs font-bold"
                >
                  Registrar na Escola
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Novo Agendamento */}
      {showAgendaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-xl font-black font-kids text-slate-900 mb-1">Agendar Consulta ou Terapia</h3>
            <p className="text-xs text-slate-500 mb-4">Adicione um compromisso à rotina do Ian.</p>

            <form onSubmit={handleAddAgenda} className="space-y-3 text-xs font-bold font-kids">
              <div>
                <label className="text-slate-600 block mb-1">Especialidade / Terapia</label>
                <input 
                  type="text" 
                  value={newAgenda.tipo} 
                  onChange={e => setNewAgenda({ ...newAgenda, tipo: e.target.value })}
                  placeholder="Ex: Musicoterapia / Fonoaudiologia"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-sans"
                  required
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Profissional Responsável</label>
                <input 
                  type="text" 
                  value={newAgenda.who} 
                  onChange={e => setNewAgenda({ ...newAgenda, who: e.target.value })}
                  placeholder="Ex: Dra. Karen Camargo / Letícia Onari"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-sans"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 block mb-1">Dia da Semana</label>
                  <input 
                    type="text" 
                    value={newAgenda.day} 
                    onChange={e => setNewAgenda({ ...newAgenda, day: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-sans"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Horário</label>
                  <input 
                    type="text" 
                    value={newAgenda.time} 
                    onChange={e => setNewAgenda({ ...newAgenda, time: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Local / Sala</label>
                <input 
                  type="text" 
                  value={newAgenda.local} 
                  onChange={e => setNewAgenda({ ...newAgenda, local: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-sans"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAgendaModal(false)}
                  className="blob-button bg-slate-100 text-slate-700 w-1/2 !py-2.5 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="blob-button bg-indigo-500 text-white w-1/2 !py-2.5 text-xs font-bold"
                >
                  Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
