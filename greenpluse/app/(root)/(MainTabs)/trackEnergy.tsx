import React from 'react'
import { View, Text, ScrollView } from 'react-native'

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

      {/* Bar chart placeholder */}
      <View className="h-56 bg-transparent mb-6 justify-end">
        <View className="flex-row items-end justify-between h-full">
          <View className="items-center">
            <View className="w-6 bg-[#0fd56b] rounded-t-xl h-12" />
            <Text className="text-gray-400 text-xs mt-2">05</Text>
          </View>
          <View className="items-center">
            <View className="w-6 bg-[#0fd56b] rounded-t-xl h-28" />
            <Text className="text-gray-400 text-xs mt-2">06</Text>
          </View>
          <View className="items-center">
            <View className="w-6 bg-[#0fd56b] rounded-t-xl h-40" />
            <Text className="text-gray-400 text-xs mt-2">07</Text>
          </View>
          <View className="items-center">
            <View className="w-6 bg-[#0fd56b] rounded-t-xl h-28" />
            <Text className="text-gray-400 text-xs mt-2">08</Text>
          </View>
        </View>
      </View>

      {/* Weekly Average */}
      <View className="mb-6">
        <Text className="text-gray-300 text-sm">Weekly Average</Text>
        <Text className="text-white text-3xl font-extrabold mt-2">14738 kWh</Text>
      </View>

      {/* Most frequently used components */}
      <View className="mb-6">
        <Text className="text-white font-semibold mb-3">Most frequently used components</Text>

        {[
          { name: 'Air Conditioner', pct: 0.9 },
          { name: 'Printer', pct: 0.65 },
          { name: 'PC', pct: 0.5 },
        ].map((c) => (
          <View key={c.name} className="mb-3">
            <Text className="text-white mb-2">{c.name}</Text>
            <View className="h-4 bg-transparent border border-[#27433a] rounded-full overflow-hidden">
              <View className="h-4 rounded-full bg-[#13f07a]" style={{ width: `${c.pct * 100}%` }} />
            </View>
          </View>
        ))}
      </View>

      {/* Coins generated */}
      <View className="mb-6">
        <Text className="text-gray-300 text-sm">Total coins generated</Text>
        <Text className="text-white text-3xl font-extrabold mt-2">250 Coins</Text>
      </View>

      {/* Line chart placeholder */}
      <View className="mb-6">
        <View className="h-44 bg-transparent">
          {/* Simple line chart points using absolute Views would need more complex layout; use placeholders */}
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-400">[line chart placeholder]</Text>
          </View>
        </View>
      </View>

      {/* Renewable sources progress */}
      <View className="mb-10">
        {[
          { name: 'Solar panels', pct: 0.85 },
          { name: 'Wind turbine', pct: 0.6 },
          { name: 'Generator', pct: 0.45 },
        ].map((r) => (
          <View key={r.name} className="mb-4">
            <Text className="text-white mb-2">{r.name}</Text>
            <View className="h-4 bg-transparent border border-[#27433a] rounded-full overflow-hidden">
              <View className="h-4 rounded-full bg-[#13f07a]" style={{ width: `${r.pct * 100}%` }} />
            </View>
          </View>
        ))}
      </View>

      {/* Bottom navigation spacer to emulate bottom tabs */}
      <View className="h-16" />
    </ScrollView>
  )
}