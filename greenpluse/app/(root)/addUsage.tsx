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
  Modal,
} from 'react-native'
import React, { useState } from 'react'
import { Camera, Calendar } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import DateTimePicker from '@react-native-community/datetimepicker'

// --- OCR Imports ---
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";

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

  // --- OCR State ---
  const [ocrResult, setOcrResult] = useState<{amount?: number}>({})
  const [showOcrResult, setShowOcrResult] = useState(false)
  const [isOcrLoading, setIsOcrLoading] = useState(false)

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
    Alert.alert(
      'Select Source',
      'Choose how to scan your document',
      [
        { text: 'Camera', onPress: handleOpenCamera },
        { text: 'Photo Library', onPress: handlePickDocument },
        { text: 'Cancel', style: 'cancel' },
      ]
    )
  }

  // --- OCR Functions ---
  const parseOcrText = (text: string) => {
    // Extract the first number found in the text (for kWh values)
    const numberMatch = text.match(/(\d+(?:\.\d+)?)/);
    const amount = numberMatch ? parseFloat(numberMatch[1]) : undefined;

    // Console logging for debugging
    console.log('OCR Raw Text:', text);
    console.log('OCR Extracted Amount:', amount);

    return { amount };
  }

  const runOcrOnBase64 = async (base64: string) => {
    setIsOcrLoading(true)
    try {
      const formData = new FormData()
      formData.append('base64Image', `data:image/jpeg;base64,${base64}`)
      formData.append('language', 'eng')
      formData.append('isCreateSearchablePdf', 'false')
      formData.append('isSearchablePdfHideTextLayer', 'true')

      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        headers: {
          'apikey': 'helloworld', // Replace with your actual API key
        },
        body: formData,
      })

      const data = await response.json()
      if (data.IsErroredOnProcessing) {
        throw new Error(data.ErrorMessage?.[0] || 'OCR processing failed')
      }

      const extractedText = data.ParsedResults?.[0]?.ParsedText || ''
      const parsedData = parseOcrText(extractedText)
      setOcrResult(parsedData)

      // Additional logging for the final result
      console.log('OCR Final Result:', parsedData);
      console.log('Will auto-fill kWh field with amount:', parsedData.amount);

      setShowOcrResult(true)
    } catch (error) {
      console.error('OCR Error:', error)
      setOcrResult({ amount: undefined })
      Alert.alert('OCR Error', 'Failed to process the image. Please try again.')
    } finally {
      setIsOcrLoading(false)
    }
  }

  const handleOpenCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (permission.granted) {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      })

      if (!result.canceled && result.assets[0].base64) {
        await runOcrOnBase64(result.assets[0].base64)
      }
    } else {
      Alert.alert('Permission Denied', 'Camera permission is required to scan documents.')
    }
  }

  const handlePickDocument = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (permission.granted) {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      })

      if (!result.canceled && result.assets[0].base64) {
        await runOcrOnBase64(result.assets[0].base64)
      }
    } else {
      Alert.alert('Permission Denied', 'Media library permission is required to pick documents.')
    }
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

      {/* OCR Result Modal */}
      {showOcrResult && (
        <View className="absolute inset-0 bg-black bg-opacity-50 justify-center items-center">
          <View className="bg-[#1a3830] rounded-3xl p-6 mx-5 w-full max-w-sm">
            <Text className="text-white text-xl font-bold mb-4 text-center">OCR Results</Text>
            
            <View className="mb-4">
              {ocrResult.amount !== undefined ? (
                <Text className="text-white text-base mb-2">
                  Detected Value: <Text className="text-[#0fd56b] font-bold">{ocrResult.amount} kWh</Text>
                </Text>
              ) : (
                <Text className="text-white text-base mb-2">
                  No number detected. Please try again with a clearer image.
                </Text>
              )}
            </View>

            <View className="flex-row gap-3 mt-6">
              <TouchableOpacity
                onPress={() => setShowOcrResult(false)}
                className="flex-1 bg-gray-600 rounded-full py-3 items-center"
              >
                <Text className="text-white font-bold">Cancel</Text>
              </TouchableOpacity>
              
              {ocrResult.amount !== undefined && (
                <TouchableOpacity
                  onPress={() => {
                    setKwhValue(ocrResult.amount!.toString());
                    console.log('Applied OCR value to kWh field:', ocrResult.amount);
                    setShowOcrResult(false);
                  }}
                  className="flex-1 bg-[#0fd56b] rounded-full py-3 items-center"
                >
                  <Text className="text-black font-bold">Apply</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}

      {/* Loading Modal */}
      {isOcrLoading && (
        <View className="absolute inset-0 bg-black bg-opacity-50 justify-center items-center">
          <View className="bg-[#1a3830] rounded-3xl p-6 mx-5">
            <Text className="text-white text-lg font-bold mb-4 text-center">Processing Image...</Text>
            <Text className="text-white text-center">Please wait while we extract text from your document.</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

export default AddUsage
