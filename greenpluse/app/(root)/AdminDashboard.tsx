import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Shield, FolderCheck, LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { auth } from '@/config/firebaseConfig';
import { isAdmin, checkAdminAccess, logoutAdmin } from '@/utils/adminAuth';

const AdminDashboard = () => {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    verifyAdminAccess();
  }, []);

  const verifyAdminAccess = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Access Denied', 'Please login first');
      router.replace('/(root)/(MainTabs)/home' as any);
      return;
    }

    if (!isAdmin()) {
      Alert.alert('Access Denied', 'You do not have admin privileges');
      router.replace('/(root)/(MainTabs)/home' as any);
      return;
    }

    // Check if admin has authenticated with password
    const hasAccess = await checkAdminAccess();
    if (!hasAccess) {
      // Redirect to admin login page
      router.replace('/AdminLogin' as any);
      return;
    }

    setUserEmail(user.email || '');
    setIsLoading(false);
  };

  const handleLogoutAdmin = async () => {
    Alert.alert(
      'Logout Admin',
      'Are you sure you want to logout from admin dashboard?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logoutAdmin();
            await auth.signOut();
            router.replace('/signIn' as any);
          }
        }
      ]
    );
  };

  const adminMenuItems = [
    {
      id: 1,
      icon: FolderCheck,
      title: 'Project Management',
      subtitle: 'View, manage & track all project requests',
      gradient: 'from-blue-500 to-cyan-600',
      bgColor: '#3B82F6',
      onPress: () => {
        try {
          router.push('/AdminProjectList' as any);
        } catch (error) {
          console.error('Navigation error:', error);
        }
      }
    }
  ];

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#122119]">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1AE57D" />
          <Text className="text-gray-400 text-sm mt-3">Verifying admin access...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#122119]" edges={['bottom']}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="flex-row justify-between items-center px-5 py-4 mt-12 bg-[#122119]">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Admin Dashboard</Text>
        <TouchableOpacity onPress={handleLogoutAdmin}>
          <LogOut size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Admin Badge */}
        <View className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 mb-6 mt-4">
          <View className="flex-row items-center mb-3">
            <View className="bg-white/20 rounded-full p-3 mr-3">
              <Shield size={32} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white text-xl font-bold">Administrator</Text>
              <Text className="text-white/80 text-sm mt-1">{userEmail}</Text>
            </View>
          </View>
          <View className="bg-white/20 h-px my-3" />
          
        </View>

        {/* Admin Menu Items */}
        <Text className="text-white text-lg font-bold mb-4">Admin Controls</Text>
        
        {adminMenuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <TouchableOpacity
              key={item.id}
              style={{
                backgroundColor: '#2a3e3e',
                borderRadius: 20,
                padding: 20,
                marginBottom: 16,
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: item.bgColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 8,
                overflow: 'hidden'
              }}
              activeOpacity={0.7}
              onPress={item.onPress}
            >
              {/* Gradient Background Accent */}
              <View style={{
                position: 'absolute',
                right: -40,
                top: -40,
                width: 120,
                height: 120,
                backgroundColor: item.bgColor,
                opacity: 0.1,
                borderRadius: 60
              }} />
              
              {/* Icon Container */}
              <View style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: item.bgColor + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 16,
                borderWidth: 1,
                borderColor: item.bgColor + '40'
              }}>
                <IconComponent size={28} color={item.bgColor} strokeWidth={2.5} />
              </View>

              {/* Text Content */}
              <View style={{ flex: 1 }}>
                <Text style={{
                  color: 'white',
                  fontSize: 18,
                  fontWeight: '700',
                  marginBottom: 4,
                  letterSpacing: -0.3
                }}>
                  {item.title}
                </Text>
                <Text style={{
                  color: '#737373',
                  fontSize: 13,
                  fontWeight: '500',
                  lineHeight: 18
                }}>
                  {item.subtitle}
                </Text>
              </View>

              {/* Arrow Indicator */}
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                backgroundColor: '#122119',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <Text style={{ color: item.bgColor, fontSize: 18, fontWeight: '600' }}>›</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Warning Notice */}
        <View className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mt-4">
          <Text className="text-red-400 text-sm font-semibold mb-2">⚠️ Admin Notice</Text>
          <Text className="text-red-300/80 text-xs leading-5">
            All actions performed in this dashboard are logged. Please use admin privileges responsibly.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboard;
