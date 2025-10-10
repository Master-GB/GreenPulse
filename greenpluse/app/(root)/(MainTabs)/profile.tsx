
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Phone, MapPin, Calendar, LogOut, Settings, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { icons } from '@/constants/icons';
import { auth, db } from '@/config/firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  joinedDate: string;
  totalDonations?: number;
  totalProjects?: number;
  totalDonationAmount?: number;
  photoURL?: string;
}

const Profile = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('No user logged in');
        setLoading(false);
        return;
      }

      // Try to get additional user data from Firestore (optional)
      let userData: any = {};
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        userData = userDoc.exists() ? userDoc.data() : {};
      } catch (firestoreError) {
        // Firestore data is optional, continue with Auth data only
        console.log('Using Firebase Auth data only');
      }

      // Get user name from various sources
      const userName = userData.name || 
                       user.displayName || 
                       (user.email ? user.email.split('@')[0] : 'User');

      // Fetch actual project count
      let projectCount = 0;
      try {
        const projectsRef = collection(db, 'projectRequests');
        const projectsQuery = query(projectsRef, where('userId', '==', user.uid));
        const projectsSnapshot = await getDocs(projectsQuery);
        projectCount = projectsSnapshot.size;
      } catch (error) {
        console.log('Could not fetch project count');
      }

      // Fetch actual donation count and total amount
      let donationCount = 0;
      let totalDonationAmount = 0;
      try {
        const donationsRef = collection(db, 'ProjectDonation');
        const donationsQuery = query(donationsRef, where('userId', '==', user.uid));
        const donationsSnapshot = await getDocs(donationsQuery);
        donationCount = donationsSnapshot.size;
        
        // Calculate total donation amount
        donationsSnapshot.forEach((doc) => {
          const data = doc.data();
          totalDonationAmount += data.amount || 0;
        });
      } catch (error) {
        console.log('Could not fetch donation count');
      }

      setProfile({
        name: userName,
        email: user.email || 'No email',
        phone: userData.phone || '+94 XX XXX XXXX',
        location: userData.location || 'Sri Lanka',
        joinedDate: user.metadata.creationTime 
          ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { 
              year: 'numeric', month: 'long', day: 'numeric' 
            })
          : 'Recently',
        totalDonations: donationCount,
        totalProjects: projectCount,
        totalDonationAmount: totalDonationAmount,
        photoURL: user.photoURL || undefined
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      const user = auth.currentUser;
      if (user) {
        const userName = user.displayName || 
                        (user.email ? user.email.split('@')[0] : 'User');
        setProfile({
          name: userName,
          email: user.email || 'No email',
          joinedDate: 'Recently',
          totalDonations: 0,
          totalProjects: 0
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
            router.replace('/signIn' as any);
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to logout');
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#122119]">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1AE57D" />
          <Text className="text-gray-400 text-sm mt-3">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-[#122119]">
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-lg">No user data found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#122119]">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="flex-row justify-between items-center px-5 py-1">
        <TouchableOpacity>
          <ArrowLeft size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold ml-8">Profile</Text>
        <TouchableOpacity 
          className='bg-[#2a3e3e] rounded-full px-3 py-2 flex-row items-center gap-2'
          onPress={() => router.push('/(root)/wallet' as any)}
        >
          <Image source={icons.coinH} className="size-5 mb-1" />
          <Text className="text-white font-semibold">120</Text>
          <Text className="text-gray-400">/5</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        <View className="bg-[#2a3e3e] mx-5 mt-5 rounded-2xl p-6 items-center">
          <View className="w-24 h-24 rounded-full bg-[#1AE57D] justify-center items-center mb-4">
            {profile.photoURL ? (
              <Image source={{ uri: profile.photoURL }} className="w-24 h-24 rounded-full" />
            ) : (
              <Text className="text-[#122119] text-4xl font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <Text className="text-white text-2xl font-bold mb-1">{profile.name}</Text>
          <Text className="text-gray-400 text-sm mb-5">{profile.email}</Text>
          
        </View>

        {/* Statistics Cards */}
        <View className="px-5 mt-6">
          <Text className="text-white text-lg font-bold mb-4">Statistics</Text>
          
          {/* Request Projects */}
          <View className="bg-[#2a3e3e] rounded-2xl p-4 mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 rounded-xl bg-[#1AE57D20] justify-center items-center mr-3">
                <Text className="text-2xl">📋</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 text-xs mb-1">Request Projects</Text>
                <Text className="text-white text-lg font-bold">{profile.totalProjects || 0} Projects</Text>
              </View>
            </View>
            <Text className="text-[#1AE57D] text-3xl font-bold">{profile.totalProjects || 0}</Text>
          </View>

          {/* Credit Donations */}
          <View className="bg-[#2a3e3e] rounded-2xl p-4 mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 rounded-xl bg-[#1AE57D20] justify-center items-center mr-3">
                <Text className="text-2xl">💳</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 text-xs mb-1">Credit Donations</Text>
                <Text className="text-white text-lg font-bold">{profile.totalDonations || 0} Times</Text>
              </View>
            </View>
            <Text className="text-[#1AE57D] text-3xl font-bold">{profile.totalDonations || 0}</Text>
          </View>

          {/* LKR Donated */}
          <View className="bg-[#2a3e3e] rounded-2xl p-4 mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 rounded-xl bg-[#1AE57D20] justify-center items-center mr-3">
                <Text className="text-2xl">💰</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 text-xs mb-1">Total Amount Donated</Text>
                <Text className="text-white text-lg font-bold">
                  LKR {profile.totalDonationAmount ? profile.totalDonationAmount.toLocaleString() : '0'}
                </Text>
              </View>
            </View>
            <Text className="text-[#1AE57D] text-2xl font-bold">
              {profile.totalDonationAmount ? profile.totalDonationAmount.toLocaleString() : '0'}
            </Text>
          </View>

          {/* Coin Donations */}
          <View className="bg-[#2a3e3e] rounded-2xl p-4 mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 rounded-xl bg-[#1AE57D20] justify-center items-center mr-3">
                <Image source={icons.coinH} className="size-7" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 text-xs mb-1">Coin Donations</Text>
                <Text className="text-white text-lg font-bold">0 Coins</Text>
              </View>
            </View>
            <Text className="text-[#1AE57D] text-3xl font-bold">0</Text>
          </View>

          {/* Monthly Energy Usage */}
          <View className="bg-[#2a3e3e] rounded-2xl p-4 mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 rounded-xl bg-[#1AE57D20] justify-center items-center mr-3">
                <Text className="text-2xl">⚡</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 text-xs mb-1">Monthly Energy Usage</Text>
                <Text className="text-white text-lg font-bold">0 kWh</Text>
              </View>
            </View>
            <Text className="text-[#1AE57D] text-3xl font-bold">0</Text>
          </View>

          {/* Carbon Offset */}
          <View className="bg-[#2a3e3e] rounded-2xl p-4 mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 rounded-xl bg-[#1AE57D20] justify-center items-center mr-3">
                <Text className="text-2xl">🌱</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-400 text-xs mb-1">Carbon Offset</Text>
                <Text className="text-white text-lg font-bold">0 kg CO₂</Text>
              </View>
            </View>
            <Text className="text-[#1AE57D] text-3xl font-bold">0</Text>
          </View>
        </View>

        <View className="px-5 mt-6">
          <Text className="text-white text-lg font-bold mb-4">Personal Information</Text>
          
          <View className="bg-[#2a3e3e] rounded-2xl p-4 mb-3 flex-row items-center">
            <View className="w-10 h-10 rounded-xl bg-[#1AE57D20] justify-center items-center mr-3">
              <Mail size={20} color="#1AE57D" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-400 text-xs mb-0.5">Email</Text>
              <Text className="text-white text-base font-medium">{profile.email}</Text>
            </View>
          </View>

          <View className="bg-[#2a3e3e] rounded-2xl p-4 mb-3 flex-row items-center">
            <View className="w-10 h-10 rounded-xl bg-[#1AE57D20] justify-center items-center mr-3">
              <Phone size={20} color="#1AE57D" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-400 text-xs mb-0.5">Phone</Text>
              <Text className="text-white text-base font-medium">{profile.phone}</Text>
            </View>
          </View>

          <View className="bg-[#2a3e3e] rounded-2xl p-4 mb-3 flex-row items-center">
            <View className="w-10 h-10 rounded-xl bg-[#1AE57D20] justify-center items-center mr-3">
              <MapPin size={20} color="#1AE57D" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-400 text-xs mb-0.5">Location</Text>
              <Text className="text-white text-base font-medium">{profile.location}</Text>
            </View>
          </View>

          <View className="bg-[#2a3e3e] rounded-2xl p-4 mb-3 flex-row items-center">
            <View className="w-10 h-10 rounded-xl bg-[#1AE57D20] justify-center items-center mr-3">
              <Calendar size={20} color="#1AE57D" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-400 text-xs mb-0.5">Member Since</Text>
              <Text className="text-white text-base font-medium">{profile.joinedDate}</Text>
            </View>
          </View>
        </View>

        <View className="px-5 mt-8">
          <TouchableOpacity
            className="bg-[#2a3e3e] py-4 px-5 rounded-2xl flex-row items-center mb-3"
            onPress={() => router.push('/(root)/ProjectSetting' as any)}
            activeOpacity={0.8}
          >
            <Settings size={24} color="#1AE57D" />
            <Text className="text-white text-base font-semibold ml-3 flex-1">Settings</Text>
            <Text className="text-gray-400 text-lg">›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-[#ef444420] py-4 px-5 rounded-2xl flex-row items-center border border-[#ef4444]"
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <LogOut size={24} color="#ef4444" />
            <Text className="text-[#ef4444] text-base font-semibold ml-3 flex-1">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;

