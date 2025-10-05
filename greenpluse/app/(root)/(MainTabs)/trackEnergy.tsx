import React from 'react'
import { View, Text, ScrollView, Dimensions } from 'react-native'
import { BarChart, LineChart } from 'react-native-chart-kit'

// Pixel-approximate Track Energy screen using nativewind/tailwind classes
export default function TrackEnergy() {
  return (
    <ScrollView className="flex-1 bg-[#122119] px-6" contentContainerStyle={{ paddingBottom: 48 }}>
      {/* Header */}
      <View className="items-center mt-8 mb-6">
        <Text className="text-white text-xl font-bold">Energy usage & analytics</Text>
      </View>

      {/* Segmented control */}
      <View className="flex-row justify-center items-center gap-3 mb-6">
        <View className="bg-[#1f6b49] px-4 py-2 rounded-full">
          <Text className="text-white font-semibold">Weekly</Text>
        </View>
        <View className="border border-[#2b6b4f] px-4 py-2 rounded-full">
          <Text className="text-white">Monthly</Text>
        </View>
        <View className="bg-[#1f6b49] px-4 py-2 rounded-full">
          <Text className="text-white font-semibold">Yearly</Text>
        </View>
      </View>

      {/* Total Energy Use */}
      <View className="mb-6">
        <Text className="text-gray-300 text-sm">Total Energy Use</Text>
        <Text className="text-white text-4xl font-extrabold mt-2">19456 kWh</Text>
      </View>

      {/* Bar chart (react-native-chart-kit) */}
      <View className="mb-6">
        <BarChart
          data={{
            labels: ['05', '06', '07', '08'],
            datasets: [{ data: [30, 50, 90, 50] }],
          }}
          width={Dimensions.get('window').width - 48} // padding compensation
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          withInnerLines={true}
          chartConfig={{
            backgroundColor: '#122119',
            backgroundGradientFrom: '#122119',
            backgroundGradientTo: '#122119',
            decimalPlaces: 0,
            // bright green for bars and labels
            color: (opacity = 1) => `rgba(19,240,122, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255,255,255, ${opacity})`,
            propsForBackgroundLines: { stroke: '#183226' },
            // make them bars bright green
            fillShadowGradient: '#13f07a',
            fillShadowGradientOpacity: 1,
          }}
          style={{
            marginVertical: 8,
            borderRadius: 8,
          }}
          showBarTops={false}
          fromZero
        />
      </View>

      {/* Weekly Average */}
      <View className="mb-6">
        <Text className="text-gray-300 text-sm">Weekly Average</Text>
        <Text className="text-white text-3xl font-extrabold mt-2">14738 kWh</Text>
      </View>

      {/* Most frequently used components */}
      <View className="mb-6">
        <Text className="text-white font-semibold mb-4">Most frequently used components</Text>

        {[
          { name: 'Air Conditioner', pct: 0.9 },
          { name: 'Printer', pct: 0.65 },
          { name: 'PC', pct: 0.5 },
        ].map((c) => (
          <View key={c.name} className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-base">{c.name}</Text>
            <View className="w-1/2 h-8 rounded-full border" style={{ borderColor: '#2b6b66', padding: 4 }}>
              <View className="h-full rounded-full" style={{ backgroundColor: '#13f07a', width: `${c.pct * 100}%` }} />
            </View>
          </View>
        ))}
      </View>

      {/* Coins generated */}
      <View className="mb-6">
        <Text className="text-gray-300 text-sm">Total coins generated</Text>
        <Text className="text-white text-3xl font-extrabold mt-2">250 Coins</Text>
      </View>

      {/* Line chart (react-native-chart-kit) */}
      <View className="mb-6">
        <LineChart
          data={{
            labels: ['05', '06', '07', '08', '09', '10'],
            datasets: [{ data: [34, 67, 55, 78, 76, 55] }],
          }}
          width={Dimensions.get('window').width - 48}
          height={180}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: '#122119',
            backgroundGradientFrom: '#122119',
            backgroundGradientTo: '#122119',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(19,240,122, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255,255,255, ${opacity})`,
            propsForDots: { r: '4', strokeWidth: '2', stroke: '#13f07a', fill: '#13f07a' },
            propsForBackgroundLines: { stroke: '#183226' },
          }}
          bezier
          style={{ borderRadius: 8 }}
          withDots
        />
      </View>

      {/* Renewable sources progress */}
      <View className="mb-10">
        {[
          { name: 'Solar panels', pct: 0.85 },
          { name: 'Wind turbine', pct: 0.6 },
          { name: 'Generator', pct: 0.45 },
        ].map((r) => (
          <View key={r.name} className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-base">{r.name}</Text>
            <View className="w-1/2 h-8 rounded-full border" style={{ borderColor: '#2b6b66', padding: 4 }}>
              <View className="h-full rounded-full" style={{ backgroundColor: '#13f07a', width: `${r.pct * 100}%` }} />
            </View>
          </View>
        ))}
      </View>

      {/* Bottom navigation spacer to emulate bottom tabs */}
      <View className="h-16" />
    </ScrollView>
  )
}