import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  StatusBar,
  TextInput,
  Share 
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
// Using legacy API to avoid deprecation warnings
import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import * as Sharing from 'expo-sharing';
import { Linking, ImageBackground, Platform } from 'react-native';
import * as Print from 'expo-print';
// Firebase
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';


  interface BillData {
    currentBill: number;
    creditAvailable: number;
    creditConversionRate: number;
}

// Add this type definition near your other interfaces
type BillParams = {
  accountNumber: string;
  accountNickname: string;
  serviceAddress: string;
  provider: string;
  credits: string;
  creditValue: string;
};

const BillPayment = () => {
  const { user } = useAuth();
  const params = useLocalSearchParams<BillParams>();
 

  
  const [credits, setCredits] = useState(params.credits ? parseInt(params.credits, 10) : 15);
  const [creditsToUse, setCreditsToUse] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCreditError, setShowCreditError] = useState(false);
  const [showLearnMore, setShowLearnMore] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showOcrResult, setShowOcrResult] = useState(false);
  const [ocrResult, setOcrResult] = useState<{accountNo?: string, amount?: number, meterReading?: string}>({});

  // Helper to normalize account numbers for comparison
  const normalizeAccount = (v?: string) => (v || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  // Only validate when OCR has extracted an account number
  const showAccountMismatch = !!(
    ocrResult.accountNo && params.accountNumber &&
    normalizeAccount(ocrResult.accountNo) !== normalizeAccount(String(params.accountNumber))
  );

  const ReceiptModal = () => {
    const remainingAmount = billData.currentBill - amountToPay;
    const transactionId = Math.random().toString(36).substring(2, 10).toUpperCase();
    const receiptDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const handleShareReceipt = async () => {
      try {
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GreenPulse Receipt ${transactionId}</title>
  <style>
    body{font-family: Arial, sans-serif; background:#0e1713; color:#fff; padding:20px}
    .card{background:#1a1a1a; border-radius:16px; padding:20px; max-width:420px; margin:0 auto}
    .title{font-size:22px; font-weight:700; margin:0 0 6px}
    .date{color:#cbd5e1; font-size:12px; margin-bottom:14px}
    .row{display:flex; justify-content:space-between; margin:8px 0}
    .muted{color:#9ca3af}
    .accent{color:#00ff88}
    .divider{height:1px; background:#333; margin:12px 0}
    .total{font-size:18px; font-weight:700}
    .badge{background:#1a3a2a; color:#00ff88; padding:2px 6px; border-radius:8px; font-size:11px}
    .footer{color:#86efac; text-align:center; font-size:12px; margin-top:10px}
  </style>
  </head>
  <body>
    <div class="card">
      <div class="title">Payment Receipt</div>
      <div class="date">${receiptDate}</div>
      <div class="row"><div class="muted">Transaction ID</div><div>${transactionId}</div></div>
      <div class="divider"></div>
      <div class="row"><div class="muted">Account</div><div>${params.accountNickname || 'N/A'}</div></div>
      <div class="row"><div class="muted">Account No</div><div>${params.accountNumber || ''}</div></div>
      <div class="row"><div class="muted">Provider</div><div>${params.provider || ''}</div></div>
      <div class="divider"></div>
      <div class="row"><div class="muted">Bill Amount</div><div>Rs.${billData.currentBill.toFixed(2)}</div></div>
      <div class="row"><div class="muted">Credits Used</div><div class="accent">-${creditsToUse} (Rs.${amountToPay.toFixed(2)})</div></div>
      <div class="row"><div class="muted">Remaining Amount</div><div>Rs.${remainingAmount.toFixed(2)}</div></div>
      <div class="divider"></div>
      <div class="row"><div class="total">Total Paid</div><div class="total">Rs.${amountToPay.toFixed(2)}</div></div>
      <div class="row" style="margin-top:10px"><div class="muted">Payment Status</div><div class="badge">Completed</div></div>
      <div class="footer">Thank you for using GreenPulse!</div>
    </div>
  </body>
</html>`;

        // Generate PDF and ensure .pdf extension
        const pdfFileName = `GreenPulse_Receipt_${transactionId}.pdf`;
        const { uri: pdfUri } = await Print.printToFileAsync({ html });
        const finalPdfUri = `${FileSystem.cacheDirectory}${pdfFileName}`;
        try {
          await FileSystem.copyAsync({ from: pdfUri, to: finalPdfUri });
        } catch {}

        const shareUri = (await FileSystem.getInfoAsync(finalPdfUri)).exists ? finalPdfUri : pdfUri;

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(shareUri, {
            mimeType: 'application/pdf',
            UTI: 'com.adobe.pdf',
            dialogTitle: 'Share Receipt PDF',
          });
        } else {
          Alert.alert('Share Unavailable', 'Sharing is not available on this device.');
        }
      } catch (error) {
        console.error('Error sharing receipt:', error);
        Alert.alert('Share Failed', 'Could not share the receipt. Please try again.');
      }
    };

    const handleDownloadReceipt = async () => {
      try {
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GreenPulse Receipt ${transactionId}</title>
  <style>
    body{font-family: Arial, sans-serif; background:#0e1713; color:#fff; padding:20px}
    .card{background:#1a1a1a; border-radius:16px; padding:20px; max-width:420px; margin:0 auto}
    .title{font-size:22px; font-weight:700; margin:0 0 6px}
    .date{color:#cbd5e1; font-size:12px; margin-bottom:14px}
    .row{display:flex; justify-content:space-between; margin:8px 0}
    .muted{color:#9ca3af}
    .accent{color:#00ff88}
    .divider{height:1px; background:#333; margin:12px 0}
    .total{font-size:18px; font-weight:700}
    .badge{background:#1a3a2a; color:#00ff88; padding:2px 6px; border-radius:8px; font-size:11px}
    .footer{color:#86efac; text-align:center; font-size:12px; margin-top:10px}
  </style>
  </head>
  <body>
    <div class="card">
      <div class="title">Payment Receipt</div>
      <div class="date">${receiptDate}</div>
      <div class="row"><div class="muted">Transaction ID</div><div>${transactionId}</div></div>
      <div class="divider"></div>
      <div class="row"><div class="muted">Account</div><div>${params.accountNickname || 'N/A'}</div></div>
      <div class="row"><div class="muted">Account No</div><div>${params.accountNumber || ''}</div></div>
      <div class="row"><div class="muted">Provider</div><div>${params.provider || ''}</div></div>
      <div class="divider"></div>
      <div class="row"><div class="muted">Bill Amount</div><div>Rs.${billData.currentBill.toFixed(2)}</div></div>
      <div class="row"><div class="muted">Credits Used</div><div class="accent">-${creditsToUse} (Rs.${amountToPay.toFixed(2)})</div></div>
      <div class="row"><div class="muted">Remaining Amount</div><div>Rs.${(billData.currentBill - amountToPay).toFixed(2)}</div></div>
      <div class="divider"></div>
      <div class="row"><div class="total">Total Paid</div><div class="total">Rs.${amountToPay.toFixed(2)}</div></div>
      <div class="row" style="margin-top:10px"><div class="muted">Payment Status</div><div class="badge">Completed</div></div>
      <div class="footer">Thank you for using GreenPulse!</div>
    </div>
  </body>
</html>`;

        // Generate PDF from HTML
        const pdfFileName = `GreenPulse_Receipt_${transactionId}.pdf`;
        const { uri: pdfUri } = await Print.printToFileAsync({ html });
        // Ensure the file has a .pdf extension for correct mime handling on share dialogs
        const finalPdfUri = `${FileSystem.cacheDirectory}${pdfFileName}`;
        try {
          // Overwrite if exists
          await FileSystem.copyAsync({ from: pdfUri, to: finalPdfUri });
        } catch (copyErr) {
          // If copy fails, fall back to original uri
          console.warn('Copy to .pdf path failed, using original PDF uri', copyErr);
        }

        if (Platform.OS === 'android') {
          try {
            const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
            if (permissions.granted && permissions.directoryUri) {
              const destUri = await FileSystem.StorageAccessFramework.createFileAsync(
                permissions.directoryUri,
                pdfFileName,
                'application/pdf'
              );
              // Read the PDF (with .pdf extension path if available) as base64 and write via SAF
              const sourceUri = (await FileSystem.getInfoAsync(finalPdfUri)).exists ? finalPdfUri : pdfUri;
              const pdfBase64 = await FileSystem.readAsStringAsync(sourceUri, { encoding: FileSystem.EncodingType.Base64 });
              await FileSystem.StorageAccessFramework.writeAsStringAsync(destUri, pdfBase64, { encoding: FileSystem.EncodingType.Base64 });
              Alert.alert('Receipt Downloaded', 'PDF saved to selected folder.', [{ text: 'OK' }]);
            } else {
              // Fallback to share dialog if user cancelled
              if (await Sharing.isAvailableAsync()) {
                const shareUri = (await FileSystem.getInfoAsync(finalPdfUri)).exists ? finalPdfUri : pdfUri;
                await Sharing.shareAsync(shareUri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: 'Save or Share Receipt' });
              }
            }
          } catch (e) {
            // On any SAF error, fallback to share
            if (await Sharing.isAvailableAsync()) {
              const shareUri = (await FileSystem.getInfoAsync(finalPdfUri)).exists ? finalPdfUri : pdfUri;
              await Sharing.shareAsync(shareUri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: 'Save or Share Receipt' });
            }
          }
        } else {
          if (await Sharing.isAvailableAsync()) {
            const shareUri = (await FileSystem.getInfoAsync(finalPdfUri)).exists ? finalPdfUri : pdfUri;
            await Sharing.shareAsync(shareUri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: 'Save or Share Receipt' });
          } else {
            const savedUri = (await FileSystem.getInfoAsync(finalPdfUri)).exists ? finalPdfUri : pdfUri;
            Alert.alert('Receipt Ready', `PDF saved at: ${savedUri}`);
          }
        }
      } catch (error) {
        console.error('Error downloading receipt:', error);
        Alert.alert('Download Failed', 'Could not save the receipt. Please try again.');
      }
    };

    return (
      <Modal
        visible={showReceipt}
        transparent={true}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowReceipt(false)}
      >
        <View className="flex-1 bg-[#122119] opacity-90 justify-center items-center p-5">
          <View className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-sm">
            <ScrollView className="max-h-[80vh]">
              <View className="items-center mb-6">
                <View className="bg-[#00ff88] rounded-full p-3 mb-4">
                  <Ionicons name="receipt" size={40} color="#122119" />
                </View>
                <Text className="text-white text-2xl font-bold mb-2">Payment Receipt</Text>
                <Text className="text-gray-300 text-sm mb-4">
                  {receiptDate}
                </Text>
                
                <View className="w-full bg-[#2a2a2a] rounded-xl p-4 mb-4">
                  <View className="flex-row justify-between mb-3">
                    <Text className="text-gray-400">Transaction ID</Text>
                    <Text className="text-white">{transactionId}</Text>
                  </View>
                  <View className="h-px bg-[#3a3a3a] my-2" />
                  
                  <View className="mb-2">
                    <Text className="text-gray-400 text-sm mb-1">Account Details</Text>
                    <Text className="text-white">{params.accountNickname || 'N/A'}</Text>
                    <Text className="text-gray-300 text-xs">{params.accountNumber || ''}</Text>
                    <Text className="text-gray-300 text-xs">{params.provider || ''}</Text>
                  </View>
                  
                  <View className="h-px bg-[#3a3a3a] my-3" />
                  
                  <View className="space-y-2">
                    <View className="flex-row justify-between">
                      <Text className="text-gray-400">Bill Amount</Text>
                      <Text className="text-white">Rs.{billData.currentBill.toFixed(2)}</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-gray-400">Credits Used</Text>
                      <Text className="text-[#00ff88]">-{creditsToUse} (Rs.{amountToPay.toFixed(2)})</Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-gray-400">Remaining Amount</Text>
                      <Text className="text-white">Rs.{remainingAmount.toFixed(2)}</Text>
                    </View>
                    
                    <View className="h-px bg-[#3a3a3a] my-2" />
                    
                    <View className="flex-row justify-between items-center">
                      <Text className="text-white text-lg font-bold">Total Paid</Text>
                      <Text className="text-white text-xl font-bold">
                        Rs.{amountToPay.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="flex-row justify-between mt-4">
                    <Text className="text-gray-400">Payment Status</Text>
                    <View className="bg-[#1a3a2a] px-2 py-1 rounded">
                      <Text className="text-[#00ff88] text-xs">Completed</Text>
                    </View>
                  </View>
                </View>
                
                <View className="flex-row justify-between w-full gap-5 mb-4">
                  <TouchableOpacity
                    className="flex-1 bg-[#2a2a2a] p-3 rounded-lg items-center flex-row justify-center space-x-2"
                    onPress={handleDownloadReceipt}
                  >
                    <Ionicons name="download-outline" size={20} color="#00ff88" />
                    <Text className="text-white">Download</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-[#00ff88] p-3 rounded-lg items-center flex-row justify-center space-x-2"
                    onPress={handleShareReceipt}
                  >
                    <Ionicons name="share-social-outline" size={20} color="#000" />
                    <Text className="text-black font-semibold">Share</Text>
                  </TouchableOpacity>
                </View>
                
                <Text className="text-green-400 text-center text-sm mb-2">
                  Thank you for using GreenPulse! Your payment was successful.
                </Text>
                <Text className="text-gray-400 text-center text-xs">
                  Transaction ID: {transactionId}
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              className="bg-[#333] py-3 rounded-xl items-center mt-2"
              onPress={() => setShowReceipt(false)}
            >
              <Text className="text-white font-semibold">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const [billData, setBillData] = useState<BillData>({
    currentBill: 0,
    creditAvailable: params.credits ? parseFloat(params.credits) * 23.38 : 1100.0,
    creditConversionRate: 91,
  });

  // Controlled input for Current Bill (user-entered)
  const [currentBillInput, setCurrentBillInput] = useState<string>("");
  const [isOcrLoading, setIsOcrLoading] = useState(false);

  // OCR helpers
  const parseOcrText = (text: string) => {
    // Try multiple patterns commonly found on bills/SMS
    const accountMatch = text.match(/(?:A\/C\s*No\.?\s*[:#-]?\s*|Account\s*(?:No|Number)\s*[:#-]?\s*)([A-Za-z0-9\-\/]+)/i) || text.match(/AC\s*No\.?\s*[:#-]?\s*([A-Za-z0-9\-\/]+)/i) || text.match(/Account\s*(?:No|Number)\s*[:#-]?\s*([A-Za-z0-9\-\/]+)/i);
    const amountMatch = text.match(/(?:Total\s*Due|Amount\s*Due|Bill\s*Amount|Current\s*Bill)\s*[:#-]?\s*Rs?\.?\s*([0-9,.]+)/i) || text.match(/Rs\.?\s*([0-9,.]+)/i);
    
    // Find all numbers that look like meter readings (4-6 digits)
    const meterReadings = text.match(/\b\d{4,6}\b/g) || [];
    const numericReadings = meterReadings.map(Number);
    
    // Sort in descending order to get the two highest readings
    const [currentReading, previousReading] = [...numericReadings].sort((a, b) => b - a).slice(0, 2);
    
    // Calculate monthly usage if we have both current and previous readings
    let meterReading: string | undefined;
    if (currentReading && previousReading && currentReading > previousReading) {
      const usage = currentReading - previousReading;
      meterReading = `${usage} (${previousReading} → ${currentReading})`;
    } else if (currentReading) {
      meterReading = currentReading.toString();
    }

    const accountNo = accountMatch ? accountMatch[1].trim() : undefined;
    const amountStr = amountMatch ? amountMatch[1].replace(/,/g, "").trim() : undefined;
    const amount = amountStr ? parseFloat(amountStr) : undefined;

    return { accountNo, amount, meterReading };
  };

  const runOcrOnBase64 = async (mime: string, base64: string) => {
    try {
      setIsOcrLoading(true);
      // Helper to send OCR request with a specific engine
      const sendOcr = async (engine: 1 | 2) => {
        const form = new FormData();
        // Demo key; replace with secure key for production
        form.append("apikey", "helloworld");
        form.append("base64Image", `data:${mime || "image/jpeg"};base64,${base64}`);
        // Tables are not necessary for simple bill detection; enabling may hurt accuracy
        form.append("isTable", "false");
        form.append("OCREngine", String(engine));
        form.append("language", "eng");
        const res = await fetch("https://api.ocr.space/parse/image", {
          method: "POST",
          body: form,
        });
        return res.json();
      };

      // Try with engine 2 first, then fallback to engine 1
      let json = await sendOcr(2);
      let parsedText = json?.ParsedResults?.[0]?.ParsedText as string | undefined;

      if (!parsedText || !parsedText.trim()) {
        // Retry with a different engine
        const retryJson = await sendOcr(1);
        const retryText = retryJson?.ParsedResults?.[0]?.ParsedText as string | undefined;
        if (retryText && retryText.trim()) {
          json = retryJson;
          parsedText = retryText;
        }
      }

      if (!parsedText || !parsedText.trim()) {
        const apiMsg = (json?.ErrorMessage && (Array.isArray(json.ErrorMessage) ? json.ErrorMessage.join("; ") : String(json.ErrorMessage)))
          || json?.ErrorDetails
          || (typeof json?.OCRExitCode !== 'undefined' ? `ExitCode: ${json.OCRExitCode}` : undefined);
        throw new Error(apiMsg || "OCR failed to extract text");
      }

      const result = parseOcrText(parsedText);
      setOcrResult(result);

      if (result.amount !== undefined) {
        setCurrentBillInput(result.amount.toString());
        setBillData((prev) => ({ ...prev, currentBill: result.amount as number }));
      }
      
      setShowOcrResult(true);
    } catch (e: any) {
      setOcrResult({
        accountNo: undefined,
        amount: undefined,
        meterReading: undefined
      });
      setShowOcrResult(true);
    } finally {
      setIsOcrLoading(false);
    }
  };

  

  const handleOpenCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Camera Access Required",
          "To scan your bill, we need access to your camera. This helps us read the bill details accurately.",
          [
            { text: "Open Settings", onPress: () => Linking.openSettings() },
            { text: "Not Now", style: "cancel" }
          ]
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        // Reduce quality to shrink payload size for OCR API limits
        quality: 0.5,
        base64: true, // Get base64 directly from ImagePicker
      });
      
      if (result.canceled || !result.assets?.[0]) return;
      
      const asset = result.assets[0];
      // Ensure JPEG format and moderate size for better OCR reliability
      const manipulated = await ImageManipulator.manipulateAsync(
        asset.uri,
        [
          // Resize large images down to ~1600px width while keeping aspect ratio
          { resize: { width: 1600 } },
        ],
        {
          compress: 0.6,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      if (!manipulated.base64) {
        throw new Error('Failed to process captured image');
      }

      await runOcrOnBase64('image/jpeg', manipulated.base64);
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to capture or process the image');
    }
  };

  const handlePickDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        multiple: false,
        copyToCacheDirectory: true,
      });
      
      if (res.canceled || !res.assets?.[0]?.uri) return;
      
      const doc = res.assets[0];
      const mime = doc.mimeType || (doc.name?.endsWith(".pdf") ? "application/pdf" : "image/jpeg");
      
      // Read file content as base64 using the legacy API
      const base64 = await FileSystem.readAsStringAsync(doc.uri, { 
        encoding: 'base64'
      });
      
      await runOcrOnBase64(mime, base64);
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert(
        "Document Error",
        error instanceof Error && error.message 
          ? `Error: ${error.message}`
          : "We couldn't process the selected document. Please ensure it's a clear image or PDF of your bill.",
        [{ text: "OK", style: "default" }]
      );
    }
  };

  const creditAmount = 23.38;
  const maxCreditsUsable = Math.min(
    credits,
    Math.ceil(billData.currentBill / 100)
  );
  const amountToPay = creditsToUse * 23.38;
  const remainingAmount = billData.currentBill - amountToPay;
  const remainingCredits = credits - creditsToUse;

  const handleIncrement = useCallback(() => {
    if (creditsToUse < credits) {
      setCreditsToUse(creditsToUse + 1);
    }
  }, [creditsToUse, maxCreditsUsable]);

  const handleDecrement = useCallback(() => {
    if (creditsToUse > 0) {
      setCreditsToUse(creditsToUse - 1);
    }
  }, [creditsToUse]);

  const handleConfirmPayment = async () => {
    try {
      // Prepare bill data
      const billData = {
        accountNumber: params.accountNumber || ocrResult.accountNo || 'N/A',
        userEmail: user?.email || 'N/A',
        accountNickname: params.accountNickname || 'N/A',
        serviceAddress: params.serviceAddress || 'N/A',
        provider: params.provider || 'N/A',
        currentBill: parseFloat(currentBillInput) || 0,
        creditsUsed: creditsToUse,
        creditAmount: amountToPay,
        remainingAmount: remainingAmount,
        unitsUsed: ocrResult.meterReading?.split(' ')[0] || 'N/A',
        paymentDate: serverTimestamp(),
        status: 'completed',
        userId: user?.uid || 'anonymous',
        timestamp: new Date().toISOString()
      };

      // Add a new document with a generated id
      const docRef = await addDoc(collection(db, 'billPayments'), billData);
      console.log('Document written with ID: ', docRef.id);
      
      // Reset all form states
      setCurrentBillInput("");
      setCreditsToUse(0);
      setOcrResult({});
      setShowOcrResult(false);
      setCredits(remainingCredits);
      // Reset bill data to clear remaining amount
      setBillData(prev => ({
        ...prev,
        currentBill: 0
      }));
      // Show success message
      setShowPaymentConfirmation(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error adding document: ', error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    }
  };

  const handlePayNow = () => {
    if (creditsToUse === 0) {
      setShowCreditError(true);
      return;
    }
    // Show payment confirmation dialog
    setShowPaymentConfirmation(true);
  };

  const handleLearnMore = () => {
    setShowCreditError(false);
    setShowLearnMore(true);
  };

  const closeLearnMore = () => {
    setShowLearnMore(false);
  };

  const confirmPayment = async () => {
    setShowPaymentConfirmation(false);
    setIsLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsLoading(false);
      setCredits(remainingCredits);
      setCreditsToUse(0); // Reset credits to use to 0
      setShowSuccessModal(true);
    }, 2000);
  };

  return (
    <View className="flex-1 bg-[#122119]">
      <ScrollView>
        {/* Bill Summary Section */}
        <View className="mx-5 mt-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-lg font-semibold">
              Bill Summary
            </Text>
            <View className="flex-row items-center">
              <TouchableOpacity 
                onPress={handlePickDocument} 
                className="bg-[#2a4a3a] px-2 py-2 rounded-xl flex-row items-center mr-2 border border-[#00ff88]/30"
              >
                <Ionicons name="document-attach" size={18} color="#00ff88" />
                <Text className="text-[#00ff88] font-medium text-sm ml-2">Upload Bill</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleOpenCamera} 
                className="bg-[#00ff88] px-2 py-2 rounded-xl flex-row items-center"
              >
                <Ionicons name="camera" size={18} color="#000" />
                <Text className="text-black font-semibold text-sm ml-2">Scan Bill</Text>
              </TouchableOpacity>
            </View>
          </View>
          </View>
          {isOcrLoading && (
            <View className="mb-2 px-5">
              <View className="flex-row items-center py-2 px-4 bg-[#122119] rounded-lg w-auto self-start">
                <ActivityIndicator color="#00ff88" size="small" />
                <Text className="text-gray-300 ml-2">Reading bill…</Text>
              </View>
            </View>
          )}

          <View className="rounded-2xl overflow-hidden mx-5">
            {/* Background Image with Overlay */}
            <ImageBackground 
              source={require('@/assets/images/light_bill.jpg')} 
              className="w-full h-full absolute top-0 left-0"
              resizeMode="cover"
            >
              <View className="w-full h-full bg-black/70" />
            </ImageBackground>
            
            <View className="p-5 relative">
              {/* Watermark */}
              <View className="absolute right-0 top-0 opacity-10">
                <Text className="text-[#00ff88] text-6xl font-bold">CEB</Text>
              </View>

              <View className="absolute right-0 top-20 opacity-10">
                <Text className="text-[#00ff88] text-6xl font-bold">LECO</Text>
              </View>

              <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1">
                <Text className="text-white font-medium text-sm mb-1">Current Bill</Text>
                <View className="bg-[#2a3a3a]  rounded-xl px-5  flex-row items-center">
                  <Text className="text-white text-base mr-2">Rs.</Text>
                  <TextInput
                    className="text-white text-base flex-1"
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor="#9CA3AF"
                    value={currentBillInput}
                    onChangeText={(text) => {
                      setCurrentBillInput(text);
                      const parsed = parseFloat(text);
                      setBillData((prev) => ({
                        ...prev,
                        currentBill: isNaN(parsed) ? 0 : parsed,
                      }));
                    }}
                  />
                </View>
              </View>
            </View>

            {ocrResult.accountNo && (
              <View className="mb-4 opacity-65 ">
                <Text className="text-white font-medium text-sm mb-1">Account Number</Text>
                <View className="bg-[#2a3a3a]  rounded-xl px-5 py-3">
                  <Text className="text-white text-base">{ocrResult.accountNo}</Text>
                </View>
                {showAccountMismatch && (
                  <Text className="text-[#e71111] text-[12px] mt-1">
                    The scanned account number does not match the selected account.
                  </Text>
                )}
              </View>
            )}

            {ocrResult.meterReading && (
              <View className="mb-4 opacity-65">
                <Text className="text-white font-medium text-sm mb-1">Units Used</Text>
                <View className="bg-[#2a3a3a] rounded-xl px-5 py-3">
                  <Text className="text-white text-base">
                    {ocrResult.meterReading.includes('→') 
                      ? `${ocrResult.meterReading.split('(')[0].trim()} units`
                      : `${ocrResult.meterReading} units`}
                  </Text>
                </View>
              </View>
            )}

            <View>
              <Text className="text-white text-sm mb-1">Credit Available</Text>
              <Text className="text-[#00ff88] text-xl font-bold">
                Rs.{credits * creditAmount}
              </Text>
            </View>

            {/* Credit Conversion Rate */}
            <View className="pt-3 border-t border-[#4a6a5a]">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-white text-sm">
                  Credit Conversion rate
                </Text>
                <View className="bg-[#00ff88] px-3 py-1 rounded-full">
                  <Text className="text-black font-bold">
                    {(
                      (100 / billData.currentBill) *
                      credits *
                      creditAmount
                    ).toFixed(2)}
                    %
                  </Text>
                </View>
              </View>

              {/* Static Progress Bar kept as-is */}
              <View className="mt-2">
                <View className="bg-[#2a4a3a] h-2 rounded-full overflow-hidden">
                  <View
                    className={`h-full rounded-full ${(100 / billData.currentBill) * credits * creditAmount >= 100 ? "bg-[#00ff88]" : "bg-[#ff4d4d]"}`}
                    style={{
                      width: `${Math.min(100, (100 / billData.currentBill) * credits * creditAmount)}%`,
                    }}
                  />
                </View>
                <View className="flex-row justify-between mt-1">
                  <Text className="text-gray-400 text-xs">0%</Text>
                  <Text className="text-gray-400 text-xs">100%</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Section */}
        <View className="mx-5 mt-4 mb-8">
          <Text className="text-white text-lg font-semibold mb-4">Payment</Text>

          <View className="bg-[#1a3333] rounded-2xl p-5 border border-[#2a4444]">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-gray-400 text-sm mb-1">
                  Credits to Use
                </Text>
                <Text className="text-[#00ff88] text-2xl font-bold">
                  Rs.{amountToPay.toFixed(2)}
                </Text>
              </View>
              <View className="flex-row items-center bg-[#2a3a3a] rounded-full px-2 py-2">
                <TouchableOpacity
                  onPress={handleDecrement}
                  disabled={credits === 0}
                >
                  <Ionicons
                    name="remove-circle"
                    size={28}
                    color={creditsToUse === 0 ? "#4a5a5a" : "#fff"}
                  />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold mx-2 min-w-[40px] text-center">
                  {creditsToUse}
                </Text>
                <TouchableOpacity
                  onPress={handleIncrement}
                  disabled={creditsToUse >= credits}
                >
                  <Ionicons
                    name="add-circle"
                    size={28}
                    color={creditsToUse >= credits ? "#4a5a5a" : "#00ff88"}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Custom Slider Implementation */}
            <View className="mb-4 px-1 mt-[-5px]">
              <View className="relative h-12 flex justify-center">
                {/* Track Background */}
                <View className="absolute left-0 right-0 h-2 bg-[#374151] rounded-full" />

                {/* Progress Fill */}
                <View
                  className="absolute left-0 h-2 bg-[#00ff88] rounded-full"
                  style={{ width: `${(creditsToUse / credits) * 100}%` }}
                />

                {/* Slider Thumb */}
                <View
                  className="absolute"
                  style={{
                    left: `${(creditsToUse / credits) * 100}%`,
                    transform: [{ translateX: -12 }],
                  }}
                >
                  <View className="w-6 h-6 rounded-full bg-[#00ff88] border-2 border-white" />
                </View>

                {/* Hidden Slider for Touch Handling */}
                <Slider
                  minimumValue={0}
                  maximumValue={credits}
                  step={1}
                  value={creditsToUse}
                  onValueChange={setCreditsToUse}
                  minimumTrackTintColor="transparent"
                  maximumTrackTintColor="transparent"
                  thumbTintColor="transparent"
                  style={{
                    width: "100%",
                    height: 40,
                    opacity: 0.01,
                    position: "absolute",
                    top: -4,
                  }}
                />
              </View>
              <View className="flex-row justify-between px-1 mt-[-4px]">
                <Text className="text-gray-400 text-xs">0</Text>
                <Text className="text-gray-400 text-xs">
                  Max credits : {credits}
                </Text>
              </View>
            </View>

            {/* Remaining Amount */}
            <View className="flex-row items-center justify-between pt-4 border-t border-[#2a4444]">
              <Text className="text-white text-base font-medium">
                Remaining Amount
              </Text>
              <View className="items-end">
                <Text className="text-white text-xl font-bold">
                  Rs.{remainingAmount.toFixed(2)}
                </Text>
              </View>
            </View>

            {remainingAmount > 0 ? (
              <View className="mt-3 bg-[#4a3a1a] rounded-lg p-3 flex-row items-start">
                <Ionicons name="information-circle" size={18} color="#ffaa00" />
                <Text className="text-[#ffaa00] text-xs ml-2 flex-1">
                  You'll need to pay Rs.{remainingAmount.toFixed(2)} via other
                  payment methods
                </Text>
              </View>
            ) : (
              remainingAmount < 0 && (
                <View className="mt-3 bg-[#1a3a2a] rounded-lg p-3 flex-row items-start">
                  <Ionicons name="checkmark-circle" size={18} color="#00ff88" />
                  <Text className="text-[#00ff88] text-xs ml-2 flex-1">
                    You have a surplus of Rs.
                    {Math.abs(remainingAmount).toFixed(2)} that will be added to
                    your electricity bill
                  </Text>
                </View>
              )
            )}

            {/* Summary Info */}
            <View className="mt-4 bg-[#1a2a2a] rounded-xl p-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-400 text-sm">Current Credits</Text>
                <Text className="text-white font-semibold">{credits}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-400 text-sm">Credits Used</Text>
                <Text className="text-[#ff6666] font-semibold">
                  -{creditsToUse}
                </Text>
              </View>
              <View className="flex-row justify-between pt-2 border-t border-[#2a3a3a]">
                <Text className="text-white font-semibold">
                  Remaining Credits
                </Text>
                <Text className="text-[#00ff88] font-bold">
                  {remainingCredits}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Pay Button */}
            <TouchableOpacity
            className={`mt-5 mb-5 mx-12 rounded-3xl py-4 ${
              isLoading || showAccountMismatch ? "bg-[#00ff88a1]" : !currentBillInput || parseFloat(currentBillInput) <= 0 ? "bg-[#00ff8899]" : "bg-[#00ff88]"
            }`}
            onPress={handlePayNow}
            disabled={isLoading || !currentBillInput || parseFloat(currentBillInput) <= 0 || showAccountMismatch}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-center text-black text-base font-bold">
                Pay Now Using Credits
              </Text>
            )}
          </TouchableOpacity>

      {/* Payment Confirmation Modal */}
      <Modal
        visible={showPaymentConfirmation}
        transparent={true}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowPaymentConfirmation(false)}
      >
        <View className="flex-1 justify-center items-center bg-[#122119] opacity-90 px-5">
          <View className="w-full bg-[#1a3333] rounded-2xl p-6 border border-[#2a4444]">
            <Text className="text-white text-xl font-bold mb-4 text-center">
              Confirm Payment
            </Text>

            <View className="mb-6">
              <View className="flex-row justify-between py-2 border-b border-[#2a4444]">
                <Text className="text-gray-300">Current Bill</Text>
                <Text className="text-white font-semibold">
                  Rs.{billData.currentBill.toFixed(2)}
                </Text>
              </View>

              <View className="flex-row justify-between py-2 border-b border-[#2a4444]">
                <Text className="text-gray-300">Credits Used</Text>
                <Text className="text-[#00ff88] font-semibold">
                  {creditsToUse} (Rs.{amountToPay.toFixed(2)})
                </Text>
              </View>

              {remainingAmount > 0 ? (
                <View className="flex-row justify-between py-2">
                  <Text className="text-gray-300">Remaining to Pay</Text>
                  <Text className="text-[#ffaa00] font-semibold">
                    Rs.{remainingAmount.toFixed(2)}
                  </Text>
                </View>
              ) : (
                <View className="flex-row justify-between py-2">
                  <Text className="text-gray-300">Surplus Amount</Text>
                  <Text className="text-[#00ff88] font-semibold">
                    Rs.{Math.abs(remainingAmount).toFixed(2)}
                  </Text>
                </View>
              )}
            </View>

            <View className="flex-row justify-between space-x-6 gap-4">
              <TouchableOpacity
                className="flex-1 bg-[#2a3a3a] rounded-xl py-3 items-center"
                onPress={() => setShowPaymentConfirmation(false)}
              >
                <Text className="text-white font-semibold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`py-4 px-6 rounded-xl ${isLoading || showAccountMismatch ? 'bg-[#00ff88]/50' : 'bg-[#00ff88]'}`}
                onPress={handlePayNow}
                disabled={isLoading || showAccountMismatch}
              >
                {isLoading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text className="text-black font-semibold">Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View className="flex-1 bg-[#122119] opacity-90 justify-center items-center p-5">
          <View className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-sm">
            <View className="items-center mb-6">
              <View className="bg-[#00ff88] rounded-full p-3 mb-4">
                <Ionicons name="checkmark" size={40} color="#122119" />
              </View>
              <Text className="text-white text-2xl font-bold mb-2">
                Success!
              </Text>
              <Text className="text-gray-300 text-center mb-2">
                Your payment has been processed successfully
              </Text>
              <Text className="text-green-400 text-center text-sm">
                You light stay on-powered by community energy 💚
              </Text>
            </View>

            <View className="gap-5">
              <View className="bg-[#2a2a2a] p-4 rounded-xl">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-400">Amount Paid</Text>
                  <Text className="text-white font-semibold">
                    LKR {amountToPay.toFixed(2)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-400">Remaining to Pay</Text>
                  <Text className="text-white font-semibold">
                    Rs.{remainingAmount.toFixed(2)}
                  </Text>
                </View>
              </View>

              <View className="gap-3">
                <TouchableOpacity
                  className="bg-[#19E57D] py-4 rounded-xl items-center"
                  onPress={() => setShowSuccessModal(false)}
                >
                  <Text className="text-white font-semibold">Done</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-[#8DB890] opacity-50 py-4 rounded-xl items-center"
                  onPress={() => {
                    setShowSuccessModal(false);
                    setShowReceipt(true);
                  }}
                >
                  <Text className="text-[#1CFF4E] font-semibold">
                    View Receipt
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Credit Error Modal */}
      <Modal
        visible={showCreditError}
        transparent={true}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowCreditError(false)}
      >
        <View className="flex-1 bg-[#122119] opacity-90 justify-center items-center p-5">
          <View className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-sm">
            <View className="items-center mb-4">
              <View className="bg-amber-100 p-3 rounded-full mb-3">
                <Ionicons name="warning" size={32} color="#F59E0B" />
              </View>
              <Text className="text-white text-xl font-bold mb-1">
                No Credits Selected
              </Text>
              <Text className="text-gray-300 text-center text-sm">
                Please select at least 1 credit before proceeding with your
                payment.
              </Text>
            </View>

            <View className="mt-4 gap-3">
              <TouchableOpacity
                className="bg-[#00ff88] py-3 rounded-xl items-center"
                onPress={() => setShowCreditError(false)}
              >
                <Text className="text-black font-semibold">
                  OK, I'll Select Credits
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="py-3 rounded-xl items-center border border-[#2a3a3a]"
                onPress={handleLearnMore}
              >
                <Text className="text-[#00ff88] font-semibold">
                  Learn About Credits
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Receipt Modal */}
      <ReceiptModal />

      {/* Learn About Credits Modal */}
      <Modal
        visible={showLearnMore}
        transparent={true}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeLearnMore}
      >
        <View className="flex-1">
          {/* StatusBar for the modal */}
          <StatusBar
            barStyle="light-content"
            backgroundColor="transparent"
            translucent={true}
          />
          <View className="flex-1 bg-[#122119] opacity-90  top-0 left-0 right-0 bottom-0 justify-center items-center p-5">
            <View className="bg-[#1a1a1a] rounded-2xl p-6 w-full max-w-sm">
              <View className="items-center mb-4">
                <View className="bg-green-100 p-3 rounded-full mb-3">
                  <Ionicons
                    name="information-circle"
                    size={32}
                    color="#10B981"
                  />
                </View>
                <Text className="text-white text-xl font-bold mb-3">
                  About Credits
                </Text>

                <View className="w-full gap-3 mb-4">
                  <View className="flex-row items-start">
                    <View className="bg-[#2a3a3a] p-2 rounded-lg mr-3">
                      <Ionicons name="gift" size={18} color="#00ff88" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-medium mb-1">
                        Earn Credits
                      </Text>
                      <Text className="text-gray-300 text-sm">
                        Get credits from community donation .
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-start">
                    <View className="bg-[#2a3a3a] p-2 rounded-lg mr-3">
                      <Ionicons name="cash" size={18} color="#00ff88" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-medium mb-1">
                        Credit Value
                      </Text>
                      <Text className="text-gray-300 text-sm">
                        Each credit is worth LKR 100 towards your utility bill.
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-start">
                    <View className="bg-[#2a3a3a] p-2 rounded-lg mr-3">
                      <Ionicons
                        name="refresh-circle"
                        size={18}
                        color="#00ff88"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-medium mb-1">Usage</Text>
                      <Text className="text-gray-300 text-sm">
                        Apply credits to reduce your bill amount when making
                        payments.
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                className="bg-[#00ff88] py-3 rounded-xl items-center mt-2"
                onPress={closeLearnMore}
              >
                <Text className="text-black font-semibold">Got It!</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* OCR Result Modal */}
      <Modal
        visible={showOcrResult}
        transparent={true}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowOcrResult(false)}
      >
        <View className="flex-1 bg-[#122119] opacity-90 justify-center items-center p-5">
          <View className="bg-[#1a3333] rounded-2xl p-6 w-full max-w-sm">
            {/* Header */}
            <View className="items-center mb-4">
              <View className="bg-[#00ff88] rounded-full p-3 mb-3">
                <Ionicons 
                  name={ocrResult.amount !== undefined ? "checkmark-circle" : "alert-circle"} 
                  size={32} 
                  color="#000" 
                />
              </View>
              <Text className="text-white text-xl font-bold text-center">
                {ocrResult.amount !== undefined ? "Bill Scan Complete" : "Scan Failed"}
              </Text>
            </View>

            {/* Content */}
            <View className="mb-6">
              {ocrResult.amount !== undefined ? (
                <View className="space-y-3">
                  <Text className="text-gray-300 text-center mb-3">
                    We've extracted the following details from your bill:
                  </Text>
                  
                  <View className="bg-[#2a3a3a] rounded-xl p-3">
                    <View className="space-y-2">
                      <View className="flex-row items-center">
                        <Ionicons 
                          name={ocrResult.accountNo ? "card" : "close-circle"} 
                          size={20} 
                          color={ocrResult.accountNo ? "#00ff88" : "#ff4d4d"} 
                          style={{marginRight: 8}}
                        />
                        <Text className="text-white font-medium">
                          {ocrResult.accountNo ? "Account Number:" : "Account not found"}
                        </Text>
                      </View>
                      {ocrResult.accountNo && (
                        <View className="ml-8">
                          <Text className="text-white">
                            {ocrResult.accountNo}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <View className="space-y-2">
                      <View className="flex-row items-center">
                        <Ionicons 
                          name={ocrResult.amount ? "cash" : "close-circle"} 
                          size={20} 
                          color={ocrResult.amount ? "#00ff88" : "#ff4d4d"} 
                          style={{marginRight: 8}}
                        />
                        <Text className="text-white font-medium">
                          {ocrResult.amount ? "Bill Amount:" : "Amount not found"}
                        </Text>
                      </View>
                      {ocrResult.amount && (
                        <View className="ml-8">
                          <Text className="text-white">
                            Rs.{ocrResult.amount.toFixed(2)}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <View className="space-y-2">
                      <View className="flex-row items-center">
                        <Ionicons 
                          name={ocrResult.meterReading ? "speedometer" : "close-circle"} 
                          size={20} 
                          color={ocrResult.meterReading ? "#00ff88" : "#ff4d4d"} 
                          style={{marginRight: 8}}
                        />
                        <Text className="text-white font-medium">
                          {ocrResult.meterReading ? "Meter Usage (Units):" : "Meter reading not found"}
                        </Text>
                      </View>
                      {ocrResult.meterReading && (
                        <View className="ml-8">
                          {ocrResult.meterReading.includes('→') ? (
                            <View>
                              <Text className="text-white">
                                {ocrResult.meterReading.split('(')[0].trim()} units
                              </Text>
                              <Text className="text-gray-400 text-sm">
                                {ocrResult.meterReading.match(/\(([^)]+)\)/)?.[1] || ''}
                              </Text>
                            </View>
                          ) : (
                            <Text className="text-white">
                              {ocrResult.meterReading} units (current reading)
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                  
                  <Text className="text-gray-400 text-sm text-center mt-3">
                    Please verify the details before proceeding.
                  </Text>
                </View>
              ) : (
                <View className="space-y-4">
                  <Text className="text-gray-300 text-center">
                    We couldn't read your bill. Please ensure:
                  </Text>
                  <View className="bg-[#2a3a3a] rounded-xl p-3">
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="checkmark-circle" size={16} color="#00ff88" style={{marginRight: 8}} />
                      <Text className="text-gray-300">The bill is well-lit and in focus</Text>
                    </View>
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="checkmark-circle" size={16} color="#00ff88" style={{marginRight: 8}} />
                      <Text className="text-gray-300">All text is clear and visible</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="checkmark-circle" size={16} color="#00ff88" style={{marginRight: 8}} />
                      <Text className="text-gray-300">The image isn't blurry</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Footer */}
            <View className="flex-row space-x-3">
              {ocrResult.amount !== undefined ? (
                <>
                  <TouchableOpacity 
                    className="flex-1 bg-[#2a3a3a] py-3 rounded-xl items-center"
                    onPress={() => setShowOcrResult(false)}
                  >
                    <Text className="text-white font-semibold">Looks Good</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="flex-1 bg-[#00ff88] py-3 rounded-xl items-center"
                    onPress={() => {
                      setShowOcrResult(false);
                      handleOpenCamera();
                    }}
                  >
                    <Text className="text-black font-semibold">Rescan</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity 
                    className="flex-1 bg-[#2a3a3a] py-3 rounded-xl items-center"
                    onPress={() => setShowOcrResult(false)}
                  >
                    <Text className="text-white font-semibold">Enter Manually</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="flex-1 bg-[#00ff88] py-3 rounded-xl items-center"
                    onPress={() => {
                      setShowOcrResult(false);
                      handleOpenCamera();
                    }}
                  >
                    <Text className="text-black font-semibold">Try Again</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default BillPayment;
