import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { 
  initialChildData, 
  initialSessions, 
  initialGoals, 
  initialAchievements, 
  initialSchoolRecords, 
  initialAgenda, 
  initialDocuments,
  initialMoments,
  initialChannels,
  initialMessages 
} from './firebase';
import { 
  Child, 
  TherapySession, 
  Goal, 
  Achievement, 
  SchoolRecord, 
  AgendaEvent, 
  DocumentRecord,
  MomentRecord,
  DirectChannel,
  DirectMessage 
} from '../types';

const STORAGE_PREFIX = 'mundo_azul_cache_';

function getLocalCache<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch {
    // ignore
  }
}

/**
 * Limpar todos os dados em cache local (iniciar em branco)
 */
export function clearAllAppData(): void {
  try {
    const keys = [
      'child_ian-paterra-01',
      'sessions',
      'goals',
      'achievements',
      'school_records',
      'agenda',
      'documents',
      'moments',
      'direct_channels'
    ];
    keys.forEach(k => localStorage.removeItem(STORAGE_PREFIX + k));
    localStorage.removeItem('mundo_azul_diary_records_v1');
    localStorage.removeItem('mundo_azul_moments_v1');
  } catch {
    // ignore
  }
}

/**
 * Seeds initial child doc into Firestore if none exists yet, leaving clinical collections blank.
 */
export async function seedFirestoreIfEmpty(): Promise<void> {
  try {
    // 1. Child Record (Blank if new)
    const childDocRef = doc(db, 'children', initialChildData.id);
    const childSnap = await getDoc(childDocRef);
    if (!childSnap.exists()) {
      await setDoc(childDocRef, {
        ...initialChildData,
        createdAt: serverTimestamp()
      });
    }
  } catch (err: any) {
    console.warn('Firebase init notice (non-fatal):', err.message);
  }
}

/**
 * Real-time listener for Child record (Prontuário)
 */
export function subscribeToChild(childId: string, onUpdate: (child: Child) => void): () => void {
  const cached = getLocalCache<Child>('child_' + childId, initialChildData);
  onUpdate(cached);

  try {
    const childRef = doc(db, 'children', childId);
    return onSnapshot(childRef, (snap) => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() } as Child;
        setLocalCache('child_' + childId, data);
        onUpdate(data);
      }
    }, (err) => {
      console.warn('Child snapshot error, using cached:', err.message);
      handleFirestoreError(err, OperationType.GET, `children/${childId}`);
    });
  } catch (err) {
    return () => {};
  }
}

/**
 * Save Child Record (Prontuário) to Firestore
 */
export async function saveChildToFirestore(child: Child): Promise<void> {
  setLocalCache('child_' + child.id, child);
  try {
    const childRef = doc(db, 'children', child.id);
    await setDoc(childRef, {
      ...child,
      updatedAt: new Date().toISOString(),
      timestamp: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('Error saving child to Firestore:', err);
    handleFirestoreError(err, OperationType.UPDATE, `children/${child.id}`);
  }
}

/**
 * Real-time listener for Sessions
 */
export function subscribeToSessions(childId: string, onUpdate: (sessions: TherapySession[]) => void): () => void {
  const cached = getLocalCache<TherapySession[]>('sessions', initialSessions);
  onUpdate(cached);

  try {
    const coll = collection(db, 'sessions');
    const q = query(coll, orderBy('date', 'desc'));
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as TherapySession[];
      setLocalCache('sessions', list);
      onUpdate(list);
    }, (err) => {
      console.warn('Sessions snapshot error:', err.message);
      handleFirestoreError(err, OperationType.LIST, 'sessions');
    });
  } catch {
    return () => {};
  }
}

/**
 * Add Therapy Session to Firestore
 */
export async function addSessionToFirestore(session: Omit<TherapySession, 'id'>): Promise<TherapySession> {
  const tempId = `sess-${Date.now()}`;
  const fullSession: TherapySession = { id: tempId, ...session };
  
  // Update local cache immediately
  const current = getLocalCache<TherapySession[]>('sessions', []);
  setLocalCache('sessions', [fullSession, ...current]);

  try {
    const docRef = await addDoc(collection(db, 'sessions'), {
      ...session,
      timestamp: serverTimestamp()
    });
    const saved = { id: docRef.id, ...session };
    // Replace temp id with real id in cache
    const updated = getLocalCache<TherapySession[]>('sessions', []).map(s => s.id === tempId ? saved : s);
    setLocalCache('sessions', updated);
    return saved;
  } catch (err) {
    console.warn('Fallback saving session locally:', err);
    handleFirestoreError(err, OperationType.CREATE, 'sessions');
    return fullSession;
  }
}

/**
 * Real-time listener for Goals PEI
 */
export function subscribeToGoals(childId: string, onUpdate: (goals: Goal[]) => void): () => void {
  const cached = getLocalCache<Goal[]>('goals', initialGoals);
  onUpdate(cached);

  try {
    const coll = collection(db, 'goals');
    return onSnapshot(coll, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Goal[];
      setLocalCache('goals', list);
      onUpdate(list);
    }, (err) => {
      console.warn('Goals snapshot error:', err.message);
      handleFirestoreError(err, OperationType.LIST, 'goals');
    });
  } catch {
    return () => {};
  }
}

/**
 * Add Goal to Firestore
 */
export async function addGoalToFirestore(goal: Omit<Goal, 'id'>): Promise<Goal> {
  const tempId = `goal-${Date.now()}`;
  const fullGoal: Goal = { id: tempId, ...goal };

  // Update local cache immediately
  const current = getLocalCache<Goal[]>('goals', []);
  setLocalCache('goals', [fullGoal, ...current]);

  try {
    const docRef = await addDoc(collection(db, 'goals'), {
      ...goal,
      timestamp: serverTimestamp()
    });
    const saved = { id: docRef.id, ...goal };
    const updated = getLocalCache<Goal[]>('goals', []).map(g => g.id === tempId ? saved : g);
    setLocalCache('goals', updated);
    return saved;
  } catch (err) {
    console.warn('Fallback saving goal locally:', err);
    handleFirestoreError(err, OperationType.CREATE, 'goals');
    return fullGoal;
  }
}

/**
 * Update Goal level in Firestore
 */
export async function updateGoalLevelInFirestore(goalId: string, newLevel: number): Promise<void> {
  const current = getLocalCache<Goal[]>('goals', []);
  const status = newLevel === 100 ? 'achieved' : 'in_progress';
  const updated = current.map(g => g.id === goalId ? { ...g, nivel: newLevel, status, updatedAt: new Date().toISOString() } : g);
  setLocalCache('goals', updated);

  try {
    const goalRef = doc(db, 'goals', goalId);
    await updateDoc(goalRef, {
      nivel: newLevel,
      status,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Error updating goal in Firestore:', err);
    handleFirestoreError(err, OperationType.UPDATE, `goals/${goalId}`);
  }
}

/**
 * Real-time listener for School Records
 */
export function subscribeToSchoolRecords(childId: string, onUpdate: (records: SchoolRecord[]) => void): () => void {
  const cached = getLocalCache<SchoolRecord[]>('school_records', initialSchoolRecords);
  onUpdate(cached);

  try {
    const coll = collection(db, 'school_records');
    return onSnapshot(coll, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as SchoolRecord[];
      setLocalCache('school_records', list);
      onUpdate(list);
    }, (err) => {
      console.warn('School records snapshot error:', err.message);
      handleFirestoreError(err, OperationType.LIST, 'school_records');
    });
  } catch {
    return () => {};
  }
}

/**
 * Add School Record to Firestore
 */
export async function addSchoolRecordToFirestore(record: Omit<SchoolRecord, 'id'>): Promise<SchoolRecord> {
  const tempId = `sch-${Date.now()}`;
  const fullRecord: SchoolRecord = { id: tempId, ...record };

  const current = getLocalCache<SchoolRecord[]>('school_records', []);
  setLocalCache('school_records', [fullRecord, ...current]);

  try {
    const docRef = await addDoc(collection(db, 'school_records'), {
      ...record,
      timestamp: serverTimestamp()
    });
    const saved = { id: docRef.id, ...record };
    const updated = getLocalCache<SchoolRecord[]>('school_records', []).map(r => r.id === tempId ? saved : r);
    setLocalCache('school_records', updated);
    return saved;
  } catch (err) {
    console.warn('Fallback saving school record locally:', err);
    handleFirestoreError(err, OperationType.CREATE, 'school_records');
    return fullRecord;
  }
}

/**
 * Real-time listener for Agenda Events
 */
export function subscribeToAgenda(childId: string, onUpdate: (events: AgendaEvent[]) => void): () => void {
  const cached = getLocalCache<AgendaEvent[]>('agenda', initialAgenda);
  onUpdate(cached);

  try {
    const coll = collection(db, 'agenda');
    return onSnapshot(coll, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as AgendaEvent[];
      setLocalCache('agenda', list);
      onUpdate(list);
    }, (err) => {
      console.warn('Agenda snapshot error:', err.message);
      handleFirestoreError(err, OperationType.LIST, 'agenda');
    });
  } catch {
    return () => {};
  }
}

/**
 * Add Agenda Event to Firestore
 */
export async function addAgendaEventToFirestore(event: Omit<AgendaEvent, 'id'>): Promise<AgendaEvent> {
  const tempId = `ag-${Date.now()}`;
  const fullEvent: AgendaEvent = { id: tempId, ...event };

  const current = getLocalCache<AgendaEvent[]>('agenda', []);
  setLocalCache('agenda', [fullEvent, ...current]);

  try {
    const docRef = await addDoc(collection(db, 'agenda'), {
      ...event,
      timestamp: serverTimestamp()
    });
    const saved = { id: docRef.id, ...event };
    const updated = getLocalCache<AgendaEvent[]>('agenda', []).map(e => e.id === tempId ? saved : e);
    setLocalCache('agenda', updated);
    return saved;
  } catch (err) {
    console.warn('Fallback saving agenda event locally:', err);
    handleFirestoreError(err, OperationType.CREATE, 'agenda');
    return fullEvent;
  }
}

/**
 * Toggle Agenda Event completion in Firestore
 */
export async function toggleAgendaInFirestore(id: string, completed: boolean): Promise<void> {
  const current = getLocalCache<AgendaEvent[]>('agenda', []);
  const updated = current.map(e => e.id === id ? { ...e, completed, status: (completed ? 'realizado' : 'agendado') as any } : e);
  setLocalCache('agenda', updated);

  try {
    const agRef = doc(db, 'agenda', id);
    await updateDoc(agRef, {
      completed,
      status: completed ? 'realizado' : 'agendado'
    });
  } catch (err) {
    console.warn('Error toggling agenda in Firestore:', err);
    handleFirestoreError(err, OperationType.UPDATE, `agenda/${id}`);
  }
}

/**
 * Real-time listener for Achievements
 */
export function subscribeToAchievements(childId: string, onUpdate: (achievements: Achievement[]) => void): () => void {
  const cached = getLocalCache<Achievement[]>('achievements', initialAchievements);
  onUpdate(cached);

  try {
    const coll = collection(db, 'achievements');
    return onSnapshot(coll, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Achievement[];
      setLocalCache('achievements', list);
      onUpdate(list);
    }, (err) => {
      console.warn('Achievements snapshot error:', err.message);
      handleFirestoreError(err, OperationType.LIST, 'achievements');
    });
  } catch {
    return () => {};
  }
}

/**
 * Real-time listener for Documents
 */
export function subscribeToDocuments(childId: string, onUpdate: (docs: DocumentRecord[]) => void): () => void {
  const cached = getLocalCache<DocumentRecord[]>('documents', initialDocuments);
  onUpdate(cached);

  try {
    const coll = collection(db, 'documents');
    return onSnapshot(coll, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as DocumentRecord[];
      setLocalCache('documents', list);
      onUpdate(list);
    }, (err) => {
      console.warn('Documents snapshot error:', err.message);
      handleFirestoreError(err, OperationType.LIST, 'documents');
    });
  } catch {
    return () => {};
  }
}

/**
 * Real-time listener for Moments (Galeria de Registros Visuais)
 */
export function subscribeToMoments(childId: string, onUpdate: (moments: MomentRecord[]) => void): () => void {
  const cached = getLocalCache<MomentRecord[]>('moments', initialMoments);
  onUpdate(cached);

  try {
    const coll = collection(db, 'moments');
    return onSnapshot(coll, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as MomentRecord[];
      list.sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
      setLocalCache('moments', list);
      onUpdate(list);
    }, (err) => {
      console.warn('Moments snapshot error:', err.message);
      handleFirestoreError(err, OperationType.LIST, 'moments');
    });
  } catch {
    return () => {};
  }
}

/**
 * Add Moment to Firestore
 */
export async function addMomentToFirestore(moment: Omit<MomentRecord, 'id'>): Promise<MomentRecord> {
  const tempId = `moment-${Date.now()}`;
  const fullMoment: MomentRecord = { id: tempId, ...moment };

  const current = getLocalCache<MomentRecord[]>('moments', []);
  setLocalCache('moments', [fullMoment, ...current]);

  try {
    const docRef = await addDoc(collection(db, 'moments'), {
      ...moment,
      timestamp: serverTimestamp()
    });
    const saved = { id: docRef.id, ...moment };
    const updated = getLocalCache<MomentRecord[]>('moments', []).map(m => m.id === tempId ? saved : m);
    setLocalCache('moments', updated);
    return saved;
  } catch (err) {
    console.warn('Fallback saving moment locally:', err);
    handleFirestoreError(err, OperationType.CREATE, 'moments');
    return fullMoment;
  }
}

/**
 * Delete Moment from Firestore
 */
export async function deleteMomentFromFirestore(id: string): Promise<void> {
  const current = getLocalCache<MomentRecord[]>('moments', []);
  setLocalCache('moments', current.filter(m => m.id !== id));

  try {
    await deleteDoc(doc(db, 'moments', id));
  } catch (err) {
    console.warn('Error deleting moment from Firestore:', err);
    handleFirestoreError(err, OperationType.DELETE, `moments/${id}`);
  }
}

/* =========================================================================
   ADMIN CRUD OPERATIONS (Acesso Total: Editar & Excluir)
   ========================================================================= */

/**
 * Atualizar Sessão Terapêutica (Admin/Terapeuta)
 */
export async function updateSessionInFirestore(session: TherapySession): Promise<void> {
  const current = getLocalCache<TherapySession[]>('sessions', []);
  const updated = current.map(s => s.id === session.id ? session : s);
  setLocalCache('sessions', updated);

  try {
    const sessionRef = doc(db, 'sessions', session.id);
    await setDoc(sessionRef, {
      ...session,
      updatedAt: new Date().toISOString(),
      timestamp: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('Error updating session in Firestore:', err);
    handleFirestoreError(err, OperationType.UPDATE, `sessions/${session.id}`);
  }
}

/**
 * Excluir Sessão Terapêutica (Admin)
 */
export async function deleteSessionFromFirestore(id: string): Promise<void> {
  const current = getLocalCache<TherapySession[]>('sessions', []);
  setLocalCache('sessions', current.filter(s => s.id !== id));

  try {
    await deleteDoc(doc(db, 'sessions', id));
  } catch (err) {
    console.warn('Error deleting session from Firestore:', err);
    handleFirestoreError(err, OperationType.DELETE, `sessions/${id}`);
  }
}

/**
 * Atualizar Meta PEI (Admin)
 */
export async function updateGoalInFirestore(goal: Goal): Promise<void> {
  const current = getLocalCache<Goal[]>('goals', []);
  const updated = current.map(g => g.id === goal.id ? goal : g);
  setLocalCache('goals', updated);

  try {
    const goalRef = doc(db, 'goals', goal.id);
    await setDoc(goalRef, {
      ...goal,
      updatedAt: new Date().toISOString(),
      timestamp: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('Error updating goal in Firestore:', err);
    handleFirestoreError(err, OperationType.UPDATE, `goals/${goal.id}`);
  }
}

/**
 * Excluir Meta PEI (Admin)
 */
export async function deleteGoalFromFirestore(id: string): Promise<void> {
  const current = getLocalCache<Goal[]>('goals', []);
  setLocalCache('goals', current.filter(g => g.id !== id));

  try {
    await deleteDoc(doc(db, 'goals', id));
  } catch (err) {
    console.warn('Error deleting goal from Firestore:', err);
    handleFirestoreError(err, OperationType.DELETE, `goals/${id}`);
  }
}

/**
 * Atualizar Registro Escolar (Admin/Escola)
 */
export async function updateSchoolRecordInFirestore(record: SchoolRecord): Promise<void> {
  const current = getLocalCache<SchoolRecord[]>('school_records', []);
  const updated = current.map(r => r.id === record.id ? record : r);
  setLocalCache('school_records', updated);

  try {
    const schRef = doc(db, 'school_records', record.id);
    await setDoc(schRef, {
      ...record,
      updatedAt: new Date().toISOString(),
      timestamp: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('Error updating school record in Firestore:', err);
    handleFirestoreError(err, OperationType.UPDATE, `school_records/${record.id}`);
  }
}

/**
 * Excluir Registro Escolar (Admin)
 */
export async function deleteSchoolRecordFromFirestore(id: string): Promise<void> {
  const current = getLocalCache<SchoolRecord[]>('school_records', []);
  setLocalCache('school_records', current.filter(r => r.id !== id));

  try {
    await deleteDoc(doc(db, 'school_records', id));
  } catch (err) {
    console.warn('Error deleting school record from Firestore:', err);
    handleFirestoreError(err, OperationType.DELETE, `school_records/${id}`);
  }
}

/**
 * Atualizar Evento da Agenda (Admin)
 */
export async function updateAgendaEventInFirestore(event: AgendaEvent): Promise<void> {
  const current = getLocalCache<AgendaEvent[]>('agenda', []);
  const updated = current.map(e => e.id === event.id ? event : e);
  setLocalCache('agenda', updated);

  try {
    const agRef = doc(db, 'agenda', event.id);
    await setDoc(agRef, {
      ...event,
      updatedAt: new Date().toISOString(),
      timestamp: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('Error updating agenda event in Firestore:', err);
    handleFirestoreError(err, OperationType.UPDATE, `agenda/${event.id}`);
  }
}

/**
 * Excluir Evento da Agenda (Admin)
 */
export async function deleteAgendaEventFromFirestore(id: string): Promise<void> {
  const current = getLocalCache<AgendaEvent[]>('agenda', []);
  setLocalCache('agenda', current.filter(e => e.id !== id));

  try {
    await deleteDoc(doc(db, 'agenda', id));
  } catch (err) {
    console.warn('Error deleting agenda event from Firestore:', err);
    handleFirestoreError(err, OperationType.DELETE, `agenda/${id}`);
  }
}

/**
 * Adicionar Documento (Admin)
 */
export async function addDocumentToFirestore(docData: Omit<DocumentRecord, 'id'>): Promise<DocumentRecord> {
  const tempId = `doc-${Date.now()}`;
  const fullDoc: DocumentRecord = { id: tempId, ...docData };

  const current = getLocalCache<DocumentRecord[]>('documents', []);
  setLocalCache('documents', [fullDoc, ...current]);

  try {
    const docRef = await addDoc(collection(db, 'documents'), {
      ...docData,
      timestamp: serverTimestamp()
    });
    const saved = { id: docRef.id, ...docData };
    const updated = getLocalCache<DocumentRecord[]>('documents', []).map(d => d.id === tempId ? saved : d);
    setLocalCache('documents', updated);
    return saved;
  } catch (err) {
    console.warn('Fallback saving document locally:', err);
    handleFirestoreError(err, OperationType.CREATE, 'documents');
    return fullDoc;
  }
}

/**
 * Excluir Documento (Admin)
 */
export async function deleteDocumentFromFirestore(id: string): Promise<void> {
  const current = getLocalCache<DocumentRecord[]>('documents', []);
  setLocalCache('documents', current.filter(d => d.id !== id));

  try {
    await deleteDoc(doc(db, 'documents', id));
  } catch (err) {
    console.warn('Error deleting document from Firestore:', err);
    handleFirestoreError(err, OperationType.DELETE, `documents/${id}`);
  }
}

/**
 * Adicionar Marco / Conquista
 */
export async function addAchievementToFirestore(achievement: Omit<Achievement, 'id'>): Promise<Achievement> {
  const tempId = `ach-${Date.now()}`;
  const fullAch: Achievement = { id: tempId, ...achievement };

  const current = getLocalCache<Achievement[]>('achievements', []);
  setLocalCache('achievements', [fullAch, ...current]);

  try {
    const docRef = await addDoc(collection(db, 'achievements'), {
      ...achievement,
      timestamp: serverTimestamp()
    });
    const saved = { id: docRef.id, ...achievement };
    const updated = getLocalCache<Achievement[]>('achievements', []).map(a => a.id === tempId ? saved : a);
    setLocalCache('achievements', updated);
    return saved;
  } catch (err) {
    console.warn('Fallback saving achievement locally:', err);
    handleFirestoreError(err, OperationType.CREATE, 'achievements');
    return fullAch;
  }
}

/**
 * Excluir Marco / Conquista
 */
export async function deleteAchievementFromFirestore(id: string): Promise<void> {
  const current = getLocalCache<Achievement[]>('achievements', []);
  setLocalCache('achievements', current.filter(a => a.id !== id));

  try {
    await deleteDoc(doc(db, 'achievements', id));
  } catch (err) {
    console.warn('Error deleting achievement from Firestore:', err);
    handleFirestoreError(err, OperationType.DELETE, `achievements/${id}`);
  }
}

/* =========================================================================
   MENSAGENS INSTANTÂNEAS INDIVIDUAIS (Comunicação Direta Pais <-> Terapeutas & Escola)
   ========================================================================= */

/**
 * Escutar Canais de Comunicação
 */
export function subscribeToChannels(onUpdate: (channels: DirectChannel[]) => void): () => void {
  const cached = getLocalCache<DirectChannel[]>('direct_channels', initialChannels);
  onUpdate(cached);

  try {
    const coll = collection(db, 'direct_channels');
    return onSnapshot(coll, (snap) => {
      if (!snap.empty) {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as DirectChannel[];
        setLocalCache('direct_channels', list);
        onUpdate(list);
      }
    }, (err) => {
      console.warn('Channels snapshot notice, using fallback:', err.message);
    });
  } catch {
    return () => {};
  }
}

/**
 * Escutar Mensagens em Tempo Real de um Canal Individual
 */
export function subscribeToMessages(channelId: string, onUpdate: (messages: DirectMessage[]) => void): () => void {
  const initialForChannel = initialMessages.filter(m => m.channelId === channelId);
  const cached = getLocalCache<DirectMessage[]>('messages_' + channelId, initialForChannel);
  onUpdate(cached);

  try {
    const coll = collection(db, 'direct_messages');
    const q = query(coll, where('channelId', '==', channelId));
    return onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as DirectMessage[];
        const sorted = list.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
        setLocalCache('messages_' + channelId, sorted);
        onUpdate(sorted);
      } else {
        // Retain initial seeded messages for channel if none in firestore yet
        if (initialForChannel.length > 0) {
          setLocalCache('messages_' + channelId, initialForChannel);
          onUpdate(initialForChannel);
        }
      }
    }, (err) => {
      console.warn('Messages snapshot notice, using fallback:', err.message);
    });
  } catch {
    return () => {};
  }
}

/**
 * Enviar Mensagem Instantânea
 */
export async function sendMessageToFirestore(msg: Omit<DirectMessage, 'id'>): Promise<DirectMessage> {
  const tempId = `msg-${Date.now()}`;
  const fullMsg: DirectMessage = { id: tempId, ...msg };

  try {
    const docRef = await addDoc(collection(db, 'direct_messages'), {
      ...msg,
      timestamp: msg.timestamp || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      createdAt: msg.createdAt || new Date().toISOString(),
      serverTimestamp: serverTimestamp()
    });

    // Atualizar último recado do canal
    try {
      const channelRef = doc(db, 'direct_channels', msg.channelId);
      await setDoc(channelRef, {
        lastMessage: msg.text,
        lastMessageTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch {}

    return { id: docRef.id, ...msg };
  } catch (err) {
    console.warn('Fallback saving message locally:', err);
    handleFirestoreError(err, OperationType.CREATE, 'direct_messages');
    return fullMsg;
  }
}

/**
 * Excluir Mensagem (Admin ou Autor)
 */
export async function deleteMessageFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'direct_messages', id));
  } catch (err) {
    console.warn('Error deleting message from Firestore:', err);
    handleFirestoreError(err, OperationType.DELETE, `direct_messages/${id}`);
  }
}


