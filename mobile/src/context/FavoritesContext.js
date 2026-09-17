import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const FavoritesContext = createContext();

const STORAGE_KEY = 'FAVORITES';

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const storedFavs = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedFavs) {
        setFavorites(JSON.parse(storedFavs));
      }
    } catch (error) {
      console.error('Failed to load favorites from AsyncStorage', error);
    }
  };

  const toggleFavorite = async (eventId) => {
    try {
      let updatedFavs;
      if (favorites.includes(eventId)) {
        updatedFavs = favorites.filter((id) => id !== eventId);
      } else {
        updatedFavs = [...favorites, eventId];
      }
      setFavorites(updatedFavs);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFavs));
    } catch (error) {
      console.error('Failed to toggle favorite', error);
    }
  };

  const isFavorite = (eventId) => {
    return favorites.includes(eventId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};
