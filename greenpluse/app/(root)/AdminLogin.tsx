import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Shield, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { authenticateAdmin, isAdmin } from '@/utils/adminAuth';

const AdminLogin = () => {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter admin password');
      return;
    }

    if (!isAdmin()) {
      Alert.alert('Access Denied', 'Only admin@gmail.com can access this page');
      router.back();
      return;
    }

    setIsLoading(true);

    try {
      const success = await authenticateAdmin(password);
      
      if (success) {
        Alert.alert('Success', 'Admin authentication successful', [
          {
            text: 'OK',
            onPress: () => router.replace('/AdminDashboard' as any)
          }
        ]);
      } else {
        Alert.alert('Error', 'Incorrect password. Please try again.');
        setPassword('');
      }
    } catch (error) {
      Alert.alert('Error', 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#122119]">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="flex-row justify-between items-center px-5 py-4 bg-[#122119]">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Admin Login</Text>
        <View style={{ width: 28 }} />
      </View>

      <View className="flex-1 justify-center px-6">
        {/* Admin Shield Icon */}
        <View className="items-center mb-8">
          <View className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full p-6 mb-4">
            <Shield size={64} color="white" strokeWidth={2} />
          </View>
          <Text className="text-white text-2xl font-bold mb-2">Administrator Access</Text>
          <Text className="text-gray-400 text-center text-sm">
            Enter your admin password to continue
          </Text>
        </View>

        {/* Password Input */}
        <View className="mb-6">
          <Text className="text-gray-300 text-sm font-semibold mb-2 ml-1">Admin Password</Text>
          <View className="bg-[#2a3e3e] rounded-2xl flex-row items-center px-4 border-2 border-[#1AE57D]/20">
            <Lock size={20} color="#1AE57D" />
            <TextInput
              className="flex-1 text-white text-base py-4 px-3"
              placeholder="Enter password"
              placeholderTextColor="#6b7280"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff size={20} color="#6b7280" />
              ) : (
                <Eye size={20} color="#6b7280" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          className="bg-[#1AE57D] rounded-2xl py-4 items-center mb-4"
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#122119" />
          ) : (
            <Text className="text-[#122119] text-lg font-bold">Login as Admin</Text>
          )}
        </TouchableOpacity>

        {/* Info Box */}
        <View className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 mt-4">
          <Text className="text-yellow-400 text-xs font-semibold mb-1">🔒 Secure Access</Text>
          <Text className="text-yellow-300/80 text-xs leading-5">
            This area is restricted to authorized administrators only. All login attempts are monitored and logged.
          </Text>
        </View>

        {/* Hint (for demo purposes - remove in production) */}
        <View className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 mt-4">
          <Text className="text-blue-400 text-xs font-semibold mb-1">💡 Demo Credentials</Text>
          <Text className="text-blue-300/80 text-xs leading-5">
            Email: admin@gmail.com{'\n'}
            Password: 12345678
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AdminLogin;
