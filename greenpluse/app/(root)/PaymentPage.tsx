import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CreditCard, DollarSign } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { db, auth } from '@/config/firebaseConfig';
import { doc, updateDoc, increment, serverTimestamp, collection, addDoc, getDoc } from 'firebase/firestore';

const PaymentPage = () => {
  const router = useRouter();
  const { projectId, projectTitle, currentAmount, goalAmount } = useLocalSearchParams();
  
  const [donationAmount, setDonationAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);

  const quickAmounts = [1000, 5000, 10000, 25000];

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const handleCardNumberChange = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    if (cleaned.length <= 16 && /^\d*$/.test(cleaned)) {
      setCardNumber(formatCardNumber(cleaned));
    }
  };

  const handleExpiryChange = (text: string) => {
    const cleaned = text.replace(/\//g, '');
    if (cleaned.length <= 4 && /^\d*$/.test(cleaned)) {
      if (cleaned.length >= 2) {
        setExpiryDate(cleaned.slice(0, 2) + '/' + cleaned.slice(2));
      } else {
        setExpiryDate(cleaned);
      }
    }
  };

  const handleCvvChange = (text: string) => {
    if (text.length <= 3 && /^\d*$/.test(text)) {
      setCvv(text);
    }
  };

  const validateInputs = () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid donation amount');
      return false;
    }
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      Alert.alert('Error', 'Please enter a valid 16-digit card number');
      return false;
    }
    if (!cardName.trim()) {
      Alert.alert('Error', 'Please enter cardholder name');
      return false;
    }
    if (expiryDate.length !== 5) {
      Alert.alert('Error', 'Please enter valid expiry date (MM/YY)');
      return false;
    }
    if (cvv.length !== 3) {
      Alert.alert('Error', 'Please enter valid CVV');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'You must be logged in to make a donation');
        setLoading(false);
        return;
      }

      const amount = parseFloat(donationAmount);
      
      // Update project funding in Firebase
      const projectRef = doc(db, 'projectRequests', projectId as string);
      
      // First, get current project data to check funding goal
      const projectSnap = await getDoc(projectRef);
      const projectData = projectSnap.data();
      const fundingGoal = projectData?.fundingGoal || parseFloat(goalAmount as string) || 0;
      const currentFunding = projectData?.currentFunding || parseFloat(currentAmount as string) || 0;
      const newTotalFunding = currentFunding + amount;
      
      // Prepare update object
      const updateData: any = {
        currentFunding: increment(amount),
        actualAmount: increment(amount),
        updatedAt: serverTimestamp()
      };
      
      // Check if funding goal is reached or exceeded
      if (newTotalFunding >= fundingGoal && projectData?.status !== 'Funded') {
        updateData.status = 'Funded';
        console.log('🎉 Project fully funded! Status changed to Funded');
      }
      
      await updateDoc(projectRef, updateData);

      // Save donation record for this user
      await addDoc(collection(db, 'donations'), {
        userId: user.uid,
        userEmail: user.email,
        projectId: projectId,
        projectTitle: projectTitle,
        amount: amount,
        donatedAt: serverTimestamp(),
        cardLastFour: cardNumber.slice(-4),
        status: 'completed'
      });

      // Show success message
      Alert.alert(
        'Payment Successful! 🎉',
        `Thank you for donating LKR ${amount.toLocaleString()} to ${projectTitle}`,
        [
          {
            text: 'OK',
            onPress: () => {
              router.back();
              router.back(); // Go back to project list
            }
          }
        ]
      );
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#122119' }}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        
        paddingBottom: 16,
        backgroundColor: '#122119'
      }}>
        <TouchableOpacity 
          style={{ marginRight: 16 }}
          onPress={() => router.back()}
        >
          <ArrowLeft size={28} color="white" />
        </TouchableOpacity>
        <Text style={{ 
          color: 'white', 
          fontSize: 24, 
          fontWeight: '700', 
          flex: 1 
        }}>
          Make a Donation
        </Text>
      </View>

      <View style={{ paddingHorizontal: 20 }}>
          {/* Project Info */}
          <View style={{
            backgroundColor: '#2a3e3e',
            borderRadius: 16,
            padding: 20,
            marginBottom: 24
          }}>
            <Text style={{ color: '#1AE57D', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
              Donating to
            </Text>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
              {projectTitle}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>Current</Text>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                  LKR {parseFloat(currentAmount as string || '0').toLocaleString()}
                </Text>
              </View>
              <View>
                <Text style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>Goal</Text>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                  LKR {parseFloat(goalAmount as string || '0').toLocaleString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Donation Amount */}
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
            Donation Amount
          </Text>
          
          {/* Quick Amount Buttons */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            {quickAmounts.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={{
                  backgroundColor: donationAmount === amount.toString() ? '#1AE57D' : '#2a3e3e',
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: donationAmount === amount.toString() ? '#1AE57D' : 'transparent'
                }}
                onPress={() => setDonationAmount(amount.toString())}
              >
                <Text style={{
                  color: donationAmount === amount.toString() ? 'black' : 'white',
                  fontSize: 16,
                  fontWeight: '600'
                }}>
                  LKR {amount.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Amount Input */}
          <View style={{
            backgroundColor: '#2a3e3e',
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            marginBottom: 32
          }}>
            <DollarSign size={20} color="#1AE57D" />
            <TextInput
              style={{
                flex: 1,
                color: 'white',
                fontSize: 18,
                fontWeight: '600',
                paddingVertical: 16,
                paddingHorizontal: 12
              }}
              placeholder="Enter custom amount"
              placeholderTextColor="#6b7280"
              keyboardType="numeric"
              value={donationAmount}
              onChangeText={setDonationAmount}
            />
          </View>

          {/* Payment Details */}
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', marginBottom: 16 }}>
            Payment Details
          </Text>

          {/* Card Number */}
          <Text style={{ color: '#9ca3af', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
            Card Number
          </Text>
          <View style={{
            backgroundColor: '#2a3e3e',
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            marginBottom: 16
          }}>
            <CreditCard size={20} color="#1AE57D" />
            <TextInput
              style={{
                flex: 1,
                color: 'white',
                fontSize: 16,
                paddingVertical: 16,
                paddingHorizontal: 12
              }}
              placeholder="1234 5678 9012 3456"
              placeholderTextColor="#6b7280"
              keyboardType="numeric"
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              maxLength={19}
            />
          </View>

          {/* Cardholder Name */}
          <Text style={{ color: '#9ca3af', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
            Cardholder Name
          </Text>
          <TextInput
            style={{
              backgroundColor: '#2a3e3e',
              color: 'white',
              fontSize: 16,
              paddingVertical: 16,
              paddingHorizontal: 16,
              borderRadius: 12,
              marginBottom: 16
            }}
            placeholder="John Doe"
            placeholderTextColor="#6b7280"
            value={cardName}
            onChangeText={setCardName}
          />

          {/* Expiry and CVV */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#9ca3af', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                Expiry Date
              </Text>
              <TextInput
                style={{
                  backgroundColor: '#2a3e3e',
                  color: 'white',
                  fontSize: 16,
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  borderRadius: 12
                }}
                placeholder="MM/YY"
                placeholderTextColor="#6b7280"
                keyboardType="numeric"
                value={expiryDate}
                onChangeText={handleExpiryChange}
                maxLength={5}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#9ca3af', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                CVV
              </Text>
              <TextInput
                style={{
                  backgroundColor: '#2a3e3e',
                  color: 'white',
                  fontSize: 16,
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  borderRadius: 12
                }}
                placeholder="123"
                placeholderTextColor="#6b7280"
                keyboardType="numeric"
                secureTextEntry
                value={cvv}
                onChangeText={handleCvvChange}
                maxLength={3}
              />
            </View>
          </View>

          {/* Pay Button */}
          <TouchableOpacity
            style={{
              backgroundColor: loading ? '#6b7280' : '#1AE57D',
              paddingVertical: 18,
              borderRadius: 16,
              alignItems: 'center',
              elevation: 4,
              shadowColor: '#1AE57D',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8
            }}
            onPress={handlePayment}
            disabled={loading}
            activeOpacity={0.9}
          >
            <Text style={{
              color: 'black',
              fontSize: 18,
              fontWeight: '700'
            }}>
              {loading ? 'Processing...' : `Donate LKR ${donationAmount || '0'}`}
            </Text>
          </TouchableOpacity>

          {/* Security Note */}
          <Text style={{
            color: '#6b7280',
            fontSize: 12,
            textAlign: 'center',
            marginTop: 16,
            lineHeight: 18
          }}>
            🔒 Your payment information is secure and encrypted
          </Text>
      </View>
    </ScrollView>
  );
};

export default PaymentPage;
