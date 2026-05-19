import React, { createContext, useState, useContext } from 'react';

const Mp3QuranContext = createContext();

export const Mp3QuranProvider = ({ children }) => {
  const [mp3PlayerState, setMp3PlayerState] = useState({
    isOpen: false,
    isMinimized: false,
    surahNumber: null,
    surahName: "",
  });

  const openMp3Player = (surahNumber, surahName) => {
    setMp3PlayerState({ isOpen: true, isMinimized: false, surahNumber, surahName });
  };

  const closeMp3Player = () => {
    setMp3PlayerState(prev => ({ ...prev, isOpen: false }));
  };

  const toggleMinimizeMp3Player = () => {
    setMp3PlayerState(prev => ({ ...prev, isMinimized: !prev.isMinimized }));
  };

  return (
    <Mp3QuranContext.Provider value={{ mp3PlayerState, openMp3Player, closeMp3Player, toggleMinimizeMp3Player }}>
      {children}
    </Mp3QuranContext.Provider>
  );
};

export const useMp3Quran = () => useContext(Mp3QuranContext);
