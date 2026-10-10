import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider, testFirestoreConnection } from './config';
import { handleFirestoreError, OperationType } from './errorHandler';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  setSyncStatus: (status: 'idle' | 'syncing' | 'synced' | 'error') => void;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Sync or register user document in Firestore
        const userDocPath = `users/${currentUser.uid}`;
        try {
          const userDocRef = doc(db, userDocPath);
          const existingSnap = await getDoc(userDocRef);

          if (!existingSnap.exists()) {
            await setDoc(userDocRef, {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Focus User',
              photoURL: currentUser.photoURL || '',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          } else {
            await setDoc(
              userDocRef,
              {
                displayName: currentUser.displayName || 'Focus User',
                photoURL: currentUser.photoURL || '',
                updatedAt: serverTimestamp(),
              },
              { merge: true }
            );
          }
        } catch (err) {
          console.error('Error synchronizing user profile document:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError(err?.message || 'Failed to sign in with Google');
      }
    }
  };

  const signOutUser = async () => {
    setError(null);
    try {
      await signOut(auth);
      setSyncStatus('idle');
    } catch (err: any) {
      setError(err?.message || 'Failed to sign out');
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        syncStatus,
        setSyncStatus,
        signInWithGoogle,
        signOutUser,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
