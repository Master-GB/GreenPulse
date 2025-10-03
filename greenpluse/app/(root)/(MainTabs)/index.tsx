
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  ImageBackground
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Home as HomeIcon,
  Zap,
  TrendingUp,
  Leaf,
  HelpCircle,
  BookOpen,
  Bell,
  Coins,
} from 'lucide-react-native';
import { images } from '@/constants/images'
import { icons } from '@/constants/icons';

export default function Home() {
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
          <TouchableOpacity className='bg-[#2a3e3e] rounded-full px-3 py-2 flex-row items-center gap-2'>
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
              <TouchableOpacity className="bg-[#1AE57D] rounded-full py-3 w-full max-w-[190px]">
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
          
          <View className="flex-row gap-3 mb-3">
            <TouchableOpacity className="flex-1 bg-[#2a3e3e] rounded-2xl  items-center justify-center h-28">
            
                <Image source={icons.donateH}  className="size-12  mb-1" />
         
              <Text className="text-white text-center text-sm whitespace-nowrap">
                Donate Energy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1 bg-[#2a3e3e] rounded-2xl p-4 items-center justify-center h-28">
                 <Image source={icons.supportH}  className="size-12 mb-1" />
              <Text className="text-white text-center text-sm">
                Request Help
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1 bg-[#2a3e3e] rounded-2xl p-4 items-center justify-center h-28">
              <Image source={icons.impactH}  className="size-12 mb-1" />
              <Text className="text-white text-center text-sm">
                View Impact
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity className="flex-[1.5] bg-[#2a3e3e] rounded-2xl  items-center justify-center h-28">
               <Image source={icons.trackH}  className="size-12 mb-1" />
              <Text className="text-white text-center text-sm">
                Track Usage & Generated
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
            <TouchableOpacity>
              <Text className="text-emerald-500 font-semibold">View All</Text>
            </TouchableOpacity>
          </View>

          {/* Story Card 1 */}
          <View className="bg-[#2a3e3e] rounded-3xl overflow-hidden mb-4">
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
          </View>

          {/* Story Card 2 */}
          <View className="bg-[#2a3e3e] rounded-3xl overflow-hidden mb-6">
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
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}