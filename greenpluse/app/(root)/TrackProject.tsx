import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StatusBar, ActivityIndicator, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Calendar, DollarSign, Zap } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { db, auth } from '@/config/firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

interface DonatedProject {
  id: string;
  projectId: string;
  projectTitle: string;
  amount?: number;
  donatedAt?: string;
  projectLocation?: string;
  projectDescription?: string;
  energySystem?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
}

const TrackProject = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const singleProjectId = params.projectId as string | undefined;
  
  const [donatedProjects, setDonatedProjects] = useState<DonatedProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<DonatedProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMap, setIsDarkMap] = useState(true);
  const [mapRegion, setMapRegion] = useState({
    latitude: 7.8731,
    longitude: 80.7718,
    latitudeDelta: 3.5,
    longitudeDelta: 3.5,
  });
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (singleProjectId) {
      // If coming from ProjectDetails, show only that project
      fetchSingleProject(singleProjectId);
    } else {
      // Otherwise show all donated projects
      fetchDonatedProjects();
    }
    startPulseAnimation();
  }, [singleProjectId]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const fetchSingleProject = async (projectId: string) => {
    try {
      const projectRef = doc(db, 'projectRequests', projectId);
      const projectDoc = await getDoc(projectRef);
      
      if (projectDoc.exists()) {
        const projectData = projectDoc.data();
        
        // Use saved coordinates if available, otherwise use default Sri Lanka coordinates
        let projectLatitude = projectData.latitude;
        let projectLongitude = projectData.longitude;
        
        // If no coordinates saved, use default Sri Lanka center
        if (!projectLatitude || !projectLongitude) {
          projectLatitude = 7.8731;
          projectLongitude = 80.7718;
        }

        const project: DonatedProject = {
          id: projectDoc.id,
          projectId: projectId,
          projectTitle: projectData.projectTitle || 'Untitled Project',
          projectLocation: projectData.location || projectData.address || 'Sri Lanka',
          projectDescription: projectData.projectDescription || 'No description available',
          energySystem: projectData.energySystem || 'Renewable Energy',
          latitude: projectLatitude,
          longitude: projectLongitude,
          status: projectData.status || 'Active',
        };

        setDonatedProjects([project]);
        setSelectedProject(project);
        
        // Center map on project location
        if (projectLatitude && projectLongitude) {
          setMapRegion({
            latitude: projectLatitude,
            longitude: projectLongitude,
            latitudeDelta: 0.3,
            longitudeDelta: 0.3,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDonatedProjects = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('No user logged in');
        setLoading(false);
        return;
      }

      // Fetch user's donations
      const donationsRef = collection(db, 'ProjectDonation');
      const q = query(donationsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);

      const projects: DonatedProject[] = [];
      const projectIds = new Set<string>();

      // Get unique project IDs
      querySnapshot.forEach((donationDoc) => {
        const data = donationDoc.data();
        if (data.projectId && !projectIds.has(data.projectId)) {
          projectIds.add(data.projectId);
        }
      });

      // Fetch project details for each unique project
      for (const projectId of projectIds) {
        try {
          const projectRef = doc(db, 'projectRequests', projectId);
          const projectDoc = await getDoc(projectRef);
          
          if (projectDoc.exists()) {
            const projectData = projectDoc.data();
            
            // Calculate total donated amount for this project by this user
            let totalAmount = 0;
            let latestDonationDate = '';
            
            querySnapshot.forEach((donationDoc) => {
              const donationData = donationDoc.data();
              if (donationData.projectId === projectId) {
                totalAmount += donationData.amount || 0;
                if (!latestDonationDate || donationData.donatedAt > latestDonationDate) {
                  latestDonationDate = donationData.donatedAt?.toDate?.()?.toLocaleDateString() || 'Recent';
                }
              }
            });

            // Use saved coordinates if available, otherwise use default Sri Lanka coordinates
            let projectLatitude = projectData.latitude;
            let projectLongitude = projectData.longitude;
            
            // If no coordinates saved, use default Sri Lanka center
            if (!projectLatitude || !projectLongitude) {
              projectLatitude = 7.8731;
              projectLongitude = 80.7718;
            }

            projects.push({
              id: projectDoc.id,
              projectId: projectId,
              projectTitle: projectData.projectTitle || 'Untitled Project',
              amount: totalAmount,
              donatedAt: latestDonationDate,
              projectLocation: projectData.location || projectData.address || 'Sri Lanka',
              projectDescription: projectData.projectDescription || 'No description available',
              energySystem: projectData.energySystem || 'Renewable Energy',
              latitude: projectLatitude,
              longitude: projectLongitude,
              status: projectData.status || 'In Progress',
            });
          }
        } catch (error) {
          console.error('Error fetching project details:', error);
        }
      }

      setDonatedProjects(projects);
      if (projects.length > 0) {
        setSelectedProject(projects[0]);
        // Center map on first project
        if (projects[0].latitude && projects[0].longitude) {
          setMapRegion({
            latitude: projects[0].latitude,
            longitude: projects[0].longitude,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching donated projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (project: DonatedProject) => {
    setSelectedProject(project);
    if (project.latitude && project.longitude && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: project.latitude,
        longitude: project.longitude,
        latitudeDelta: 0.3,
        longitudeDelta: 0.3,
      }, 1000);
    }
  };

  const getEnergyIcon = (energySystem?: string) => {
    if (energySystem?.includes('Solar')) return '☀️';
    if (energySystem?.includes('Wind')) return '💨';
    if (energySystem?.includes('Hydro')) return '💧';
    return '⚡';
  };

  const darkMapStyle = [
    {
      "elementType": "geometry",
      "stylers": [{ "color": "#1a1a1a" }]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#8a8a8a" }]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [{ "color": "#1a1a1a" }]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{ "color": "#2a3e3e" }]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [{ "color": "#2c2c2c" }]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [{ "color": "#252525" }]
    }
  ];

  const lightMapStyle = [
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{ "color": "#a2daf2" }]
    },
    {
      "featureType": "landscape",
      "elementType": "geometry",
      "stylers": [{ "color": "#f5f5f5" }]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [{ "color": "#ffffff" }]
    },
    {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [{ "color": "#e8e8e8" }]
    }
  ];

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#122119]">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1AE57D" />
          <Text className="text-gray-400 text-sm mt-3">Loading your projects...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#122119]" edges={['top']}>
      <StatusBar barStyle="light-content" />

      

      {donatedProjects.length === 0 ? (
        <View className="flex-1 justify-center items-center px-5">
          <Text className="text-white text-xl font-bold mb-2">
            {singleProjectId ? 'Location Not Available' : 'No Projects Yet'}
          </Text>
          <Text className="text-gray-400 text-center mb-6">
            {singleProjectId 
              ? 'This project does not have location information available'
              : 'Start donating to projects to track their locations and progress'
            }
          </Text>
          <TouchableOpacity
            className="bg-[#1AE57D] px-8 py-4 rounded-2xl"
            onPress={() => router.back()}
          >
            <Text className="text-[#122119] text-base font-bold">
              {singleProjectId ? 'Go Back' : 'Explore Projects'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Map View */}
          <View className="h-[45%] bg-[#2a3e3e] mx-5 rounded-3xl overflow-hidden mb-4">
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={{ flex: 1 }}
              initialRegion={mapRegion}
              customMapStyle={isDarkMap ? darkMapStyle : lightMapStyle}
            >
              {donatedProjects.map((project) => (
                project.latitude && project.longitude && (
                  <Marker
                    key={project.id}
                    coordinate={{
                      latitude: project.latitude,
                      longitude: project.longitude,
                    }}
                    onPress={() => handleProjectSelect(project)}
                  >
                    <Animated.View
                      style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {/* Pulsing Circle for selected project */}
                      {selectedProject?.id === project.id && (
                        <Animated.View
                          style={{
                            position: 'absolute',
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: '#1AE57D',
                            opacity: 0.3,
                            transform: [{ scale: pulseAnim }],
                          }}
                        />
                      )}
                      {/* Marker Pin */}
                      <View
                        style={{
                          backgroundColor: selectedProject?.id === project.id ? '#1AE57D' : '#A855F7',
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderWidth: 3,
                          borderColor: 'white',
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.5,
                          shadowRadius: 4,
                          elevation: 5,
                        }}
                      >
                        <Text style={{ fontSize: 16 }}>
                          {getEnergyIcon(project.energySystem)}
                        </Text>
                      </View>
                    </Animated.View>
                  </Marker>
                )
              ))}
            </MapView>

            {/* Map Theme Toggle */}
            <TouchableOpacity
              className="absolute top-4 left-4 bg-[#122119]/90 rounded-xl p-3 flex-row items-center"
              onPress={() => setIsDarkMap(!isDarkMap)}
              activeOpacity={0.8}
            >
              <Text className="text-2xl mr-2">{isDarkMap ? '🌙' : '☀️'}</Text>
              <Text className="text-white text-xs font-semibold">
                {isDarkMap ? 'Dark' : 'Light'}
              </Text>
            </TouchableOpacity>

            {/* Map Legend */}
            <View className="absolute top-4 right-4 bg-[#122119]/90 rounded-xl p-3">
              <Text className="text-white text-xs font-bold mb-2">Legend</Text>
              <View className="flex-row items-center mb-1">
                <View className="w-3 h-3 rounded-full bg-[#1AE57D] mr-2" />
                <Text className="text-gray-300 text-xs">Selected</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-[#A855F7] mr-2" />
                <Text className="text-gray-300 text-xs">Your Projects</Text>
              </View>
            </View>
          </View>

          {/* Project Details List */}
          <View className="flex-1 px-5">
            <Text className="text-white text-lg font-bold mb-3">
              {singleProjectId ? 'Project Location' : `Your Donated Projects (${donatedProjects.length})`}
            </Text>
            
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {donatedProjects.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  onPress={() => handleProjectSelect(project)}
                  activeOpacity={0.8}
                  className={`rounded-2xl p-4 mb-3 ${
                    selectedProject?.id === project.id 
                      ? 'bg-[#1AE57D]/20 border-2 border-[#1AE57D]' 
                      : 'bg-[#2a3e3e]'
                  }`}
                >
                  <View className="flex-row items-start">
                    {/* Energy Icon */}
                    <View className="w-12 h-12 rounded-xl bg-[#1AE57D]/20 justify-center items-center mr-3">
                      <Text className="text-2xl">{getEnergyIcon(project.energySystem)}</Text>
                    </View>

                    {/* Project Info */}
                    <View className="flex-1">
                      <Text className="text-white text-base font-bold mb-1" numberOfLines={2}>
                        {project.projectTitle}
                      </Text>
                      
                      <View className="flex-row items-center mb-1">
                        <MapPin size={14} color="#9ca3af" />
                        <Text className="text-gray-400 text-xs ml-1" numberOfLines={1}>
                          {project.projectLocation}
                        </Text>
                      </View>

                      {!singleProjectId && project.amount && (
                        <View className="flex-row items-center mb-1">
                          <DollarSign size={14} color="#1AE57D" />
                          <Text className="text-[#1AE57D] text-xs ml-1 font-semibold">
                            Donated: {project.amount} LKR
                          </Text>
                        </View>
                      )}

                      {!singleProjectId && project.donatedAt && (
                        <View className="flex-row items-center">
                          <Calendar size={14} color="#9ca3af" />
                          <Text className="text-gray-400 text-xs ml-1">
                            {project.donatedAt}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Status Badge */}
                    <View className={`px-3 py-1 rounded-lg ${
                      project.status === 'Completed' ? 'bg-green-500/20' :
                      project.status === 'In Progress' ? 'bg-yellow-500/20' :
                      'bg-blue-500/20'
                    }`}>
                      <Text className={`text-xs font-semibold ${
                        project.status === 'Completed' ? 'text-green-400' :
                        project.status === 'In Progress' ? 'text-yellow-400' :
                        'text-blue-400'
                      }`}>
                        {project.status}
                      </Text>
                    </View>
                  </View>

                  {/* Selected Indicator */}
                  {selectedProject?.id === project.id && (
                    <View className="mt-3 pt-3 border-t border-[#1AE57D]/30">
                      <Text className="text-[#1AE57D] text-xs font-semibold text-center">
                        📍 Viewing on map
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default TrackProject;
