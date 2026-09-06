export type UserRole = 'parent' | 'therapist' | 'school' | 'admin';

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  permissions?: string;
  status: 'active' | 'pending';
  photoUrl?: string;
}

export interface Child {
  id: string;
  name: string;
  parents: string;
  birth: string;
  birthDateFull: string;
  age: string;
  diagnosis: string;
  photoUrl: string;
  bloodType: string;
  emergencyContact: string;
  allergies: string;
  schoolName: string;
  notes: string;
  updatedAt: string;
}

export interface TherapySession {
  id: string;
  childId: string;
  professionalId: string;
  professionalName: string;
  role: string;
  date: string;
  time: string;
  goalCategory: string;
  activities: string;
  evolution: string;
  nextGoals: string;
  behaviorsObserved: string;
  childResponse: string;
  difficulties: string;
  recommendations: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  childId: string;
  cat: string;
  name: string;
  nivel: number; // 0 to 100%
  description: string;
  responsibleProf: string;
  status: 'in_progress' | 'achieved' | 'planned';
  updatedAt: string;
}

export interface Achievement {
  id: string;
  childId: string;
  cat: string;
  title: string;
  date: string;
  desc: string;
  emoji: string;
  photoUrl?: string;
  celebrated?: boolean;
}

export interface DiaryRecord {
  id: string;
  childId: string;
  date: string;
  authorId?: string;
  authorName?: string;
  authorRole?: UserRole;
  authorRoleTitle?: string;
  category?: 'geral' | 'comunicacao' | 'sensorial' | 'rotina' | 'humor_sono' | 'terapia_casa' | 'conquista';
  humor: 'radiante' | 'tranquilo' | 'sensivel' | 'agitado' | 'cansado';
  sono: string;
  alimentacao: string;
  atividades: string;
  conquista: string;
  obs: string;
  orientacoes?: string;
  tags?: string[];
  createdAt: string;
}

export interface SchoolRecord {
  id: string;
  childId: string;
  date: string;
  teacher: string;
  atividade: string;
  participacao: string;
  socializacao: string;
  comunicacao: string;
  autonomia: string;
  conquista: string;
  observacoes: string;
  recadoPais?: string;
  createdAt: string;
}

export interface AgendaEvent {
  id: string;
  childId: string;
  day: string;
  date: string;
  time: string;
  tipo: string;
  who: string;
  local: string;
  status: 'agendado' | 'realizado' | 'remarcado';
  completed: boolean;
}

export interface ObservationRecord {
  id: string;
  childId: string;
  authorId: string;
  authorName: string;
  authorType: string;
  category: string;
  text: string;
  date: string;
  createdAt: string;
}

export interface DocumentRecord {
  id: string;
  childId: string;
  nome: string;
  cat: string;
  data: string;
  author: string;
  fileUrl?: string;
}
