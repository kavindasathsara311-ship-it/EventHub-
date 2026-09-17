import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loginUserInFirestore,
  registerUserInFirestore,
  updateUserProfileInFirestore
} from '../services/firebaseService';

export const AuthContext = createContext();

const STORAGE_KEY = 'USER_SESSION';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedUser && isMounted) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to load user session from AsyncStorage:', error);
      }
    };

    loadSession();

    return () => {
      isMounted = false;
    };
  }, []);


  const login = async (email, password) => {
    try {
      const userData = await loginUserInFirestore(email, password);
      setUser(userData);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message || 'Login failed.' };
    }
  };

  const register = async (name, email, password, role = 'user') => {
    try {
      const userData = await registerUserInFirestore(name, email, password, role);
      setUser(userData);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message || 'Registration failed.' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUser(null);
    } catch (error) {
      console.error('Failed to remove user session', error);
    }
  };

  const updateUser = async (updatedData) => {
    try {
      let updatedUser = { ...user, ...updatedData };
      if (user && user.id) {
        updatedUser = await updateUserProfileInFirestore(user.id, updatedData);
      }
      setUser(updatedUser);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Failed to update user session', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

