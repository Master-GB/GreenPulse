import React, { useState, useCallback, useEffect, useRef } from "react";
import { 
  View, 
  TextInput, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Pressable,
  Animated,
  Easing,
  Dimensions,
  Image
} from "react-native";
import { router } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth, db } from "../config/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

// Initialize WebBrowser for OAuth
WebBrowser.maybeCompleteAuthSession();
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react-native';
import Svg, { Path, Circle, Rect, G, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Constants
const COLORS = {
  primary: '#1AE57D',
  primaryDark: '#15C96D',
  background: '#122119',
  cardBg: '#1a2e2e',
  border: '#374151',
  borderFocus: '#1AE57D',
  error: '#EF4444',
  success: '#1AE57D',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  placeholder: '#6b7280',
  inputBg: '#1E2E24',
};

const VALIDATION_RULES = {
  name: {
    required: 'Name is required',
    minLength: 2,
    tooShort: 'Name must be at least 2 characters',
  },
  email: {
    required: 'Email is required',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    invalid: 'Please enter a valid email address',
  },
  password: {
    required: 'Password is required',
    minLength: 6,
    tooShort: 'Password must be at least 6 characters',
  },
};

// Types
interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  general?: string;
}

// Custom Hook for Form Validation
const useFormValidation = () => {
  const [errors, setErrors] = useState<FormErrors>({});

  const validateName = useCallback((name: string): boolean => {
    if (!name.trim()) {
      setErrors(prev => ({ ...prev, name: VALIDATION_RULES.name.required }));
      return false;
    }
    if (name.trim().length < VALIDATION_RULES.name.minLength) {
      setErrors(prev => ({ ...prev, name: VALIDATION_RULES.name.tooShort }));
      return false;
    }
    setErrors(prev => ({ ...prev, name: undefined }));
    return true;
  }, []);

  const validateEmail = useCallback((email: string): boolean => {
    if (!email.trim()) {
      setErrors(prev => ({ ...prev, email: VALIDATION_RULES.email.required }));
      return false;
    }
    if (!VALIDATION_RULES.email.pattern.test(email)) {
      setErrors(prev => ({ ...prev, email: VALIDATION_RULES.email.invalid }));
      return false;
    }
    setErrors(prev => ({ ...prev, email: undefined }));
    return true;
  }, []);

  const validatePassword = useCallback((password: string): boolean => {
    if (!password) {
      setErrors(prev => ({ ...prev, password: VALIDATION_RULES.password.required }));
      return false;
    }
    if (password.length < VALIDATION_RULES.password.minLength) {
      setErrors(prev => ({ ...prev, password: VALIDATION_RULES.password.tooShort }));
      return false;
    }
    setErrors(prev => ({ ...prev, password: undefined }));
    return true;
  }, []);

  const clearError = useCallback((field: keyof FormErrors) => {
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    setErrors,
    validateName,
    validateEmail,
    validatePassword,
    clearError,
    clearAllErrors,
  };
};

// Sign Up Illustration Component
const SignUpIllustration: React.FC = () => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

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
            duration: 6000,
            easing: Easing.linear,
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
      className="items-center justify-center mb-[-5px] mt-[-40px]"
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
        </Defs>

        {/* Background Circle */}
        <Circle cx="100" cy="100" r="90" fill="url(#grad2)" />

        {/* Document/Form */}
        <G transform="translate(50, 40)">
          <Rect x="0" y="0" width="100" height="120" rx="8" fill="#1a2e2e" stroke="#1AE57D" strokeWidth="2" />
          
          {/* Form Lines */}
          <Rect x="15" y="20" width="70" height="8" rx="4" fill="#374151" />
          <Rect x="15" y="40" width="70" height="8" rx="4" fill="#374151" />
          <Rect x="15" y="60" width="50" height="8" rx="4" fill="#374151" />
          
          {/* Checkmark Circle */}
          <Circle cx="50" cy="95" r="15" fill="url(#grad1)" />
          <Path 
            d="M 43 95 L 48 100 L 57 88" 
            stroke="#122119" 
            strokeWidth="3" 
            fill="none" 
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>

        {/* User Icon */}
        <G transform="translate(30, 90)">
          <Circle cx="0" cy="0" r="20" fill="url(#grad1)" opacity="0.8" />
          <Circle cx="0" cy="-5" r="7" fill="#122119" />
          <Path 
            d="M -12 8 Q -12 0, 0 0 Q 12 0, 12 8 Z" 
            fill="#122119" 
          />
        </G>

        {/* Floating Elements */}
        <Circle cx="30" cy="30" r="4" fill="#1AE57D" opacity="0.6" />
        <Circle cx="170" cy="50" r="5" fill="#2ECC71" opacity="0.5" />
        <Circle cx="160" cy="150" r="3" fill="#1AE57D" opacity="0.7" />
        
        {/* Plus Signs */}
        <G transform="translate(25, 160)" opacity="0.5">
          <Rect x="-1" y="-6" width="2" height="12" fill="#1AE57D" />
          <Rect x="-6" y="-1" width="12" height="2" fill="#1AE57D" />
        </G>
        
        <G transform="translate(175, 35)" opacity="0.4">
          <Rect x="-1" y="-5" width="2" height="10" fill="#2ECC71" />
          <Rect x="-5" y="-1" width="10" height="2" fill="#2ECC71" />
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

// Input Field Component
interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
  secureTextEntry?: boolean;
  onSecureToggle?: () => void;
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
          className={`flex-row items-center bg-[#1E2E24] rounded-xl px-4 py-1 border-2 ${
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
          {onSecureToggle && (
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

// Error Banner
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
        <Text className="text-red-400 font-medium text-sm leading-5">
          {message}
        </Text>
      </View>
      <TouchableOpacity onPress={onDismiss} className="ml-2">
        <Text className="text-red-400 font-bold text-lg">×</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Success Banner
interface SuccessBannerProps {
  message: string;
}

const SuccessBanner: React.FC<SuccessBannerProps> = ({ message }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View 
      className="bg-green-500/10 border-2 border-[#1AE57D] rounded-xl p-4 mb-6 flex-row items-center"
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: fadeAnim,
      }}
    >
      <CheckCircle size={20} color={COLORS.success} />
      <Text className="text-[#1AE57D] font-medium text-sm ml-3">
        {message}
      </Text>
    </Animated.View>
  );
};

// Password Strength Indicator
interface Strength {
  label: string;
  color: string;
  width: string;
  widthValue: number;
}

const PasswordStrengthIndicator: React.FC<{ password: string }> = ({ password }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  const getStrength = (): Strength => {
    if (password.length === 0) return { label: '', color: '', width: 'w-0', widthValue: 0 };
    if (password.length < 6) return { label: 'Weak', color: '#EF4444', width: 'w-1/3', widthValue: 0.33 };
    if (password.length < 10) return { label: 'Medium', color: '#F59E0B', width: 'w-2/3', widthValue: 0.66 };
    return { label: 'Strong', color: '#1AE57D', width: 'w-full', widthValue: 1 };
  };

  const strength = getStrength();

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: strength.widthValue,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
  }, [password]);

  if (!password) return null;

  const animatedWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View className="mb-4">
      <View className="h-1 bg-gray-700 rounded-full overflow-hidden mb-1">
        <Animated.View 
          className="h-full"
          style={{ 
            backgroundColor: strength.color,
            width: animatedWidth,
          }}
        />
      </View>
      <Text className="text-xs ml-1" style={{ color: strength.color }}>
        Password strength: {strength.label}
      </Text>
    </View>
  );
};

// Animated Button
interface AnimatedButtonProps {
  onPress: () => void;
  disabled: boolean;
  isLoading: boolean;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ onPress, disabled, isLoading }) => {
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
        className={`bg-[#1AE57D] py-4 rounded-xl items-center mt-2 ${
          disabled ? 'opacity-50' : 'opacity-100'
        }`}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.9}
      >
        {isLoading ? (
          <ActivityIndicator color="#122119" size="small" />
        ) : (
          <Text className="text-[#122119] text-lg font-bold">
            Sign Up
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Main Component
export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isNameTouched, setIsNameTouched] = useState(false);
  const [isEmailTouched, setIsEmailTouched] = useState(false);
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Success Modal
  const SuccessModal = ({ visible, onContinue }: { visible: boolean, onContinue: () => void }) => {
    if (!visible) return null;
    
    return (
      <View className="absolute top-0 left-0 right-0 bottom-0 z-50">
        <View className="absolute inset-0 bg-[#122119] opacity-90" />
        <View className="flex-1 justify-center items-center p-6">
          <View className="bg-[#1a2e2e] rounded-2xl p-6 w-full max-w-sm">
            <View className="items-center mb-6">
              <View className="bg-green-500/20 rounded-full p-3 mb-4">
                <CheckCircle size={40} color="#1AE57D" />
              </View>
              <Text className="text-white text-2xl font-bold mb-2">Success!</Text>
              <Text className="text-gray-300 text-center">
                Your account has been created successfully.
              </Text>
            </View>
            <TouchableOpacity
              onPress={onContinue}
              className="bg-[#1AE57D] py-3 rounded-xl items-center"
              activeOpacity={0.8}
            >
              <Text className="text-[#122119] font-bold text-base">Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Google OAuth
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '440074217275-i3rhpdihp5dg6ga01bckb8jdc29l5759.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
    redirectUri: 'https://auth.expo.io/@master-g/GreenPluse',
    iosClientId: '440074217275-i3rhpdihp5dg6ga01bckb8jdc29l5759.apps.googleusercontent.com',
    androidClientId: '440074217275-i3rhpdihp5dg6ga01bckb8jdc29l5759.apps.googleusercontent.com'
  });

  const {
    errors,
    setErrors,
    validateName,
    validateEmail,
    validatePassword,
    clearError,
    clearAllErrors,
  } = useFormValidation();

  // Handle Google OAuth response
  useEffect(() => {
    const handleGoogleAuth = async () => {
      if (response?.type === 'success') {
        const { authentication } = response;
        if (authentication) {
          try {
            setIsLoading(true);
            const credential = GoogleAuthProvider.credential(
              authentication.idToken,
              authentication.accessToken
            );
            
            // Sign in with Firebase
            const userCredential = await signInWithCredential(auth, credential);
            const user = userCredential.user;
            
            if (user) {
              // Check if user exists in Firestore
              const userRef = doc(db, "AllUsers", user.uid);
              const userDoc = await getDoc(userRef);
              
              if (!userDoc.exists()) {
                // Create user document if it doesn't exist
                await setDoc(userRef, {
                  uid: user.uid,
                  displayName: user.displayName || 'User',
                  email: user.email,
                  createdAt: new Date().toISOString(),
                  location: "",
                  energyRecords: [],
                  totalCoins: 0,
                  lastUpdated: new Date().toISOString(),
                });
              }
              
              // Wait a moment to ensure the auth state is updated
              await new Promise(resolve => setTimeout(resolve, 500));
              router.replace('/(root)/(MainTabs)');
            }
            
          } catch (error) {
            console.error('Google auth error:', error);
            setErrors({ 
              general: 'Failed to sign in with Google. Please try again.' 
            });
          } finally {
            setIsLoading(false);
          }
        }
      } else if (response?.type === 'error') {
        console.error('Google auth error:', response.error);
        setErrors({ 
          general: response.error?.message || 'Google sign in failed. Please try again.' 
        });
      }
    };

    if (response) {
      handleGoogleAuth();
    }
  }, [response]);

  const handleGoogleSignIn = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.error('Google sign-in error:', error);
      setErrors({
        general: 'Failed to start Google sign-in. Please try again.'
      });
    }
  };

  const handleNameChange = (text: string) => {
    setName(text);
    if (isNameTouched && errors.name) {
      clearError('name');
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

  const handleNameBlur = () => {
    setIsNameTouched(true);
    if (name) {
      validateName(name);
    }
  };

  const handleEmailBlur = () => {
    setIsEmailTouched(true);
    if (email) {
      validateEmail(email);
    }
  };

  const handlePasswordBlur = () => {
    setIsPasswordTouched(true);
    if (password) {
      validatePassword(password);
    }
  };

  const handleRegister = async () => {
    clearAllErrors();
    setSuccessMessage("");

    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isNameValid || !isEmailValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      const userEmail = userCredential.user.email;
      const userName = name.trim();
      
      await setDoc(doc(db, "AllUsers", userId), {
        uid: userId,
        displayName: userName,
        email: userEmail,
        createdAt: new Date().toISOString(),
        location: "",
        energyRecords: [],
        totalCoins: 0,
        lastUpdated: new Date().toISOString(),
      });
      
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: userName,
        });
        await auth.currentUser.reload();
      }

      const ADMIN_EMAIL = 'admin@gmail.com';
      
      if (email.toLowerCase() === ADMIN_EMAIL) {
        await AsyncStorage.setItem('admin_authenticated', 'true');
      }
      
      // Show success modal instead of redirecting
      setShowSuccessModal(true);
      
    } catch (error: any) {
      console.error("Registration error:", error);
      let errorMessage = "An error occurred during registration.";
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already in use. Please use a different email.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters long.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
        default:
          console.error('Registration error:', error);
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle continue from success modal
  const handleContinue = () => {
    setShowSuccessModal(false);
    router.replace('/signIn');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#122119]">
      <StatusBar barStyle="light-content" backgroundColor="#122119" />
      
      {/* Success Modal */}
      <SuccessModal 
        visible={showSuccessModal} 
        onContinue={handleContinue} 
      />
      
      {/* Floating Particles */}
      <FloatingParticles />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <ScrollView 
          className="flex-1 px-6"
          contentContainerStyle={{ flexGrow: 1, paddingTop: 40, paddingBottom: 10 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Signup Illustration */}
          <SignUpIllustration />

          {/* Header Text */}
          <View className="items-center mb-2">
            <Text className="text-white text-3xl font-bold">
              Create Account
            </Text>
            <Text className="text-gray-400 text-base">
              Join GreenPluse today
            </Text>
          </View>

          {/* Error Banner */}
          {errors.general && (
            <ErrorBanner 
              message={errors.general} 
              onDismiss={() => clearError('general')}
            />
          )}

          {/* Success Banner */}
          {successMessage && (
            <SuccessBanner message={successMessage} />
          )}

          {/* Name Input */}
          <InputField
            label="Full Name"
            value={name}
            onChangeText={handleNameChange}
            placeholder="Enter your full name"
            error={isNameTouched ? errors.name : undefined}
            icon={<User size={20} color={COLORS.textSecondary} />}
            autoCapitalize="words"
            autoComplete="name"
            onBlur={handleNameBlur}
            onFocus={() => clearError('name')}
          />

          {/* Email Input */}
          <InputField
            label="Email Address"
            value={email}
            onChangeText={handleEmailChange}
            placeholder="Enter your email"
            error={isEmailTouched ? errors.email : undefined}
            icon={<Mail size={20} color={COLORS.textSecondary} />}
            keyboardType="email-address"
            autoComplete="email"
            onBlur={handleEmailBlur}
            onFocus={() => clearError('email')}
          />

          {/* Password Input */}
          <InputField
            label="Password"
            value={password}
            onChangeText={handlePasswordChange}
            placeholder="Create a password"
            error={isPasswordTouched ? errors.password : undefined}
            secureTextEntry={!showPassword}
            onSecureToggle={() => setShowPassword(!showPassword)}
            icon={<Lock size={20} color={COLORS.textSecondary} />}
            autoComplete="password-new"
            onBlur={handlePasswordBlur}
            onFocus={() => clearError('password')}
          />

          {/* Password Strength */}
          <PasswordStrengthIndicator password={password} />

          {/* Sign Up Button */}
          <AnimatedButton
            onPress={handleRegister}
            disabled={isLoading || !name || !email || !password}
            isLoading={isLoading}
          />

          {/* Divider */}
          <View className="flex-row items-center my-4">
            <View className="flex-1 h-px bg-gray-700" />
            <Text className="mx-4 text-gray-400">or continue with</Text>
            <View className="flex-1 h-px bg-gray-700" />
          </View>

          {/* Google Sign In Button */}
          <TouchableOpacity
            className="flex-row w-72 ml-10 items-center justify-center bg-white py-3 rounded-xl "
            onPress={handleGoogleSignIn}
            disabled={isLoading}
            activeOpacity={0.6}
          >
            <Image 
              source={{ uri: 'https://www.google.com/favicon.ico' }}
              className="w-6 h-6 mr-3"
              resizeMode="contain"
            />
            <Text className="text-gray-800 font-medium">
              {isLoading ? 'Signing in...' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          {/* Terms */}
          <Text className="text-gray-400 text-xs text-center mt-3 leading-5">
            By signing up, you agree to our{' '}
            <Text className="text-[#1AE57D]">Terms of Service</Text>
            {' '}and{' '}
            <Text className="text-[#1AE57D]">Privacy Policy</Text>
          </Text>

          {/* Sign In Link */}
          <View className="flex-row justify-center items-center mt-3">
            <Text className="text-gray-400 text-base">
              Already have an account?{' '}
            </Text>
            <Pressable 
              onPress={() => router.push('/signIn')}
              disabled={isLoading}
            >
              <Text className="text-[#1AE57D] font-semibold text-base">
                Sign In
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}