import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';

const ProjectDetails = () => {
  const donors = [
    { id: 1, image: 'https://i.pravatar.cc/150?img=1' },
    { id: 2, image: 'https://i.pravatar.cc/150?img=2' },
    { id: 3, image: 'https://i.pravatar.cc/150?img=3' }
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#122119' }}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Image */}
      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800' }}
          style={{
            width: '100%',
            height: 280,
            borderRadius: 20,
            backgroundColor: '#2a2a2a'
          }}
          resizeMode="cover"
        />
      </View>
      
      {/* Project Info */}
      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <Text style={{
          color: 'white',
          fontSize: 26,
          fontWeight: '700',
          marginBottom: 12,
          lineHeight: 32
        }}>
          Solar Power for Rural School
        </Text>
        <Text style={{
          color: '#9ca3af',
          fontSize: 15,
          lineHeight: 24,
          marginBottom: 16
        }}>
          This project aims to install solar panels at a rural school, providing a sustainable energy source for lighting and educational resources.
        </Text>
        <Text style={{
          color: '#d1d5db',
          fontSize: 16,
          fontWeight: '600',
          marginBottom: 12
        }}>
          Solar Panel Installation
        </Text>
        <View style={{
          backgroundColor: '#16A34A',
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 12,
          alignSelf: 'flex-start'
        }}>
          <Text style={{ color: 'white', fontSize: 15, fontWeight: '600' }}>
            In Progress
          </Text>
        </View>
      </View>
      
      {/* Image Grid */}
      <View style={{
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        marginBottom: 32
      }}>
        <View style={{ flex: 1 }}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400' }}
            style={{
              width: '100%',
              height: 180,
              borderRadius: 16,
              backgroundColor: '#2a2a2a',
              marginBottom: 12
            }}
            resizeMode="cover"
          />
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            Solar Panel Installation
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{
            width: '100%',
            height: 180,
            borderRadius: 16,
            backgroundColor: '#c4d97f',
            marginBottom: 12,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16
          }}>
            {/*Illustration placeholder */}
            <View style={{
              width: 80,
              height: 80,
              backgroundColor: '#7c9f5f',
              borderRadius: 40,
              marginBottom: 8
            }} />
            <View style={{
              width: 60,
              height: 40,
              backgroundColor: 'white',
              borderRadius: 8
            }} />
          </View>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            Students Benefits
          </Text>
        </View>
      </View>
      
      {/* Funding Progress */}
      <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
        <Text style={{
          color: 'white',
          fontSize: 18,
          fontWeight: '700',
          marginBottom: 4
        }}>
          Funding Progress
        </Text>
        <Text style={{
          color: '#9ca3af',
          fontSize: 16,
          marginBottom: 12
        }}>
          7,500 / 10,000 Coins
        </Text>
        <View style={{
          width: '100%',
          height: 12,
          backgroundColor: '#2a2a2a',
          borderRadius: 6,
          overflow: 'hidden'
        }}>
          <View style={{
            width: '75%',
            height: '100%',
            backgroundColor: '#10b981',
            borderRadius: 6
          }} />
        </View>
      </View>
      
      {/* Top Donors */}
      <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
        <Text style={{
          color: 'white',
          fontSize: 20,
          fontWeight: '700',
          marginBottom: 16
        }}>
          Top Donors
        </Text>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 16
        }}>
          {donors.map((donor, index) => (
            <View
              key={donor.id}
              style={{
                marginLeft: index > 0 ? -12 : 0,
                borderWidth: 3,
                borderColor: '#1a1a1a',
                borderRadius: 30,
                overflow: 'hidden'
              }}
            >
              <Image
                source={{ uri: donor.image }}
                style={{
                  width: 56,
                  height: 56,
                  backgroundColor: '#2a2a2a'
                }}
              />
            </View>
          ))}
        </View>
        <TouchableOpacity>
          <Text style={{
            color: '#9ca3af',
            fontSize: 15,
            fontWeight: '500'
          }}>
            View All Donors
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Donate Button */}
      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#10b981',
            paddingVertical: 18,
            borderRadius: 16,
            alignItems: 'center',
            elevation: 4,
            shadowColor: '#10b981',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8
          }}
          activeOpacity={0.9}
        >
          <Text style={{
            color: 'white',
            fontSize: 18,
            fontWeight: '700'
          }}>
            Donate Now
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Bottom Message */}
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={{
          color: '#6b7280',
          fontSize: 14,
          textAlign: 'center',
          lineHeight: 20
        }}>
          Your contributions help bring clean energy to communities in need.
        </Text>
      </View>
    </ScrollView>
  );
};

export default ProjectDetails;