import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, FlatList, StatusBar, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Home as HomeIcon,
  Zap,
  Leaf,
  HelpCircle,
  BookOpen,
  Bell,
  Coins,
} from 'lucide-react-native';
import { images } from '@/constants/images'
import { icons } from '@/constants/icons';

export default function Home() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-[#122119]">
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View className="flex-row justify-between items-center px-5">
        <Image source={images.logo}  className="size-14 ml-[-12px]" />
        <Text className="text-white text-2xl font-bold mr-16 ml-[-3px]">GreenPulse</Text>
        <View className="flex-row items-center gap-3">
          <View className="relative ml-2 mr-1">
            <Bell size={24} color="white" />
            <View className="absolute -top-2 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
              <Text className="text-white text-xs font-bold">3</Text>
            </View>
          </View>
          <TouchableOpacity 
          className='bg-[#2a3e3e] rounded-full px-3 py-2 flex-row items-center gap-2 mb-2'
          onPress={() => router.push('/(root)/wallet')}
          >
            <Image source={icons.coinH}  className="size-5 mb-1" />
            <Text className="text-white font-semibold">120</Text>
            <Text className="text-gray-400">/5</Text>
          </TouchableOpacity>
         
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Welcome Banner */}
        <View className="mx-4 mt-4 mb-6 rounded-3xl overflow-hidden">
          <ImageBackground source={images.welcomeB} className="w-full h-48 rounded-3xl"></ImageBackground>
          <View className="absolute top-0 left-0 right-0 bottom-0 p-6 justify-center">
            <Text className="text-white text-3xl font-bold mb-2">
              Welcome, Power{'\n'}Donor!
            </Text>
            <Text className="text-emerald-100 text-base">
              Let's make clean energy accessible{'\n'}today
            </Text>
          </View>
        </View>

        {/* Community Energy Pool */}
        <View className="mx-4 mb-6 bg-[#2a3e3e] rounded-3xl p-6">
          <View className="flex-row items-center gap-6">
            {/* Progress Circle - Moved to left */}
            <View className="relative w-24 h-24 items-center justify-center">
              <View className="absolute w-28 h-28 rounded-full border-8 border-[#737373]" />
              <View
                className="absolute w-28 h-28 rounded-full border-8 border-[#1AE57D]"
                style={{
                  borderBottomColor: 'transparent',
                  borderLeftColor: 'transparent',
                  transform: [{ rotate: '-60deg' }],
                }}
              />
              <Text className="text-white text-2xl font-bold">60%</Text>
            </View>

            {/* Pool Info - Moved to right */}
            <View className="flex-1">
              <Text className="text-white text-xl font-bold mb-2">
                Community Energy Pool
              </Text>
              <Text className="text-gray-300 text-sm mb-3">
                3,450 / 5,000 kWh contributed
              </Text>
              <TouchableOpacity 
                className="bg-[#1AE57D] rounded-full py-3 w-full max-w-[190px]"
                onPress={() => router.push('/(root)/donateNow')}
              >
                <Text className="text-center text-black font-bold text-base">
                  Contribute Now
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mx-4 mb-6">
          <Text className="text-white text-xl font-bold mb-4">Quick Actions</Text>
          
          <View className="flex-row justify-between w-full">
            <TouchableOpacity 
            className="w-[31%] bg-[#2a3e3e] rounded-2xl items-center justify-center h-28"
             onPress={() => router.push('/(root)/wallet')} 
            >
                <Image source={icons.wallet}  className="size-12 mb-1" />
              <Text className="text-white text-center text-sm">
                Wallet
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="w-[31%] bg-[#2a3e3e] rounded-2xl items-center justify-center h-28">
                <Image source={icons.supportH} className="size-12 mb-1" />
                <Text className="text-white text-center text-sm">
                    Request Help
                </Text>
            </TouchableOpacity>

            <TouchableOpacity 
            className="w-[31%] bg-[#2a3e3e] rounded-2xl items-center justify-center h-28"
             onPress={() => router.push('/(root)/impact')}
            >
                <Image source={icons.impactH} className="size-12 mb-1" />
              <Text className="text-white text-center text-sm">
                View Impact
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-3 mt-3">
            <TouchableOpacity 
            className="flex-[1.5] bg-[#2a3e3e] rounded-2xl  items-center justify-center h-28"
            onPress={() => router.push('/(root)/pay_bill')}
            >
               <Image source={icons.pay_bill} className="size-12 mb-1" />
                <Text className="text-white text-center text-sm">
                    Pay Electricity Bill
                </Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-[1.5] bg-[#2a3e3e] rounded-2xl p-4 items-center justify-center h-28">
              <Image source={icons.knowdledgeH}  className="size-12 mb-1" />
              <Text className="text-white text-center text-sm">
                Knowledge Hub
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Impact Stories */}
        <View className="mx-4 mb-[45px]">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-xl font-bold">Impact Stories</Text>
            <TouchableOpacity onPress={() => router.push('/(root)/impact')}>
              <Text className="text-emerald-500 font-semibold">View Impact</Text>
            </TouchableOpacity>
          </View>

          {/* Story Card 1 */}
          <TouchableOpacity 
            className="bg-[#2a3e3e] rounded-3xl overflow-hidden mb-4"
            onPress={() => router.push({
              pathname: "/stories/[id]",
              params: {
                id: "1",
                title: "Community Power Donation",
                image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800",
                body: "Your donation powered 10 homes this month. Thanks to community contributions, families in Galle now have reliable clean energy access, enabling children to study at night and businesses to operate after dark."
              }
            })}
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800' }}
              className="w-full h-48"
              resizeMode="cover"
            />
            <View className="p-5">
              <View className="flex-row items-center gap-2 mb-3">
                <HomeIcon size={20} color="#10b981" />
                <Text className="text-emerald-500 font-semibold text-base">
                  Community Power Donation
                </Text>
              </View>
              <Text className="text-white font-bold text-lg mb-2">
                Your donation powered 10 homes in this month
              </Text>
              <Text className="text-gray-400 text-sm leading-5">
                Thanks to community contributions, families in Galle now have
                reliable clean energy access.
              </Text>
            </View>
          </TouchableOpacity>

          {/* Story Card 2 */}
          <TouchableOpacity 
            className="bg-[#2a3e3e] rounded-3xl overflow-hidden mb-6"
            onPress={() => router.push({
              pathname: "/stories/[id]",
              params: {
                id: "2",
                title: "Kandy Solar Project",
                image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800",
                body: "Our community solar project in Kandy is now fully operational, providing clean energy to 15 households. The project includes battery storage to ensure consistent power supply even during cloudy days."
              }
            })}
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800' }}
              className="w-full h-48"
              resizeMode="cover"
            />
            <View className="p-5">
              <View className="flex-row items-center gap-2 mb-3">
                <View className="bg-yellow-500 rounded-full p-1">
                  <Text className="text-base">☀️</Text>
                </View>
                <Text className="text-yellow-500 font-semibold text-base">
                  Kandy Project
                </Text>
              </View>
              <Text className="text-white font-bold text-lg mb-2">
                Community solar project installed ☀️
              </Text>
              <Text className="text-gray-400 text-sm leading-5">
                New solar installation will provide clean energy to 50+
                families in the Kandy district.
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}