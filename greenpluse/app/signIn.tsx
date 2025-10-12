import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  StatusBar,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { images } from '../constants/images';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { auth } from '../config/firebaseConfig';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

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
  icon,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete,
  onFocus,
  onBlur,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mb-4">
      <Text className="text-gray-300 text-sm mb-2 ml-1 font-medium">{label}</Text>
      <View className="relative">
        <View
          className={`flex-row items-center bg-[#1a2e2e] rounded-xl px-4 py-2.5 border-2 ${
            error 
              ? 'border-red-500' 
              : isFocused 
              ? 'border-[#1AE57D]' 
              : 'border-gray-700'
          }`}
        >
          {icon && <View className="mr-3">{icon}</View>}
          <TextInput
            className="flex-1 text-white text-base py-2.5"
            placeholder={placeholder}
            placeholderTextColor={COLORS.placeholder}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={false}
            autoComplete={autoComplete as any}
            onFocus={() => {
              setIsFocused(true);
              onFocus?.();
            }}
            onBlur={() => {
              setIsFocused(false);
              onBlur?.();
            }}
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
    </View>
  );
};

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onDismiss }) => {
  return (
    <View className="bg-red-500/10 border-2 border-red-500 rounded-xl p-4 mb-6 flex-row items-start">
      <AlertCircle size={20} color={COLORS.error} className="mt-0.5" />
      <View className="flex-1 ml-3">
        <Text className="text-red-400 font-medium text-sm leading-5">{message}</Text>
      </View>
      <TouchableOpacity onPress={onDismiss} className="ml-2">
        <Text className="text-red-400 font-bold text-lg">×</Text>
      </TouchableOpacity>
    </View>
  );
};

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

  // Google OAuth
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '440074217275-i3rhpdihp5dg6ga01bckb8jdc29l5759.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
    redirectUri: 'https://auth.expo.io/@master-g/GreenPluse',
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
            
            // Sign in with Firebase
            const userCredential = await signInWithCredential(auth, credential);
            
            if (userCredential.user) {
              // Wait a moment to ensure the auth state is updated
              await new Promise(resolve => setTimeout(resolve, 500));
              // Redirect to home after successful sign in
             router.push({
  pathname: '/(root)',
  params: { screen: '(MainTabs)' }
} as any);
            }
            
          } catch (error) {
            console.error('Firebase auth error:', error);
            Alert.alert('Authentication Error', 'Failed to sign in with Google. Please try again.');
            setErrors(prev => ({ 
              ...prev, 
              general: 'Failed to sign in with Google. Please try again.' 
            }));
          } finally {
            setLoading(false);
          }
        }
      } else if (response?.type === 'error') {
        console.error('Google auth error:', response.error);
        Alert.alert('Authentication Error', response.error?.message || 'Google sign in failed. Please try again.');
        setErrors(prev => ({ 
          ...prev,
          general: response.error?.message || 'Google sign in was cancelled' 
        }));
      }
    };

    if (response) {
      handleGoogleAuth();
    }
  }, [response, router, signInWithCredential]);

  const validateEmail = (emailToValidate: string): boolean => {
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
  };

  const validatePassword = (passwordToValidate: string): boolean => {
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
  };

  const clearError = (field: keyof FormErrors) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  const handleGoogleSignIn = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.error('Google sign-in error:', error);
      setErrors(prev => ({
        ...prev,
        general: 'Failed to start Google sign-in. Please try again.'
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
    clearAllErrors();

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);

    try {
      await signIn(email, password);
      router.replace('/(root)/(MainTabs)');
    } catch (error: any) {
      let errorMessage = 'Failed to sign in. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Invalid email or password. Please check your credentials.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Please contact support.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format. Please check and try again.';
          break;
        default:
          console.error('Sign in error:', error);
      }
      
      setErrors({ general: errorMessage });
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
            // TODO: Implement password reset logic
            Alert.alert('Success', 'Password reset link sent to your email!');
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#122119] justify-center">
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-6 py-10"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo and Welcome */}
          <View className="items-center mb-6">
            <View className="bg-[#1a2e2e] rounded-full p-5 mb-6 border-2 border-[#2a4a3a]">
              <Image 
                source={images.logo}
                className="w-20 h-20"
                resizeMode="contain"
              />
            </View>
            <Text className="text-2xl font-bold text-white mb-2">Welcome Back</Text>
            <Text className="text-gray-400">Sign in to continue</Text>
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
            placeholder="Enter your email"
            error={errors.email}
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
            placeholder="Enter your password"
            error={errors.password}
            secureTextEntry={!showPassword}
            onSecureToggle={() => setShowPassword(!showPassword)}
            showSecureToggle
            icon={<Lock size={20} color={COLORS.textSecondary} />}
          />

          {/* Forgot Password */}
          <TouchableOpacity 
            onPress={handleForgotPassword}
            className="self-end mb-6"
          >
            <Text className="text-[#1AE57D] text-sm font-medium">Forgot Password?</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            onPress={handleSignIn}
            disabled={loading}
            className="bg-[#1AE57D] py-4 rounded-xl items-center mb-6"
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.background} size="small" />
            ) : (
              <Text className="text-[#122119] text-base font-semibold">Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center justify-center mb-6">
            <View className="flex-1 h-px bg-gray-700" />
            <Text className="text-gray-500 mx-4 text-sm">OR</Text>
            <View className="flex-1 h-px bg-gray-700" />
          </View>

          {/* Google Sign In Button */}
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            disabled={!request || loading}
            className="flex-row w-72 ml-10 items-center justify-center bg-white py-3 rounded-xl mb-6"
            activeOpacity={0.8}
          >
            <Image 
              source={{ uri: 'https://www.google.com/favicon.ico' }}
              className="w-6 h-6 mr-3"
              resizeMode="contain"
            />
            <Text className="text-gray-800 text-base font-medium">
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View className="flex-row justify-center">
            <Text className="text-gray-400">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signUp')}>
              <Text className="text-[#1AE57D] font-medium">Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}