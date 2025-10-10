import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Sun, DollarSign, MapPin, Award, Folder, Users, Settings } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { icons } from '@/constants/icons';

const ProjectsSetting = () => {
  const router = useRouter();

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
      onPress: () => console.log('Track Project')
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
    },
    {
      id: 7,
      icon: Settings,
      title: 'Update Project Status',
      subtitle: 'Change project approval status',
      gradient: 'from-indigo-500 to-purple-600',
      bgColor: '#6366F1',
      onPress: () => {
        try {
          router.push('/UpdateProjectStatus' as any);
        } catch (error) {
          console.error('Navigation error:', error);
        }
      }
    }
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#122119]" edges={['bottom']}>
      <StatusBar barStyle="light-content" />

      {/* Enhanced Menu Items */}
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
          {menuItems.map((item, index) => {
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#1AE57D', fontSize: 24, fontWeight: '800' }}>12</Text>
                <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>Projects</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#1AE57D', fontSize: 24, fontWeight: '800' }}>$2.4K</Text>
                <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>Donated</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#1AE57D', fontSize: 24, fontWeight: '800' }}>8</Text>
                <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>Certificates</Text>
              </View>
            </View>
          </View>
        </ScrollView>
    </SafeAreaView>
  );
};

export default ProjectsSetting;