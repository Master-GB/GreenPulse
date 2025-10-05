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
import { useRouter } from "expo-router";
import { Globe, Zap, Leaf, Users } from "lucide-react-native";
import { LineChart } from "react-native-chart-kit";
import { images } from "@/constants/images";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";

export default function Impact() {
  const screenWidth = Dimensions.get("window").width;
  const router = useRouter();
  const viewShotRef = useRef<ViewShot>(null);

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

  // Bar chart data for Families Helped
  const familiesData = [
    { month: "Jan", value: 8 },
    { month: "Feb", value: 2 },
    { month: "Mar", value: 6 },
    { month: "Apr", value: 5 },
    { month: "May", value: 10 },
    { month: "Jun", value: 9 },
  ];

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
      if (viewShotRef.current) {
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
                <Text className="text-white text-2xl font-bold">1,040 kWh</Text>
                <Text className="text-[#1AE57D] text-sm mt-1">+5%</Text>
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
              <View className="flex-1 mr-2 bg-[#1a4d3a] rounded-2xl p-4">
                <Text className="text-gray-300 text-sm mb-1">
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
                <Text className="text-white text-2xl font-bold">18</Text>
                <Text className="text-[#1AE57D] text-sm mt-1">+6%</Text>
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
            <Text className="text-[#1AE57D] text-3xl font-bold ">18</Text>
          </View>
          <Text className="text-gray-400 text-sm mb-7">
            Last 6 Month <Text className="text-[#1AE57D]">+8%</Text>
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
              <Text className="text-gray-400 text-xs ">2025</Text>
            </View>
          </View>
        </View>

        {/* Community Stories */}
        <Text className="text-white text-xl font-bold mb-4 mx-4">
          Community Stories
        </Text>

        {(() => {
          const stories = [
            {
              id: "1",
              title: "Powering Safe Nights",
              image:
                "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400",
              excerpt: "You & 200 others powered safe nights for 80 families.",
              body: "Through your contributions, we installed solar lanterns and micro-grids that now power safe nights for 80 families. Children can study, and parents can work in the evenings without relying on unsafe kerosene lamps.",
            },
            {
              id: "2",
              title: "Lighting Classrooms",
              image:
                "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400",
              excerpt:
                "Together, the community lit up 3 classrooms in rural schools.",
              body: "A collaborative effort brought clean electricity to 3 classrooms, enabling evening classes and computer literacy programs for students in rural areas.",
            },
            {
              id: "3",
              title: "Village Solar Upgrade",
              image:
                "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400",
              excerpt:
                "New solar panels will provide clean energy in the village.",
              body: "We completed a set of rooftop installations to stabilize power for essential services like water pumps and health posts, reducing outages and diesel usage.",
            },
          ];

          return (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-3 mx-2"
              contentContainerStyle={{ paddingRight: -2 }}
            >
              {stories.map((story) => (
                <TouchableOpacity
                  key={story.id}
                  className="w-64 mr-4"
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push({
                      pathname: "/(root)/stories/[id]",
                      params: {
                        id: story.id,
                        title: story.title,
                        image: story.image,
                        body: story.body,
                      },
                    })
                  }
                >
                  <Image
                    source={{ uri: story.image }}
                    className="w-full h-40 rounded-2xl mb-3"
                    resizeMode="cover"
                  />
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