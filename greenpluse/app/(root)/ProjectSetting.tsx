import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Sun, DollarSign, MapPin, Award, Folder, Users, Settings, Shield } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { icons } from '@/constants/icons';
import { isAdmin } from '@/utils/adminAuth';
import { auth, db } from '@/config/firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { nftService } from '@/services/nftService';

const ProjectsSetting = () => {
  const router = useRouter();
  const [showAdminOption, setShowAdminOption] = useState(false);
  const [impactData, setImpactData] = useState({
    projects: 0,
    donated: 0,
    certificates: 0
  });
  const [loadingImpact, setLoadingImpact] = useState(true);

  useEffect(() => {
    setShowAdminOption(isAdmin());
    loadImpactData();
  }, []);

  const menuItems = [
    {
      id: 1,
      icon: Sun,
      title: 'Request New Project',
      subtitle: 'Submit your renewable energy idea',
      gradient: 'from-green-500 to-emerald-600',
      bgColor: '#16A34A',
      onPress: () => {
        try {
          router.push('/RequestProject' as any);
        } catch (error) {
          console.error('Navigation error:', error);
        }
      }
    },
    {
      id: 2,
      icon: DollarSign,
      title: 'My Donations',
      subtitle: 'View your contribution history',
      gradient: 'from-blue-500 to-cyan-600',
      bgColor: '#3B82F6',
      onPress: () => {
        try {
          router.push('/MyDonatedList' as any);
        } catch (error) {
          console.error('Navigation error:', error);
        }
      }
    }, 
    {
      id: 3,
      icon: MapPin,
      title: 'Track Project',
      subtitle: 'Monitor project progress live',
      gradient: 'from-purple-500 to-pink-600',
      bgColor: '#A855F7',
      onPress: () => {
        try {
          router.push('/TrackProject' as any);
        } catch (error) {
          console.error('Navigation error:', error);
        }
      }
    },
    {
      id: 4,
      icon: Award,
      title: 'My NFT Certificates',
      subtitle: 'View your blockchain NFT certificates',
      gradient: 'from-amber-500 to-orange-600',
      bgColor: '#F59E0B',
      onPress: () => {
        try {
          router.push('/nft-gallery' as any);
        } catch (error) {
          console.error('Navigation error:', error);
        }
      }
    },
    {
      id: 5,
      icon: Folder,
      title: 'My Projects',
      subtitle: 'Manage your active projects',
      gradient: 'from-teal-500 to-green-600',
      bgColor: '#14B8A6',
      onPress: () => {
        try {
          router.push('/MyRequestProject' as any);
        } catch (error) {
          console.error('Navigation error:', error);
        }
      }
    },
    {
      id: 6,
      icon: Users,
      title: 'Grid Contribution',
      subtitle: 'Share energy back to the grid',
      gradient: 'from-rose-500 to-red-600',
      bgColor: '#EF4444',
      onPress: () => {
        try {
          router.push('/contribution' as any);
        } catch (error) {
          console.error('Navigation error:', error);
        }
      }
    }
  ];

  const adminMenuItem = {
    id: 99,
    icon: Shield,
    title: 'Admin Dashboard',
    subtitle: 'Manage projects and system settings',
    gradient: 'from-yellow-500 to-orange-600',
    bgColor: '#F59E0B',
    onPress: () => {
      try {
        router.push('/AdminLogin' as any);
      } catch (error) {
        console.error('Navigation error:', error);
      }
    }
  };

  const displayMenuItems = showAdminOption ? [adminMenuItem, ...menuItems] : menuItems;

  const loadImpactData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setLoadingImpact(false);
        return;
      }

      let projects = 0;
      let donated = 0;
      let certificates = 0;

      // Get user's projects count
      try {
        const projectsRef = collection(db, 'projectRequests');
        const projectsQuery = query(projectsRef, where('userId', '==', user.uid));
        const projectsSnapshot = await getDocs(projectsQuery);
        projects = projectsSnapshot.size;
      } catch (error) {
        console.log('Could not fetch projects count:', error);
      }

      // Get user's total donated amount
      try {
        const donationsRef = collection(db, 'ProjectDonation');
        const donationsQuery = query(donationsRef, where('userId', '==', user.uid));
        const donationsSnapshot = await getDocs(donationsQuery);

        donationsSnapshot.forEach((doc) => {
          const data = doc.data();
          donated += data.amount || 0;
        });
      } catch (error) {
        console.log('Could not fetch donations:', error);
      }

      // Get user's NFT certificates count
      try {
        const userNFTs = await nftService.getUserNFTs();
        certificates = userNFTs.length;
      } catch (error) {
        console.log('Could not fetch NFT certificates:', error);
      }

      setImpactData({
        projects,
        donated,
        certificates
      });
    } catch (error) {
      console.error('Error loading impact data:', error);
    } finally {
      setLoadingImpact(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#122119]" edges={['bottom']}>
      <StatusBar barStyle="light-content" />

      {/* Enhanced Menu Items */}
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
          {displayMenuItems.map((item, index) => {
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

          {/* Stats Card */}
          <View style={{
            backgroundColor: '#2a3e3e',
            borderRadius: 20,
            padding: 24,
            marginTop: 8
          }}>
            <Text style={{
              color: 'white',
              fontSize: 16,
              fontWeight: '700',
              marginBottom: 16
            }}>
              Your Impact
            </Text>
            {loadingImpact ? (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#1AE57D', fontSize: 24, fontWeight: '800' }}>...</Text>
                  <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>Projects</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#1AE57D', fontSize: 24, fontWeight: '800' }}>...</Text>
                  <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>Donated</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#1AE57D', fontSize: 24, fontWeight: '800' }}>...</Text>
                  <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>Certificates</Text>
                </View>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#1AE57D', fontSize: 24, fontWeight: '800' }}>{impactData.projects}</Text>
                  <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>Projects</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#1AE57D', fontSize: 24, fontWeight: '800' }}>LKR {impactData.donated.toLocaleString()}</Text>
                  <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>Donated</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#1AE57D', fontSize: 24, fontWeight: '800' }}>{impactData.certificates}</Text>
                  <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>Certificates</Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
    </SafeAreaView>
  );
};

export default ProjectsSetting;