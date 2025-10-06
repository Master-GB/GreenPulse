import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { ArrowLeft, Upload, MapPin, FileText, ChevronDown } from 'lucide-react-native';

const RequestProject = () => {
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

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 16,
        paddingTop: 48,
        paddingBottom: 16,
        backgroundColor: '#0a0a0a'
      }}>
        <TouchableOpacity style={{ marginRight: 16 }}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={{ color: 'white', fontSize: 20, fontWeight: '700' }}>
          Request a Project
        </Text>
      </View>

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
          <TouchableOpacity style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#171717',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: '#262626'
          }}>
            <Upload size={20} color="#737373" />
            <Text style={{ color: '#a3a3a3', fontSize: 14, marginLeft: 8, flex: 1 }}>
              Upload ID Document
            </Text>
            <View style={{
              backgroundColor: '#16A34A',
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 8
            }}>
              <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>Upload</Text>
            </View>
          </TouchableOpacity>

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
          <TouchableOpacity style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#171717',
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: '#262626'
          }}>
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
          <TouchableOpacity style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#171717',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: '#262626'
          }}>
            <FileText size={20} color="#737373" />
            <Text style={{ color: '#a3a3a3', fontSize: 14, marginLeft: 8, flex: 1 }}>
              Upload Land Document
            </Text>
            <View style={{
              backgroundColor: '#16A34A',
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 8
            }}>
              <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>Upload</Text>
            </View>
          </TouchableOpacity>

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
          <TouchableOpacity style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#171717',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: '#262626'
          }}>
            <Text style={{ color: '#737373', fontSize: 15, flex: 1 }}>
              {formData.propertyType || 'Select property type'}
            </Text>
            <ChevronDown size={20} color="#737373" />
          </TouchableOpacity>
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
          <TouchableOpacity style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#171717',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: '#262626'
          }}>
            <Text style={{ color: '#737373', fontSize: 15, flex: 1 }}>
              {formData.energySystem || 'Select energy system'}
            </Text>
            <ChevronDown size={20} color="#737373" />
          </TouchableOpacity>

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
          <TouchableOpacity style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#171717',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: '#262626'
          }}>
            <Upload size={20} color="#737373" />
            <Text style={{ color: '#a3a3a3', fontSize: 14, marginLeft: 8, flex: 1 }}>
              Attach Supporting Photos (Optional)
            </Text>
            <View style={{
              backgroundColor: '#16A34A',
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 8
            }}>
              <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>Upload</Text>
            </View>
          </TouchableOpacity>
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
        <TouchableOpacity style={{
          flex: 1,
          backgroundColor: '#16A34A',
          borderRadius: 12,
          padding: 16,
          alignItems: 'center',
          elevation: 4
        }}>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
            Submit Request
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RequestProject;