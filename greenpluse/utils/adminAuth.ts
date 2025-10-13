import { auth } from '@/config/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = '12345678';
const ADMIN_SESSION_KEY = 'admin_authenticated';

export const isAdmin = (): boolean => {
  const user = auth.currentUser;
  return user?.email === ADMIN_EMAIL;
};

export const checkAdminAccess = async (): Promise<boolean> => {
  if (!isAdmin()) {
    return false;
  }
  
  // Check if admin has authenticated with password in this session
  try {
    const isAuthenticated = await AsyncStorage.getItem(ADMIN_SESSION_KEY);
    return isAuthenticated === 'true';
  } catch (error) {
    return false;
  }
};

export const authenticateAdmin = async (password: string): Promise<boolean> => {
  if (!isAdmin()) {
    return false;
  }
  
  if (password === ADMIN_PASSWORD) {
    try {
      await AsyncStorage.setItem(ADMIN_SESSION_KEY, 'true');
      return true;
    } catch (error) {
      return false;
    }
  }
  
  return false;
};

export const logoutAdmin = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ADMIN_SESSION_KEY);
  } catch (error) {
    console.error('Error logging out admin:', error);
  }
};

export const getAdminEmail = (): string => {
  return ADMIN_EMAIL;
};

export const getAdminPassword = (): string => {
  return ADMIN_PASSWORD;
};
