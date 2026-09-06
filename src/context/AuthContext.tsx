import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { SystemUser, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  systemUser: SystemUser | null;
  loading: boolean;
  isAdmin: boolean;
  isParent: boolean;
  isTherapist: boolean;
  isSchool: boolean;
  isUnauthorizedDomain: boolean;
  currentHost: string;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, pass: string, role: UserRole, roleTitle: string) => Promise<void>;
  loginAsPreset: (role: UserRole, email?: string, name?: string, roleTitle?: string) => void;
  signOut: () => Promise<void>;
  switchRoleDemo: (role: UserRole, name?: string, roleTitle?: string) => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Known admin emails from security rules
const ADMIN_EMAILS = [
  'vmpveiculos@gmail.com',
  'marcospaterra31@gmail.com',
  'admin@mundoazul.com.br',
  'marcospaterra@ianpaterra',
  'marcospaterra@ianpaterra.com',
  'ianzinhopaterraoficial@gmail.com'
];

const LOCAL_STORAGE_KEY = 'mundo_azul_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [systemUser, setSystemUser] = useState<SystemUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState<boolean>(false);
  const [currentHost, setCurrentHost] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentHost(window.location.hostname);
    }
  }, []);

  const clearError = () => {
    setError(null);
    setIsUnauthorizedDomain(false);
  };

  // Sync auth state
  useEffect(() => {
    // Check local session storage first
    try {
      const savedSession = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedSession) {
        setSystemUser(JSON.parse(savedSession));
      }
    } catch {
      // ignore
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Attempt to load profile from Firestore
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const data = userDocSnap.data() as SystemUser;
            setSystemUser(data);
            try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data)); } catch {}
          } else {
            // Determine default role based on email or admin check
            const email = currentUser.email?.toLowerCase() || '';
            const isAdmin = ADMIN_EMAILS.some(adminEmail => email.includes('marcospaterra') || email === adminEmail);
            
            const newSystemUser: SystemUser = {
              id: currentUser.uid,
              name: currentUser.displayName || (email.includes('marcos') ? 'Marcos Paterra (Pai)' : 'Usuário Mundo Azul'),
              email: currentUser.email || '',
              role: isAdmin ? 'admin' : 'parent',
              roleTitle: isAdmin ? 'Pai do Ian & Administrador' : 'Família / Responsável',
              status: 'active',
              photoUrl: currentUser.photoURL || undefined
            };

            try {
              await setDoc(userDocRef, newSystemUser);
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`);
            }
            setSystemUser(newSystemUser);
            try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSystemUser)); } catch {}
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`);
          // Fallback in-memory profile if Firestore permissions or rules deny write
          const email = currentUser.email?.toLowerCase() || '';
          const isAdmin = ADMIN_EMAILS.some(adminEmail => email.includes('marcospaterra') || email === adminEmail);
          const fallbackUser: SystemUser = {
            id: currentUser.uid,
            name: currentUser.displayName || (email.includes('marcos') ? 'Marcos Paterra (Pai)' : 'Usuário Mundo Azul'),
            email: currentUser.email || '',
            role: isAdmin ? 'admin' : 'parent',
            roleTitle: isAdmin ? 'Pai do Ian & Administrador' : 'Família / Responsável',
            status: 'active',
            photoUrl: currentUser.photoURL || undefined
          };
          setSystemUser(fallbackUser);
          try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fallbackUser)); } catch {}
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginAsPreset = (role: UserRole, email?: string, name?: string, roleTitle?: string) => {
    const roleDefaults: Record<UserRole, { name: string; title: string; email: string }> = {
      admin: { 
        name: 'Marcos Paterra', 
        title: 'Pai do Ian & Administrador',
        email: 'ianzinhopaterraoficial@gmail.com'
      },
      parent: { 
        name: 'Marcos & Alessandra Paterra', 
        title: 'Pais do Ian (Família)',
        email: 'pais@ianzinhopaterraoficial.com.br'
      },
      therapist: { 
        name: 'Dra. Karen Camargo', 
        title: 'Neuropediatra (Equipe Multidisciplinar)',
        email: 'dra.karen@mundoazul.com.br'
      },
      school: { 
        name: 'Profª Mariana', 
        title: 'Escola Reino das Letras (Pedagógico)',
        email: 'escola@reinodasletras.com.br'
      }
    };

    const target = roleDefaults[role];
    const updatedUser: SystemUser = {
      id: user ? user.uid : `session-${role}-${Date.now()}`,
      name: name || target.name,
      email: email || target.email,
      role,
      roleTitle: roleTitle || target.title,
      status: 'active',
      photoUrl: role === 'admin' 
        ? 'http://ianzinhopaterraoficial.com.br/wp-content/uploads/2026/07/iansemcolar.png' 
        : undefined
    };

    setSystemUser(updatedUser);
    setError(null);
    setIsUnauthorizedDomain(false);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedUser));
    } catch {
      // ignore
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    setIsUnauthorizedDomain(false);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      const isDomainErr = err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain');
      if (isDomainErr) {
        setIsUnauthorizedDomain(true);
        const host = typeof window !== 'undefined' ? window.location.hostname : 'este domínio';
        setError(`Domínio não autorizado pelo Firebase: ${host}. Adicione-o no console do Firebase ou use o acesso instantâneo abaixo.`);
      } else {
        setError(err.message || 'Erro ao autenticar com o Google.');
      }
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setError(null);
    setIsUnauthorizedDomain(false);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      console.error('Email Sign In Error:', err);
      if (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed')) {
        // Fallback gracefully to local profile session
        const isAdmin = ADMIN_EMAILS.some(adminEmail => email.toLowerCase().includes(adminEmail));
        loginAsPreset(isAdmin ? 'admin' : 'parent', email, email.split('@')[0], isAdmin ? 'Administrador' : 'Família');
        return;
      }
      let msg = 'Erro ao realizar login.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = 'E-mail ou senha incorretos.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Formato de e-mail inválido.';
      }
      setError(msg);
      throw new Error(msg);
    }
  };

  const signUpWithEmail = async (name: string, email: string, pass: string, role: UserRole, roleTitle: string) => {
    setError(null);
    setIsUnauthorizedDomain(false);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(cred.user, { displayName: name });

      const newSystemUser: SystemUser = {
        id: cred.user.uid,
        name,
        email,
        role,
        roleTitle,
        status: 'active'
      };

      try {
        await setDoc(doc(db, 'users', cred.user.uid), newSystemUser);
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `users/${cred.user.uid}`);
      }

      setSystemUser(newSystemUser);
      try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSystemUser)); } catch {}
    } catch (err: any) {
      console.error('Sign Up Error:', err);
      if (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed')) {
        // Fallback gracefully to local profile session
        loginAsPreset(role, email, name, roleTitle);
        return;
      }
      let msg = 'Erro ao cadastrar usuário.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'Este e-mail já está cadastrado no sistema.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'A senha deve conter no mínimo 6 caracteres.';
      }
      setError(msg);
      throw new Error(msg);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err: any) {
      console.error('Sign Out Error:', err);
    } finally {
      setSystemUser(null);
      setUser(null);
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  };

  // Demo Role Switcher for seamless testability
  const switchRoleDemo = (role: UserRole, name?: string, roleTitle?: string) => {
    loginAsPreset(role, undefined, name, roleTitle);
  };

  const currentRole = systemUser?.role;
  const isAdmin = currentRole === 'admin';
  const isParent = currentRole === 'parent' || isAdmin;
  const isTherapist = currentRole === 'therapist' || isAdmin;
  const isSchool = currentRole === 'school' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        systemUser,
        loading,
        isAdmin,
        isParent,
        isTherapist,
        isSchool,
        isUnauthorizedDomain,
        currentHost,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        loginAsPreset,
        signOut,
        switchRoleDemo,
        error,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
