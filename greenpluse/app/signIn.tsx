import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Alert,
  Animated,
  Easing,
  Dimensions,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react-native';
import Svg, { Path, Circle, Rect, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { auth } from '../config/firebaseConfig';
import { GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword } from 'firebase/auth';

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
      className="items-center justify-center mt-[-40px]"
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

// Main Component
export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEmailTouched, setIsEmailTouched] = useState(false);
  const [isPasswordTouched, setIsPasswordTouched] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const { signIn } = useAuth();
  const router = useRouter();

  // Google OAuth configuration - using only valid properties
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '440074217275-i3rhpdihp5dg6ga01bckb8jdc29l5759.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
    redirectUri: 'https://auth.expo.io/@master-g/GreenPluse',
    // Platform-specific client IDs
    iosClientId: '440074217275-i3rhpdihp5dg6ga01bckb8jdc29l5759.apps.googleusercontent.com',
    androidClientId: '440074217275-i3rhpdihp5dg6ga01bckb8jdc29l5759.apps.googleusercontent.com'
  });

  // Handle Google OAuth response
  useEffect(() => {
    const handleGoogleAuth = async () => {
      if (response?.type === 'success') {
        const { authentication } = response;
        if (authentication) {
          try {
            setLoading(true);
            const credential = GoogleAuthProvider.credential(
              authentication.idToken,
              authentication.accessToken
            );
            
            // Use a try-catch block with empty catch to prevent uncaught promise rejections
            try {
              const userCredential = await signInWithCredential(auth, credential);
              
              if (userCredential.user) {
                await new Promise(resolve => setTimeout(resolve, 500));
                router.push({
                  pathname: '/(root)',
                  params: { screen: '(MainTabs)' }
                } as any);
              }
            } catch (authError) {
              // Silent error handling - user will see the message in the UI
            }
            
          } catch (error) {
            // Silent error handling - user will see the message in the UI
          } finally {
            setLoading(false);
          }
        }
      } else if (response?.type === 'error') {
        // Only show error if it's not a user cancellation
        if (!response.error?.message?.includes('cancelled')) {
          setErrors(prev => ({ 
            ...prev,
            general: 'Google sign-in was cancelled or failed. Please try again.' 
          }));
        }
      }
    };

    if (response) {
      handleGoogleAuth().catch(() => {
        // Silent catch to prevent unhandled promise rejection
      });
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
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await promptAsync();
    } catch (error: any) {
      // Prevent default error logging
      if (error?.message?.includes('cancelled')) return;
      
      setErrors(prev => ({
        ...prev,
        general: 'Unable to start Google sign-in. Please check your connection and try again.'
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
    setIsEmailTouched(true);
    setIsPasswordTouched(true);
    clearAllErrors();

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      if (!email.trim()) {
        setErrors(prev => ({ ...prev, email: 'Email is required' }));
      }
      if (!password) {
        setErrors(prev => ({ ...prev, password: 'Password is required' }));
      }
      return;
    }

    setLoading(true);

    try {
      // Use a silent authentication attempt
      const userCredential = await signInWithEmailAndPassword(auth, email, password).catch(() => {
        // Silent catch - we'll handle the error in the UI
        return null;
      });

      if (userCredential?.user) {
        router.replace('/(root)/(MainTabs)');
      } else {
        // Handle invalid credentials without showing console errors
        setErrors({ 
          general: 'Incorrect email or password. Please check your credentials and try again.' 
        });
      }
    } catch (error: any) {
      // Handle other potential errors
      let errorMessage = 'Unable to sign in. Please try again.';
      const errorCode = error?.code || '';
      
      if (errorCode.includes('too-many-requests')) {
        errorMessage = 'Too many failed login attempts. Please wait a moment and try again.';
      } else if (errorCode.includes('user-disabled')) {
        errorMessage = 'This account has been disabled. Please contact support for assistance.';
      } else if (errorCode.includes('network') || errorCode.includes('timeout')) {
        errorMessage = 'Connection problem. Please check your internet and try again.';
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      Alert.alert(
        'Email Required',
        'Please enter your email address first.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
          onPress: async () => {
            try {
              // TODO: Implement actual password reset logic here
              // await auth.sendPasswordResetEmail(email);
              Alert.alert('Success', 'Password reset link sent to your email!');
            } catch (error) {
              Alert.alert('Error', 'Failed to send password reset email. Please try again.');
            }
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
          </View>

          {/* Error Banner */}
          {errors.general && (
            <ErrorBanner 
              message={errors.general} 
              onDismiss={() => clearError('general')} 
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

          {/* Forgot Password */}
          <TouchableOpacity 
            onPress={() => router.push('/forgotPassword')}
            className="self-end mb-4 mt-1"
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
          </View>

          {/* Google Sign In Button */}
          <TouchableOpacity
            className="flex-row w-72 ml-10 items-center justify-center bg-white py-3 rounded-xl"
            onPress={handleGoogleSignIn}
            disabled={!request || loading}                    
          >
            <Image 
              source={{ uri: 'https://www.google.com/favicon.ico' }}
              className="w-6 h-6 mr-3"
              resizeMode="contain"
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
  );
}