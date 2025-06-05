
import { useState, useEffect } from 'react';

interface ReadingProgress {
  [resourceId: number]: {
    isRead: boolean;
    progress: number; // 0-100
    lastReadAt: string;
  };
}

export const useReadingProgress = () => {
  const [progress, setProgress] = useState<ReadingProgress>({});

  useEffect(() => {
    const saved = localStorage.getItem('education-progress');
    if (saved) {
      setProgress(JSON.parse(saved));
    }
  }, []);

  const markAsRead = (resourceId: number) => {
    setProgress(prev => {
      const newProgress = {
        ...prev,
        [resourceId]: {
          isRead: true,
          progress: 100,
          lastReadAt: new Date().toISOString()
        }
      };
      localStorage.setItem('education-progress', JSON.stringify(newProgress));
      return newProgress;
    });
  };

  const updateProgress = (resourceId: number, progressPercent: number) => {
    setProgress(prev => {
      const newProgress = {
        ...prev,
        [resourceId]: {
          isRead: progressPercent >= 100,
          progress: progressPercent,
          lastReadAt: new Date().toISOString()
        }
      };
      localStorage.setItem('education-progress', JSON.stringify(newProgress));
      return newProgress;
    });
  };

  const getProgress = (resourceId: number) => progress[resourceId] || { isRead: false, progress: 0, lastReadAt: '' };
  const isRead = (resourceId: number) => progress[resourceId]?.isRead || false;
  const getReadCount = () => Object.values(progress).filter(p => p.isRead).length;

  return { progress, markAsRead, updateProgress, getProgress, isRead, getReadCount };
};
