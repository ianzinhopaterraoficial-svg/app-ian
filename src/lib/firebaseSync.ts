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
  initialDocuments 
} from './firebase';
import { 
  Child, 
  TherapySession, 
  Goal, 
  Achievement, 
  SchoolRecord, 
  AgendaEvent, 
  DocumentRecord 
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
 * Seeds initial clinical and family data into Firestore if documents do not exist yet.
 */
export async function seedFirestoreIfEmpty(): Promise<void> {
  try {
    // 1. Child Record
    const childDocRef = doc(db, 'children', initialChildData.id);
    const childSnap = await getDoc(childDocRef);
    if (!childSnap.exists()) {
      await setDoc(childDocRef, {
        ...initialChildData,
        seededAt: serverTimestamp()
      });
    }

    // 2. Sessions
    const sessionsColl = collection(db, 'sessions');
    const sessionsSnap = await getDocs(sessionsColl);
    if (sessionsSnap.empty) {
      for (const s of initialSessions) {
        await setDoc(doc(db, 'sessions', s.id), {
          ...s,
          timestamp: serverTimestamp()
        });
      }
    }

    // 3. Goals PEI
    const goalsColl = collection(db, 'goals');
    const goalsSnap = await getDocs(goalsColl);
    if (goalsSnap.empty) {
      for (const g of initialGoals) {
        await setDoc(doc(db, 'goals', g.id), {
          ...g,
          timestamp: serverTimestamp()
        });
      }
    }

    // 4. Achievements
    const achColl = collection(db, 'achievements');
    const achSnap = await getDocs(achColl);
    if (achSnap.empty) {
      for (const a of initialAchievements) {
        await setDoc(doc(db, 'achievements', a.id), {
          ...a,
          timestamp: serverTimestamp()
        });
      }
    }

    // 5. School Records
    const schColl = collection(db, 'school_records');
    const schSnap = await getDocs(schColl);
    if (schSnap.empty) {
      for (const sch of initialSchoolRecords) {
        await setDoc(doc(db, 'school_records', sch.id), {
          ...sch,
          timestamp: serverTimestamp()
        });
      }
    }

    // 6. Agenda
    const agColl = collection(db, 'agenda');
    const agSnap = await getDocs(agColl);
    if (agSnap.empty) {
      for (const ag of initialAgenda) {
        await setDoc(doc(db, 'agenda', ag.id), {
          ...ag,
          timestamp: serverTimestamp()
        });
      }
    }

    // 7. Documents
    const docColl = collection(db, 'documents');
    const docSnap = await getDocs(docColl);
    if (docSnap.empty) {
      for (const d of initialDocuments) {
        await setDoc(doc(db, 'documents', d.id), {
          ...d,
          timestamp: serverTimestamp()
        });
      }
    }
  } catch (err: any) {
    console.warn('Firebase seeding notice (non-fatal):', err.message);
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
      if (!snap.empty) {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as TherapySession[];
        setLocalCache('sessions', list);
        onUpdate(list);
      }
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
  
  try {
    const docRef = await addDoc(collection(db, 'sessions'), {
      ...session,
      timestamp: serverTimestamp()
    });
    return { id: docRef.id, ...session };
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
      if (!snap.empty) {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Goal[];
        setLocalCache('goals', list);
        onUpdate(list);
      }
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

  try {
    const docRef = await addDoc(collection(db, 'goals'), {
      ...goal,
      timestamp: serverTimestamp()
    });
    return { id: docRef.id, ...goal };
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
  try {
    const status = newLevel === 100 ? 'achieved' : 'in_progress';
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
      if (!snap.empty) {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as SchoolRecord[];
        setLocalCache('school_records', list);
        onUpdate(list);
      }
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

  try {
    const docRef = await addDoc(collection(db, 'school_records'), {
      ...record,
      timestamp: serverTimestamp()
    });
    return { id: docRef.id, ...record };
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
      if (!snap.empty) {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as AgendaEvent[];
        setLocalCache('agenda', list);
        onUpdate(list);
      }
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

  try {
    const docRef = await addDoc(collection(db, 'agenda'), {
      ...event,
      timestamp: serverTimestamp()
    });
    return { id: docRef.id, ...event };
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
      if (!snap.empty) {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Achievement[];
        setLocalCache('achievements', list);
        onUpdate(list);
      }
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
      if (!snap.empty) {
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() })) as DocumentRecord[];
        setLocalCache('documents', list);
        onUpdate(list);
      }
    }, (err) => {
      console.warn('Documents snapshot error:', err.message);
      handleFirestoreError(err, OperationType.LIST, 'documents');
    });
  } catch {
    return () => {};
  }
}
