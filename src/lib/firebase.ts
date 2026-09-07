import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc,
  getDocFromServer,
  setDoc, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { SystemUser, Child, TherapySession, Goal, Achievement, DiaryRecord, SchoolRecord, AgendaEvent, DocumentRecord, MomentRecord, DirectChannel, DirectMessage } from '../types';

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Operation types for error handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentAuth = auth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuth?.uid,
      email: currentAuth?.email,
      emailVerified: currentAuth?.emailVerified,
      isAnonymous: currentAuth?.isAnonymous,
      tenantId: currentAuth?.tenantId,
      providerInfo: currentAuth?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Status:', JSON.stringify(errInfo));
  return errInfo;
}

// Test initial connection as required by firebase skill
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration or network status.");
    }
  }
}
testConnection();

// Initial Seed Data for Child and Clinical Records (Blank / Clean State)
export const initialChildData: Child = {
  id: 'ian-paterra-01',
  name: '',
  parents: '',
  birth: '',
  birthDateFull: '',
  age: '',
  diagnosis: '',
  photoUrl: '',
  bloodType: '',
  emergencyContact: '',
  allergies: '',
  schoolName: '',
  notes: '',
  updatedAt: new Date().toISOString()
};

export const initialSessions: TherapySession[] = [];
export const initialGoals: Goal[] = [];
export const initialAchievements: Achievement[] = [];
export const initialDiary: DiaryRecord[] = [];
export const initialSchoolRecords: SchoolRecord[] = [];
export const initialAgenda: AgendaEvent[] = [];
export const initialDocuments: DocumentRecord[] = [];
export const initialMoments: MomentRecord[] = [];

export const initialChannels: DirectChannel[] = [
  {
    id: 'channel-karen',
    participantId: 'prof-karen',
    participantName: 'Dra. Karen Camargo',
    participantRole: 'therapist',
    participantRoleTitle: 'Neuropediatra',
    participantAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'Recebi os relatos do sono. Continuamos com a suplementação indicada.',
    lastMessageTime: '10:15',
    unreadCount: 0,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
  },
  {
    id: 'channel-barbara',
    participantId: 'prof-barbara',
    participantName: 'Barbara Momberg',
    participantRole: 'therapist',
    participantRoleTitle: 'Musicoterapeuta',
    participantAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'O Ian acompanhou a pausa da cantiga batendo palmas hoje com muita alegria!',
    lastMessageTime: '11:40',
    unreadCount: 1,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString()
  },
  {
    id: 'channel-edineia',
    participantId: 'prof-edineia',
    participantName: 'Edinéia Almeida',
    participantRole: 'therapist',
    participantRoleTitle: 'Terapeuta Ocupacional (T.O.)',
    participantAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'Hoje treinamos pegada em pinça e texturas de massinha sem aversão!',
    lastMessageTime: '15:20',
    unreadCount: 0,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString()
  },
  {
    id: 'channel-marcelo',
    participantId: 'prof-marcelo',
    participantName: 'Marcelo Cardoso',
    participantRole: 'therapist',
    participantRoleTitle: 'Psicólogo ABA',
    participantAvatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
    lastMessage: '85% de acertos na discriminação visual das cores primárias na sessão.',
    lastMessageTime: 'Ontem',
    unreadCount: 0,
    createdAt: new Date(Date.now() - 13 * 86400000).toISOString()
  },
  {
    id: 'channel-juliana',
    participantId: 'prof-juliana',
    participantName: 'Dra. Juliana Mendes',
    participantRole: 'therapist',
    participantRoleTitle: 'Fonoaudióloga',
    participantAvatar: 'https://images.unsplash.com/photo-1594824813588-44473e7d58a1?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'Estimulamos os sons bilabiais /p/ e /b/ com apoio de pistas visuais.',
    lastMessageTime: '04/03',
    unreadCount: 0,
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString()
  },
  {
    id: 'channel-escola',
    participantId: 'prof-mariana',
    participantName: 'Profª Mariana (Escola Reino das Letras)',
    participantRole: 'school',
    participantRoleTitle: 'Professora Mediadora & Inclusão',
    participantAvatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
    lastMessage: 'Ian interagiu muito bem na rodinha com os coleguinhas e comeu toda a maçã.',
    lastMessageTime: 'Hoje 16:10',
    unreadCount: 1,
    createdAt: new Date(Date.now() - 11 * 86400000).toISOString()
  }
];

export const initialMessages: DirectMessage[] = [
  // Conversa com Dra. Karen (Neuropediatra)
  {
    id: 'msg-k-1',
    channelId: 'channel-karen',
    senderId: 'admin-marcos',
    senderName: 'Marcos Paterra (Pai)',
    senderRole: 'admin',
    senderRoleTitle: 'Pai do Ian & Administrador',
    text: 'Boa tarde Dra. Karen! O Ian está dormindo muito mais tranquilo após o novo ajuste de rotina que a senhora recomendou.',
    timestamp: 'Ontem às 14:10',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'msg-k-2',
    channelId: 'channel-karen',
    senderId: 'prof-karen',
    senderName: 'Dra. Karen Camargo',
    senderRole: 'therapist',
    senderRoleTitle: 'Neuropediatra',
    text: 'Excelente notícia, Marcos! Essa estabilidade no sono é fundamental para o rendimento dele nas terapias. Vamos manter a conduta.',
    timestamp: 'Hoje às 10:15',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
  },

  // Conversa com Barbara (Musicoterapeuta)
  {
    id: 'msg-b-1',
    channelId: 'channel-barbara',
    senderId: 'prof-barbara',
    senderName: 'Barbara Momberg',
    senderRole: 'therapist',
    senderRoleTitle: 'Musicoterapeuta',
    text: 'Olá Marcos e Alessandra! Hoje o Ian teve uma resposta fantástica na musicoterapia com o metalofone. Postei a foto lá na Galeria!',
    tag: 'Evolução na Sessão',
    timestamp: 'Hoje às 11:35',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 'msg-b-2',
    channelId: 'channel-barbara',
    senderId: 'admin-marcos',
    senderName: 'Marcos Paterra (Pai)',
    senderRole: 'admin',
    senderRoleTitle: 'Pai do Ian & Administrador',
    text: 'Que alegria, Barbara! Vimos a foto na galeria, ele estava com um sorriso contagiante. Em casa ele já começou a bater palminhas ao ouvir as musiquinhas!',
    timestamp: 'Hoje às 11:40',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },

  // Conversa com Edinéia (T.O.)
  {
    id: 'msg-e-1',
    channelId: 'channel-edineia',
    senderId: 'prof-edineia',
    senderName: 'Edinéia Almeida',
    senderRole: 'therapist',
    senderRoleTitle: 'Terapeuta Ocupacional',
    text: 'Marcos, conseguimos avançar na tolerância a texturas úmidas e pegada tripé. Em casa, recomendo continuar oferecendo massinha antes do banho.',
    tag: 'Orientação para Casa',
    timestamp: 'Hoje às 15:20',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },

  // Conversa com Escola Reino das Letras
  {
    id: 'msg-s-1',
    channelId: 'channel-escola',
    senderId: 'prof-mariana',
    senderName: 'Profª Mariana',
    senderRole: 'school',
    senderRoleTitle: 'Professora Mediadora',
    text: 'Queridos pais! Hoje no lanche coletivo o Ian sentou na mesa junto com os outros 4 coleguinhas e compartilhou os biscoitos. Dia muito proveitoso!',
    tag: 'Recado Escolar',
    timestamp: 'Hoje às 16:10',
    createdAt: new Date(Date.now() - 1800000).toISOString()
  }
];

