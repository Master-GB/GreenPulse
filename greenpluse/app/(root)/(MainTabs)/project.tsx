import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
} from 'lucide-react-native';
import { icons } from '@/constants/icons';

type ProjectStatus = 'Published' | 'Funded' | 'In Progress' | 'Completed';
type FilterCategory = 'All' | 'Solar' | 'Wind' | 'Hydro';
interface ProjectType {
  id: number;
  status: ProjectStatus;
  title: string;
  description: string;
  image: string;
  category: FilterCategory;
  // Future backend fields
  fundingGoal?: number;
  currentFunding?: number;
  location?: string;
  startDate?: string;
  endDate?: string;
  donors?: number;
}

const Project = () => {
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const router = useRouter();

  const filters: FilterCategory[] = ['All', 'Solar', 'Wind', 'Hydro'];

  // Mock data - replace with API call in future
  const projects: ProjectType[] = [
    {
      id: 1,
      status: 'Published',
      title: 'Solar Power for Rural School',
      description:
        'Help us install solar panels to power a school in a remote village, providing sustainable energy for education.',
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
      category: 'Solar',
      fundingGoal: 10000,
      currentFunding: 7500,
    },
    {
      id: 2,
      status: 'Funded',
      title: 'Wind Turbine for Coastal Community',
      description:
        'Support the installation of a wind turbine to provide clean energy for a coastal community, reducing reliance on fossil fuels.',
      image: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=400&h=300&fit=crop',
      category: 'Wind',
      fundingGoal: 15000,
      currentFunding: 15000,
    },
    {
      id: 3,
      status: 'In Progress',
      title: 'Hydroelectric Dam Upgrade',
      description:
        'Contribute to upgrading an existing hydroelectric dam to increase efficiency and provide more clean energy to the region.',
      image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop',
      category: 'Hydro',
      fundingGoal: 50000,
      currentFunding: 32000,
    },
    {
      id: 4,
      status: 'Completed',
      title: 'Biogas Plant for Farm',
      description:
        'Support the construction of a biogas plant on a farm to convert organic waste into clean energy, reducing emissions.',
      image: 'https://images.unsplash.com/photo-1614531341773-3bff8b7cb3fc?w=400&h=300&fit=crop',
      category: 'All',
      fundingGoal: 8000,
      currentFunding: 8000,
    },
  ];

  // TODO: Replace with actual API call
  // const fetchProjects = async () => {
  //   try {
  //     const response = await fetch('YOUR_API_ENDPOINT/projects');
  //     const data = await response.json();
  //     setProjects(data);
  //   } catch (error) {
  //     console.error('Error fetching projects:', error);
  //   }
  // };

  const filteredProjects = projects.filter((project) => {
    const matchesFilter = selectedFilter === 'All' || project.category === selectedFilter;
    const matchesSearch =
      searchQuery === '' ||
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
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
    <SafeAreaView className="flex-1 bg-[#122119]">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View className="flex-row justify-between items-center px-5 py-1">
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
      <View className="px-8 mt-8 flex-row gap-3">
        <View className="flex-1 bg-neutral-700 rounded-xl px-4 py-3 flex-row items-center gap-3">
            <Text className="text-green-400 text-lg">🔍</Text>
            <TextInput
              placeholder="Search projects..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-gray-300"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
        </View>
        <TouchableOpacity className="bg-neutral-700 rounded-xl px-4 py-3 justify-center items-center">
            <Text className="text-white text-lg">⚡</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="bg-neutral-700 rounded-xl px-4 py-3 justify-center items-center"
            onPress={() => router.push('/(root)/ProjectSetting')}
          >
            <Text className="text-white text-lg">⚙️</Text>
          </TouchableOpacity>
      </View>

      {/* Filter Buttons */}
      <View className="py-5">
        <ScrollView
          horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-2"
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setSelectedFilter(filter)}
                className={`min-w-[80px] min-h-[20px] h-10 rounded-full justify-center items-center ${
                  selectedFilter === filter ? 'bg-green-700' : 'bg-green-800'
                }`}
              >
                <Text className="text-white text-base font-semibold">{filter}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
      </View>

      {/* Projects List */}
      <ScrollView
          className="px-5 pb-24 flex-1"
          showsVerticalScrollIndicator={false}
      >
        {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <TouchableOpacity
                key={project.id}
                className="bg-neutral-800 rounded-2xl overflow-hidden flex-row mb-4"
                onPress={() => handleProjectPress(project.id)}
                activeOpacity={0.8}
              >
                <View className="flex-1 p-5">
                  <Text className={`text-sm font-semibold mb-2 ${getStatusColor(project.status)}`}>
                    {project.status}
                  </Text>
                  <Text className="text-white text-xl font-bold mb-2">{project.title}</Text>
                  <Text className="text-gray-400 text-sm leading-5" numberOfLines={3}>
                    {project.description}
                  </Text>
                  
                  {/* Optional: Show funding progress */}
                  {project.fundingGoal && project.currentFunding !== undefined && (
                    <View className="mt-3">
                      <Text className="text-gray-500 text-xs mb-1">
                        {project.currentFunding} / {project.fundingGoal} Coins
                      </Text>
                      <View className="h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                        <View 
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${(project.currentFunding / project.fundingGoal) * 100}%` }}
                        />
                      </View>
                    </View>
                  )}
                </View>
                <View className="w-56 h-56">
                  <Image
                    source={{ uri: project.image }}
                    className="w-full h-full rounded-2xl m-4"
                    resizeMode="cover"
                  />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="flex-1 justify-center items-center py-20">
              <Text className="text-gray-400 text-lg">No projects found</Text>
            </View>
          )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Project;