import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, StatusBar, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import {
  ArrowLeft,
} from 'lucide-react-native';
import { icons } from '@/constants/icons';
import { db } from '@/config/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

type ProjectStatus = 'Published' | 'Funded' | 'In Progress' | 'Completed' | 'Approved';
type FilterCategory = 'All' | 'Solar' | 'Wind' | 'Hydro';
interface ProjectType {
  id: number;
  docId?: string;
  status: ProjectStatus;
  title: string;
  description: string;
  image: string;
  category: FilterCategory;
  // Future backend fields
  fundingGoal?: number;
  currentFunding?: number;
  actualAmount?: number;
  location?: string;
  startDate?: string;
  endDate?: string;
  donors?: number;
}

const Project = () => {
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    fetchApprovedProjects();
  }, []);

  // Refresh projects when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchApprovedProjects();
    }, [])
  );

  const filters: FilterCategory[] = ['All', 'Solar', 'Wind', 'Hydro'];

  // Fetch approved projects from Firebase
  const fetchApprovedProjects = async () => {
    try {
      const projectsRef = collection(db, 'projectRequests');
      const q = query(projectsRef, where('status', '==', 'Approved'));
      
      const querySnapshot = await getDocs(q);
      const fetchedProjects: ProjectType[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Map energy system to category
        let category: FilterCategory = 'All';
        if (data.energySystem === 'Solar Panel') category = 'Solar';
        else if (data.energySystem === 'Wind Turbine') category = 'Wind';
        else if (data.energySystem === 'Hydroelectric') category = 'Hydro';
        
        fetchedProjects.push({
          id: parseInt(doc.id.slice(-6), 36),
          docId: doc.id,
          status: 'Approved',
          title: data.projectTitle || 'Untitled Project',
          description: data.projectDescription || 'No description available',
          image: category === 'Solar' 
            ? 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop'
            : category === 'Wind'
            ? 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=400&h=300&fit=crop'
            : 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop',
          category,
          fundingGoal: data.fundingGoal || 50000,
          currentFunding: data.currentFunding || 0,
          actualAmount: data.actualAmount || data.currentFunding || 0,
          location: data.location || '',
        });
      });
      
      setProjects(fetchedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Fallback to mock data if Firebase fails
      setProjects([
        {
          id: 3,
          status: 'Approved',
          title: 'Hydroelectric Dam Upgrade',
          description:
            'Contribute to upgrading an existing hydroelectric dam to increase efficiency and provide more clean energy to the region.',
          image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop',
          category: 'Hydro',
          fundingGoal: 50000,
          currentFunding: 32000,
          actualAmount: 35000,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesFilter = selectedFilter === 'All' || project.category === selectedFilter;
    const matchesSearch =
      searchQuery === '' ||
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const isApproved = project.status === 'Approved';
    return matchesFilter && matchesSearch && isApproved;
  });

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'Published':
        return 'text-gray-400';
      case 'Funded':
        return 'text-green-400';
      case 'In Progress':
        return 'text-orange-400';
      case 'Completed':
        return 'text-blue-400';
      case 'Approved':
        return 'text-green-500';
      default:
        return 'text-gray-400';
    }
  };

  const handleProjectPress = (projectId: number) => {
    // Navigate to project details with project ID
    router.push({
      pathname: '/(root)/ProjectDetails',
      params: { id: projectId }
    } as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#122119]" edges={['bottom']}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="flex-row justify-between items-center px-5 pt-20">
        <TouchableOpacity>
          <ArrowLeft size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold ml-8">Projects</Text>
        <TouchableOpacity className='bg-[#2a3e3e] rounded-full px-3 py-2 flex-row items-center gap-2'>
            <Image source={icons.coinH}  className="size-5 mb-1" />
            <Text className="text-white font-semibold">120</Text>
            <Text className="text-gray-400">/5</Text>
          </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-4 flex-row gap-3 mt-5">
        <View className="flex-1 bg-[#2a3e3e] rounded-xl px-4 py-3 flex-row items-center">
          <Text className="text-[#1AE57D] text-lg mr-2">🔍</Text>
          <TextInput
            placeholder="Search projects..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-gray-300 text-base"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity className="bg-[#2a3e3e] rounded-xl px-4 py-3 justify-center items-center">
          <Text className="text-white text-lg">⚡</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="bg-[#2a3e3e] rounded-xl px-4 py-3 justify-center items-center"
          onPress={() => router.push('/(root)/ProjectSetting')}
        >
          <Text className="text-white text-lg">⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Buttons */}
      <View className="py-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setSelectedFilter(filter)}
              className={`px-6 py-2.5 rounded-full ${
                selectedFilter === filter ? 'bg-[#1AE57D]' : 'bg-[#2a3e3e]'
              }`}
            >
              <Text className={`text-base font-semibold ${selectedFilter === filter ? 'text-black' : 'text-white'}`}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Projects List */}
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View className="flex-1 justify-center items-center py-20">
            <ActivityIndicator size="large" color="#1AE57D" />
            <Text className="text-gray-400 text-base mt-4">Loading projects...</Text>
          </View>
        ) : filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <TouchableOpacity
              key={project.id}
              className="bg-[#2a3e3e] rounded-2xl mb-4 overflow-hidden"
              onPress={() => handleProjectPress(project.id)}
              activeOpacity={0.8}
            >
              {/* Image */}
              <View className="w-full h-48">
                <Image
                  source={{ uri: project.image }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
              
              {/* Text Content */}
              <View className="p-4">
                <Text className={`text-sm font-semibold mb-2 ${getStatusColor(project.status)}`}>
                  {project.status}
                </Text>
                <Text className="text-white text-xl font-bold mb-2" numberOfLines={2}>
                  {project.title}
                </Text>
                <Text className="text-gray-400 text-sm leading-5 mb-3" numberOfLines={3}>
                  {project.description}
                </Text>
                
                {/* Funding Progress */}
                {project.fundingGoal && project.currentFunding !== undefined && (
                  <View className="mt-2">
                    <Text className="text-gray-500 text-xs mb-1.5">
                      LKR {project.actualAmount || project.currentFunding} / {project.fundingGoal} Credits
                    </Text>
                    <View className="h-2 bg-[#122119] rounded-full overflow-hidden">
                      <View 
                        className="h-full bg-[#1AE57D] rounded-full"
                        style={{ width: `${Math.min(((project.actualAmount || project.currentFunding) / project.fundingGoal) * 100, 100)}%` }}
                      />
                    </View>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-gray-400 text-lg">No projects found</Text>
            <Text className="text-gray-500 text-sm mt-2">Try adjusting your filters</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Project;