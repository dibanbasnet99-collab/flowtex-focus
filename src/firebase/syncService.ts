import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './errorHandler';
import { Habit, Task, UserPreferences } from '../types';

export async function uploadLocalHabitsToCloud(userId: string, localHabits: Habit[]) {
  const collectionPath = `users/${userId}/habits`;
  try {
    for (const habit of localHabits) {
      const docRef = doc(db, collectionPath, habit.id);
      await setDoc(docRef, {
        ...habit,
        userId,
        createdAt: habit.createdAt || new Date().toISOString(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionPath);
  }
}

export async function uploadLocalTasksToCloud(userId: string, localTasks: Task[]) {
  const collectionPath = `users/${userId}/tasks`;
  try {
    for (const task of localTasks) {
      const docRef = doc(db, collectionPath, task.id);
      await setDoc(docRef, {
        ...task,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionPath);
  }
}

export async function saveHabitToFirestore(userId: string, habit: Habit) {
  const path = `users/${userId}/habits`;
  try {
    const docRef = doc(db, path, habit.id);
    await setDoc(
      docRef,
      {
        ...habit,
        userId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${habit.id}`);
  }
}

export async function deleteHabitFromFirestore(userId: string, habitId: string) {
  const path = `users/${userId}/habits/${habitId}`;
  try {
    const docRef = doc(db, `users/${userId}/habits`, habitId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveTaskToFirestore(userId: string, task: Task) {
  const path = `users/${userId}/tasks`;
  try {
    const docRef = doc(db, path, task.id);
    await setDoc(
      docRef,
      {
        ...task,
        userId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${task.id}`);
  }
}

export async function deleteTaskFromFirestore(userId: string, taskId: string) {
  const path = `users/${userId}/tasks/${taskId}`;
  try {
    const docRef = doc(db, `users/${userId}/tasks`, taskId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function savePreferencesToFirestore(userId: string, prefs: UserPreferences) {
  const path = `users/${userId}/preferences/settings`;
  try {
    const docRef = doc(db, `users/${userId}/preferences`, 'settings');
    await setDoc(
      docRef,
      {
        ...prefs,
        userId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveLeaderboardEntryToFirestore(
  userId: string,
  entry: {
    displayName: string;
    photoURL?: string;
    totalFocusMinutes: number;
    completedSessions: number;
    currentStreak: number;
    habitsCompletedCount: number;
  }
) {
  const path = `leaderboard/${userId}`;
  try {
    const docRef = doc(db, 'leaderboard', userId);
    await setDoc(
      docRef,
      {
        userId,
        displayName: entry.displayName || 'Focus User',
        photoURL: entry.photoURL || '',
        totalFocusMinutes: Math.max(0, entry.totalFocusMinutes || 0),
        completedSessions: Math.max(0, entry.completedSessions || 0),
        currentStreak: Math.max(0, entry.currentStreak || 0),
        habitsCompletedCount: Math.max(0, entry.habitsCompletedCount || 0),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
