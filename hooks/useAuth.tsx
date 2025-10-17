import React, { createContext, useState, useContext, useEffect, ReactNode, useMemo } from 'react';
import { User } from '../types';
import { useData } from './useData';

interface AuthContextType {
  currentUser: User | null;
  isOwner: boolean;
  loading: boolean;
  login: (username: string, password: string) => User | null;
  signup: (details: Omit<User, 'id' | 'createdAt'>) => User | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const data = useData();

  const isOwner = useMemo(() => {
    if (!currentUser) return false;
    const isZezo = currentUser.username.toLowerCase() === 'zezo';
    const isOwnerInList = data.owners.includes(currentUser.id);
    return isZezo || isOwnerInList;
  }, [currentUser, data.owners]);

  useEffect(() => {
    try {
        const storedUserId = localStorage.getItem('r_currentUserId');
        if (storedUserId && data.users) {
            const user = data.users.find(u => u.id === storedUserId);
            setCurrentUser(user || null);
        }
    } catch (e) {
        console.error("Failed to parse auth data from localStorage", e);
    } finally {
        setLoading(false);
    }
  }, [data.users]);

  const login = (username: string, password: string): User | null => {
    const user = data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    // For existing users without a password (for backward compatibility), or for new users with a matching password
    if (user && (user.password === password || !user.password)) {
        localStorage.setItem('r_currentUserId', user.id);
        setCurrentUser(user);
        return user;
    }
    return null;
  };

  const signup = (details: Omit<User, 'id' | 'createdAt'>): User | null => {
    const userExists = data.users.some(u => u.username.toLowerCase() === details.username.toLowerCase());
    if (userExists) {
      return null; // Username is taken
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      ...details,
      createdAt: new Date().toISOString(),
    };
    
    data.addUser(newUser);
    localStorage.setItem('r_currentUserId', newUser.id);
    setCurrentUser(newUser);
    return newUser;
  }

  const logout = () => {
    localStorage.removeItem('r_currentUserId');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, isOwner, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};