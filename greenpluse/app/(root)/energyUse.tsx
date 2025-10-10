import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native'
import React, { useCallback, useState } from 'react'
import { ArrowLeft, Info } from 'lucide-react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { collection, getDocs } from 'firebase/firestore'

import { db } from '../../config/firebaseConfig'
import { useAuth } from '../../contexts/AuthContext'

export const options = {
  headerShown: false,
}

type UsageRecord = {
  id: string
  userId: string
  kwhValue: number
  period: 'Weekly' | 'Monthly' | 'Yearly'
  recordedAtString: string
  device: string
  timestamp: Date
}

const EnergyUse = () => {
  const router = useRouter()
  const { user } = useAuth()

  const [records, setRecords] = useState<UsageRecord[]>([])
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      let isMounted = true

      const fetchUsage = async () => {
        if (!user) {
          if (isMounted) {
            setRecords([])
            setLoading(false)
          }
          return
        }

        try {
          const recordsRef = collection(db, 'users', user.uid, 'usageRecords')
          const snapshot = await getDocs(recordsRef)

          const fetched: UsageRecord[] = []
          snapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data()
            const timestampValue = data.recordedAt?.toDate?.()
              || data.timestamp?.toDate?.()
              || new Date()
            const periodValue = (data.period ?? 'Monthly') as UsageRecord['period']
            fetched.push({
              id: docSnapshot.id,
              userId: data.userId,
              kwhValue: Number(data.kwhValue) || 0,
              period: periodValue,
              recordedAtString:
                data.recordedAtString ?? data.recordedAt?.toDate?.()?.toLocaleString?.() ?? '',
              device: data.device ?? 'Unknown device',
              timestamp: timestampValue,
            })
          })

          fetched.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

          if (isMounted) {
            setRecords(fetched)
            setLoading(false)
          }
        } catch (error) {
          console.error('Error fetching usage records:', error)
          if (isMounted) {
            Alert.alert('Error', 'Failed to load usage records')
            setRecords([])
            setLoading(false)
          }
        }
      }

      setLoading(true)
      fetchUsage()

      return () => {
        isMounted = false
      }
    }, [user])
  )

  const handleBack = () => {
    router.back()
  }

  const handleGoToAnalysis = () => {
    router.push('/(root)/(MainTabs)/trackEnergy')
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0a1410]">
      <StatusBar barStyle="light-content" backgroundColor="#0a1410" />

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-lg">Loading usage...</Text>
        </View>
      ) : !user ? (
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-white text-lg text-center mb-4">
            You must be logged in to view your usage records.
          </Text>
        </View>
      ) : (
        <>
          <View className="px-5 pt-6 pb-4">
            <View className="flex-row items-center justify-between mb-2">
              <TouchableOpacity
                onPress={handleBack}
                className="w-10 h-10 items-center justify-center"
              >
                <ArrowLeft size={28} color="#ffffff" strokeWidth={2.5} />
              </TouchableOpacity>
              <Text className="text-white text-2xl font-bold">Energy Use</Text>
              <View className="w-10" />
            </View>
          </View>

          <ScrollView
            className="flex-1 px-5"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            {records.map((record) => (
              <View
                key={record.id}
                className="bg-transparent border-2 border-[#0fd56b] rounded-3xl p-5 mb-4"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-white text-3xl font-bold">
                    {record.kwhValue} kWh
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-[#8a9a94] text-sm mr-2">
                      {record.recordedAtString}
                    </Text>
                    <Info size={18} color="#8a9a94" strokeWidth={2} />
                  </View>
                </View>

                <View className="flex-row justify-between">
                  <Text className="text-[#8a9a94] text-sm">Period: {record.period}</Text>
                  <Text className="text-[#8a9a94] text-sm">Device: {record.device}</Text>
                </View>
              </View>
            ))}

            {records.length === 0 && (
              <View className="items-center justify-center py-20">
                <Text className="text-[#8a9a94] text-lg">
                  No usage records found. Add your first entry!
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleGoToAnalysis}
              className="bg-[#0fd56b] rounded-full py-4 items-center mt-6"
            >
              <Text className="text-black font-bold text-lg">Back to analysis</Text>
            </TouchableOpacity>
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  )
}

export default EnergyUse
