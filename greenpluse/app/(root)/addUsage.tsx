import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
} from 'react-native'
import React, { useState } from 'react'
import { Camera, Calendar } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import DateTimePicker from '@react-native-community/datetimepicker'

import logoicon from '../../assets/images/GreenPluseLogo.png'
import camImage from '../../assets/images/camerascanner2.png'
import { db } from '../../config/firebaseConfig'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useAuth } from '../../contexts/AuthContext'

export const options = {
  headerShown: false,
}

const AddUsage = () => {
  const router = useRouter()
  const { user } = useAuth()

  const [selectedPeriod, setSelectedPeriod] = useState<'Weekly' | 'Monthly' | 'Yearly'>('Monthly')
  const [kwhValue, setKwhValue] = useState('')
  const [device, setDevice] = useState('')
  const [dateTime, setDateTime] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)

  const handleSaveUsage = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to save a usage record.')
      return
    }

    if (!kwhValue.trim() || Number.isNaN(parseFloat(kwhValue))) {
      Alert.alert('Error', 'Please enter a valid number for kWh value.')
      return
    }

    if (!device.trim()) {
      Alert.alert('Error', 'Please enter a device name.')
      return
    }

    try {
      const numericKwhValue = parseFloat(kwhValue)
      const recordedAtString = dateTime.toLocaleString()

      const recordsCollection = collection(db, 'users', user.uid, 'usageRecords')
      await addDoc(recordsCollection, {
        userId: user.uid,
        kwhValue: numericKwhValue,
        period: selectedPeriod,
        recordedAt: dateTime,
        recordedAtString,
        device,
        timestamp: serverTimestamp(),
      })

      Alert.alert('Success', 'Usage record saved!', [
        {
          text: 'OK',
          onPress: () => {
            setKwhValue('')
            setDevice('')
            setDateTime(new Date())
            setSelectedPeriod('Monthly')
            router.push('/(root)/energyUse')
          },
        },
      ])
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error)
      console.error('Error saving usage record:', error)
      Alert.alert('Error', `Failed to save usage record: ${errMsg}`)
    }
  }

  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios')
    if (selectedDate) {
      setDateTime(selectedDate)
    }
  }

  const showDateTimePicker = () => {
    setShowDatePicker(true)
  }

  const handleUseScanner = () => {
    Alert.alert('Scanner', 'OCR Scanner will be implemented')
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0a1410]">
      <StatusBar barStyle="light-content" backgroundColor="#0a1410" />
      <ScrollView className="flex-1 px-5 pt-8">
        <View className="flex-row items-center justify-center">
          <Text className="text-white text-3xl font-bold mb-8">Add Usage</Text>
          <Image source={logoicon} className="w-32 h-32 mb-4" />
        </View>

        <View className="bg-[#1a3830] rounded-3xl p-6 mb-6">
          <View className="flex-row items-end">
            <View>
              <Text className="text-white text-2xl font-bold mb-4 leading-tight">
                Capture your
                {'\n'}latest usage
                {'\n'}with OCR
              </Text>
              <TouchableOpacity
                onPress={handleUseScanner}
                className="bg-[#0fd56b] rounded-full px-6 py-3 flex-row items-center self-start"
              >
                <Camera size={20} color="#000" strokeWidth={2.5} />
                <Text className="text-black font-bold text-base ml-2">
                  Use Scanner
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex justify-center items-center h-50">
              <Image source={camImage} className="w-40 h-10 ml-6 mb-10" />
            </View>
          </View>
        </View>

        <View className="flex-row gap-3 mb-6">
          {(['Weekly', 'Monthly', 'Yearly'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              onPress={() => setSelectedPeriod(period)}
              className={`px-6 py-3 rounded-full ${
                selectedPeriod === period
                  ? 'bg-[#0fd56b]'
                  : 'bg-transparent border-2 border-[#2a4a42]'
              }`}
            >
              <Text
                className={`font-semibold ${
                  selectedPeriod === period ? 'text-black' : 'text-white'
                }`}
              >
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="mb-6">
          <Text className="text-white text-base font-semibold mb-3">Enter Usage (kWh)</Text>
          <TextInput
            value={kwhValue}
            onChangeText={setKwhValue}
            placeholder="Enter consumption value"
            placeholderTextColor="#4a5a54"
            keyboardType="numeric"
            className="bg-[#0a1410] border-2 border-[#0fd56b] rounded-3xl px-5 py-4 text-white text-base"
          />
        </View>

        <View className="mb-6">
          <Text className="text-white text-base font-semibold mb-3">Date & Time</Text>
          <TouchableOpacity
            onPress={showDateTimePicker}
            className="bg-[#0a1410] border-2 border-[#0fd56b] rounded-3xl px-5 py-4 flex-row items-center justify-between"
          >
            <Text className="text-white text-base">{dateTime.toLocaleString()}</Text>
            <Calendar size={20} color="#0fd56b" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={dateTime}
            mode="datetime"
            is24Hour={false}
            display="default"
            onChange={handleDateChange}
          />
        )}

        <View className="mb-6">
          <Text className="text-white text-base font-semibold mb-3">Device</Text>
          <TextInput
            value={device}
            onChangeText={setDevice}
            placeholder="e.g. Air Conditioner"
            placeholderTextColor="#4a5a54"
            className="bg-[#0a1410] border-2 border-[#0fd56b] rounded-3xl px-5 py-4 text-white text-base"
          />
        </View>

        <TouchableOpacity
          onPress={handleSaveUsage}
          className="bg-[#0fd56b] rounded-full py-4 mb-8 items-center"
        >
          <Text className="text-black font-bold text-lg">Save Usage</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

export default AddUsage
