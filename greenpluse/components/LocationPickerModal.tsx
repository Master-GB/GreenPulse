import React, { useState, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Alert, StyleSheet, Dimensions } from 'react-native';
import { MapPin, X, Check, Navigation, Crosshair } from 'lucide-react-native';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

interface LocationPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: string, coordinates?: { latitude: number; longitude: number }) => void;
  currentLocation?: string;
}

// Sri Lanka major cities and districts
const sriLankaLocations = [
  // Western Province
  { name: 'Colombo', district: 'Colombo', province: 'Western', lat: 6.9271, lng: 79.8612 },
  { name: 'Gampaha', district: 'Gampaha', province: 'Western', lat: 7.0840, lng: 80.0098 },
  { name: 'Kalutara', district: 'Kalutara', province: 'Western', lat: 6.5854, lng: 79.9607 },
  { name: 'Negombo', district: 'Gampaha', province: 'Western', lat: 7.2008, lng: 79.8358 },
  { name: 'Moratuwa', district: 'Colombo', province: 'Western', lat: 6.7730, lng: 79.8816 },
  
  // Central Province
  { name: 'Kandy', district: 'Kandy', province: 'Central', lat: 7.2906, lng: 80.6337 },
  { name: 'Matale', district: 'Matale', province: 'Central', lat: 7.4675, lng: 80.6234 },
  { name: 'Nuwara Eliya', district: 'Nuwara Eliya', province: 'Central', lat: 6.9497, lng: 80.7891 },
  
  // Southern Province
  { name: 'Galle', district: 'Galle', province: 'Southern', lat: 6.0535, lng: 80.2210 },
  { name: 'Matara', district: 'Matara', province: 'Southern', lat: 5.9549, lng: 80.5550 },
  { name: 'Hambantota', district: 'Hambantota', province: 'Southern', lat: 6.1429, lng: 81.1212 },
  
  // Northern Province
  { name: 'Jaffna', district: 'Jaffna', province: 'Northern', lat: 9.6615, lng: 80.0255 },
  { name: 'Kilinochchi', district: 'Kilinochchi', province: 'Northern', lat: 9.3961, lng: 80.3986 },
  { name: 'Mannar', district: 'Mannar', province: 'Northern', lat: 8.9810, lng: 79.9044 },
  
  // Eastern Province
  { name: 'Trincomalee', district: 'Trincomalee', province: 'Eastern', lat: 8.5874, lng: 81.2152 },
  { name: 'Batticaloa', district: 'Batticaloa', province: 'Eastern', lat: 7.7310, lng: 81.6747 },
  { name: 'Ampara', district: 'Ampara', province: 'Eastern', lat: 7.2976, lng: 81.6747 },
  
  // North Western Province
  { name: 'Kurunegala', district: 'Kurunegala', province: 'North Western', lat: 7.4863, lng: 80.3623 },
  { name: 'Puttalam', district: 'Puttalam', province: 'North Western', lat: 8.0362, lng: 79.8283 },
  
  // North Central Province
  { name: 'Anuradhapura', district: 'Anuradhapura', province: 'North Central', lat: 8.3114, lng: 80.4037 },
  { name: 'Polonnaruwa', district: 'Polonnaruwa', province: 'North Central', lat: 7.9403, lng: 81.0188 },
  
  // Uva Province
  { name: 'Badulla', district: 'Badulla', province: 'Uva', lat: 6.9934, lng: 81.0550 },
  { name: 'Monaragala', district: 'Monaragala', province: 'Uva', lat: 6.8728, lng: 81.3507 },
  
  // Sabaragamuwa Province
  { name: 'Ratnapura', district: 'Ratnapura', province: 'Sabaragamuwa', lat: 6.7056, lng: 80.3847 },
  { name: 'Kegalle', district: 'Kegalle', province: 'Sabaragamuwa', lat: 7.2513, lng: 80.3464 },
];

const { width, height } = Dimensions.get('window');

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  visible,
  onClose,
  onSelectLocation,
  currentLocation
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('All');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [markerPosition, setMarkerPosition] = useState({
    latitude: 7.8731, // Center of Sri Lanka
    longitude: 80.7718,
  });
  const [selectedAddress, setSelectedAddress] = useState('');
  const mapRef = useRef<MapView>(null);

  const provinces = ['All', 'Western', 'Central', 'Southern', 'Northern', 'Eastern', 'North Western', 'North Central', 'Uva', 'Sabaragamuwa'];

  const filteredLocations = sriLankaLocations.filter(loc => {
    const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         loc.district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvince = selectedProvince === 'All' || loc.province === selectedProvince;
    return matchesSearch && matchesProvince;
  });

  const handleGetCurrentLocation = async () => {
    setGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to get your current location');
        setGettingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Update marker position
      setMarkerPosition({ latitude, longitude });
      
      // Animate map to location
      mapRef.current?.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);

      // Reverse geocode to get address
      const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (addresses.length > 0) {
        const address = addresses[0];
        const locationString = `${address.city || address.district || address.region}, ${address.country}`;
        setSelectedAddress(locationString);
      } else {
        setSelectedAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSelectLocation = (location: typeof sriLankaLocations[0]) => {
    setMarkerPosition({ latitude: location.lat, longitude: location.lng });
    setSelectedAddress(`${location.name}, ${location.district}, Sri Lanka`);
    
    // Animate map to selected location
    mapRef.current?.animateToRegion({
      latitude: location.lat,
      longitude: location.lng,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    }, 1000);
    
    setShowMap(true);
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarkerPosition({ latitude, longitude });

    // Reverse geocode
    try {
      const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (addresses.length > 0) {
        const address = addresses[0];
        const locationString = `${address.city || address.district || address.region}, Sri Lanka`;
        setSelectedAddress(locationString);
      } else {
        setSelectedAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }
    } catch (error) {
      setSelectedAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    }
  };

  const handleConfirmLocation = () => {
    if (selectedAddress) {
      onSelectLocation(selectedAddress, markerPosition);
      onClose();
    } else {
      Alert.alert('No Location Selected', 'Please select a location on the map');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <MapPin size={24} color="#1AE57D" />
              <Text style={styles.headerTitle}>Select Location</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* View Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, showMap && styles.toggleButtonActive]}
              onPress={() => setShowMap(true)}
            >
              <MapPin size={18} color={showMap ? 'black' : '#9ca3af'} />
              <Text style={[styles.toggleText, showMap && styles.toggleTextActive]}>
                Map View
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, !showMap && styles.toggleButtonActive]}
              onPress={() => setShowMap(false)}
            >
              <Text style={[styles.toggleText, !showMap && styles.toggleTextActive]}>
                List View
              </Text>
            </TouchableOpacity>
          </View>

          {/* Current Location Button */}
          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={handleGetCurrentLocation}
            disabled={gettingLocation}
          >
            <Navigation size={20} color="#1AE57D" />
            <Text style={styles.currentLocationText}>
              {gettingLocation ? 'Getting location...' : 'Use Current Location'}
            </Text>
          </TouchableOpacity>

          {/* Selected Address Display */}
          {selectedAddress && (
            <View style={styles.selectedAddressContainer}>
              <MapPin size={16} color="#1AE57D" />
              <Text style={styles.selectedAddressText}>{selectedAddress}</Text>
            </View>
          )}

          {showMap ? (
            /* Map View */
            <>
              <View style={styles.mapContainer}>
                <MapView
                  ref={mapRef}
                  style={styles.map}
                  initialRegion={{
                    latitude: 7.8731,
                    longitude: 80.7718,
                    latitudeDelta: 3,
                    longitudeDelta: 3,
                  }}
                  onPress={handleMapPress}
                  provider={PROVIDER_GOOGLE}
                >
                  <Marker
                    coordinate={markerPosition}
                    draggable
                    onDragEnd={handleMapPress}
                  >
                    <View style={styles.customMarker}>
                      <MapPin size={32} color="#1AE57D" fill="#1AE57D" />
                    </View>
                  </Marker>
                </MapView>
                
                {/* Map Instructions */}
                <View style={styles.mapInstructions}>
                  <Crosshair size={16} color="#1AE57D" />
                  <Text style={styles.mapInstructionsText}>
                    Tap on map or drag marker to select location
                  </Text>
                </View>
              </View>

              {/* Confirm Button */}
              <View style={styles.confirmContainer}>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirmLocation}
                >
                  <Check size={20} color="black" />
                  <Text style={styles.confirmButtonText}>Confirm Location</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            /* List View */
            <>
              {/* Province Filter */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.provinceScroll}
                contentContainerStyle={styles.provinceScrollContent}
              >
                {provinces.map((province) => (
                  <TouchableOpacity
                    key={province}
                    style={[
                      styles.provinceChip,
                      selectedProvince === province && styles.provinceChipActive
                    ]}
                    onPress={() => setSelectedProvince(province)}
                  >
                    <Text style={[
                      styles.provinceChipText,
                      selectedProvince === province && styles.provinceChipTextActive
                    ]}>
                      {province}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Location List */}
              <ScrollView style={styles.locationList} showsVerticalScrollIndicator={false}>
            {filteredLocations.map((location, index) => (
              <TouchableOpacity
                key={index}
                style={styles.locationItem}
                onPress={() => handleSelectLocation(location)}
              >
                <View style={styles.locationIcon}>
                  <MapPin size={20} color="#1AE57D" />
                </View>
                <View style={styles.locationInfo}>
                  <Text style={styles.locationName}>{location.name}</Text>
                  <Text style={styles.locationDetails}>
                    {location.district} • {location.province} Province
                  </Text>
                </View>
                {currentLocation?.includes(location.name) && (
                  <Check size={20} color="#1AE57D" />
                )}
              </TouchableOpacity>
            ))}
            {filteredLocations.length === 0 && (
              <View style={styles.emptyState}>
                <MapPin size={48} color="#6b7280" />
                <Text style={styles.emptyText}>No locations found</Text>
              </View>
            )}
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#122119',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a3e3e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1AE57D20',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1AE57D',
    marginBottom: 16,
  },
  currentLocationText: {
    color: '#1AE57D',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  provinceScroll: {
    maxHeight: 50,
    marginBottom: 16,
  },
  provinceScrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  provinceChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2a3e3e',
    marginRight: 8,
  },
  provinceChipActive: {
    backgroundColor: '#1AE57D',
  },
  provinceChipText: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '600',
  },
  provinceChipTextActive: {
    color: 'black',
  },
  locationList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a3e3e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1AE57D20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationDetails: {
    color: '#9ca3af',
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
    marginTop: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#2a3e3e',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#1AE57D',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  toggleTextActive: {
    color: 'black',
  },
  selectedAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1AE57D20',
    marginHorizontal: 20,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1AE57D',
  },
  selectedAddressText: {
    color: '#1AE57D',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapInstructions: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(18, 33, 25, 0.9)',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapInstructionsText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  confirmContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  confirmButton: {
    backgroundColor: '#1AE57D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  confirmButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});
