import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  onSnapshot, 
  query, 
  where, 
  addDoc, 
  updateDoc,
  deleteDoc,
  getDocFromServer
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { Application, Offer, ResumeData } from '../types';

interface JobContextType {
  user: User | null;
  isAuthReady: boolean;
  applications: Application[];
  addApplication: (app: Omit<Application, 'id'>) => Promise<void>;
  updateApplication: (id: string, app: Partial<Application>) => Promise<void>;
  offers: Offer[];
  addOffer: (offer: Omit<Offer, 'id'>) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;
  updateOffer: (id: string, offer: Partial<Offer>) => Promise<void>;
  resume: ResumeData;
  updateResume: (data: Partial<ResumeData>) => Promise<void>;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

const INITIAL_RESUME: ResumeData = {
  name: '',
  email: '',
  phone: '',
  location: '',
  summary: '',
  experience: [],
  education: [],
  skills: [],
};

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [resume, setResume] = useState<ResumeData>(INITIAL_RESUME);

  // Test connection to Firestore
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
        }
      }
    }
    testConnection();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
    });
    return unsubscribe;
  }, []);

  // Sync Resume
  useEffect(() => {
    if (!user) {
      setResume(INITIAL_RESUME);
      return;
    }

    const path = `users/${user.uid}`;
    const unsubscribe = onSnapshot(doc(db, path), (docSnap) => {
      if (docSnap.exists()) {
        setResume(docSnap.data() as ResumeData);
      } else {
        setResume(INITIAL_RESUME);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return unsubscribe;
  }, [user]);

  // Sync Applications
  useEffect(() => {
    if (!user) {
      setApplications([]);
      return;
    }

    const path = 'applications';
    const q = query(collection(db, path), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Application));
      setApplications(apps);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return unsubscribe;
  }, [user]);

  // Sync Offers
  useEffect(() => {
    if (!user) {
      setOffers([]);
      return;
    }

    const path = 'offers';
    const q = query(collection(db, path), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const off = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Offer));
      setOffers(off);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return unsubscribe;
  }, [user]);

  const addApplication = async (app: Omit<Application, 'id'>) => {
    if (!user) return;
    const path = 'applications';
    try {
      const docRef = await addDoc(collection(db, path), { ...app, userId: user.uid });
      
      // If status is Offer, automatically create an offer entry
      if (app.status === 'Offer') {
        await addOffer({
          applicationId: docRef.id,
          jobTitle: app.jobTitle,
          company: app.company,
          type: 'Offer',
          status: 'Pending',
          stage: 'Offer Received',
          date: new Date().toISOString().split('T')[0],
          notes: app.jobDescription,
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const updateApplication = async (id: string, app: Partial<Application>) => {
    if (!user) return;
    const path = `applications/${id}`;
    try {
      await updateDoc(doc(db, 'applications', id), app);
      
      // If status changed to Offer, automatically create an offer entry if it doesn't exist
      if (app.status === 'Offer') {
        const existingOffer = offers.find(o => o.applicationId === id);
        if (!existingOffer) {
          const fullApp = applications.find(a => a.id === id);
          if (fullApp) {
            await addOffer({
              applicationId: id,
              jobTitle: fullApp.jobTitle,
              company: fullApp.company,
              type: 'Offer',
              status: 'Pending',
              stage: 'Offer Received',
              date: new Date().toISOString().split('T')[0],
              notes: fullApp.jobDescription,
            });
          }
        }
      } else if (app.status && (app.status as string) !== 'Offer') {
        // If status changed AWAY from Offer, remove the auto-generated offer
        const existingOffer = offers.find(o => o.applicationId === id);
        if (existingOffer) {
          await deleteOffer(existingOffer.id);
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const addOffer = async (offer: Omit<Offer, 'id'>) => {
    if (!user) return;
    const path = 'offers';
    try {
      await addDoc(collection(db, path), { ...offer, userId: user.uid, status: offer.status || 'Pending' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const deleteOffer = async (id: string) => {
    if (!user) return;
    const path = `offers/${id}`;
    try {
      await deleteDoc(doc(db, 'offers', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const updateOffer = async (id: string, offer: Partial<Offer>) => {
    if (!user) return;
    const path = `offers/${id}`;
    try {
      await updateDoc(doc(db, 'offers', id), offer);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const updateResume = async (data: Partial<ResumeData>) => {
    if (!user) return;
    const path = `users/${user.uid}`;
    try {
      await setDoc(doc(db, 'users', user.uid), { ...resume, ...data }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  return (
    <JobContext.Provider value={{
      user,
      isAuthReady,
      applications,
      addApplication,
      updateApplication,
      offers,
      addOffer,
      deleteOffer,
      updateOffer,
      resume,
      updateResume,
    }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJob = () => {
  const context = useContext(JobContext);
  if (!context) throw new Error('useJob must be used within a JobProvider');
  return context;
};
