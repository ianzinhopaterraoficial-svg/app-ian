import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  Heart, 
  Stethoscope, 
  Sparkles, 
  Smile, 
  Calendar, 
  Plus, 
  User, 
  ShieldCheck, 
  Tag, 
  Filter, 
  CheckCircle2, 
  MessageSquare, 
  Sun, 
  Moon, 
  Utensils, 
  Activity, 
  Trash2, 
  X, 
  RefreshCw, 
  AlertCircle, 
  Award, 
  BookOpen,
  ChevronDown,
  GraduationCap
} from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType, initialDiary } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { DiaryRecord, UserRole } from '../types';

interface DailyObservationsDiaryProps {
  childId?: string;
  childName?: string;
}

const LOCAL_STORAGE_DIARY_KEY = 'mundo_azul_diary_fallback';

export const DailyObservationsDiary: React.FC<DailyObservationsDiaryProps> = ({ 
  childId = 'ian-paterra-01',
  childName = 'Ian Paterra' 
}) => {
  const { user, systemUser, isParent, isTherapist, isSchool, isAdmin } = useAuth();

  const [records, setRecords] = useState<DiaryRecord[]>(initialDiary);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'local' | 'saving'>('local');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters
  const [filterRole, setFilterRole] = useState<'all' | 'parent' | 'therapist' | 'school'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [savingRecord, setSavingRecord] = useState<boolean>(false);

  // Form State
  const [formDate, setFormDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [formAuthorName, setFormAuthorName] = useState<string>('');
  const [formAuthorRole, setFormAuthorRole] = useState<UserRole>('parent');
  const [formAuthorTitle, setFormAuthorTitle] = useState<string>('');
  const [formCategory, setFormCategory] = useState<DiaryRecord['category']>('geral');
  const [formHumor, setFormHumor] = useState<DiaryRecord['humor']>('radiante');
  const [formSono, setFormSono] = useState<string>('Boa noite de sono contínuo');
  const [formAlimentacao, setFormAlimentacao] = useState<string>('Aceitação positiva das refeições');
  const [formAtividades, setFormAtividades] = useState<string>('');
  const [formConquista, setFormConquista] = useState<string>('');
  const [formObs, setFormObs] = useState<string>('');
  const [formOrientacoes, setFormOrientacoes] = useState<string>('');
  const [formTags, setFormTags] = useState<string[]>(['Comunicação']);
  const [customTagInput, setCustomTagInput] = useState<string>('');

  // Sync default author from system user
  useEffect(() => {
    if (systemUser) {
      setFormAuthorName(systemUser.name || 'Marcos Paterra');
      setFormAuthorRole(systemUser.role || (isTherapist ? 'therapist' : 'parent'));
      setFormAuthorTitle(systemUser.roleTitle || (isTherapist ? 'Terapeuta Multidisciplinar' : 'Pai do Ian'));
    } else {
      setFormAuthorName('Marcos Paterra');
      setFormAuthorRole('parent');
      setFormAuthorTitle('Pai do Ian & Administrador');
    }
  }, [systemUser, isTherapist]);

  // Load from Firestore with Realtime Listener
  useEffect(() => {
    setLoading(true);
    let unsubscribe = () => {};

    try {
      const diaryColl = collection(db, 'diary');
      const q = query(diaryColl, orderBy('createdAt', 'desc'));

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const loaded = snapshot.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            })) as DiaryRecord[];
            setRecords(loaded);
            setSyncStatus('synced');
            try {
              localStorage.setItem(LOCAL_STORAGE_DIARY_KEY, JSON.stringify(loaded));
            } catch {
              // ignore
            }
          } else {
            // If empty in Firestore, retain seed or local storage
            try {
              const cached = localStorage.getItem(LOCAL_STORAGE_DIARY_KEY);
              if (cached) {
                setRecords(JSON.parse(cached));
              } else {
                setRecords(initialDiary);
              }
            } catch {
              setRecords(initialDiary);
            }
            setSyncStatus('synced');
          }
          setLoading(false);
        },
        (error) => {
          console.warn('Firestore real-time subscription error:', error.message);
          handleFirestoreError(error, OperationType.LIST, 'diary');
          setSyncStatus('local');
          // Load fallback from localStorage
          try {
            const cached = localStorage.getItem(LOCAL_STORAGE_DIARY_KEY);
            if (cached) {
              setRecords(JSON.parse(cached));
            } else {
              setRecords(initialDiary);
            }
          } catch {
            setRecords(initialDiary);
          }
          setLoading(false);
        }
      );
    } catch (err) {
      console.warn('Could not establish Firestore listener:', err);
      setSyncStatus('local');
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0284c7', '#38bdf8', '#fbbf24', '#34d399', '#f43f5e']
      });
    } catch {
      // ignore
    }
  };

  const handleToggleTag = (tag: string) => {
    if (formTags.includes(tag)) {
      setFormTags(formTags.filter(t => t !== tag));
    } else {
      setFormTags([...formTags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const clean = customTagInput.trim();
    if (clean && !formTags.includes(clean)) {
      setFormTags([...formTags, clean]);
      setCustomTagInput('');
    }
  };

  const handleOpenNewEntryModal = (rolePreset?: UserRole) => {
    const role = rolePreset || (systemUser?.role || (isTherapist ? 'therapist' : 'parent'));
    setFormAuthorRole(role);

    if (role === 'therapist') {
      setFormAuthorName(systemUser?.role === 'therapist' ? systemUser.name : 'Dra. Karen Camargo');
      setFormAuthorTitle(systemUser?.role === 'therapist' ? systemUser.roleTitle : 'Neuropediatra (Equipe Clínica)');
      setFormCategory('comunicacao');
      setFormTags(['Terapia', 'Evolução Clínica', 'Comunicação']);
    } else if (role === 'school') {
      setFormAuthorName(systemUser?.role === 'school' ? systemUser.name : 'Profª Mariana');
      setFormAuthorTitle(systemUser?.role === 'school' ? systemUser.roleTitle : 'Escola Reino das Letras');
      setFormCategory('rotina');
      setFormTags(['Pedagógico', 'Socialização']);
    } else {
      setFormAuthorName(systemUser?.role === 'parent' ? systemUser.name : 'Marcos & Alessandra Paterra');
      setFormAuthorTitle('Pais do Ian (Família)');
      setFormCategory('rotina');
      setFormTags(['Rotina de Casa', 'Sono Regulado']);
    }

    setFormDate(new Date().toISOString().split('T')[0]);
    setFormHumor('radiante');
    setFormSono('8 a 9 horas de sono tranquilo');
    setFormAlimentacao('Almoço e café aceitos normalmente');
    setFormAtividades('');
    setFormConquista('');
    setFormObs('');
    setFormOrientacoes('');
    setErrorMessage(null);
    setShowModal(true);
  };

  const handleSaveObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formObs.trim()) {
      setErrorMessage('Por favor, descreva a observação do dia.');
      return;
    }

    setSavingRecord(true);
    setErrorMessage(null);

    // Format display date DD/MM/AAAA
    let formattedDate = formDate;
    if (formDate.includes('-')) {
      const parts = formDate.split('-');
      if (parts.length === 3) {
        formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }

    const newEntry: Omit<DiaryRecord, 'id'> & { createdAt: string } = {
      childId,
      date: formattedDate,
      authorId: user?.uid || systemUser?.id || `local-${Date.now()}`,
      authorName: formAuthorName.trim() || (formAuthorRole === 'therapist' ? 'Terapeuta' : 'Família Paterra'),
      authorRole: formAuthorRole,
      authorRoleTitle: formAuthorTitle.trim() || (formAuthorRole === 'therapist' ? 'Especialista' : 'Pais do Ian'),
      category: formCategory,
      humor: formHumor,
      sono: formSono.trim() || 'Não especificado',
      alimentacao: formAlimentacao.trim() || 'Não especificado',
      atividades: formAtividades.trim(),
      conquista: formConquista.trim(),
      obs: formObs.trim(),
      orientacoes: formOrientacoes.trim(),
      tags: formTags,
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Attempt Firestore write
      const docRef = await addDoc(collection(db, 'diary'), {
        ...newEntry,
        timestamp: serverTimestamp()
      });

      const fullRecord: DiaryRecord = {
        id: docRef.id,
        ...newEntry
      };

      setRecords(prev => [fullRecord, ...prev.filter(r => r.id !== docRef.id)]);
      setSyncStatus('synced');
    } catch (err: any) {
      console.warn('Firestore write failed, falling back to local persistence:', err);
      handleFirestoreError(err, OperationType.CREATE, 'diary');
      
      // Fallback local persistence
      const fallbackRecord: DiaryRecord = {
        id: `local-diary-${Date.now()}`,
        ...newEntry
      };
      const updated = [fallbackRecord, ...records];
      setRecords(updated);
      try {
        localStorage.setItem(LOCAL_STORAGE_DIARY_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      setSyncStatus('local');
    } finally {
      setSavingRecord(false);
      setShowModal(false);
      triggerCelebration();
    }
  };

  const handleDeleteRecord = async (id: string, authorName?: string) => {
    if (!window.confirm(`Deseja realmente excluir esta observação registrada por ${authorName || 'usuário'}?`)) {
      return;
    }

    try {
      if (!id.startsWith('local-') && !id.startsWith('diary-')) {
        await deleteDoc(doc(db, 'diary', id));
      }
    } catch (err) {
      console.warn('Firestore delete failed:', err);
      handleFirestoreError(err, OperationType.DELETE, `diary/${id}`);
    }

    const updated = records.filter(r => r.id !== id);
    setRecords(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_DIARY_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Filtered list
  const filteredRecords = records.filter(rec => {
    // Role filter
    if (filterRole !== 'all') {
      if (filterRole === 'parent' && rec.authorRole !== 'parent') return false;
      if (filterRole === 'therapist' && rec.authorRole !== 'therapist') return false;
      if (filterRole === 'school' && rec.authorRole !== 'school') return false;
    }

    // Category filter
    if (filterCategory !== 'all' && rec.category !== filterCategory) {
      return false;
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchText = (
        (rec.obs || '').toLowerCase().includes(term) ||
        (rec.conquista || '').toLowerCase().includes(term) ||
        (rec.atividades || '').toLowerCase().includes(term) ||
        (rec.authorName || '').toLowerCase().includes(term) ||
        (rec.authorRoleTitle || '').toLowerCase().includes(term) ||
        (rec.tags || []).some(t => t.toLowerCase().includes(term))
      );
      if (!matchText) return false;
    }

    return true;
  });

  // Metrics
  const parentCount = records.filter(r => r.authorRole === 'parent' || !r.authorRole).length;
  const therapistCount = records.filter(r => r.authorRole === 'therapist').length;
  const schoolCount = records.filter(r => r.authorRole === 'school').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Header */}
      <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="p-2.5 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-500 text-white shadow-md shadow-sky-500/20">
                <Heart className="w-6 h-6 fill-current text-white" />
              </span>
              <div>
                <h3 className="text-2xl font-black font-kids text-slate-900 leading-tight">
                  Diário Multidisciplinar do {childName}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Registro colaborativo em tempo real para Família (Marcos & Alessandra), Terapeutas Clínicos e Escola
                </p>
              </div>
            </div>

            {/* Sync Badge */}
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-kids ${
                syncStatus === 'synced'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${syncStatus === 'synced' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                <span>{syncStatus === 'synced' ? 'Persistência no Firestore Ativa' : 'Modo Seguro Local / Offline'}</span>
              </span>

              <span className="text-[11px] text-slate-400">
                • {records.length} {records.length === 1 ? 'observação registrada' : 'observações registradas'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => handleOpenNewEntryModal('parent')}
              className="flex-1 sm:flex-initial py-2.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold font-kids shadow-md shadow-rose-500/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <Heart className="w-4 h-4 fill-current" />
              <span>Registrar como Pais</span>
            </button>

            <button
              onClick={() => handleOpenNewEntryModal('therapist')}
              className="flex-1 sm:flex-initial py-2.5 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white text-xs font-bold font-kids shadow-md shadow-sky-500/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Registrar como Terapeuta</span>
            </button>
          </div>
        </div>

        {/* Metric Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100/80">
            <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wide block">Total de Relatos</span>
            <p className="text-xl font-black font-kids text-sky-950 mt-0.5">{records.length}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100/80">
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wide block">Observações da Família</span>
            <p className="text-xl font-black font-kids text-rose-950 mt-0.5">{parentCount}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100/80">
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wide block">Terapeutas / Clínica</span>
            <p className="text-xl font-black font-kids text-indigo-950 mt-0.5">{therapistCount}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100/80">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide block">Escola & Mediadores</span>
            <p className="text-xl font-black font-kids text-amber-950 mt-0.5">{schoolCount}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Role Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none font-kids text-xs font-bold">
          <button
            onClick={() => setFilterRole('all')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              filterRole === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({records.length})
          </button>

          <button
            onClick={() => setFilterRole('parent')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1 ${
              filterRole === 'parent'
                ? 'bg-rose-500 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Pais ({parentCount})</span>
          </button>

          <button
            onClick={() => setFilterRole('therapist')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1 ${
              filterRole === 'therapist'
                ? 'bg-sky-600 text-white'
                : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Terapeutas ({therapistCount})</span>
          </button>

          <button
            onClick={() => setFilterRole('school')}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1 ${
              filterRole === 'school'
                ? 'bg-amber-500 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Escola ({schoolCount})</span>
          </button>
        </div>

        {/* Category & Search Input */}
        <div className="flex items-center gap-2 flex-1 md:justify-end">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs font-bold font-kids bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <option value="all">Todas as Áreas</option>
            <option value="rotina">Rotina & Sono</option>
            <option value="comunicacao">Comunicação & Linguagem</option>
            <option value="sensorial">Sensorial & Motor</option>
            <option value="humor_sono">Humor & Sono</option>
            <option value="terapia_casa">Orientações para Casa</option>
            <option value="conquista">Conquistas do Dia</option>
          </select>

          <input
            type="text"
            placeholder="Buscar nas anotações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-56 text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 font-sans"
          />
        </div>
      </div>

      {/* Observations Timeline / Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center bg-white rounded-[2rem] border border-slate-200">
            <RefreshCw className="w-8 h-8 text-sky-500 animate-spin mx-auto mb-2" />
            <p className="text-sm font-bold font-kids text-slate-700">Carregando diário de observações...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-[2rem] border border-slate-200">
            <div className="w-16 h-16 rounded-full bg-sky-50 flex items-center justify-center text-sky-500 mx-auto mb-3">
              <Sparkles className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold font-kids text-slate-800">Nenhum registro encontrado</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              {searchTerm || filterCategory !== 'all' || filterRole !== 'all'
                ? 'Tente remover os filtros ou o termo de busca para visualizar todas as anotações.'
                : 'Seja o primeiro a registrar a rotina e conquistas do dia de hoje para o Ian!'}
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => handleOpenNewEntryModal('parent')}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl font-kids"
              >
                + Registro Familiar
              </button>
              <button
                onClick={() => handleOpenNewEntryModal('therapist')}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl font-kids"
              >
                + Registro Terapêutico
              </button>
            </div>
          </div>
        ) : (
          filteredRecords.map((rec) => {
            const isAuthorTherapist = rec.authorRole === 'therapist';
            const isAuthorSchool = rec.authorRole === 'school';
            const isAuthorParent = !isAuthorTherapist && !isAuthorSchool;

            const humorEmoji = 
              rec.humor === 'radiante' ? '😄' :
              rec.humor === 'tranquilo' ? '😊' :
              rec.humor === 'sensivel' ? '🥺' :
              rec.humor === 'agitado' ? '⚡' : '😴';

            const humorLabel = 
              rec.humor === 'radiante' ? 'Radiante & Alegre' :
              rec.humor === 'tranquilo' ? 'Tranquilo & Calmo' :
              rec.humor === 'sensivel' ? 'Sensível a Estímulos' :
              rec.humor === 'agitado' ? 'Mais Agitado' : 'Cansado / Sonolento';

            return (
              <div 
                key={rec.id}
                className={`bg-white rounded-[2rem] p-6 border transition-all hover:shadow-md ${
                  isAuthorTherapist 
                    ? 'border-sky-200/80 bg-gradient-to-br from-white via-white to-sky-50/20' 
                    : isAuthorSchool
                    ? 'border-amber-200/80 bg-gradient-to-br from-white via-white to-amber-50/20'
                    : 'border-rose-200/80 bg-gradient-to-br from-white via-white to-rose-50/20'
                }`}
              >
                {/* Header: Author, Role & Date */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm shrink-0 ${
                      isAuthorTherapist 
                        ? 'bg-gradient-to-tr from-sky-500 to-indigo-600' 
                        : isAuthorSchool
                        ? 'bg-gradient-to-tr from-amber-500 to-orange-500'
                        : 'bg-gradient-to-tr from-rose-500 to-pink-500'
                    }`}>
                      {isAuthorTherapist ? (
                        <Stethoscope className="w-5 h-5" />
                      ) : isAuthorSchool ? (
                        <GraduationCap className="w-5 h-5" />
                      ) : (
                        <Heart className="w-5 h-5 fill-current" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black font-kids text-slate-900 text-sm">
                          {rec.authorName || (isAuthorTherapist ? 'Terapeuta Responsável' : 'Família Paterra')}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-kids ${
                          isAuthorTherapist 
                            ? 'bg-sky-100 text-sky-800' 
                            : isAuthorSchool
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {rec.authorRoleTitle || (isAuthorTherapist ? 'Terapeuta Multidisciplinar' : 'Pais do Ian')}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Registrado em {rec.date}
                      </span>
                    </div>
                  </div>

                  {/* Right Tags & Actions */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                      <span>{humorEmoji}</span>
                      <span className="text-[11px] font-kids">{humorLabel}</span>
                    </div>

                    {(isAdmin || isParent || user?.uid === rec.authorId) && (
                      <button
                        onClick={() => handleDeleteRecord(rec.id, rec.authorName)}
                        className="p-1.5 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Excluir observação"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Main Body */}
                <div className="mt-4 space-y-3.5 text-xs text-slate-700">
                  {/* Detailed Observation Text */}
                  <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                    <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">
                      Observação do Progresso & Comportamento
                    </span>
                    <p className="text-slate-800 font-medium text-xs leading-relaxed whitespace-pre-line">
                      {rec.obs}
                    </p>
                  </div>

                  {/* Highlights Grid: Sono, Alimentação, Atividades */}
                  <div className="grid sm:grid-cols-3 gap-3">
                    {rec.sono && (
                      <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100/60">
                        <span className="font-bold text-indigo-700 block uppercase text-[10px] flex items-center gap-1">
                          <Moon className="w-3 h-3" />
                          <span>Sono & Descanso</span>
                        </span>
                        <p className="text-slate-700 mt-1 font-medium text-[11px]">{rec.sono}</p>
                      </div>
                    )}

                    {rec.alimentacao && (
                      <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100/60">
                        <span className="font-bold text-amber-700 block uppercase text-[10px] flex items-center gap-1">
                          <Utensils className="w-3 h-3" />
                          <span>Alimentação</span>
                        </span>
                        <p className="text-slate-700 mt-1 font-medium text-[11px]">{rec.alimentacao}</p>
                      </div>
                    )}

                    {rec.atividades && (
                      <div className="p-3 rounded-xl bg-sky-50/50 border border-sky-100/60">
                        <span className="font-bold text-sky-700 block uppercase text-[10px] flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          <span>Atividades / Terapia</span>
                        </span>
                        <p className="text-slate-700 mt-1 font-medium text-[11px]">{rec.atividades}</p>
                      </div>
                    )}
                  </div>

                  {/* Conquista do Dia */}
                  {rec.conquista && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-pink-50 border border-amber-200/80 flex items-start gap-2.5">
                      <span className="text-xl shrink-0 mt-0.5">🌟</span>
                      <div>
                        <span className="font-black font-kids text-amber-900 uppercase text-[10px] block">
                          Conquista / Marco Notável do Dia
                        </span>
                        <p className="text-slate-900 font-bold text-xs mt-0.5">
                          {rec.conquista}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Orientações para Casa / Recado aos Pais ou à Equipe */}
                  {rec.orientacoes && (
                    <div className={`p-3.5 rounded-2xl border flex items-start gap-2.5 ${
                      isAuthorTherapist 
                        ? 'bg-sky-50/60 border-sky-200 text-sky-900' 
                        : 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                    }`}>
                      <MessageSquare className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-black font-kids uppercase text-[10px] block">
                          {isAuthorTherapist ? 'Orientações aos Pais para Estimulação em Casa' : 'Comunicação para a Equipe Multidisciplinar'}
                        </span>
                        <p className="text-xs font-medium mt-0.5 leading-relaxed">
                          {rec.orientacoes}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {rec.tags && rec.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {rec.tags.map((tag, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold font-kids transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Observation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border-2 border-sky-100 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className={`p-6 text-white shrink-0 relative ${
              formAuthorRole === 'therapist'
                ? 'bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600'
                : formAuthorRole === 'school'
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600'
                : 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600'
            }`}>
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase font-bold tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full font-kids">
                  {formAuthorRole === 'therapist' ? 'Registro Clínico' : formAuthorRole === 'school' ? 'Registro Pedagógico' : 'Registro Familiar'}
                </span>
                <span className="text-white/80 text-xs">• Sincronizado no Firestore</span>
              </div>

              <h3 className="text-2xl font-black font-kids">Nova Observação do {childName}</h3>
              <p className="text-white/80 text-xs mt-0.5">
                Compartilhe o progresso diário, sinais de regulação, sono e conquistas.
              </p>
            </div>

            {/* Modal Form (Scrollable) */}
            <form onSubmit={handleSaveObservation} className="p-6 overflow-y-auto space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Author & Role Selector */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-2 font-kids">
                  Tipo de Autor do Registro:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormAuthorRole('parent');
                      setFormAuthorTitle('Pais do Ian (Família)');
                      if (systemUser?.role === 'parent') setFormAuthorName(systemUser.name);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold font-kids transition-all flex items-center justify-center gap-1.5 ${
                      formAuthorRole === 'parent'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-rose-50'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span>Pais / Família</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormAuthorRole('therapist');
                      setFormAuthorTitle('Terapeuta Multidisciplinar');
                      if (systemUser?.role === 'therapist') setFormAuthorName(systemUser.name);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold font-kids transition-all flex items-center justify-center gap-1.5 ${
                      formAuthorRole === 'therapist'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-sky-50'
                    }`}
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Terapeuta</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormAuthorRole('school');
                      setFormAuthorTitle('Escola Reino das Letras');
                      if (systemUser?.role === 'school') setFormAuthorName(systemUser.name);
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold font-kids transition-all flex items-center justify-center gap-1.5 ${
                      formAuthorRole === 'school'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-amber-50'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Escola</span>
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 mb-1 block">Nome de quem registra</label>
                    <input
                      type="text"
                      value={formAuthorName}
                      onChange={(e) => setFormAuthorName(e.target.value)}
                      placeholder="Ex: Marcos Paterra, Dra. Karen, Letícia..."
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-sans"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 mb-1 block">Especialidade / Título</label>
                    <input
                      type="text"
                      value={formAuthorTitle}
                      onChange={(e) => setFormAuthorTitle(e.target.value)}
                      placeholder="Ex: Neuropediatra, Fonoaudióloga, Pai..."
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-sans"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Date & Category */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">Data da Observação</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-sans"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block">Área Temática Principal</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-sans"
                  >
                    <option value="geral">Geral / Dia a dia</option>
                    <option value="rotina">Rotina & Sono</option>
                    <option value="comunicacao">Comunicação & Linguagem</option>
                    <option value="sensorial">Sensorial & Motor</option>
                    <option value="terapia_casa">Orientações para Casa</option>
                    <option value="conquista">Conquista Especial</option>
                  </select>
                </div>
              </div>

              {/* Humor Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1.5 block">
                  Humor e Disposição Geral do Ian
                </label>
                <div className="grid grid-cols-5 gap-2 text-center">
                  {[
                    { id: 'radiante', emoji: '😄', label: 'Radiante' },
                    { id: 'tranquilo', emoji: '😊', label: 'Tranquilo' },
                    { id: 'sensivel', emoji: '🥺', label: 'Sensível' },
                    { id: 'agitado', emoji: '⚡', label: 'Agitado' },
                    { id: 'cansado', emoji: '😴', label: 'Cansado' },
                  ].map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setFormHumor(h.id as any)}
                      className={`p-2.5 rounded-2xl border transition-all flex flex-col items-center ${
                        formHumor === h.id
                          ? 'border-sky-500 bg-sky-50 text-sky-800 shadow-sm scale-105'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="text-2xl">{h.emoji}</span>
                      <span className="text-[10px] font-bold mt-1 font-kids">{h.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Detailed Observation Text */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 mb-1 block">
                  Observação Detalhada do Dia / Atendimento *
                </label>
                <textarea
                  rows={3}
                  value={formObs}
                  onChange={(e) => setFormObs(e.target.value)}
                  placeholder={
                    formAuthorRole === 'therapist'
                      ? "Descreva como o Ian respondeu aos estímulos da sessão, contato ocular, regulação sensorial e avanços observados..."
                      : "Conte como foi o dia em casa, brincadeiras, humor, interação com os pais e resposta a novos desafios..."
                  }
                  className="w-full text-xs p-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 font-sans"
                  required
                />
              </div>

              {/* Conquista do Dia (Opcional, mas muito celebrada) */}
              <div>
                <label className="text-[11px] font-bold text-amber-800 mb-1 block flex items-center gap-1 font-kids">
                  <span>🌟 Conquista / Marco do Dia (Opcional)</span>
                </label>
                <input
                  type="text"
                  value={formConquista}
                  onChange={(e) => setFormConquista(e.target.value)}
                  placeholder="Ex: Apontou espontaneamente para pedir a água, falou uma palavra nova, etc."
                  className="w-full text-xs p-2.5 rounded-xl border border-amber-200 bg-amber-50/40 font-sans"
                />
              </div>

              {/* Rotina: Sono & Alimentação */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block flex items-center gap-1">
                    <Moon className="w-3 h-3 text-indigo-500" />
                    <span>Sono & Descanso</span>
                  </label>
                  <input
                    type="text"
                    value={formSono}
                    onChange={(e) => setFormSono(e.target.value)}
                    placeholder="Ex: 9 horas contínuas, acordou calmo..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-sans"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 mb-1 block flex items-center gap-1">
                    <Utensils className="w-3 h-3 text-amber-500" />
                    <span>Alimentação</span>
                  </label>
                  <input
                    type="text"
                    value={formAlimentacao}
                    onChange={(e) => setFormAlimentacao(e.target.value)}
                    placeholder="Ex: Boa aceitação no almoço, bebeu bastante água..."
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-sans"
                  />
                </div>
              </div>

              {/* Atividades / Terapia */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1 block">
                  Brincadeiras, Terapias ou Atividades Realizadas
                </label>
                <input
                  type="text"
                  value={formAtividades}
                  onChange={(e) => setFormAtividades(e.target.value)}
                  placeholder="Ex: Brincou de empilhar blocos, ouviu a música do Ian, esteve no parque..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-sans"
                />
              </div>

              {/* Orientações para Casa / Recado Multidisciplinar */}
              <div>
                <label className="text-[11px] font-bold text-sky-800 mb-1 block font-kids flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                  <span>
                    {formAuthorRole === 'therapist'
                      ? 'Orientações aos Pais (Dicas para aplicar em casa)'
                      : 'Recado / Pergunta para a Equipe de Terapeutas'}
                  </span>
                </label>
                <textarea
                  rows={2}
                  value={formOrientacoes}
                  onChange={(e) => setFormOrientacoes(e.target.value)}
                  placeholder={
                    formAuthorRole === 'therapist'
                      ? 'Ex: Recomendo estimular o gesto de apontar aguardando 3 segundos antes de entregar o item.'
                      : 'Ex: Notamos maior sensibilidade a sons altos hoje à tarde; gostaria de dicas para a próxima sessão.'
                  }
                  className="w-full text-xs p-3 rounded-2xl border border-sky-200 bg-sky-50/30 focus:outline-none focus:ring-2 focus:ring-sky-400 font-sans"
                />
              </div>

              {/* Tags Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 mb-1.5 block">
                  Tags & Marcadores Rápidos
                </label>
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  {[
                    'Comunicação',
                    'Contato Visual',
                    'Sensorial',
                    'Integração Motora',
                    'Auto-regulação',
                    'Alimentação',
                    'Sono Regulado',
                    'Fonoaudiologia',
                    'Terapia Ocupacional',
                    'Psicologia ABA',
                    'Escola'
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold font-kids transition-all ${
                        formTags.includes(tag)
                          ? 'bg-sky-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Adicionar tag personalizada..."
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyDown={handleAddCustomTag}
                    className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 flex-1 font-sans"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTag}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold font-kids"
                  >
                    + Tag
                  </button>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 font-kids"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={savingRecord}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white text-xs font-bold font-kids shadow-md shadow-sky-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {savingRecord ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Salvando no Firestore...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Publicar Observação</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
