import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Upload, MapPin, FileText, ChevronDown } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { db, auth } from '@/config/firebaseConfig';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { LocationPickerModal } from '@/components/LocationPickerModal';

const RequestProject = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const editDocId = params.docId as string | undefined;
  const isEditMode = !!editDocId;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [showEnergyDropdown, setShowEnergyDropdown] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | undefined>();
  const [uploadedFiles, setUploadedFiles] = useState({
    idDocument: null as string | null,
    landDocument: null as string | null,
    photos: [] as string[]
  });
  const [formData, setFormData] = useState({
    fullName: '',
    licenseNumber: '',
    phoneNumber: '',
    email: '',
    address: '',
    landReference: '',
    propertyType: '',
    projectTitle: '',
    projectDescription: '',
    energySystem: '',
    energyNeed: '',
    terms: {
      accurate: false,
      shareEnergy: false,
      verification: false
    }
  });

  const propertyTypes = ['Residential', 'Commercial', 'Industrial', 'Agricultural'];
  const energySystems = ['Solar Panel', 'Wind Turbine', 'Hybrid System', 'Biogas', 'Hydroelectric'];

  // Load existing project data when editing
  useEffect(() => {
    if (isEditMode && editDocId) {
      loadProjectData();
    }
  }, [editDocId]);

  const loadProjectData = async () => {
    setIsLoading(true);
    try {
      const docRef = doc(db, 'projectRequests', editDocId!);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          fullName: data.fullName || '',
          licenseNumber: data.licenseNumber || '',
          phoneNumber: data.phoneNumber || '',
          email: data.email || '',
          address: data.address || '',
          landReference: data.landReference || '',
          propertyType: data.propertyType || '',
          projectTitle: data.projectTitle || '',
          projectDescription: data.projectDescription || '',
          energySystem: data.energySystem || '',
          energyNeed: data.energyNeed || '',
          terms: {
            accurate: true,
            shareEnergy: true,
            verification: true
          }
        });
      } else {
        Alert.alert('Error', 'Project not found');
        router.back();
      }
    } catch (error) {
      console.error('Load error:', error);
      Alert.alert('Error', 'Failed to load project data');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePick = async (type: 'id' | 'land' | 'photo') => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera roll permissions to upload images');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as any,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        
        if (type === 'id') {
          setUploadedFiles(prev => ({ ...prev, idDocument: uri }));
          Alert.alert('Success', 'ID document uploaded successfully');
        } else if (type === 'land') {
          setUploadedFiles(prev => ({ ...prev, landDocument: uri }));
          Alert.alert('Success', 'Land document uploaded successfully');
        } else if (type === 'photo') {
          setUploadedFiles(prev => ({ ...prev, photos: [...prev.photos, uri] }));
          Alert.alert('Success', `Photo uploaded (${uploadedFiles.photos.length + 1} total)`);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleDocumentPick = async (type: 'id' | 'land') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets[0]) {
        const uri = result.assets[0].uri;
        
        if (type === 'id') {
          setUploadedFiles(prev => ({ ...prev, idDocument: uri }));
          Alert.alert('Success', 'ID document uploaded successfully');
        } else if (type === 'land') {
          setUploadedFiles(prev => ({ ...prev, landDocument: uri }));
          Alert.alert('Success', 'Land document uploaded successfully');
        }
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleLocationPick = () => {
    setShowLocationPicker(true);
  };

  const handleSelectLocation = (location: string, coordinates?: { latitude: number; longitude: number }) => {
    setFormData({ ...formData, address: location });
    setSelectedLocation(coordinates);
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      Alert.alert('Validation Error', 'Please enter your full name');
      return false;
    }
    if (!formData.licenseNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter your ID number');
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      Alert.alert('Validation Error', 'Please enter your phone number');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email');
      return false;
    }
    if (!formData.address.trim()) {
      Alert.alert('Validation Error', 'Please enter the project address');
      return false;
    }
    if (!formData.projectTitle.trim()) {
      Alert.alert('Validation Error', 'Please enter project title');
      return false;
    }
    if (!formData.projectDescription.trim()) {
      Alert.alert('Validation Error', 'Please enter project description');
      return false;
    }
    if (!formData.terms.accurate || !formData.terms.shareEnergy || !formData.terms.verification) {
      Alert.alert('Validation Error', 'Please accept all terms and agreements');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Authentication Error', 'Please sign in to submit a project request');
        setIsSubmitting(false);
        return;
      }

      const projectData = {
        userId: user.uid,
        userEmail: user.email,
        fullName: formData.fullName,
        licenseNumber: formData.licenseNumber,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        address: formData.address,
        landReference: formData.landReference,
        propertyType: formData.propertyType,
        projectTitle: formData.projectTitle,
        projectDescription: formData.projectDescription,
        energySystem: formData.energySystem,
        energyNeed: formData.energyNeed,
        status: 'Pending',
        updatedAt: serverTimestamp()
      };

      if (isEditMode && editDocId) {
        // Update existing project
        const docRef = doc(db, 'projectRequests', editDocId);
        await updateDoc(docRef, projectData);
        
        console.log('Project request updated with ID:', editDocId);

        Alert.alert(
          'Success!',
          'Your project request has been updated successfully.',
          [
            {
              text: 'View My Requests',
              onPress: () => router.push('/(root)/MyRequestProject')
            }
          ]
        );
      } else {
        // Create new project
        const newProjectData = {
          ...projectData,
          submittedDate: serverTimestamp(),
          createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'projectRequests'), newProjectData);
        
        console.log('Project request submitted with ID:', docRef.id);

        Alert.alert(
          'Success!',
          'Your project request has been submitted successfully. You will receive updates via email.',
          [
            {
              text: 'View My Requests',
              onPress: () => router.push('/(root)/MyRequestProject')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert(
        'Submission Failed',
        error instanceof Error ? error.message : 'An error occurred while submitting your request. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#0a0a0a'
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
          {isEditMode ? 'Edit Project Request' : 'Request a Project'}
        </Text>
      </View>

      {/* Loading Indicator */}
      {isLoading && (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#16A34A" />
          <Text style={{ color: '#737373', marginTop: 12 }}>Loading project data...</Text>
        </View>
      )}

      {!isLoading && (

      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Hero Illustration */}
        <View style={{
          backgroundColor: '#F4A460',
          marginHorizontal: 16,
          marginTop: 8,
          borderRadius: 16,
          height: 180,
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden'
        }}>
          <View style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: '#FFA07A',
            position: 'absolute',
            top: 20
          }} />
          <Text style={{ fontSize: 60, marginTop: 20 }}>👤</Text>
          <View style={{
            backgroundColor: 'white',
            padding: 12,
            borderRadius: 8,
            marginTop: 16,
            elevation: 4
          }}>
            <View style={{ flexDirection: 'row', gap: 4 }}>
              <View style={{ width: 40, height: 4, backgroundColor: '#d4d4d4', borderRadius: 2 }} />
              <View style={{ width: 20, height: 4, backgroundColor: '#d4d4d4', borderRadius: 2 }} />
            </View>
            <View style={{ flexDirection: 'row', gap: 4, marginTop: 4 }}>
              <View style={{ width: 30, height: 4, backgroundColor: '#d4d4d4', borderRadius: 2 }} />
              <View style={{ width: 25, height: 4, backgroundColor: '#d4d4d4', borderRadius: 2 }} />
            </View>
          </View>
        </View>

        {/* Personal Information Section */}
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', marginBottom: 4 }}>
            Personal Information
          </Text>
          <Text style={{ color: '#737373', fontSize: 13, marginBottom: 16 }}>
            Please provide your personal details for verification
          </Text>

          {/* Full Name */}
          <Text style={{ color: '#a3a3a3', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
            Full Name
          </Text>
          <TextInput
            style={{
              backgroundColor: '#171717',
              borderRadius: 12,
              padding: 16,
              color: 'white',
              fontSize: 15,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: '#262626'
            }}
            placeholder="Enter your full name"
            placeholderTextColor="#525252"
            value={formData.fullName}
            onChangeText={(text) => setFormData({...formData, fullName: text})}
          />

          {/* License Number */}
          <Text style={{ color: '#a3a3a3', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
            National ID / Driving License Number
          </Text>
          <TextInput
            style={{
              backgroundColor: '#171717',
              borderRadius: 12,
              padding: 16,
              color: 'white',
              fontSize: 15,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: '#262626'
            }}
            placeholder="Enter your ID number"
            placeholderTextColor="#525252"
            value={formData.licenseNumber}
            onChangeText={(text) => setFormData({...formData, licenseNumber: text})}
          />

          {/* Upload ID Button */}
          <TouchableOpacity 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#171717',
              borderRadius: 12,
              padding: 16,
              marginBottom: 8,
              borderWidth: 1,
              borderColor: uploadedFiles.idDocument ? '#16A34A' : '#262626'
            }}
            onPress={() => handleImagePick('id')}
          >
            <Upload size={20} color={uploadedFiles.idDocument ? '#16A34A' : '#737373'} />
            <Text style={{ color: uploadedFiles.idDocument ? '#16A34A' : '#a3a3a3', fontSize: 14, marginLeft: 8, flex: 1 }}>
              {uploadedFiles.idDocument ? 'ID Document Uploaded ✓' : 'Upload ID Document'}
            </Text>
            <View style={{
              backgroundColor: '#16A34A',
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 8
            }}>
              <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>
                {uploadedFiles.idDocument ? 'Change' : 'Upload'}
              </Text>
            </View>
          </TouchableOpacity>
          
          {/* ID Document Preview */}
          {uploadedFiles.idDocument && (
            <View style={{ marginBottom: 16, borderRadius: 12, overflow: 'hidden' }}>
              <Image 
                source={{ uri: uploadedFiles.idDocument }} 
                style={{ width: '100%', height: 150, borderRadius: 12 }}
                resizeMode="cover"
              />
            </View>
          )}

          {/* Phone Number */}
          <Text style={{ color: '#a3a3a3', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
            Phone Number
          </Text>
          <TextInput
            style={{
              backgroundColor: '#171717',
              borderRadius: 12,
              padding: 16,
              color: 'white',
              fontSize: 15,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: '#262626'
            }}
            placeholder="Enter your phone number"
            placeholderTextColor="#525252"
            keyboardType="phone-pad"
            value={formData.phoneNumber}
            onChangeText={(text) => setFormData({...formData, phoneNumber: text})}
          />

          {/* Email */}
          <Text style={{ color: '#a3a3a3', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
            Email
          </Text>
          <TextInput
            style={{
              backgroundColor: '#171717',
              borderRadius: 12,
              padding: 16,
              color: 'white',
              fontSize: 15,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: '#262626'
            }}
            placeholder="Enter your email"
            placeholderTextColor="#525252"
            keyboardType="email-address"
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
          />
        </View>

        {/* Location Illustration */}
        <View style={{
          backgroundColor: '#D4A574',
          marginHorizontal: 16,
          borderRadius: 16,
          height: 120,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 24
        }}>
          <View style={{
            width: 60,
            height: 80,
            backgroundColor: '#C9B89A',
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <View style={{
              width: 40,
              height: 40,
              backgroundColor: 'white',
              borderRadius: 4,
              marginBottom: 8
            }} />
            <View style={{
              width: 40,
              height: 8,
              backgroundColor: '#8B7355',
              borderRadius: 2
            }} />
          </View>
          <MapPin size={32} color="#8B4513" style={{ position: 'absolute', top: 20, right: 40 }} />
        </View>

        {/* Property Details Section */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', marginBottom: 4 }}>
            Project Location & Property Details
          </Text>
          <Text style={{ color: '#737373', fontSize: 13, marginBottom: 16 }}>
            Specify the location and details of the property for the project
          </Text>

          {/* Full Address */}
          <Text style={{ color: '#a3a3a3', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
            Full Address
          </Text>
          <TextInput
            style={{
              backgroundColor: '#171717',
              borderRadius: 12,
              padding: 16,
              color: 'white',
              fontSize: 15,
              height: 80,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: '#262626',
              textAlignVertical: 'top'
            }}
            placeholder="Enter full address"
            placeholderTextColor="#525252"
            multiline
            value={formData.address}
            onChangeText={(text) => setFormData({...formData, address: text})}
          />

          {/* Pick Location Button */}
          <TouchableOpacity 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#171717',
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: '#262626'
            }}
            onPress={handleLocationPick}
          >
            <MapPin size={20} color="#737373" />
            <Text style={{ color: '#a3a3a3', fontSize: 14, marginLeft: 8, flex: 1 }}>
              Pick Location
            </Text>
            <View style={{
              backgroundColor: '#16A34A',
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 8
            }}>
              <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>Select</Text>
            </View>
          </TouchableOpacity>

          {/* Upload Land Document Button */}
          <TouchableOpacity 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#171717',
              borderRadius: 12,
              padding: 16,
              marginBottom: 8,
              borderWidth: 1,
              borderColor: uploadedFiles.landDocument ? '#16A34A' : '#262626'
            }}
            onPress={() => handleImagePick('land')}
          >
            <FileText size={20} color={uploadedFiles.landDocument ? '#16A34A' : '#737373'} />
            <Text style={{ color: uploadedFiles.landDocument ? '#16A34A' : '#a3a3a3', fontSize: 14, marginLeft: 8, flex: 1 }}>
              {uploadedFiles.landDocument ? 'Land Document Uploaded ✓' : 'Upload Land Document'}
            </Text>
            <View style={{
              backgroundColor: '#16A34A',
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 8
            }}>
              <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>
                {uploadedFiles.landDocument ? 'Change' : 'Upload'}
              </Text>
            </View>
          </TouchableOpacity>
          
          {/* Land Document Preview */}
          {uploadedFiles.landDocument && (
            <View style={{ marginBottom: 16, borderRadius: 12, overflow: 'hidden' }}>
              <Image 
                source={{ uri: uploadedFiles.landDocument }} 
                style={{ width: '100%', height: 150, borderRadius: 12 }}
                resizeMode="cover"
              />
            </View>
          )}

          {/* Land Reference Number */}
          <Text style={{ color: '#a3a3a3', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
            Land Reference Number (Optional)
          </Text>
          <TextInput
            style={{
              backgroundColor: '#171717',
              borderRadius: 12,
              padding: 16,
              color: 'white',
              fontSize: 15,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: '#262626'
            }}
            placeholder="Enter reference number"
            placeholderTextColor="#525252"
            value={formData.landReference}
            onChangeText={(text) => setFormData({...formData, landReference: text})}
          />

          {/* Property Type */}
          <Text style={{ color: '#a3a3a3', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
            Property Type
          </Text>
          <TouchableOpacity 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#171717',
              borderRadius: 12,
              padding: 16,
              marginBottom: 8,
              borderWidth: 1,
              borderColor: '#262626'
            }}
            onPress={() => setShowPropertyDropdown(!showPropertyDropdown)}
          >
            <Text style={{ color: formData.propertyType ? 'white' : '#737373', fontSize: 15, flex: 1 }}>
              {formData.propertyType || 'Select property type'}
            </Text>
            <ChevronDown size={20} color="#737373" />
          </TouchableOpacity>
          
          {/* Property Type Dropdown */}
          {showPropertyDropdown && (
            <View style={{ backgroundColor: '#171717', borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#262626' }}>
              {propertyTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#262626' }}
                  onPress={() => {
                    setFormData({...formData, propertyType: type});
                    setShowPropertyDropdown(false);
                  }}
                >
                  <Text style={{ color: formData.propertyType === type ? '#16A34A' : 'white', fontSize: 15 }}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {!showPropertyDropdown && <View style={{ marginBottom: 16 }} />}
        </View>

        {/* Solar Panel Image */}
        <View style={{
          backgroundColor: '#87CEEB',
          marginHorizontal: 16,
          borderRadius: 16,
          height: 140,
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginBottom: 24,
          overflow: 'hidden'
        }}>
          <View style={{
            width: '100%',
            height: 60,
            backgroundColor: '#F0E68C',
            borderTopLeftRadius: 60,
            borderTopRightRadius: 60
          }} />
          <View style={{
            position: 'absolute',
            width: 120,
            height: 80,
            backgroundColor: '#1E3A5F',
            borderRadius: 8,
            top: 30,
            transform: [{ rotate: '-15deg' }]
          }}>
            <View style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              padding: 4
            }}>
              {[...Array(12)].map((_, i) => (
                <View key={i} style={{
                  width: '30%',
                  height: 20,
                  backgroundColor: '#2C5F8D',
                  margin: 1.5,
                  borderRadius: 2
                }} />
              ))}
            </View>
          </View>
        </View>

        {/* Project Information Section */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', marginBottom: 4 }}>
            Project Information
          </Text>
          <Text style={{ color: '#737373', fontSize: 13, marginBottom: 16 }}>
            Explain what kind of clean energy project you are requesting
          </Text>

          {/* Project Title */}
          <Text style={{ color: '#a3a3a3', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
            Project Title
          </Text>
          <TextInput
            style={{
              backgroundColor: '#171717',
              borderRadius: 12,
              padding: 16,
              color: 'white',
              fontSize: 15,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: '#262626'
            }}
            placeholder="Enter project title"
            placeholderTextColor="#525252"
            value={formData.projectTitle}
            onChangeText={(text) => setFormData({...formData, projectTitle: text})}
          />

          {/* Project Description */}
          <Text style={{ color: '#a3a3a3', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
            Project Description
          </Text>
          <TextInput
            style={{
              backgroundColor: '#171717',
              borderRadius: 12,
              padding: 16,
              color: 'white',
              fontSize: 15,
              height: 100,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: '#262626',
              textAlignVertical: 'top'
            }}
            placeholder="Describe your project"
            placeholderTextColor="#525252"
            multiline
            value={formData.projectDescription}
            onChangeText={(text) => setFormData({...formData, projectDescription: text})}
          />

          {/* Type of Energy System */}
          <Text style={{ color: '#a3a3a3', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
            Type of Energy System
          </Text>
          <TouchableOpacity 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#171717',
              borderRadius: 12,
              padding: 16,
              marginBottom: 8,
              borderWidth: 1,
              borderColor: '#262626'
            }}
            onPress={() => setShowEnergyDropdown(!showEnergyDropdown)}
          >
            <Text style={{ color: formData.energySystem ? 'white' : '#737373', fontSize: 15, flex: 1 }}>
              {formData.energySystem || 'Select energy system'}
            </Text>
            <ChevronDown size={20} color="#737373" />
          </TouchableOpacity>
          
          {/* Energy System Dropdown */}
          {showEnergyDropdown && (
            <View style={{ backgroundColor: '#171717', borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#262626' }}>
              {energySystems.map((system) => (
                <TouchableOpacity
                  key={system}
                  style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#262626' }}
                  onPress={() => {
                    setFormData({...formData, energySystem: system});
                    setShowEnergyDropdown(false);
                  }}
                >
                  <Text style={{ color: formData.energySystem === system ? '#16A34A' : 'white', fontSize: 15 }}>
                    {system}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {!showEnergyDropdown && <View style={{ marginBottom: 8 }} />}

          {/* Estimated Energy Need */}
          <Text style={{ color: '#a3a3a3', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
            Estimated Energy Need (kWh)
          </Text>
          <TextInput
            style={{
              backgroundColor: '#171717',
              borderRadius: 12,
              padding: 16,
              color: 'white',
              fontSize: 15,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: '#262626'
            }}
            placeholder="Enter estimated energy need"
            placeholderTextColor="#525252"
            keyboardType="numeric"
            value={formData.energyNeed}
            onChangeText={(text) => setFormData({...formData, energyNeed: text})}
          />

          {/* Attach Supporting Photos */}
          <TouchableOpacity 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#171717',
              borderRadius: 12,
              padding: 16,
              marginBottom: 8,
              borderWidth: 1,
              borderColor: uploadedFiles.photos.length > 0 ? '#16A34A' : '#262626'
            }}
            onPress={() => handleImagePick('photo')}
          >
            <Upload size={20} color={uploadedFiles.photos.length > 0 ? '#16A34A' : '#737373'} />
            <Text style={{ color: uploadedFiles.photos.length > 0 ? '#16A34A' : '#a3a3a3', fontSize: 14, marginLeft: 8, flex: 1 }}>
              {uploadedFiles.photos.length > 0 
                ? `${uploadedFiles.photos.length} Photo(s) Uploaded ✓` 
                : 'Attach Supporting Photos (Optional)'}
            </Text>
            <View style={{
              backgroundColor: '#16A34A',
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 8
            }}>
              <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>
                {uploadedFiles.photos.length > 0 ? 'Add More' : 'Upload'}
              </Text>
            </View>
          </TouchableOpacity>
          
          {/* Photos Preview */}
          {uploadedFiles.photos.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {uploadedFiles.photos.map((photo, index) => (
                  <View key={index} style={{ marginRight: 12, borderRadius: 12, overflow: 'hidden' }}>
                    <Image 
                      source={{ uri: photo }} 
                      style={{ width: 120, height: 120, borderRadius: 12 }}
                      resizeMode="cover"
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Document Illustration */}
        <View style={{
          backgroundColor: '#F4A460',
          marginHorizontal: 16,
          borderRadius: 16,
          height: 120,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 24
        }}>
          <View style={{
            width: 80,
            height: 100,
            backgroundColor: 'white',
            borderRadius: 8,
            padding: 12,
            elevation: 4
          }}>
            {[...Array(4)].map((_, i) => (
              <View key={i} style={{
                flexDirection: 'row',
                marginBottom: 8,
                alignItems: 'center'
              }}>
                <View style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: i === 0 ? '#16A34A' : '#d4d4d4',
                  marginRight: 6
                }} />
                <View style={{
                  flex: 1,
                  height: 4,
                  backgroundColor: '#e5e5e5',
                  borderRadius: 2
                }} />
              </View>
            ))}
          </View>
        </View>

        {/* Terms & Agreements */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', marginBottom: 4 }}>
            Terms & Agreements
          </Text>
          <Text style={{ color: '#737373', fontSize: 13, marginBottom: 16 }}>
            Please review and accept the terms and agreements
          </Text>

          {/* Checkbox 1 */}
          <TouchableOpacity 
            style={{ flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' }}
            onPress={() => setFormData({
              ...formData,
              terms: { ...formData.terms, accurate: !formData.terms.accurate }
            })}
          >
            <View style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              borderWidth: 2,
              borderColor: formData.terms.accurate ? '#16A34A' : '#404040',
              backgroundColor: formData.terms.accurate ? '#16A34A' : 'transparent',
              marginRight: 12,
              marginTop: 2,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {formData.terms.accurate && (
                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
              )}
            </View>
            <Text style={{ color: '#a3a3a3', fontSize: 13, flex: 1, lineHeight: 20 }}>
              I certify that the information provided is true and accurate
            </Text>
          </TouchableOpacity>

          {/* Checkbox 2 */}
          <TouchableOpacity 
            style={{ flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' }}
            onPress={() => setFormData({
              ...formData,
              terms: { ...formData.terms, shareEnergy: !formData.terms.shareEnergy }
            })}
          >
            <View style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              borderWidth: 2,
              borderColor: formData.terms.shareEnergy ? '#16A34A' : '#404040',
              backgroundColor: formData.terms.shareEnergy ? '#16A34A' : 'transparent',
              marginRight: 12,
              marginTop: 2,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {formData.terms.shareEnergy && (
                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
              )}
            </View>
            <Text style={{ color: '#a3a3a3', fontSize: 13, flex: 1, lineHeight: 20 }}>
              I agree to share excess energy with the community grid
            </Text>
          </TouchableOpacity>

          {/* Checkbox 3 */}
          <TouchableOpacity 
            style={{ flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' }}
            onPress={() => setFormData({
              ...formData,
              terms: { ...formData.terms, verification: !formData.terms.verification }
            })}
          >
            <View style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              borderWidth: 2,
              borderColor: formData.terms.verification ? '#16A34A' : '#404040',
              backgroundColor: formData.terms.verification ? '#16A34A' : 'transparent',
              marginRight: 12,
              marginTop: 2,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {formData.terms.verification && (
                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
              )}
            </View>
            <Text style={{ color: '#a3a3a3', fontSize: 13, flex: 1, lineHeight: 20 }}>
              I authorize the verification of the provided details
            </Text>
          </TouchableOpacity>

          {/* Info Box */}
          <View style={{
            backgroundColor: '#171717',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: '#262626'
          }}>
            <Text style={{ color: '#a3a3a3', fontSize: 12, lineHeight: 18 }}>
              <Text style={{ fontWeight: '700' }}>Submission Info:</Text> Your request will be reviewed within 7-14 business days. You will receive updates via email.
            </Text>
          </View>
        </View>
      </ScrollView>
      )}

      {/* Bottom Action Buttons */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#0a0a0a',
        padding: 16,
        paddingBottom: 32,
        borderTopWidth: 1,
        borderTopColor: '#262626',
        flexDirection: 'row',
        gap: 12
      }}>
        <TouchableOpacity style={{
          flex: 1,
          backgroundColor: '#171717',
          borderRadius: 12,
          padding: 16,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: '#262626'
        }}>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
            Save as Draft
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={{
            flex: 1,
            backgroundColor: isSubmitting ? '#9CA3AF' : '#16A34A',
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
            elevation: 4
          }}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
              {isEditMode ? 'Update Request' : 'Submit Request'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Location Picker Modal */}
      <LocationPickerModal
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelectLocation={handleSelectLocation}
        currentLocation={formData.address}
      />
    </SafeAreaView>
  );
};

export default RequestProject;