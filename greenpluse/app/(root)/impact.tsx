import React, { useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
  Share,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Globe, Zap, Leaf, Users } from "lucide-react-native";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { useAuth } from "../../contexts/AuthContext";
import { LineChart } from "react-native-chart-kit";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { images } from "@/constants/images";

export default function Impact() {
  const screenWidth = Dimensions.get("window").width;
  const router = useRouter();
  const viewShotRef = useRef<ViewShot>(null);
  const { user } = useAuth();
  const [donatedEnergy, setDonatedEnergy] = React.useState({
    total: 0,
    currentMonth: 0,
    previousMonth: 0
  });
  const [familiesHelped, setFamiliesHelped] = React.useState({
    total: 0,
    currentMonth: 0,
    previousMonth: 0
  });
  const [loading, setLoading] = React.useState(true);
  const [communityStories, setCommunityStories] = React.useState<{
    id: string;
    title: string;
    excerpt: string;
    body: string;
    image: string;
  }[]>([]);

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
            image: data.image || ''
          };
        })
        .filter(story => story.title && story.excerpt && story.body && story.image);
      
      console.log('Fetched stories:', stories);
      setCommunityStories(stories);
    } catch (error) {
      console.error('Error loading community stories:', error);
    }
  }, []);

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const loadImpactData = React.useCallback(async () => {
    try {
      if (!user) return;
      
      setLoading(true);
      const donationsRef = collection(db, 'donations');
      const q = query(donationsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      let totalDonatedEnergy = 0;
      let currentMonthEnergy = 0;
      let previousMonthEnergy = 0;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const amount = typeof data?.amountCoins === 'number' ? data.amountCoins : 0;
        totalDonatedEnergy += amount;
        
        let created: Date | null = null;
        if (data?.createdAt?.toDate) {
          created = data.createdAt.toDate();
        } else if (data?.createdAt instanceof Date) {
          created = data.createdAt;
        }
        
        if (created) {
          const docMonth = created.getMonth();
          const docYear = created.getFullYear();
          
          if (docMonth === currentMonth && docYear === currentYear) {
            currentMonthEnergy += amount;
          } else if (docMonth === (currentMonth === 0 ? 11 : currentMonth - 1) && 
                    (docMonth === 11 ? docYear === currentYear - 1 : docYear === currentYear)) {
            previousMonthEnergy += amount;
          }
        }
      });
      
      // Calculate families helped for total, current month, and previous month
      const totalFamilies = totalDonatedEnergy > 0 ? Math.max(1, Math.floor(totalDonatedEnergy / 50)) : 0;
      const currentMonthFamilies = currentMonthEnergy > 0 ? Math.max(1, Math.floor(currentMonthEnergy / 50)) : 0;
      const previousMonthFamilies = previousMonthEnergy > 0 ? Math.max(1, Math.floor(previousMonthEnergy / 50)) : 0;
      
      setDonatedEnergy({
        total: totalDonatedEnergy,
        currentMonth: currentMonthEnergy,
        previousMonth: previousMonthEnergy
      });
      
      setFamiliesHelped({
        total: totalFamilies,
        currentMonth: currentMonthFamilies,
        previousMonth: previousMonthFamilies
      });
      
      // Update families data with actual monthly values
      const monthlyFamiliesData = calculateMonthlyFamilies(querySnapshot.docs);
      setFamiliesData(monthlyFamiliesData);
      
    } catch (error) {
      console.error('Error loading impact data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load data on component mount and when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadImpactData();
      loadCommunityStories();
    }, [loadImpactData, loadCommunityStories])
  );

  // Chart data for CO2 Saved Over Time
  const co2ChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        data: [180, 210, 19, 24, 22, 70],
        strokeWidth: 2,
      },
    ],
    legend: ["CO2 Saved (kg)"],
  };

  // Get month names for the last 6 months
  const getLast6Months = () => {
    const months = [];
    const date = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
      months.push(monthNames[d.getMonth()]);
    }
    return months;
  };

  // Bar chart data for Families Helped - last 6 months
  const [familiesData, setFamiliesData] = React.useState<{month: string, value: number}[]>([
    { month: "Jan", value: 0 },
    { month: "Feb", value: 0 },
    { month: "Mar", value: 0 },
    { month: "Apr", value: 0 },
    { month: "May", value: 0 },
    { month: "Jun", value: 0 },
  ]);
  
  // Calculate families helped per month from donations
  const calculateMonthlyFamilies = React.useCallback((donations: any[]) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Initialize last 6 months data with zeros for energy and families
    const monthlyEnergy = Array(6).fill(0);
    const monthNames = getLast6Months();
    
    // First, sum up all energy donations per month
    donations.forEach(donation => {
      const data = donation.data();
      const amount = typeof data?.amountCoins === 'number' ? data.amountCoins : 0;
      
      let created: Date | null = null;
      if (data?.createdAt?.toDate) {
        created = data.createdAt.toDate();
      } else if (data?.createdAt instanceof Date) {
        created = data.createdAt;
      }
      
      if (created) {
        const docMonth = created.getMonth();
        const docYear = created.getFullYear();
        
        // Calculate how many months ago this was (0-5)
        const monthsAgo = (currentYear - docYear) * 12 + (currentMonth - docMonth);
        
        // If within last 6 months, add to the corresponding month
        if (monthsAgo >= 0 && monthsAgo < 6) {
          monthlyEnergy[5 - monthsAgo] += amount; // 5 - monthsAgo to get the correct index (0-5)
        }
      }
    });
    
    // Then calculate families helped based on total energy per month
    const monthlyFamilies = monthlyEnergy.map(energy => 
      energy > 0 ? Math.max(1, Math.floor(energy / 50)) : 0
    );
    
    // Format the data for the chart
    const formattedData = monthNames.map((month, index) => ({
      month,
      value: monthlyFamilies[index] || 0
    }));
    
    return formattedData;
  }, []);

  // Helpers for dynamic Y axis scaling (nice numbers)
  const getNiceMax = (maxVal: number): number => {
    const v = Math.max(0, maxVal);
    if (v === 0) return 10;
    const exponent = Math.floor(Math.log10(v));
    const pow10 = Math.pow(10, exponent);
    const fraction = v / pow10;
    let niceFraction: number;
    if (fraction <= 1) niceFraction = 1;
    else if (fraction <= 2) niceFraction = 2;
    else if (fraction <= 5) niceFraction = 5;
    else niceFraction = 10;
    return niceFraction * pow10;
  };

  const getTicks = (niceMax: number, segments: number): number[] => {
    const step = niceMax / segments;
    return Array.from({ length: segments + 1 }, (_, i) =>
      Number((i * step).toFixed(2))
    );
  };

  const maxValue = Math.max(...familiesData.map((d) => d.value), 0);
  const niceMax = getNiceMax(maxValue);
  const yTicks = getTicks(niceMax, 5);

  const handleShareImpact = async () => {
    try {
      if (viewShotRef.current && viewShotRef.current.capture) {
        const uri = await viewShotRef.current.capture();
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'Share My GreenPulse Impact',
          });
        } else {
          Alert.alert('Sharing not available', 'Sharing is not available on this device');
        }
      }
    } catch (error) {
      console.log("Error sharing:", error);
      Alert.alert('Error', 'Failed to share impact');
    }
  };

  return (
    <View className="flex-1 bg-[#122119] mb-4">
      <StatusBar
        barStyle="light-content"
        backgroundColor="#122119"
        translucent={false}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 10,
          paddingBottom: 10,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image with Stats */}
        <View className="bg-gradient-to-b from-teal-700 to-teal-800 rounded-3xl mb-4 ">
          <Image
            source={images.impactImage}
            className="w-full h-48 rounded-xl"
          />

          <View className="mt-[-25px] -mx-3 px-5">
            {/* First Row */}
            <View className="flex-row">
              {/* Donated Energy */}
              <View className="flex-1 mr-2 bg-[#1a4d3a] rounded-2xl p-4">
                <Text className="text-gray-300 text-sm mb-1">
                  Donated Energy
                </Text>
                <Text className="text-white text-2xl font-bold">
                  {loading ? '...' : `${donatedEnergy.total.toLocaleString()} kWh`}
                </Text>
                {!loading && (
                  <Text className={`text-sm mt-1 ${donatedEnergy.currentMonth >= donatedEnergy.previousMonth ? 'text-[#1AE57D]' : 'text-red-500'}`}>
                    {donatedEnergy.previousMonth === 0 ? 
                      (donatedEnergy.currentMonth > 0 ? 'New!' : '') : 
                      `${donatedEnergy.currentMonth >= donatedEnergy.previousMonth ? '+' : '-'}${Math.abs(Math.round(calculatePercentageChange(donatedEnergy.currentMonth, donatedEnergy.previousMonth)))}% from last month`}
                  </Text>
                )}
              </View>

              {/* CO2 Emissions Avoided */}
              <View className="flex-1 ml-2 bg-[#1a4d3a] rounded-2xl p-4">
                <Text className="text-gray-300 text-sm mb-1">
                  CO2 Emissions Avoided
                </Text>
                <Text className="text-white text-2xl font-bold">2,456 kg</Text>
                <Text className="text-[#1AE57D] text-sm mt-1">+15%</Text>
              </View>
            </View>

            {/* Second Row */}
            <View className="flex-row mt-3">
              {/* Clean Energy Generated */}
              <View className="flex-1 mr-2 bg-[#1a4d3a] rounded-2xl pt-6 pb-9 pl-3">
                <Text className="text-gray-300 text-sm mb-1 mt-[-7px]">
                  Helped Project
                </Text>
                <Text className="text-white text-2xl font-bold">12</Text>
                <Text className="text-[#1AE57D] text-sm mt-1">+2%</Text>
              </View>

              {/* Helped Families */}
              <View className="flex-1 ml-2 bg-[#1a4d3a] rounded-2xl p-4">
                <Text className="text-gray-300 text-sm mb-1">
                  Helped Families
                </Text>
                <Text className="text-white text-2xl font-bold">
                  {loading ? '...' : familiesHelped.total.toLocaleString()}
                </Text>
                {!loading && (
                  <Text className={`text-sm mt-1 ${familiesHelped.currentMonth >= familiesHelped.previousMonth ? 'text-[#1AE57D]' : 'text-red-500'}`}>
                    {familiesHelped.previousMonth === 0 ? 
                      (familiesHelped.currentMonth > 0 ? 'New!' : '') : 
                      `${familiesHelped.currentMonth >= familiesHelped.previousMonth ? '+' : '-'}${Math.abs(Math.round(calculatePercentageChange(familiesHelped.currentMonth, familiesHelped.previousMonth)))}% from last month`}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* CO2 Saved Over Time Chart */}
        <View className="bg-[#1a2e2e] rounded-3xl p-5 mb-5 border border-gray-700 mx-2">
          <Text className="text-white text-lg font-bold mb-1">
            CO₂ Saved Over Time
          </Text>
          <Text className="text-white text-3xl font-bold mb-1">2,456 kg</Text>
          <Text className="text-gray-400 text-sm mb-4">
            Last 6 Months <Text className="text-[#1AE57D]">+10%</Text>
          </Text>

          <View style={{ marginLeft: -34, marginRight: -20 }}>
            <LineChart
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                backgroundColor: "#1a2e2e",
                backgroundGradientFrom: "#1a2e2e",
                backgroundGradientTo: "#1a2e2e",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
                style: {
                  borderRadius: 16,
                  paddingRight: 20,
                },
                propsForDots: {
                  r: "3",
                  strokeWidth: "0.3",
                  stroke: "#2ECC71",
                },
                propsForHorizontalLabels: {
                  fontSize: 10,
                  fill: "#9CA3AF",
                },
                propsForVerticalLabels: {
                  fontSize: 10,
                  fill: "#9CA3AF",
                },
                propsForBackgroundLines: {
                  stroke: "rgba(75, 85, 99, 0.5)",
                  strokeWidth: 1.5,
                  strokeDasharray: [2, 0],
                },
                backgroundGradientFromOpacity: 0,
                backgroundGradientToOpacity: 0,
              }}
              bezier
              withVerticalLines={false}
              withHorizontalLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              withInnerLines={true}
              withOuterLines={true}
              fromZero={true}
              formatXLabel={(value: string) => value}
              segments={5}
              style={{
                borderRadius: 16,
              }}
              data={{
                labels: co2ChartData.labels,
                datasets: co2ChartData.datasets,
              }}
            />
            <View className="flex-row justify-center items-center mt-2">
              <View className="w-2 h-2 rounded-full bg-[#1AE57D] mr-2" />
              <Text className="text-gray-400 text-xs">CO2 Saved (kg)</Text>
            </View>
          </View>
        </View>

        {/* Families Helped Chart */}
        <View className="bg-[#1a2e2e] rounded-3xl p-5 mb-4 border border-gray-700 mx-2">
          <Text className="text-white text-xl font-bold mb-1">
            Families Helped
          </Text>
          <View className="flex-row items-center gap-2 mb-1">
            <Globe size={24} color="#2ECC71" />
            <Text className="text-[#1AE57D] text-3xl font-bold">
              {!loading ? familiesData.reduce((sum, month) => sum + month.value, 0).toLocaleString() : '...'}
            </Text>
          </View>
          <Text className="text-gray-400 text-sm mb-7">
            Last 6 Months {!loading ? (
              familiesData[0].value > 0 && familiesData[5].value > 0 ? (
                <Text className={familiesData[5].value >= familiesData[0].value ? 'text-[#1AE57D]' : 'text-red-500'}>
                  {familiesData[5].value >= familiesData[0].value ? '+' : '-'}
                  {Math.abs(Math.round(
                    ((familiesData[5].value - familiesData[0].value) / familiesData[0].value) * 100
                  ))}%
                </Text>
              ) : familiesData[5].value > 0 ? (
                <Text className="text-[#1AE57D]">New!</Text>
              ) : null
            ) : '...'}
          </Text>

          {/* Bar Chart */}
          <View className="h-50">
            <View className="relative h-40 mb-2">
              <View className="absolute left-0 right-0 top-0 bottom-0">
                {yTicks.map((val, idx) => {
                  if (val === 0) {
                    return (
                      <View
                        key={idx}
                        className="absolute w-full"
                        style={{ bottom: 0, height: 0 }}
                      >
                        <Text
                          className="text-gray-500 text-xs"
                          style={{
                            position: "absolute",
                            left: 0,
                            transform: [{ translateY: -6 }],
                          }}
                        >
                          {Number.isInteger(val) ? val : val.toFixed(0)}
                        </Text>
                        <View
                          style={{
                            position: "absolute",
                            left: 24,
                            right: 0,
                            borderTopWidth: 1,
                            borderTopColor: "#374151",
                          }}
                        />
                      </View>
                    );
                  }
                  const bottomPercent = (val / niceMax) * 100 + "%";
                  return (
                    <View
                      key={idx}
                      className="absolute w-full"
                      style={{ bottom: bottomPercent as any, height: 0 }}
                    >
                      <Text
                        className="text-gray-500 text-xs"
                        style={{
                          position: "absolute",
                          left: 0,
                          transform: [{ translateY: -6 }],
                        }}
                      >
                        {Number.isInteger(val) ? val : val.toFixed(0)}
                      </Text>
                      <View
                        style={{
                          position: "absolute",
                          left: 24,
                          right: 0,
                          height: 1,
                          backgroundColor: "#374151",
                        }}
                      />
                    </View>
                  );
                })}
              </View>

              <View className="flex-row items-end justify-around h-full ml-6">
                {familiesData.map((item, index) => {
                  const heightPercentage = Math.min(
                    (item.value / niceMax) * 100,
                    100
                  );
                  return (
                    <View key={index} className="flex-1 items-center mx-1">
                      <View
                        className="w-full rounded-t-2xl"
                        style={{
                          height: `${heightPercentage}%`,
                          backgroundColor: "rgba(46, 204, 113, 0.7)",
                        }}
                      />
                    </View>
                  );
                })}
              </View>
            </View>

            <View className="flex-row justify-around ml-6">
              {familiesData.map((item, index) => (
                <Text
                  key={index}
                  className="text-gray-400 text-xs flex-1 text-center"
                >
                  {item.month}
                </Text>
              ))}
            </View>
            <View className="flex-row justify-center items-center mt-2">
              <View className="w-2 h-2 rounded-full bg-[#1AE57D] mr-2" />
              <Text className="text-gray-400 text-xs ">{new Date().getFullYear()}</Text>
            </View>
          </View>
        </View>

        {/* Community Stories */}
        <Text className="text-white text-xl font-bold mb-4 mx-4">
          Community Stories
        </Text>

        {(() => {
          if (communityStories.length === 0) {
            return (
              <View className="flex-1 items-center justify-center py-10">
                <Text className="text-gray-400">No community stories available</Text>
              </View>
            );
          }

          return (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-3 mx-2"
              contentContainerStyle={{ paddingRight: -2 }}
            >
              {communityStories.map((story) => (
                <TouchableOpacity
                  key={story.id}
                  className="w-64 mr-4"
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push({
                      pathname: "/stories/[id]",
                      params: {
                        id: story.id,
                        title: story.title,
                        image: story.image,
                        body: story.body,
                        excerpt: story.excerpt,
                      },
                    })
                  }
                >
                  <View className="w-full h-40 rounded-2xl mb-3 bg-gray-700 overflow-hidden">
                    <Image
                      source={{ uri: story.image }}
                      className="w-full h-full"
                      resizeMode="cover"
                      onError={(error) => {
                        console.log('Error loading image:', error.nativeEvent.error);
                      }}
                      defaultSource={require('@/assets/images/impact_image.png')}
                    />
                  </View>
                  <Text className="text-gray-300 text-sm leading-5">
                    {story.excerpt}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          );
        })()}

        <View className="px-4 pb-5">
          <TouchableOpacity
            className="bg-[#2ECC71] rounded-full py-3"
            onPress={handleShareImpact}
          >
            <Text className="text-center text-black font-bold text-lg">
              Share Impact
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Hidden Share Card - Rendered off-screen */}
      <View style={{ position: 'absolute', left: -9999, top: -9999 }}>
        <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1.0 }}>
          <View className="bg-[#122119] p-6 w-[400px]">
            {/* Header */}
            <View className="items-center mb-6">
              <Text className="text-[#2ECC71] text-3xl font-bold">GreenPulse</Text>
              <Text className="text-white text-xl font-semibold mt-2">My Impact Report</Text>
            </View>

            {/* Stats Grid */}
            <View className="flex-row flex-wrap gap-3 mb-6">
              <View className="flex-1 bg-[#1a4d3a] rounded-2xl p-4 items-center">
                <Zap size={24} color="#2ECC71" />
                <Text className="text-white text-xl font-bold mt-2">1,040 kWh</Text>
                <Text className="text-gray-300 text-xs">Donated Energy</Text>
              </View>
              
              <View className="flex-1 bg-[#1a4d3a] rounded-2xl p-4 items-center">
                <Leaf size={24} color="#2ECC71" />
                <Text className="text-white text-xl font-bold mt-2">2,456 kg</Text>
                <Text className="text-gray-300 text-xs">CO₂ Avoided</Text>
              </View>
            </View>

            <View className="flex-row flex-wrap gap-3 mb-6">
              <View className="flex-1 bg-[#1a4d3a] rounded-2xl p-4 items-center">
                <Globe size={24} color="#2ECC71" />
                <Text className="text-white text-xl font-bold mt-2">12</Text>
                <Text className="text-gray-300 text-xs">Projects Helped</Text>
              </View>
              
              <View className="flex-1 bg-[#1a4d3a] rounded-2xl p-4 items-center">
                <Users size={24} color="#2ECC71" />
                <Text className="text-white text-xl font-bold mt-2">18</Text>
                <Text className="text-gray-300 text-xs">Families Helped</Text>
              </View>
            </View>

            {/* Footer */}
            <View className="items-center border-t border-gray-700 pt-4">
              <Text className="text-gray-400 text-sm">Join me in making a difference!</Text>
              <Text className="text-[#2ECC71] text-base font-semibold mt-1">greenpulse.app</Text>
            </View>
          </View>
        </ViewShot>
      </View>
    </View>
  );
}