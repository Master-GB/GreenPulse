import { View, Text, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import React, { useState } from 'react';

type ProjectStatus = 'Published' | 'Funded' | 'In Progress' | 'Completed';
type FilterCategory = 'All' | 'Solar' | 'Wind' | 'Hydro';

interface ProjectType {
  id: number;
  status: ProjectStatus;
  title: string;
  description: string;
  image: string;
  category: FilterCategory;
}

const Project = () => {
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filters: FilterCategory[] = ['All', 'Solar', 'Wind', 'Hydro'];

  const projects: ProjectType[] = [
    {
      id: 1,
      status: 'Published',
      title: 'Solar Power for Rural School',
      description:
        'Help us install solar panels to power a school in a remote village, providing sustainable energy for education.',
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
      category: 'Solar',
    },
    {
      id: 2,
      status: 'Funded',
      title: 'Wind Turbine for Coastal Community',
      description:
        'Support the installation of a wind turbine to provide clean energy for a coastal community, reducing reliance on fossil fuels.',
      image: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=400&h=300&fit=crop',
      category: 'Wind',
    },
    {
      id: 3,
      status: 'In Progress',
      title: 'Hydroelectric Dam Upgrade',
      description:
        'Contribute to upgrading an existing hydroelectric dam to increase efficiency and provide more clean energy to the region.',
      image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop',
      category: 'Hydro',
    },
    {
      id: 4,
      status: 'Completed',
      title: 'Biogas Plant for Farm',
      description:
        'Support the construction of a biogas plant on a farm to convert organic waste into clean energy, reducing emissions.',
      image: 'https://images.unsplash.com/photo-1614531341773-3bff8b7cb3fc?w=400&h=300&fit=crop',
      category: 'All',
    },
  ];

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

  return (
    <View className="flex-1 bg-[#122119]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 pt-12">
        <TouchableOpacity className="p-2">
          <Text className="text-white text-2xl">←</Text>
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Explore Projects</Text>
        <TouchableOpacity className="p-2">
          <Text className="text-white text-2xl">⚙</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-5 mt-8 flex-row gap-3">
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
        {filteredProjects.map((project) => (
          <TouchableOpacity
            key={project.id}
            className="bg-neutral-800 rounded-2xl overflow-hidden flex-row mb-4"
          >
            <View className="flex-1 p-5">
              <Text className={`text-sm font-semibold mb-2 ${getStatusColor(project.status)}`}>
                {project.status}
              </Text>
              <Text className="text-white text-xl font-bold mb-2">{project.title}</Text>
              <Text className="text-gray-400 text-sm leading-5">{project.description}</Text>
            </View>
            <View className="w-56 h-56">
              <Image
                source={{ uri: project.image }}
                className="w-full h-full rounded-2xl m-4"
                resizeMode="cover"
              />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

    </View>
  );
};

export default Project;
