import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClassId, ClassInfo } from '../types/hub';
import { CLASSES_CONFIG } from '../data/classHubsData';

interface ClassContextType {
  classId: ClassId | 'all';
  setClassId: (id: ClassId | 'all') => void;
  activeClassInfo: ClassInfo | null;
  roomName: string;
  allClasses: ClassInfo[];
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

const LOCAL_STORAGE_CLASS_KEY = 'kch_selected_class_id';

export const ClassProvider: React.FC<{ children: React.ReactNode; initialClassId?: ClassId | 'all' }> = ({
  children,
  initialClassId = 'kb',
}) => {
  const [classId, setClassIdState] = useState<ClassId | 'all'>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_CLASS_KEY);
      if (stored && (stored === 'all' || CLASSES_CONFIG.some((c) => c.id === stored))) {
        return stored as ClassId | 'all';
      }
    } catch (e) {}
    return initialClassId;
  });

  const setClassId = (newId: ClassId | 'all') => {
    setClassIdState(newId);
    try {
      localStorage.setItem(LOCAL_STORAGE_CLASS_KEY, newId);
    } catch (e) {}
  };

  const activeClassInfo = classId === 'all' ? null : (CLASSES_CONFIG.find((c) => c.id === classId) || null);
  const roomName = activeClassInfo ? activeClassInfo.name : 'All Rooms (Director View)';

  return (
    <ClassContext.Provider
      value={{
        classId,
        setClassId,
        activeClassInfo,
        roomName,
        allClasses: CLASSES_CONFIG,
      }}
    >
      {children}
    </ClassContext.Provider>
  );
};

export function useClassContext(): ClassContextType {
  const context = useContext(ClassContext);
  if (!context) {
    throw new Error('useClassContext must be used within a ClassProvider');
  }
  return context;
}
