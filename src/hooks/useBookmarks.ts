
import { useState, useEffect } from 'react';

export const useBookmarks = () => {
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('education-bookmarks');
    if (saved) {
      setBookmarkedIds(JSON.parse(saved));
    }
  }, []);

  const toggleBookmark = (id: number) => {
    setBookmarkedIds(prev => {
      const newBookmarks = prev.includes(id) 
        ? prev.filter(bookmarkId => bookmarkId !== id)
        : [...prev, id];
      
      localStorage.setItem('education-bookmarks', JSON.stringify(newBookmarks));
      return newBookmarks;
    });
  };

  const isBookmarked = (id: number) => bookmarkedIds.includes(id);

  return { bookmarkedIds, toggleBookmark, isBookmarked };
};
