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
import { SystemUser, Child, TherapySession, Goal, Achievement, DiaryRecord, SchoolRecord, AgendaEvent, DocumentRecord, MomentRecord } from '../types';

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

// Initial Seed Data for Ian's Comprehensive Record
export const initialChildData: Child = {
  id: 'ian-paterra-01',
  name: 'Ian Paterra',
  parents: 'Marcos Paterra & Alessandra Paterra',
  birth: 'Maio de 2023',
  birthDateFull: '10/05/2023',
  age: '2 anos e 9 meses',
  diagnosis: 'Transtorno do Espectro Autista (TEA) - Nível de Suporte (Avaliado por Dra. Karen Camargo)',
  photoUrl: 'https://ianzinhopaterraoficial.com.br/wp-content/uploads/2026/07/ianfone.png',
  bloodType: 'O+',
  emergencyContact: '(11) 98765-4321 / (11) 91234-5678 (Pai Marcos / Mãe Alessandra)',
  allergies: 'Sem alergias medicamentosas relatadas. Sensibilidade a corantes artificiais.',
  schoolName: 'Escola Infantil Reino das Letras',
  notes: 'Criança alegre, curiosa e muito afetuosa. Responde muito bem a reforços positivos, estímulos sonoros e musicais, e rotinas com previsibilidade visual.',
  updatedAt: new Date().toISOString()
};

export const initialSessions: TherapySession[] = [
  {
    id: 'sess-01',
    childId: 'ian-paterra-01',
    professionalId: 'prof-karen',
    professionalName: 'Dra. Karen Camargo',
    role: 'Neuropediatra',
    date: '28/02/2026',
    time: '14:30',
    goalCategory: 'Neurológico & Farmacológico/Desenvolvimento',
    activities: 'Avaliação clínica neurológica de rotina, análise dos relatórios multidisciplinares e acompanhamento das etapas do neurodesenvolvimento.',
    evolution: 'Ian demonstrou excelente avanço em contato visual espontâneo e resposta ao chamado. Ritmo de sono mais regularizado. Boa tolerância ao exame.',
    nextGoals: 'Continuar estimulação intensiva com equipe ABA, TO e Fono. Reavaliação em 4 meses.',
    behaviorsObserved: 'Calmo, explorou a sala com tranquilidade, acolheu estímulos lúdicos.',
    childResponse: 'Muito cooperativo durante o exame e com os brinquedos de causa-efeito.',
    difficulties: 'Pequena frustração ao trocar de brinquedo, rapidamente contornada com pistas visuais.',
    recommendations: 'Manter rotina de sono e quadro visual diário em casa e na escola.',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString()
  },
  {
    id: 'sess-02',
    childId: 'ian-paterra-01',
    professionalId: 'prof-leticia',
    professionalName: 'Letícia Onari',
    role: 'Fonoaudióloga',
    date: '03/03/2026',
    time: '09:00',
    goalCategory: 'Comunicação & Linguagem',
    activities: 'Estimulação de comunicação funcional, imitação vocal com apoio de fantoches e uso de pranchas de Comunicação Aumentativa e Alternativa (CAA).',
    evolution: 'Excelente! Apontou com intenção comunicativa clara para o objeto desejado e produziu novas vocalizações com entonação expressiva ("dá", "mais").',
    nextGoals: 'Ampliar repertório de palavras funcionais monossílabas e ampliar uso do gesto de apontar em ambiente natural.',
    behaviorsObserved: 'Alegre, sorridente, manteve atenção compartilhada por mais de 5 minutos contínuos.',
    childResponse: 'Interessado pelas figuras coloridas e músicas cantadas no violãozinho.',
    difficulties: 'Tentativa de pegar o objeto sem sinalizar; foi modelado o apontar.',
    recommendations: 'Pais devem aguardar 5 segundos de espera estruturada antes de entregar itens solicitados.',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'sess-03',
    childId: 'ian-paterra-01',
    professionalId: 'prof-edneia',
    professionalName: 'Edinéia Almeida',
    role: 'Terapeuta Ocupacional',
    date: '04/03/2026',
    time: '10:30',
    goalCategory: 'Integração Sensorial & Motricidade Fina',
    activities: 'Circuito psicomotor com balanço vestibular, caixa sensorial com texturas secas/úmidas e treino de preensão de pinça com massinha.',
    evolution: 'Ian aceitou manipular a massinha com alegria e realizou o equilíbrio sobre a prancha vestibular com menor necessidade de apoio manual.',
    nextGoals: 'Trabalhar autorregulação sensorial perante estímulos táteis pegajosos e incentivar despir peças simples de roupa.',
    behaviorsObserved: 'Regulado sensorialmente, sem crises ou sobrecargas táteis.',
    childResponse: 'Adorou o balanço ninho e riu bastante durante o percurso sensorial.',
    difficulties: 'Hesitação inicial com a textura gelatinosa; superado após ver a terapeuta brincar primeiro.',
    recommendations: 'Oferecer brincadeiras com água e esponjas durante o banho em casa.',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'sess-04',
    childId: 'ian-paterra-01',
    professionalId: 'prof-barbara',
    professionalName: 'Barbara Momberg',
    role: 'Musicoterapeuta',
    date: '05/03/2026',
    time: '15:00',
    goalCategory: 'Expressão Sonora & Atenção Compartilhada',
    activities: 'Canções com pausas estruturadas (espera pela reação da criança), exploração do tambor e metalofone em alternância de turnos.',
    evolution: 'Ian completou a pausa da música batendo palmas no tempo certo e olhou nos olhos da terapeuta para pedir a continuação da cantiga!',
    nextGoals: 'Estimular ritmo e coordenação bimanual com pandeirinho e tambor.',
    behaviorsObserved: 'Extremamente conectado com melodias suaves e canções infantis afetivas.',
    childResponse: 'Dançou, bateu palmas e segurou a baqueta com firmeza.',
    difficulties: 'Nenhuma, sessão muito fluida e harmoniosa.',
    recommendations: 'Utilizar as canções trabalhadas para momentos de transição de tarefas na rotina.',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'sess-05',
    childId: 'ian-paterra-01',
    professionalId: 'prof-marcelo',
    professionalName: 'Marcelo Cardoso',
    role: 'Psicólogo ABA',
    date: '06/03/2026',
    time: '16:00',
    goalCategory: 'Desenvolvimento Cognitivo & Comportamento',
    activities: 'Treino de imitação motora grossa (bater palmas, levantar os braços), emparelhamento de cores e seguimento de comandos de 1 passo.',
    evolution: 'Atingiu 85% de acertos independentes no emparelhamento de blocos das cores primárias (azul, amarelo e vermelho). Redução de comportamentos de fuga.',
    nextGoals: 'Introduzir quebra-cabeças de encaixe de 3 peças e reforçar espera em fila de brincadeira.',
    behaviorsObserved: 'Muito focado, engajado e motivado com o reforçador lúdico (carrinhos coloridos).',
    childResponse: 'Comemora os acertos com sorrisos espontâneos para o terapeuta.',
    difficulties: 'Necessidade de prompts leves quando distraído por sons externos.',
    recommendations: 'Reforçar o comando "guarda os brinquedos" com apoio visual em casa.',
    createdAt: new Date().toISOString()
  }
];

export const initialGoals: Goal[] = [
  {
    id: 'goal-01',
    childId: 'ian-paterra-01',
    cat: 'Comunicação',
    name: 'Apontar para solicitar itens desejados',
    nivel: 85,
    description: 'Ian deve utilizar o gesto de apontar com contato visual acompanhado em pelo menos 80% das oportunidades diárias.',
    responsibleProf: 'Letícia Onari (Fonoaudiologia)',
    status: 'in_progress',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'goal-02',
    childId: 'ian-paterra-01',
    cat: 'Sensorial & Motor',
    name: 'Tolerância a texturas úmidas e massinha',
    nivel: 90,
    description: 'Manipular massinhas, tintas guache e texturas variadas sem manifestação de aversão tátil por pelo menos 10 minutos.',
    responsibleProf: 'Edinéia Almeida (T.O.)',
    status: 'achieved',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'goal-03',
    childId: 'ian-paterra-01',
    cat: 'Cognição & ABA',
    name: 'Emparelhamento de cores primárias e formas',
    nivel: 80,
    description: 'Identificar e agrupar objetos por cores (azul, amarelo, vermelho) e formas geométricas básicas de encaixe.',
    responsibleProf: 'Marcelo Cardoso (Psicologia ABA)',
    status: 'in_progress',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'goal-04',
    childId: 'ian-paterra-01',
    cat: 'Musicoterapia',
    name: 'Alternância de turnos musicais e resposta a pausas',
    nivel: 75,
    description: 'Aguardar a sua vez de tocar o instrumento e sinalizar verbal ou gestualmente o desejo de continuar a canção.',
    responsibleProf: 'Barbara Momberg (Musicoterapia)',
    status: 'in_progress',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'goal-05',
    childId: 'ian-paterra-01',
    cat: 'Autonomia & Rotina',
    name: 'Transição suave entre atividades com apoio visual',
    nivel: 70,
    description: 'Aceitar a troca de atividade lúdica guiando-se pelo quadro de rotina com temporizador sem desregulação emocional.',
    responsibleProf: 'Equipe Multidisciplinar & Pais',
    status: 'in_progress',
    updatedAt: new Date().toISOString()
  }
];

export const initialAchievements: Achievement[] = [
  {
    id: 'ach-01',
    childId: 'ian-paterra-01',
    cat: 'Afeto & Conexão',
    title: 'Sorriso com Contato Visual Intencional',
    date: 'Fevereiro de 2026',
    desc: 'Ian buscou ativamente o olhar do papai Marcos e da mamãe Alessandra para compartilhar a alegria ao ver sua música favorita tocar!',
    emoji: '💙',
    photoUrl: 'http://ianzinhopaterraoficial.com.br/wp-content/uploads/2026/07/IMG-20230801-WA0157-e1785031443739.jpg',
    celebrated: true
  },
  {
    id: 'ach-02',
    childId: 'ian-paterra-01',
    cat: 'Sensorial & Arte',
    title: 'Explorou Pintura com as Mãozinhas',
    date: 'Janeiro de 2026',
    desc: 'Superou a hesitação com texturas e se divertiu criando uma arte cheia de cores azuis e amarelas na terapia ocupacional!',
    emoji: '🎨',
    photoUrl: 'http://ianzinhopaterraoficial.com.br/wp-content/uploads/2026/07/IMG-20240210-WA0051.jpg',
    celebrated: true
  },
  {
    id: 'ach-03',
    childId: 'ian-paterra-01',
    cat: 'Comunicação',
    title: 'Apontou com Firmeza para Pedir o Brinquedo',
    date: 'Fevereiro de 2026',
    desc: 'Em vez de puxar a mão, esticou o dedinho indicador e olhou para a fonoaudióloga Letícia pedindo o carrinho!',
    emoji: '✨',
    photoUrl: 'http://ianzinhopaterraoficial.com.br/wp-content/uploads/2026/07/Screenshot_2024-08-04-18-05-40-458_com.miui_.gallery-edit.jpg',
    celebrated: true
  },
  {
    id: 'ach-04',
    childId: 'ian-paterra-01',
    cat: 'Coordenação Motora',
    title: 'Passos Firmes e Brincadeira no Parque',
    date: 'Outubro de 2025',
    desc: 'Correu pelo gramado com autonomia, subiu no pequeno escorregador e interagiu feliz ao ar livre.',
    emoji: '⭐',
    photoUrl: 'http://ianzinhopaterraoficial.com.br/wp-content/uploads/2026/07/20251010_192034-scaled.jpg',
    celebrated: true
  }
];

export const initialDiary: DiaryRecord[] = [
  {
    id: 'diary-01',
    childId: 'ian-paterra-01',
    date: '06/03/2026',
    authorName: 'Marcos & Alessandra Paterra',
    authorRole: 'parent',
    authorRoleTitle: 'Pais do Ian (Família)',
    category: 'rotina',
    humor: 'radiante',
    sono: '9h30min contínuas, dormiu às 21h00 e acordou às 06h30 super disposto',
    alimentacao: 'Comeu bem frutas no café, almoçou arroz com legumes e frango sem resistência.',
    atividades: 'Brincou de blocos de montar com o papai Marcos, ouviu as músicas do site e dançou!',
    conquista: 'Pediu água apontando para o copo no balcão e vocalizou "á-gwa".',
    obs: 'Dia muito harmonioso, sem episódios de sobrecarga sonora. Respondeu prontamente ao chamado pelo nome.',
    orientacoes: 'Continuar estimulando a troca de turnos durante as canções antes de dormir.',
    tags: ['Sono Regulado', 'Comunicação Espontânea', 'Alimentação Positiva'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'diary-02',
    childId: 'ian-paterra-01',
    date: '05/03/2026',
    authorName: 'Letícia Onari',
    authorRole: 'therapist',
    authorRoleTitle: 'Fonoaudióloga (Clínica)',
    category: 'comunicacao',
    humor: 'radiante',
    sono: 'Relato dos pais: boa noite de sono pré-sessão',
    alimentacao: 'Boa aceitação de água na garrafinha com canudo durante a terapia',
    atividades: 'Treino de intenção comunicativa com apoio de brinquedos de sopro e bolinhas de sabão.',
    conquista: 'Manteve contato ocular por mais de 5 segundos ao solicitar "mais bolha" apontando.',
    obs: 'Excelente engajamento vocal e motor. Ian comemorou cada conquista com palmas.',
    orientacoes: 'Orientação aos pais: aguardar 3 segundos antes de entregar o item para estimular o apontar ou vocalização espontânea.',
    tags: ['Fonoaudiologia', 'Contato Visual', 'Comunicação Funcional'],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'diary-03',
    childId: 'ian-paterra-01',
    date: '04/03/2026',
    authorName: 'Edinéia Almeida',
    authorRole: 'therapist',
    authorRoleTitle: 'Terapeuta Ocupacional (Integração Sensorial)',
    category: 'sensorial',
    humor: 'tranquilo',
    sono: 'Descanso pós-almoço realizado',
    alimentacao: 'Lanche da tarde com textura crocante bem aceito',
    atividades: 'Circuito vestibular com balanço terapêutico e exploração de texturas (massinha e espuma).',
    conquista: 'Tolerou tocar a espuma colorida com as duas mãos sem sobressalto.',
    obs: 'Progressiva dessensibilização tátil observada. Ótima autorregulação com suporte de pressão profunda.',
    orientacoes: 'Manter a brincadeira com massinha de modelar em casa por 10 minutos ao dia.',
    tags: ['Terapia Ocupacional', 'Integração Sensorial', 'Regulação'],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

export const initialSchoolRecords: SchoolRecord[] = [
  {
    id: 'sch-01',
    childId: 'ian-paterra-01',
    date: '06/03/2026',
    teacher: 'Profª Mariana & Mediadora Camila',
    atividade: 'Roda de história cantada e circuito com colchonetes na brinquedoteca.',
    participacao: 'Excelente. Ficou sentado na rodinha durante toda a canção e sorriu para os colegas.',
    socializacao: 'Dividiu espontaneamente uma bola com o amiguinho Lucas.',
    comunicacao: 'Usou a prancha de figuras da sala para pedir o brinquedo de encaixar.',
    autonomia: 'Guardou a lancheira com o auxílio verbal da mediadora.',
    conquista: 'Aceitou sem chorar a troca do pátio para a sala usando a contagem de 5 dedinhos.',
    observacoes: 'Ian estava radiante hoje! Parabéns aos pais pelo estímulo em casa.',
    recadoPais: 'Lembrar de enviar uma muda extra de camiseta para a aula de artes na segunda-feira.',
    createdAt: new Date().toISOString()
  }
];

export const initialAgenda: AgendaEvent[] = [
  {
    id: 'ag-01',
    childId: 'ian-paterra-01',
    day: 'Segunda-feira',
    date: '09/03/2026',
    time: '09:00',
    tipo: 'Fonoaudiologia',
    who: 'Letícia Onari',
    local: 'Clínica Mundo Azul',
    status: 'agendado',
    completed: false
  },
  {
    id: 'ag-02',
    childId: 'ian-paterra-01',
    day: 'Segunda-feira',
    date: '09/03/2026',
    time: '14:30',
    tipo: 'Terapia Ocupacional',
    who: 'Edinéia Almeida',
    local: 'Sala de Integração Sensorial',
    status: 'agendado',
    completed: false
  },
  {
    id: 'ag-03',
    childId: 'ian-paterra-01',
    day: 'Terça-feira',
    date: '10/03/2026',
    time: '15:00',
    tipo: 'Musicoterapia',
    who: 'Barbara Momberg',
    local: 'Espaço Sonoro Multidisciplinar',
    status: 'agendado',
    completed: false
  },
  {
    id: 'ag-04',
    childId: 'ian-paterra-01',
    day: 'Quarta-feira',
    date: '11/03/2026',
    time: '16:00',
    tipo: 'Psicologia ABA & Comportamento',
    who: 'Marcelo Cardoso',
    local: 'Sala de Desenvolvimento Cognitivo',
    status: 'agendado',
    completed: false
  },
  {
    id: 'ag-05',
    childId: 'ian-paterra-01',
    day: 'Sexta-feira',
    date: '13/03/2026',
    time: '14:00',
    tipo: 'Consulta de Acompanhamento Neuropediátrico',
    who: 'Dra. Karen Camargo',
    local: 'Consultório de Neurofisiologia',
    status: 'agendado',
    completed: false
  }
];

export const initialDocuments: DocumentRecord[] = [
  {
    id: 'doc-01',
    childId: 'ian-paterra-01',
    nome: 'Laudo Médico de Diagnóstico e Plano Terapêutico - TEA',
    cat: 'Laudo Médico / Neuropediatria',
    data: 'Maio de 2024',
    author: 'Dra. Karen Camargo - CRM/SP (Neuropediatra)',
    fileUrl: '#'
  },
  {
    id: 'doc-02',
    childId: 'ian-paterra-01',
    nome: 'Avaliação Fonoaudiológica Inicial e Perfil de Linguagem',
    cat: 'Relatório Terapêutico',
    data: 'Junho de 2024',
    author: 'Letícia Onari - CRFa (Fonoaudióloga)',
    fileUrl: '#'
  },
  {
    id: 'doc-03',
    childId: 'ian-paterra-01',
    nome: 'Plano Educacional Individualizado (PEI) 2026',
    cat: 'Pedagógico / PEI',
    data: 'Fevereiro de 2026',
    author: 'Coordenação Pedagógica & Equipe Multidisciplinar',
    fileUrl: '#'
  }
];

export const initialMoments: MomentRecord[] = [
  {
    id: 'moment-01',
    childId: 'ian-paterra-01',
    title: 'Exploração Sonora no Metalofone',
    description: 'Ian completou a pausa da cantiga batendo palmas no tempo exato e olhou com alegria para pedir a repetição da música!',
    photoUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&auto=format&fit=crop&q=80',
    date: '05/03/2026',
    category: 'terapia',
    authorId: 'prof-barbara',
    authorName: 'Barbara Momberg',
    authorRole: 'therapist',
    authorRoleTitle: 'Musicoterapeuta',
    tags: ['Musicoterapia', 'Atenção Compartilhada', 'Ritmo'],
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'moment-02',
    childId: 'ian-paterra-01',
    title: 'Superação Sensorial com Massinhas Coloridas',
    description: 'Hoje na T.O. o Ian moldou bolinhas e cortou formas de estrelinhas por 15 minutos seguidos sem aversão tátil. Um grande marco!',
    photoUrl: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&auto=format&fit=crop&q=80',
    date: '04/03/2026',
    category: 'sensorial',
    authorId: 'prof-edineia',
    authorName: 'Edinéia Almeida',
    authorRole: 'therapist',
    authorRoleTitle: 'Terapeuta Ocupacional',
    tags: ['Integração Sensorial', 'T.O.', 'Coordenação Fina'],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'moment-03',
    childId: 'ian-paterra-01',
    title: 'Tarde no Parque com Balanço & Sorrisos',
    description: 'Passeio em família! Ian pediu "mais balanço" apontando e mantendo contato visual direto com a mamãe e o papai.',
    photoUrl: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&auto=format&fit=crop&q=80',
    date: '01/03/2026',
    category: 'familia',
    authorId: 'user-marcos',
    authorName: 'Marcos Paterra',
    authorRole: 'admin',
    authorRoleTitle: 'Pai & Administrador',
    tags: ['Família', 'Parque', 'Comunicação Espontânea'],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'moment-04',
    childId: 'ian-paterra-01',
    title: 'Pintura Coletiva na Sala de Aula',
    description: 'Ian participou da roda com os coleguinhas e pintou o sol no cartaz da primavera com as duas mãozinhas na Escola Reino das Letras.',
    photoUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&auto=format&fit=crop&q=80',
    date: '28/02/2026',
    category: 'escola',
    authorId: 'prof-mariana',
    authorName: 'Profª Mariana',
    authorRole: 'school',
    authorRoleTitle: 'Professora Mediadora',
    tags: ['Escola', 'Inclusão', 'Socialização'],
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString()
  },
  {
    id: 'moment-05',
    childId: 'ian-paterra-01',
    title: 'Emparelhamento Perfeito de Blocos no ABA',
    description: '85% de acertos na separação de blocos azuis, vermelhos e amarelos! Ian comemorou cada conquista batendo palmas.',
    photoUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&auto=format&fit=crop&q=80',
    date: '26/02/2026',
    category: 'conquista',
    authorId: 'prof-marcelo',
    authorName: 'Marcelo Cardoso',
    authorRole: 'therapist',
    authorRoleTitle: 'Psicólogo ABA',
    tags: ['ABA', 'Cores', 'Atenção Sustentada'],
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString()
  }
];

