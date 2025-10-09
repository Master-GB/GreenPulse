import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { ArrowLeft, Sun, DollarSign, MapPin, Award, Folder, Users } from 'lucide-react-native';
import { useRouter } from 'expo-router';

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
      title: 'My Certificates',
      subtitle: 'Your sustainability achievements',
      gradient: 'from-amber-500 to-orange-600',
      bgColor: '#F59E0B',
      onPress: () => console.log('My Certificates')
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
      title: 'Contribution',
      subtitle: 'Community impact dashboard',
      gradient: 'from-rose-500 to-red-600',
      bgColor: '#EF4444',
      onPress: () => console.log('Contribution')
    }
  ];

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      <View style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
       

        {/* Enhanced Menu Items */}
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={{
                  backgroundColor: '#171717',
                  borderRadius: 20,
                  padding: 20,
                  marginBottom: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1.5,
                  borderColor: '#262626',
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
                  backgroundColor: '#262626',
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
            backgroundColor: '#171717',
            borderRadius: 20,
            padding: 24,
            marginTop: 8,
            borderWidth: 1.5,
            borderColor: '#262626'
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
                <Text style={{ color: '#16A34A', fontSize: 24, fontWeight: '800' }}>12</Text>
                <Text style={{ color: '#737373', fontSize: 12, marginTop: 4 }}>Projects</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#3B82F6', fontSize: 24, fontWeight: '800' }}>$2.4K</Text>
                <Text style={{ color: '#737373', fontSize: 12, marginTop: 4 }}>Donated</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ color: '#F59E0B', fontSize: 24, fontWeight: '800' }}>8</Text>
                <Text style={{ color: '#737373', fontSize: 12, marginTop: 4 }}>Certificates</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

export default ProjectsSetting;