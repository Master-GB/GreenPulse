import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Animated,
  Easing,
  Dimensions,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../config/firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import { ArrowLeft, Mail } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// Constants for colors (matching sign in page)
const COLORS = {
  primary: '#1AE57D',
  primaryDark: '#15C96D',
  background: '#122119',
  cardBg: '#1a2e2e',
  border: '#374151',
  borderFocus: '#1AE57D',
  error: '#EF4444',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  placeholder: '#6b7280',
};

// Animated Image Component
const AnimatedForgotPasswordImage: React.FC = () => {
  const floatAnim = useState(new Animated.Value(0))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];

  React.useEffect(() => {
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
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <Animated.View
      style={{
        transform: [{ translateY }, { scale: pulseAnim }],
      }}
      className="items-center justify-center mb-8"
    >
      <Image
        source={require('../assets/images/ForgotPW.png')}
        className="w-96 h-96"
        resizeMode="contain"
      />
    </Animated.View>
  );
};

// Floating Particles Component
const FloatingParticles: React.FC = () => {
  const particles = useState(
    Array.from({ length: 12 }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  )[0];

  React.useEffect(() => {
    particles.forEach((particle, index) => {
      const randomDelay = Math.random() * 2000;
      const randomDuration = 4000 + Math.random() * 3000;
      const randomX = (Math.random() - 0.5) * 80;

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
                toValue: 0.4,
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
        const size = 3 + Math.random() * 6;
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

// Animated Input Field Component
interface AnimatedInputFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
  icon?: React.ReactNode;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

const AnimatedInputField: React.FC<AnimatedInputFieldProps> = ({
  value,
  onChangeText,
  placeholder,
  error,
  icon,
  keyboardType = 'default',
  autoCapitalize = 'none',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const shakeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(1))[0];

  React.useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 8,
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
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        transform: [
          { translateX: shakeAnim },
          { scale: scaleAnim },
        ],
      }}
      className="mb-5"
    >
      <View className={`flex-row items-center bg-[#1a2e2e] rounded-xl px-4 py-1 border-2 ${
        error
          ? 'border-red-500'
          : isFocused
          ? 'border-[#1AE57D]'
          : 'border-gray-700'
      }`}>
        {icon && <View className="mr-3">{icon}</View>}
        <TextInput
          className="flex-1 text-white text-base py-3"
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          autoComplete="email"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </View>
      {error && (
        <Text className="text-red-500 text-xs mt-2 text-center">
          {error}
        </Text>
      )}
    </Animated.View>
  );
};

// Animated Button Component
interface AnimatedButtonProps {
  onPress: () => void;
  disabled: boolean;
  isLoading: boolean;
  children: React.ReactNode;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ onPress, disabled, isLoading, children }) => {
  const scaleAnim = useState(new Animated.Value(1))[0];

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
          <ActivityIndicator color="#122119" size="small" />
        ) : (
          children
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendResetEmail = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Send Firebase password reset email
      await sendPasswordResetEmail(auth, email);

      console.log('===================================');
      console.log('PASSWORD RESET EMAIL SENT');
      console.log('Email:', email);
      console.log('User will receive email with reset link');
      console.log('==================================');

      Alert.alert(
        ' Please Check Your Email !',
        `A password reset link has been sent to ${email}. Please check your email and click the link to reset your password.`,
        [
          {
            text: 'Go to Sign In',
            onPress: () => router.replace('/signIn')
          }
        ]
      );
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      let errorMessage = 'Failed to send password reset email. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#122119]"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Floating Particles Background */}
      <FloatingParticles />

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ flexGrow: 1, paddingTop: 40, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header moved to top */}
        <View className="flex-row  mt-[-18px] items-center mb-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3 p-2 mt-5"
          >
            <ArrowLeft size={24} color="#1AE57D" />
          </TouchableOpacity>
          <Text className="text-3xl mt-5 ml-14 font-bold text-[#1AE57D] flex-1 ">
            Forgot Password
          </Text>
        </View>

        {/* Animated Image below header */}
        <View className='mt-8 self-center'>
          <AnimatedForgotPasswordImage />
        </View>

        <View className="w-full px-3 self-center mt-5 ">
          <Text className="text-sm text-[#9CA3AF] mb-8 px-3 leading-5">
            Enter your email and we'll send you a link to reset your password.
          </Text>

          {/* Animated Email Input */}
          <AnimatedInputField
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            error={error}
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<Mail size={20} color="#1AE57D" />}
          />

          {/* Animated Send Reset Button */}
          <AnimatedButton
            onPress={handleSendResetEmail}
            disabled={loading}
            isLoading={loading}
            
          >
            <Text className="text-[#122119] text-lg font-bold">Send Reset Link</Text>
          </AnimatedButton>

          <View className="flex-row justify-center mt-6">
            <Text className="text-[#9CA3AF]">Remember your password? </Text>
            <TouchableOpacity onPress={() => router.push('/signIn')}>
              <Text className="text-[#1AE57D] font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
