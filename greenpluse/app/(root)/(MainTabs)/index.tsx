import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, FlatList, StatusBar, ImageBackground } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getDocs, query, orderBy, limit, writeBatch, doc, DocumentData, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebaseConfig';
import { useAuth } from '../../../contexts/AuthContext';
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
  const { user } = useAuth();
  const [communityTotal, setCommunityTotal] = React.useState(0);
  type Story = {
    id: string;
    title: string;
    excerpt: string;
    image: string;
    createdAt: Date;
  };

  const [communityStories, setCommunityStories] = React.useState<Story[]>([]);
  const [userCoins, setUserCoins] = React.useState(0);
  const [userCredits, setUserCredits] = React.useState(0);

  const loadCommunityTotal = React.useCallback(async () => {
    try {
      if (!user) return;
      
      // Get all donations for community total
      const allDonationsRef = collection(db, 'donations');
      const allSnap = await getDocs(allDonationsRef);
      
      let communityTotal = 0;
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      allSnap.forEach((doc) => {
        const data: any = doc.data();
        const amount = typeof data?.amountCoins === 'number' ? data.amountCoins : 0;
        
        let created: Date | null = null;
        if (data?.createdAt?.toDate) {
          created = data.createdAt.toDate();
        } else if (data?.createdAt instanceof Date) {
          created = data.createdAt;
        }
        if (!created || created.getMonth() !== currentMonth || created.getFullYear() !== currentYear) return;
        
        communityTotal += amount;
      });
      
      setCommunityTotal(communityTotal);
    } catch (e) {
      console.log('Error loading community total:', e);
    }
  }, [user]);

  // Function to add sample stories to Firestore (run once)
  const addSampleStories = async () => {
    try {
      const stories = [
        {
          
        }
      ];

      const batch = writeBatch(db);
      const storiesRef = collection(db, 'communityStory');
      
      // Add each story to the batch
      stories.forEach(story => {
        const docRef = doc(storiesRef);
        batch.set(docRef, story);
      });
      
      // Commit the batch
      await batch.commit();
      console.log('Successfully added sample stories');
      
      // Reload the stories
      loadCommunityStories();
    } catch (error) {
      console.error('Error adding sample stories:', error);
    }
  };

  const loadCommunityStories = React.useCallback(async () => {
    try {
      console.log('Fetching community stories...');
      const storiesRef = collection(db, 'communityStory');
      const querySnapshot = await getDocs(storiesRef);
      
      const stories = querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || 'No Title',
            excerpt: data.excerpt || '',
            body: data.body || '',
            image: data.image || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400',
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
          };
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 3); // Show only the first 3 stories
      
      console.log('Fetched stories:', stories);
      setCommunityStories(stories);
    } catch (error) {
      console.error('Error loading community stories:', error);
    }
  }, []);

  // Load user's coin balance and credits
  const loadUserData = React.useCallback(async () => {
    try {
      if (!user) return;
      
      // Load coins from energy records
      const recordsRef = collection(db, 'users', user.uid, 'energyRecords');
      const snapshot = await getDocs(recordsRef);
      
      let totalCoins = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.coinValue) {
          totalCoins += Number(data.coinValue);
        }
      });
      
      setUserCoins(Math.round(totalCoins));
      
      // Load credits from totalCredits collection
      const creditsDoc = await getDoc(doc(db, 'totalCredits', user.uid));
      if (creditsDoc.exists()) {
        const creditsData = creditsDoc.data();
        const totalCredits = Number(creditsData.totalReceived) || 0;
        setUserCredits(Math.round(totalCredits));
      } else {
        setUserCredits(0);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, [user]);

  // Load all data on initial mount and when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadCommunityTotal();
      loadCommunityStories();
      loadUserData();
    }, [loadCommunityTotal, loadCommunityStories, loadUserData])
  );
  return (
    <SafeAreaView className="flex-1 bg-[#122119]">
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View className="flex-row justify-between items-center px-5">
        <Image source={images.logo}  className="size-14 ml-[-12px]" />
        <Text className="text-white text-2xl font-bold mr-28 mb-1">GreenPulse</Text>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity 
          className='bg-[#2a3e3e] rounded-full px-3 py-2 flex-row items-center gap-2 mb-2'
          onPress={() => router.push('/(root)/wallet')}
          >
            <Image source={icons.coinH}  className="size-5 mb-1" />
            <Text className="text-white font-semibold">{userCoins}</Text>
            <Text className="text-white font-semibold">/{userCredits}</Text>
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
                  transform: [{ rotate: `${(communityTotal / 5000) * 360 - 90}deg` }],
                }}
              />
              <Text className="text-white text-2xl font-bold">{Math.min(100, Math.round((communityTotal / 5000) * 100))}%</Text>
            </View>

            {/* Pool Info - Moved to right */}
            <View className="flex-1">
              <Text className="text-white text-xl font-bold mb-2">
                Community Energy Pool
              </Text>
              <Text className="text-gray-300 text-sm mb-3">
                {communityTotal.toLocaleString()} / 5,000 kWh contributed
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
            className="flex-[1.8] bg-[#2a3e3e] rounded-2xl  items-center justify-center h-28"
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
        <View className="mx-4 mb-[80px]">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-xl font-bold">Impact Stories</Text>
            <TouchableOpacity onPress={() => router.push('/(root)/impact')}>
              <Text className="text-emerald-500 font-semibold">View Impact</Text>
            </TouchableOpacity>
          </View>
          
          {communityStories.length > 0 ? (
            <View className="gap-3 mb-2">
              {communityStories.map((story) => (
                <TouchableOpacity 
                  key={story.id}
                  className="bg-[#2a3e3e] rounded-2xl overflow-hidden"
                  onPress={() => router.push(`/(root)/stories/${story.id}?title=${encodeURIComponent(story.title)}&body=${encodeURIComponent(story.excerpt)}&image=${encodeURIComponent(story.image)}`)}
                >
                  <View className="flex-row">
                    <Image 
                      source={{ uri: story.image }} 
                      className="w-24 h-24 rounded-l-2xl" 
                      resizeMode="cover"
                    />
                    <View className="flex-1 p-3">
                      <Text className="text-white font-semibold text-base mb-1" numberOfLines={1}>
                        {story.title}
                      </Text>
                      <Text className="text-gray-300 text-xs" numberOfLines={3}>
                        {story.excerpt}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="bg-[#2a3e3e] rounded-2xl p-6 items-center justify-center h-32">
              <Text className="text-gray-400 text-center">No impact stories available yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}