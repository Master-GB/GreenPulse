import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  User,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

// Initialize WebBrowser for OAuth
WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Google OAuth
  const [request, response, promptAsync] = Google.useAuthRequest({
     clientId: '440074217275-i3rhpdihp5dg6ga01bckb8jdc29l5759.apps.googleusercontent.com',
  webClientId: '440074217275-i3rhpdihp5dg6ga01bckb8jdc29l5759.apps.googleusercontent.com',
  scopes: ['profile', 'email'],
  redirectUri: 'https://auth.expo.io/@master-g/GreenPluse'
  });

  // Handle Google OAuth response
  useEffect(() => {
    const handleGoogleAuth = async () => {
      try {
        if (response?.type === 'success') {
          const { authentication } = response;
          if (!authentication) {
            throw new Error('No authentication data received from Google');
          }

          const { idToken, accessToken } = authentication;
          const credential = GoogleAuthProvider.credential(idToken, accessToken);
          
          try {
            await signInWithCredential(auth, credential);
          } catch (error: any) {
            let errorMessage = 'Failed to sign in with Google';
            
            if (error.code) {
              if (error.code.includes('account-exists-with-different-credential')) {
                errorMessage = 'An account already exists with the same email but different sign-in method. Please sign in using your email and password.';
              } else if (error.code.includes('auth/network-request-failed')) {
                errorMessage = 'Network error. Please check your internet connection and try again.';
              } else if (error.code.includes('auth/invalid-credential')) {
                errorMessage = 'Invalid authentication credentials. Please try signing in again.';
              }
            }
            
            setAuthError(errorMessage);
          }
        } else if (response?.type === 'error') {
          // Don't show error for user cancellation
          if (!response.error?.message?.includes('cancelled')) {
            setAuthError('Google sign in was not completed. Please try again.');
          }
        }
      } catch (error) {
        // Handle any unexpected errors
        setAuthError('An unexpected error occurred during Google sign-in.');
      }
    };

    if (response) {
      handleGoogleAuth();
    }
  }, [response]);

  // Handle auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setAuthError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      let errorMessage = 'Failed to sign in. Please check your credentials and try again.';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            errorMessage = 'Incorrect email or password. Please try again.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed attempts. Please try again later.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled. Please contact support.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
        }
      }
      
      const authError = new Error(errorMessage);
      authError.name = error.code || 'auth/error';
      setAuthError(errorMessage);
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      setAuthError(null);
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      let errorMessage = 'Failed to create an account. Please try again.';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'This email is already in use. Please sign in instead.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Please choose a stronger password.';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'Email/password sign-in is not enabled.';
            break;
        }
      }
      
      const authError = new Error(errorMessage);
      authError.name = error.code || 'auth/error';
      setAuthError(errorMessage);
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      await firebaseSignOut(auth);
    } catch (error: any) {
      const errorMessage = 'Failed to sign out. Please try again.';
      setAuthError(errorMessage);
      const authError = new Error(errorMessage);
      authError.name = error.code || 'auth/sign-out-error';
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      await promptAsync();
    } catch (error: any) {
      const errorMessage = 'Failed to start Google Sign-In. Please try again.';
      setAuthError(errorMessage);
      const authError = new Error(errorMessage);
      authError.name = error.code || 'auth/google-signin-error';
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    authError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}