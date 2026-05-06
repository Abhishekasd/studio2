import { db } from './firebase';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';

export interface SavedResume {
  id: string;
  templateId: string;
  templateName: string;
  formData: Record<string, any>;
  savedAt: any;
}

export async function saveResume(
  userId: string,
  templateId: string,
  templateName: string,
  formData: Record<string, any>
): Promise<string> {
  const resumeId = `${templateId}_${Date.now()}`;
  const resumeRef = doc(db, 'users', userId, 'resumes', resumeId);
  await setDoc(resumeRef, {
    id: resumeId,
    templateId,
    templateName,
    formData,
    savedAt: serverTimestamp(),
  });
  return resumeId;
}

export async function loadResumes(userId: string): Promise<SavedResume[]> {
  const resumesRef = collection(db, 'users', userId, 'resumes');
  const snapshot = await getDocs(resumesRef);
  return snapshot.docs.map((doc) => doc.data() as SavedResume);
}

export async function loadResume(userId: string, resumeId: string): Promise<SavedResume | null> {
  const resumeRef = doc(db, 'users', userId, 'resumes', resumeId);
  const snapshot = await getDoc(resumeRef);
  if (!snapshot.exists()) return null;
  return snapshot.data() as SavedResume;
}

export async function deleteResume(userId: string, resumeId: string): Promise<void> {
  const resumeRef = doc(db, 'users', userId, 'resumes', resumeId);
  await deleteDoc(resumeRef);
}
