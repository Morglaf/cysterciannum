import { createContext, useContext, useEffect, useState } from 'react';
import { authService, User } from '../../services/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, username?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      const initAuth = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            setLoading(false);
            setInitialized(true);
            return;
          }
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error('Erreur d\'authentification:', error);
          localStorage.removeItem('token');
        } finally {
          setLoading(false);
          setInitialized(true);
        }
      };

      initAuth();
    }
  }, [initialized]);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const user = await authService.login(email, password);
      setUser(user);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const registerWithEmail = async (email: string, password: string, username?: string) => {
    try {
      const user = await authService.register(email, password, username);
      setUser(user);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signOut = async () => {
    try {
      await authService.logout();
      setUser(null);
      localStorage.removeItem('token');
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const value = {
    user,
    loading,
    signInWithEmail,
    registerWithEmail,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <div>Chargement...</div> : children}
    </AuthContext.Provider>
  );
}; 