import React, { useCallback, useMemo, useState } from 'react' // useCallback and useFocusEffect for better data fetching on screen focus
import { View, Text, ScrollView, Dimensions, TouchableOpacity } from 'react-native'
import { BarChart, LineChart } from 'react-native-chart-kit'
import { useRouter, useFocusEffect } from 'expo-router'
import { collection, getDocs } from 'firebase/firestore'

import { db } from '../../../config/firebaseConfig'
import { useAuth } from '../../../contexts/AuthContext'

const DEFAULT_LINE_CHART = {
  labels: ['05', '06', '07', '08', '09', '10'],
  datasets: [{ data: [0, 0, 0, 0, 0, 0] }],
}

const DEFAULT_USAGE_BAR_CHART = {
  labels: ['01', '02', '03', '04'],
  datasets: [{ data: [0, 0, 0, 0] }],
}

type ComponentStat = { name: string; pct: number }

const DEFAULT_COMPONENTS: ComponentStat[] = [
  { name: 'Device 1', pct: 0 },
  { name: 'Device 2', pct: 0 },
  { name: 'Device 3', pct: 0 },
]

const createUsageBarChartFallback = () => ({
  labels: [...DEFAULT_USAGE_BAR_CHART.labels],
  datasets: [{ data: [...DEFAULT_USAGE_BAR_CHART.datasets[0].data] }],
})

// Pixel-approximate Track Energy screen using nativewind/tailwind classes
export default function TrackEnergy() {
  const router = useRouter()
  const { user } = useAuth()
  const BUTTON_WIDTH = 140

  const [availableCoins, setAvailableCoins] = useState(0)
  const [totalCoinsGenerated, setTotalCoinsGenerated] = useState(0)
  const [coinLineChart, setCoinLineChart] = useState(DEFAULT_LINE_CHART)
  const [usedThisMonth, setUsedThisMonth] = useState(0)
  const [totalUsage, setTotalUsage] = useState(0)
  const [monthlyAverageUsage, setMonthlyAverageUsage] = useState(0)
  const [usageComponents, setUsageComponents] = useState<ComponentStat[]>([])
  const [usageBarChart, setUsageBarChart] = useState(createUsageBarChartFallback)

  // FIX: Replace useEffect with useFocusEffect
  useFocusEffect(
    useCallback(() => {
      let isMounted = true

      const resetUsageState = () => {
        setUsedThisMonth(0)
        setTotalUsage(0)
        setMonthlyAverageUsage(0)
        setUsageComponents([])
        setUsageBarChart(createUsageBarChartFallback())
      }

      const fetchCoinData = async () => {
        if (!user) {
          if (isMounted) {
            setAvailableCoins(0)
            setTotalCoinsGenerated(0)
            setCoinLineChart(DEFAULT_LINE_CHART)
            resetUsageState()
          }
          return
        }

        try {
          const recordsRef = collection(db, 'users', user.uid, 'energyRecords')
          const snapshot = await getDocs(recordsRef)

          let runningTotal = 0
          const monthlyTotals = new Map<string, number>()

          snapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data()
            const coins = Number(data.coinValue) || 0
            runningTotal += coins

            const recordedAt = data.recordedAt?.toDate?.()
              || data.timestamp?.toDate?.()
              || new Date(data.recordedAtString || Date.now())

            if (recordedAt instanceof Date && !Number.isNaN(recordedAt.valueOf())) {
              const monthKey = `${recordedAt.getFullYear()}-${String(recordedAt.getMonth() + 1).padStart(2, '0')}`
              monthlyTotals.set(monthKey, (monthlyTotals.get(monthKey) || 0) + coins)
            }
          })

          if (isMounted) {
            const roundedTotal = Math.round(runningTotal)
            setAvailableCoins(roundedTotal)
            setTotalCoinsGenerated(roundedTotal)

            if (monthlyTotals.size > 0) {
              const sortedKeys = Array.from(monthlyTotals.keys()).sort()
              const recentKeys = sortedKeys.slice(-6)
              const labels = recentKeys.map((key) => key.split('-')[1])
              const datasetValues = recentKeys.map((key) => Math.round(monthlyTotals.get(key) || 0))

              setCoinLineChart({
                labels,
                datasets: [{ data: datasetValues }],
              })
            } else {
              setCoinLineChart(DEFAULT_LINE_CHART)
            }
          }
        } catch (error) {
          console.error('Error fetching coin data:', error)
          if (isMounted) {
            setAvailableCoins(0)
            setTotalCoinsGenerated(0)
            setCoinLineChart(DEFAULT_LINE_CHART)
          }
        }
      }

      const fetchUsageData = async () => {
        if (!user) {
          if (isMounted) {
            resetUsageState()
          }
          return
        }

        try {
          const recordsRef = collection(db, 'users', user.uid, 'usageRecords')
          const snapshot = await getDocs(recordsRef)

          let usageTotal = 0
          const monthlyTotals = new Map<string, number>()
          const deviceTotals = new Map<string, number>()

          snapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data()
            const usage = Number(data.kwhValue) || 0
            usageTotal += usage

            const recordedAt = data.recordedAt?.toDate?.()
              || data.timestamp?.toDate?.()
              || new Date(data.recordedAtString || Date.now())

            if (recordedAt instanceof Date && !Number.isNaN(recordedAt.valueOf())) {
              const monthKey = `${recordedAt.getFullYear()}-${String(recordedAt.getMonth() + 1).padStart(2, '0')}`
              monthlyTotals.set(monthKey, (monthlyTotals.get(monthKey) || 0) + usage)
            }

            const deviceName = (data.device || 'Unknown device').trim()
            if (deviceName.length > 0) {
              deviceTotals.set(deviceName, (deviceTotals.get(deviceName) || 0) + usage)
            }
          })

          if (isMounted) {
            const now = new Date()
            const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
            const currentMonthUsage = monthlyTotals.get(currentKey) || 0

            const totalRounded = Math.round(usageTotal)
            const monthlyAvg = monthlyTotals.size > 0 ? usageTotal / monthlyTotals.size : 0

            const sortedDeviceEntries = Array.from(deviceTotals.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3)
            const components = sortedDeviceEntries.map(([name, value]) => ({
              name,
              pct: usageTotal > 0 ? Math.min(1, value / usageTotal) : 0,
            }))

            while (components.length < 3) {
              const index = components.length + 1
              components.push({ name: `Device ${index}`, pct: 0 })
            }

            const sortedMonthKeys = Array.from(monthlyTotals.keys()).sort()
            const recentKeys = sortedMonthKeys.slice(-4)
            const labels = recentKeys.length > 0 ? recentKeys.map((key) => key.split('-')[1]) : [...DEFAULT_USAGE_BAR_CHART.labels]
            const datasetValues = recentKeys.length > 0
              ? recentKeys.map((key) => Math.round(monthlyTotals.get(key) || 0))
              : [...DEFAULT_USAGE_BAR_CHART.datasets[0].data]

            setUsedThisMonth(Math.round(currentMonthUsage))
            setTotalUsage(totalRounded)
            setMonthlyAverageUsage(Math.round(monthlyAvg))
            setUsageComponents(components)
            setUsageBarChart({
              labels,
              datasets: [{ data: datasetValues }],
            })
          }
        } catch (error) {
          console.error('Error fetching usage data:', error)
          if (isMounted) {
            resetUsageState()
          }
        }
      }

      fetchCoinData()
      fetchUsageData()

      return () => {
        isMounted = false
      }
    }, [user]) // The dependency array for useCallback
  )

  // Dummy data variables for Firebase integration
  const dummyData = useMemo(() => ({
    usedThisMonth,
    availableCoins,

    totalEnergyUse: totalUsage,
    barChartData: usageBarChart,

    monthlyAverage: monthlyAverageUsage,
    frequentlyUsedComponents: usageComponents.length ? usageComponents : DEFAULT_COMPONENTS,

    totalCoinsGenerated,
    lineChartData: coinLineChart,
    renewableSources: usageComponents.length ? usageComponents : DEFAULT_COMPONENTS,
  }), [availableCoins, coinLineChart, monthlyAverageUsage, totalCoinsGenerated, totalUsage, usageBarChart, usageComponents, usedThisMonth])

  return (
    <ScrollView className="flex-1 bg-[#122119] px-6 w-full" contentContainerStyle={{ paddingBottom: 48 }}>
      {/* Header */}
      <View className="items-center mt-8 mb-6">
        <Text className="text-white text-xl font-bold">Energy usage & analytics</Text>
      </View>

      {/* Summary pill */}
      {/* Summary pill - FIXED VERSION */}
      <View className="mb-6 px-2">
        <View
          className="bg-[#0f2a22] rounded-full px-6 py-6"
          style={{ borderColor: '#0f6b4f', borderWidth: 1 }}
        >
          {/* Top row: two columns - FIXED */}
          <View className="flex-row items-center justify-between">
            {/* Left section */}
            <View className="flex-1 items-center">
              <Text className="text-white text-2xl font-extrabold">{dummyData.usedThisMonth} kWh</Text>
              <Text className="text-gray-300 text-sm mt-1">Used this month</Text>
            </View>

            {/* Divider - FIXED */}
            <View style={{ width: 1, height: 40, backgroundColor: '#27433a' }} />

            {/* Right section */}
            <View className="flex-1 items-center">
              <Text className="text-white text-2xl font-extrabold">{dummyData.availableCoins} Coins</Text>
              <Text className="text-gray-300 text-sm mt-1">Available coins</Text>
            </View>
          </View>

          {/* Spacer */}
          <View style={{ height: 18 }} />

          {/* Centered button */}
          <View className="items-center">
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => router.push('/(root)/addRecord')}
                className="bg-[#13f07a] px-4 py-3 rounded-full"
                style={{ width: BUTTON_WIDTH, alignItems: 'center' }}
              >
                <Text className="text-black font-semibold">Add coin</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/(root)/addUsage')}
                className="bg-[#13f07a] px-4 py-3 rounded-full"
                style={{ width: BUTTON_WIDTH, alignItems: 'center' }}
              >
                <Text className="text-black font-semibold">Add usage</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* ...button moved into the summary pill above */}

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
        <Text className="text-white text-4xl font-extrabold mt-2">{dummyData.totalEnergyUse} kWh</Text>
      </View>

      {/* Bar chart (react-native-chart-kit) */}
      <View className="mb-6">
        <BarChart
          data={dummyData.barChartData}
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

      {/* Monthly Average */}
      <View className="mb-6">
        <Text className="text-gray-300 text-sm">Monthly Average</Text>
        <Text className="text-white text-4xl font-extrabold mt-2">{dummyData.monthlyAverage} kWh</Text>
      </View>

      {/* Most frequently used components */}
      <View className="mb-6">
        <Text className="text-white font-semibold mb-4">Most frequently used components</Text>

      
        {dummyData.frequentlyUsedComponents.map((c) => (
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
        <Text className="text-white text-4xl font-extrabold mt-2">{dummyData.totalCoinsGenerated} Coins</Text>
      </View>

      {/* Line chart (react-native-chart-kit) */}
      <View className="mb-6">
        <LineChart
          data={dummyData.lineChartData}
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
        {dummyData.renewableSources.map((r) => (
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