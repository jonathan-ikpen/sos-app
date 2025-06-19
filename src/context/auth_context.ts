import { useContext, createContext } from 'react';
import { User } from 'firebase/auth';

export interface AuthContextType {
  user: User | null | undefined;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({ user: undefined, loading: true });

export const useAuth = () => useContext(AuthContext);