import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Alert,
  Animated,
  Easing,
  Dimensions,
  Alert,
  Image
} from 'react-native';
import { useRouter,Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react-native';
import Svg, { Path, Circle, Rect, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

const { width, height } = Dimensions.get('window');

// Initialize WebBrowser for OAuth
WebBrowser.maybeCompleteAuthSession();

// Constants
const COLORS = {
  primary: '#1AE57D',
  primaryDark: '#15C96D',
  background: '#122119',
  cardBg: '#1a2e2e',
  border: '#374151',
  borderFocus: '#1AE57D',
  error: '#EF4444',
  errorBg: '#7F1D1D',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  placeholder: '#6b7280',
};

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

// Sign In Illustration Component
const SignInIllustration: React.FC = () => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 8000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View 
      className="items-center justify-center mt-[-37px]"
      style={{
        transform: [{ translateY }],
      }}
    >
      <Svg width="200" height="200" viewBox="0 0 200 200">
        <Defs>
          <LinearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#1AE57D" stopOpacity="1" />
            <Stop offset="100%" stopColor="#15C96D" stopOpacity="1" />
          </LinearGradient>
          <LinearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#2ECC71" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#1AE57D" stopOpacity="0.1" />
          </LinearGradient>
          <LinearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#1AE57D" stopOpacity="0.5" />
            <Stop offset="100%" stopColor="#2ECC71" stopOpacity="0.3" />
          </LinearGradient>
        </Defs>

        {/* Background Circle */}
        <Circle cx="100" cy="100" r="90" fill="url(#grad2)" />

        {/* Lock/Security Shield */}
        <G transform="translate(70, 50)">
          {/* Shield Background */}
          <Path 
            d="M 30 0 L 50 10 L 50 40 Q 50 60, 30 70 Q 10 60, 10 40 L 10 10 Z" 
            fill="#1a2e2e" 
            stroke="#1AE57D" 
            strokeWidth="2"
          />
          
          {/* Lock Body */}
          <Rect x="22" y="35" width="16" height="20" rx="2" fill="url(#grad1)" />
          
          {/* Lock Shackle */}
          <Path 
            d="M 25 35 L 25 28 Q 25 22, 30 22 Q 35 22, 35 28 L 35 35" 
            stroke="url(#grad1)" 
            strokeWidth="3" 
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Keyhole */}
          <Circle cx="30" cy="43" r="2" fill="#122119" />
          <Rect x="29" y="43" width="2" height="5" fill="#122119" />
        </G>

        {/* User Icon */}
        <G transform="translate(135, 90)">
          <Circle cx="0" cy="0" r="18" fill="url(#grad1)" opacity="0.9" />
          <Circle cx="0" cy="-4" r="6" fill="#122119" />
          <Path 
            d="M -10 7 Q -10 1, 0 1 Q 10 1, 10 7 Z" 
            fill="#122119" 
          />
        </G>

        {/* Key Icon */}
        <G transform="translate(50, 120)">
          <Circle cx="0" cy="0" r="15" fill="url(#grad3)" opacity="0.8" />
          <Circle cx="0" cy="0" r="5" fill="#122119" />
          <Rect x="0" y="-2" width="12" height="4" fill="#122119" />
          <Rect x="8" y="-4" width="2" height="2" fill="#122119" />
          <Rect x="11" y="-4" width="2" height="2" fill="#122119" />
        </G>

        {/* Checkmark */}
        <G transform="translate(100, 140)">
          <Circle cx="0" cy="0" r="12" fill="url(#grad1)" opacity="0.7" />
          <Path 
            d="M -5 0 L -2 4 L 5 -4" 
            stroke="#122119" 
            strokeWidth="2.5" 
            fill="none" 
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>

        {/* Floating Particles */}
        <Circle cx="35" cy="35" r="4" fill="#1AE57D" opacity="0.6" />
        <Circle cx="165" cy="45" r="5" fill="#2ECC71" opacity="0.5" />
        <Circle cx="170" cy="140" r="3" fill="#1AE57D" opacity="0.7" />
        <Circle cx="25" cy="155" r="4" fill="#2ECC71" opacity="0.6" />
        
        {/* Plus Signs */}
        <G transform="translate(25, 70)" opacity="0.5">
          <Rect x="-1" y="-6" width="2" height="12" fill="#1AE57D" />
          <Rect x="-6" y="-1" width="12" height="2" fill="#1AE57D" />
        </G>
        
        <G transform="translate(175, 110)" opacity="0.4">
          <Rect x="-1" y="-5" width="2" height="10" fill="#2ECC71" />
          <Rect x="-5" y="-1" width="10" height="2" fill="#2ECC71" />
        </G>

        {/* Arrow/Enter Icon */}
        <G transform="translate(155, 155)" opacity="0.6">
          <Path 
            d="M 0 -5 L 5 0 L 0 5 M 5 0 L -8 0" 
            stroke="#1AE57D" 
            strokeWidth="2" 
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
      </Svg>
    </Animated.View>
  );
};

// Floating Particles Component
const FloatingParticles: React.FC = () => {
  const particles = useRef(
    Array.from({ length: 15 }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    particles.forEach((particle, index) => {
      const randomDelay = Math.random() * 2000;
      const randomDuration = 3000 + Math.random() * 4000;
      const randomX = (Math.random() - 0.5) * 100;

      Animated.loop(
        Animated.sequence([
          Animated.delay(randomDelay),
          Animated.parallel([
            Animated.timing(particle.translateY, {
              toValue: -height,
              duration: randomDuration,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.timing(particle.translateX, {
              toValue: randomX,
              duration: randomDuration,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(particle.opacity, {
                toValue: 0.6,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.delay(randomDuration - 1000),
              Animated.timing(particle.opacity, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.timing(particle.scale, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.delay(randomDuration - 1000),
              Animated.timing(particle.scale, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
              }),
            ]),
          ]),
          Animated.timing(particle.translateY, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  return (
    <View className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
      {particles.map((particle, index) => {
        const size = 4 + Math.random() * 8;
        const left = Math.random() * width;
        const top = height + Math.random() * 200;

        return (
          <Animated.View
            key={index}
            style={{
              position: 'absolute',
              left: left,
              top: top,
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: COLORS.primary,
              transform: [
                { translateY: particle.translateY },
                { translateX: particle.translateX },
                { scale: particle.scale },
              ],
              opacity: particle.opacity,
            }}
          />
        );
      })}
    </View>
  );
};

// Input Field Component with Animation
interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
  secureTextEntry?: boolean;
  onSecureToggle?: () => void;
  showSecureToggle?: boolean;
  icon?: React.ReactNode;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  onSecureToggle,
  showSecureToggle,
  icon,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete,
  onFocus,
  onBlur,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [error]);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(scaleAnim, {
      toValue: 1.02,
      useNativeDriver: true,
    }).start();
    if (onFocus) onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    if (onBlur) onBlur();
  };

  return (
    <Animated.View 
      className="mb-4"
      style={{
        transform: [
          { translateX: shakeAnim },
          { scale: scaleAnim },
        ],
      }}
    >
      <Animated.Text 
        className="text-sm mb-2 ml-1 font-medium"
        style={{ color: isFocused ? COLORS.primary : COLORS.textSecondary }}
      >
        {label}
      </Animated.Text>
      <View className="relative">
        <View
          className={`flex-row items-center bg-[#1a2e2e] rounded-xl px-4 py-1 border-2 ${
            error 
              ? 'border-red-500' 
              : isFocused 
              ? 'border-[#1AE57D]' 
              : 'border-gray-700'
          }`}
        >
          {icon && <View className="mr-3">{icon}</View>}
          <TextInput
            className="flex-1 text-white text-base py-3"
            placeholder={placeholder}
            placeholderTextColor={COLORS.placeholder}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={false}
            autoComplete={autoComplete as any}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          {showSecureToggle && onSecureToggle && (
            <TouchableOpacity onPress={onSecureToggle} className="p-2">
              {secureTextEntry ? (
                <EyeOff size={20} color={COLORS.textSecondary} />
              ) : (
                <Eye size={20} color={COLORS.textSecondary} />
              )}
            </TouchableOpacity>
          )}
        </View>
        {error && (
          <View className="flex-row items-center mt-2 ml-1">
            <AlertCircle size={14} color={COLORS.error} />
            <Text className="text-red-500 text-xs ml-1">{error}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

// Error Banner with Animation
interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onDismiss }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, []);

  return (
    <Animated.View 
      className="bg-red-500/10 border-2 border-red-500 rounded-xl p-4 mb-6 flex-row items-start"
      style={{
        transform: [{ translateY: slideAnim }],
      }}
    >
      <AlertCircle size={20} color={COLORS.error} className="mt-0.5" />
      <View className="flex-1 ml-3">
        <Text className="text-red-400 font-medium text-sm leading-5">{message}</Text>
      </View>
      <TouchableOpacity onPress={onDismiss} className="ml-2">
        <Text className="text-red-400 font-bold text-lg">×</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Animated Button
interface AnimatedButtonProps {
  onPress: () => void;
  disabled: boolean;
  isLoading: boolean;
  children: React.ReactNode;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ onPress, disabled, isLoading, children }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 3,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        className={`bg-[#1AE57D] py-4 rounded-xl items-center ${disabled ? 'opacity-50' : 'opacity-100'}`}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.9}
      >
        {isLoading ? (
          <ActivityIndicator color={COLORS.background} size="small" />
        ) : (
          children
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Required for Google OAuth
WebBrowser.maybeCompleteAuthSession();
export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const [isEmailTouched, setIsEmailTouched] = useState(false);
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  // Google OAuth
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '440074217275-i3rhpdihp5dg6ga01bckb8jdc29l5759.apps.googleusercontent.com',
    androidClientId: '440074217275-i3rhpdihp5dg6ga01bckb8jdc29l5759.apps.googleusercontent.com',
    iosClientId: '440074217275-i3rhpdihp5dg6ga01bckb8jdc29l5759.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
  });

  // Handle Google OAuth response
  useEffect(() => {
    const handleGoogleAuth = async () => {
      try {
        if (response?.type === 'success') {
          const { authentication } = response;
          if (!authentication) {
            throw new Error('Authentication failed: No authentication data');
          }

          setLoading(true);
          
          try {
            const credential = GoogleAuthProvider.credential(
              authentication.idToken,
              authentication.accessToken
            );
            
            const userCredential = await signInWithCredential(auth, credential);
            
            if (userCredential.user) {
              // Small delay for better UX
              await new Promise(resolve => setTimeout(resolve, 500));
              // Redirect to home after successful sign in
              router.push({
                pathname: '/(root)',
                params: { screen: '(MainTabs)' }
              } as any);
            }
          } catch (error: any) {
            let errorMessage = 'Unable to sign in with Google. Please try again or use email and password.';
            
            if (error.code) {
              if (error.code.includes('account-exists-with-different-credential')) {
                errorMessage = 'An account already exists with the same email but different sign-in method. Please sign in using your email and password.';
              } else if (error.code.includes('auth/network-request-failed')) {
                errorMessage = 'Network error. Please check your internet connection and try again.';
              }
            }
            
            setErrors({ general: errorMessage });
          } catch (error: any) {
            console.error('Firebase auth error:', error);
            Alert.alert('Authentication Error', error.message || 'Failed to sign in with Google. Please try again.');
            setErrors(prev => ({ 
              ...prev, 
              general: error.message || 'Failed to sign in with Google. Please try again.' 
            }));
          } finally {
            setLoading(false);
          }
        } else if (response?.type === 'error') {
          // Handle user cancellation or other OAuth errors
          if (response.error?.message?.includes('cancelled')) {
            // Don't show error for user cancellation
            return;
          }
          setErrors({ 
            general: 'Google sign-in was not completed. Please try again.' 
          });
        }
      } catch (error) {
        // Catch any unexpected errors
        setErrors({ 
          general: 'An unexpected error occurred during sign-in. Please try again.' 
        });
        setLoading(false);
      }
    };

    if (response) {
      handleGoogleAuth();
    }
  }, [response, router]);

  const validateEmail = useCallback((emailToValidate: string): boolean => {
    if (!emailToValidate.trim()) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToValidate)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email' }));
      return false;
    }
    setErrors(prev => ({ ...prev, email: undefined }));
    return true;
  }, []);

  const validatePassword = useCallback((passwordToValidate: string): boolean => {
    if (!passwordToValidate) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      return false;
    }
    if (passwordToValidate.length < 6) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
      return false;
    }
    setErrors(prev => ({ ...prev, password: undefined }));
    return true;
  }, []);

  const clearError = useCallback((field: keyof FormErrors) => {
  type FormErrorField = 'email' | 'password' | 'general';

  const clearError = (field: FormErrorField) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const handleGoogleSignInPress = async () => {
    try {
      await promptAsync();
    } catch (error: any) {
      setErrors(prev => ({
        ...prev,
        general: 'Unable to start Google sign-in. Please check your connection and try again.'
      console.error('Google sign-in error:', error);
      Alert.alert('Error', 'Failed to start Google sign in. Please try again.');
      setErrors(prev => ({
        ...prev,
        general: error.message || 'Failed to start Google sign in. Please try again.'
      }));
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (isEmailTouched && errors.email) {
      clearError('email');
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (isPasswordTouched && errors.password) {
      clearError('password');
    }
  };

  const handleEmailBlur = () => {
    setIsEmailTouched(true);
    validateEmail(email);
  };

  const handlePasswordBlur = () => {
    setIsPasswordTouched(true);
    validatePassword(password);
  };

  const handleSignIn = async () => {
    try {
      // Mark fields as touched to show any validation errors
      setIsEmailTouched(true);
      setIsPasswordTouched(true);
      
      // Clear any previous errors
      setErrors({});

      // Client-side validation
      const isEmailValid = validateEmail(email);
      const isPasswordValid = validatePassword(password);

      // Show validation errors if any
      if (!isEmailValid || !isPasswordValid) {
        const newErrors: FormErrors = {};
        
        if (!email.trim()) {
          newErrors.email = 'Please enter your email address';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        
        if (!password) {
          newErrors.password = 'Please enter your password';
        } else if (password.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        }
        
        setErrors(newErrors);
        return;
      }

      setLoading(true);

      try {
        await signIn(email, password);
        // Navigate to main app on successful sign-in
        router.replace('/(root)/(MainTabs)');
      } catch (error: any) {
        let errorMessage = 'We encountered an issue signing you in. Please try again.';
        const errorCode = error?.code || '';
        const newErrors: FormErrors = {};
        
        // Handle specific Firebase error codes with user-friendly messages
        if (errorCode.includes('invalid-credential') || 
            errorCode.includes('user-not-found') || 
            errorCode.includes('wrong-password')) {
          errorMessage = 'The email or password you entered is incorrect. Please try again.';
        } else if (errorCode.includes('invalid-email')) {
          newErrors.email = 'Please enter a valid email address';
        } else if (errorCode.includes('too-many-requests')) {
          errorMessage = 'Too many failed attempts. Please wait a few minutes before trying again.';
        } else if (errorCode.includes('user-disabled')) {
          errorMessage = 'This account has been disabled. Please contact our support team for assistance.';
        } else if (errorCode.includes('network') || errorCode.includes('timeout')) {
          errorMessage = 'Unable to connect. Please check your internet connection and try again.';
        } else if (errorCode.includes('weak-password')) {
          newErrors.password = 'Your password is not strong enough. Please use at least 6 characters.';
        } else if (errorCode.includes('email-already-in-use')) {
          errorMessage = 'This email is already in use. Please sign in or use a different email.';
        }
        
        // Only set general error if no field-specific errors
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
        } else {
          setErrors({ general: errorMessage });
        }
      }
    } catch (error) {
      // Catch any unexpected errors
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
      
      // Check if admin login
      const ADMIN_EMAIL = 'admin@gmail.com';
      const ADMIN_PASSWORD = '12345678';
      
      if (email.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Set admin session
        await AsyncStorage.setItem('admin_authenticated', 'true');
        // Navigate to admin dashboard
        router.replace('/AdminDashboard' as any);
      } else {
        // Regular user - navigate to main tabs
        router.replace("/(root)/(MainTabs)");
      }
    } catch (error: any) {
      let errorMessage = 'Failed to sign in. Please try again.';
      
      // Handle common Firebase Auth errors
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      Alert.alert(
        'Email Required',
        'Please enter your email address first.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert(
        'Invalid Email',
        'Please enter a valid email address.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Reset Password',
      `We'll send a password reset link to ${email}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send', 
          onPress: () => {
            Alert.alert('Success', 'Password reset link sent to your email!');
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#122119]">
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* Floating Particles */}
      <FloatingParticles />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1 px-6"
          contentContainerStyle={{ flexGrow: 1, paddingTop: 40, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Sign In Illustration */}
          <SignInIllustration />

          {/* Header Text */}
          <View className="items-center mb-4">
            <Text className="text-white text-3xl font-bold">
              Welcome Back
            </Text>
            <Text className="text-gray-400 text-base">
              Sign in to continue to GreenPluse
            </Text>
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity onPress={() => router.push('/forgotPassword')}>
                <Text style={styles.forgotPassword}>Forgot?</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="current-password"
              placeholderTextColor="#999"
            />
          )}

          {/* Email Input */}
          <InputField
            label="Email Address"
            value={email}
            onChangeText={handleEmailChange}
            onBlur={handleEmailBlur}
            onFocus={() => clearError('email')}
            placeholder="Enter your email"
            error={isEmailTouched ? errors.email : undefined}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            icon={<Mail size={20} color={COLORS.textSecondary} />}
          />

          {/* Password Input */}
          <InputField
            label="Password"
            value={password}
            onChangeText={handlePasswordChange}
            onBlur={handlePasswordBlur}
            onFocus={() => clearError('password')}
            placeholder="Enter your password"
            error={isPasswordTouched ? errors.password : undefined}
            secureTextEntry={!showPassword}
            onSecureToggle={() => setShowPassword(!showPassword)}
            showSecureToggle={true}
            icon={<Lock size={20} color={COLORS.textSecondary} />}
          />
          </View>

          <TouchableOpacity 
            onPress={handleForgotPassword}
            className="self-end mb-4"
          >
            <Text className="text-[#1AE57D] text-sm font-medium">Forgot Password?</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <AnimatedButton
            onPress={handleSignIn}
            disabled={loading}
            isLoading={loading}
          >
            <Text className="text-[#122119] text-lg font-bold">Sign In</Text>
          </AnimatedButton>

          {/* Divider */}
          <View className="flex-row items-center justify-center my-6">
            <View className="flex-1 h-px bg-gray-700" />
            <Text className="text-gray-500 mx-4 text-sm">OR</Text>
            <View className="flex-1 h-px bg-gray-700" />
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          {/* Google Sign In Button */}
          <TouchableOpacity
            className="flex-row w-72 ml-10 items-center justify-center bg-white py-3 rounded-xl"
            onPress={handleGoogleSignIn}
            disabled={!request || loading}                    
          >
            <Image 
              source={{ uri: 'https://www.google.com/favicon.ico' }} 
              style={styles.googleIcon} 
            />
            <Text className="text-gray-800 text-base font-medium">
              {loading ? 'Signing in...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View className="flex-row justify-center mt-6 mb-2">
            <Text className="text-gray-400 text-base">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signUp')}>
              <Text className="text-[#1AE57D] font-semibold text-base">Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Additional Help */}
          <View className="mt-2 items-center">
            <Text className="text-gray-500 text-xs text-center px-6">
              By signing in, you agree to our Terms & Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signUp')}>
              <Text style={styles.signUpLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#444',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#666',
  },
  signUpLink: {
    color: '#007AFF',
    fontWeight: '600',
  },
  forgotPassword: {
    color: '#007AFF',
    fontSize: 14,
  },
  errorText: {
    color: '#ff3b30',
    marginBottom: 16,
    textAlign: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#999',
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 14,
    marginTop: 10,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleButtonText: {
    color: '#444',
    fontSize: 16,
    fontWeight: '500',
  },
});