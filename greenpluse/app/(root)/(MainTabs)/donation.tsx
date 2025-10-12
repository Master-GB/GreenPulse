import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../../../config/firebaseConfig';
import { useAuth } from '../../../contexts/AuthContext';
import {
  ArrowLeft,
  Coins,
  Zap,
  Home,
  Globe,
  TrendingUp,
  User,
} from 'lucide-react-native';
import { icons } from '@/constants/icons';

export default function Donate() {
  const router = useRouter();
  const { user } = useAuth();
  const [monthlyData, setMonthlyData] = React.useState([
    { month: 'Jan', value: 0 },
    { month: 'Feb', value: 0 },
    { month: 'Mar', value: 0 },
    { month: 'Apr', value: 0 },
    { month: 'May', value: 0 },
    { month: 'Jun', value: 0 },
    { month: 'Jul', value: 0 },
    { month: 'Aug', value: 0 },
    { month: 'Sep', value: 0 },
    { month: 'Oct', value: 0 },
    { month: 'Nov', value: 0 },
    { month: 'Dec', value: 0 },
  ]);
  const [totalDonated, setTotalDonated] = React.useState(0);
  const [familiesHelped, setFamiliesHelped] = React.useState(0);
  const [communityTotal, setCommunityTotal] = React.useState(0);
  const [userCoins, setUserCoins] = React.useState(0);
  const [userCredits, setUserCredits] = React.useState(0);

  const loadDonations = React.useCallback(async () => {
    try {
      if (!user) return;
      
      // Get user's donations
      const userDonationsRef = collection(db, 'donations');
      const userQ = query(userDonationsRef, where('userId', '==', user.uid));
      const userSnap = await getDocs(userQ);
      
      // Get all donations for community total
      const allDonationsRef = collection(db, 'donations');
      const allSnap = await getDocs(allDonationsRef);

      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const acc = months.map((m) => ({ month: m, value: 0 }));
      let userTotal = 0;
      let communityTotal = 0;

      // Process user's donations
      userSnap.forEach((doc) => {
        const data: any = doc.data();
        const amount = typeof data?.amountCoins === 'number' ? data.amountCoins : 0;
        userTotal += amount;
        
        let created: Date | null = null;
        if (data?.createdAt?.toDate) {
          created = data.createdAt.toDate();
        } else if (data?.createdAt instanceof Date) {
          created = data.createdAt;
        }
        if (!created) return;
        const monthIndex = created.getMonth();
        acc[monthIndex].value += amount;
      });

      // Process all donations for community total (current month only)
      const currentMonth = new Date().getMonth();
      allSnap.forEach((doc) => {
        const data: any = doc.data();
        const amount = typeof data?.amountCoins === 'number' ? data.amountCoins : 0;
        
        let created: Date | null = null;
        if (data?.createdAt?.toDate) {
          created = data.createdAt.toDate();
        } else if (data?.createdAt instanceof Date) {
          created = data.createdAt;
        }
        if (!created || created.getMonth() !== currentMonth) return;
        
        communityTotal += amount;
      });

      setMonthlyData(acc);
      setTotalDonated(userTotal);
      setCommunityTotal(communityTotal);
      // Calculate families helped: 1 family for every 50 coins, minimum 1 if any coins donated
      setFamiliesHelped(userTotal > 0 ? Math.ceil(userTotal / 50) : 0);
    } catch (e) {
      console.log('Error loading donations:', e);
    }
  }, [user]);

  // Load donations on initial mount and when screen comes into focus
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
      loadDonations();
      loadUserData();
    }, [loadDonations, loadUserData])
  );

  // Compute a dynamic max so bars keep the same visual height and the Y-axis scales instead
  const rawMax = Math.max(...monthlyData.map(d => d.value));
  // Add 10% headroom and round up to a nice step of 20
  const maxValue = Math.max(20, Math.ceil((rawMax * 1.1) / 20) * 20);

  return (
    <SafeAreaView className="flex-1 bg-[#122119]">
      <StatusBar barStyle="light-content" />

      <View className="flex-row justify-between items-center px-5 py-1">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold ml-8">Donation</Text>
          <TouchableOpacity 
            className='bg-[#2a3e3e] rounded-full px-3 py-2 flex-row items-center gap-2'
            onPress={() => router.push('/(root)/wallet')}
          >
            <Image source={icons.coinH} className="size-5 mb-1" />
            <Text className="text-white font-semibold">{userCoins.toLocaleString()}</Text>
            <Text className="text-white font-semibold">/{userCredits.toLocaleString()}</Text>
          </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Coin Donated This Month */}
        <View className="mx-4 mt-6 mb-6 bg-[#2a3e3e] rounded-3xl p-6">
          <View className="flex-row justify-between items-start mb-4">
            <Text className="text-white text-2xl font-bold flex-1">
              Coin Donated {'\n'}This Month
            </Text>
            <View className="items-end">
              <Text className="text-gray-400 text-2xl font-bold">{communityTotal.toLocaleString()}/5,000</Text>
              <Text className="text-gray-400 text-base">kWh</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="bg-[#33664C] h-3 rounded-full mb-3 overflow-hidden">
            <View
              className="bg-[#19E57D] h-3 rounded-full"
              style={{ width: `${Math.min(100, (communityTotal / 5000) * 100)}%` }}
            />
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-[#94C7AD] text-base">
              Community Goal: 5,000 kWh
            </Text>
            <Text className="text-[#19E57D] font-bold">
              {Math.min(100, Math.round((communityTotal / 5000) * 100))}%
            </Text>
          </View>
        </View>

        {/* Donate Energy Section */}
        <View className="mx-4 mb-5">
          <Text className="text-white text-2xl font-bold mb-4">
            Donate Energy
          </Text>

          <View className="bg-[#2a3e3e] rounded-3xl p-4">
            <Text className="text-gray-200 text-lg mb-4 leading-tight">
              Tap to choose amount &{'\n'}beneficiary.
            </Text>

            <View className="flex-row items-center justify-center gap-2 mb-2">
              <Zap size={24} color="#fbbf24" fill="#fbbf24" />
              <Text className="text-white text-base">
                1 Coin = 1 kWh of clean energy
              </Text>
            </View>

            <TouchableOpacity 
            className="bg-[#1AE57D] rounded-full py-3"
             onPress={() => router.push('/(root)/donateNow')}
            >
              <Text className="text-center text-black font-bold text-lg">
                Donate Now
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* MY Donation Section */}
        <View className="mx-4 mb-[80px]">
          <Text className="text-white text-2xl font-bold mb-4">
            MY Donation
          </Text>

          <View className="bg-[#2a3e3e] rounded-3xl p-6">
            {/* Stats */}
            <View className="flex-row justify-around mb-6">
              <View className="items-center">
                <View className="flex-row items-center gap-2 mb-2">
                  <Image source={icons.coinH}  className="size-8 mb-1" />
                  <Text className="text-black text-4xl font-bold">{totalDonated}</Text>
                </View>
                <Text className="text-gray-300 text-sm text-center">
                  Coin donated in{'\n'}total
                </Text>
              </View>

              <View className="items-center">
                <View className="flex-row items-center gap-2 mb-2">
                  <Globe size={28} color="#10b981" />
                  <Text className="text-black text-4xl font-bold">{familiesHelped}</Text>
                </View>
                <Text className="text-gray-300 text-sm text-center">
                  Families helped
                </Text>
              </View>
            </View>

            {/* Chart */}
            <AnimatedChart monthlyData={monthlyData} maxValue={maxValue} />
            <View className="items-center mb-1">
              <View className="flex-row items-center gap-2 mb-3">
                <View className="w-3 h-3 bg-[#1AE57D] rounded-sm" />
                <Text className="text-gray-100 text-sm text-center leading-5">
                {new Date().getFullYear()}
              </Text>
              </View>
              <Text className="text-black text-m font-bold text-center leading-5">
                Keep going, every credit brings us closer{'\n'}to clean energy access for all.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

}

// Attractive animated bar chart component used above
function AnimatedChart({
  monthlyData,
  maxValue,
}: {
  monthlyData: { month: string; value: number }[];
  maxValue: number;
}) {
  const containerHeight = 192; // matches h-48
  const animatedValues = React.useRef(
    monthlyData.map(() => new Animated.Value(0))
  ).current;

  const maxIndex = React.useMemo(() => {
    let idx = 0;
    let max = -Infinity;
    monthlyData.forEach((d, i) => {
      if (d.value > max) {
        max = d.value;
        idx = i;
      }
    });
    return idx;
  }, [monthlyData]);

  React.useEffect(() => {
    const animations = monthlyData.map((d, i) =>
      Animated.timing(animatedValues[i], {
        toValue: d.value,
        duration: 700,
        useNativeDriver: false,
      })
    );
    Animated.stagger(60, animations).start();
  }, [animatedValues, monthlyData]);

  // Generate grid steps based on current maxValue
  const numSteps = 5;
  const step = maxValue / numSteps;
  const gridSteps = Array.from({ length: numSteps + 1 }, (_, i) => Math.round(i * step));

  return (
    <View className="mt-6 mb-4 ml-2">
      <View className="relative">
        {/* Grid lines */}
        <View className="absolute left-0 right-0" style={{ height: containerHeight, bottom: 0 }}>
          {gridSteps.map((g) => {
            const bottom = (g / maxValue) * containerHeight;
            return (
              <View
                key={g}
                style={{ bottom, height: 1 }}
                className="absolute left-0 right-0 bg-white/10"
              />
            );
          })}
        </View>

        {/* Bars */}
        <View className="flex-row h-48 items-end gap-1">
          {monthlyData.map((data, index) => {
            const barHeight = animatedValues[index].interpolate({
              inputRange: [0, maxValue],
              outputRange: [0, containerHeight],
            });
            const isMax = index === maxIndex;
            const barColor = '#1AE57D';
            return (
              <View key={index} className="flex-1 justify-end items-center">
                <Animated.View
                  style={{ height: barHeight, backgroundColor: barColor }}
                  className="w-full rounded-t-lg"
                />
              </View>
            );
          })}
        </View>

        {/* Y-axis indicators (aligned with grid) */}
        {gridSteps.map((g) => {
          const bottom = (g / maxValue) * containerHeight;
          return (
            <Text
              key={`y-${g}`}
              className="text-gray-500 text-xs absolute"
              style={{ left: -22, bottom: bottom - 6 }}
            >
              {g}
            </Text>
          );
        })}
      </View>

      {/* X-axis labels */}
      <View className="flex-row justify-between mt-2">
        {monthlyData.map((data, index) => (
          <Text key={index} className="text-gray-400 text-xs flex-1 text-center">
            {data.month}
          </Text>
        ))}
      </View>
    </View>
  );
}