import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StatusBar } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

type ProjectStatus = 'Pending' | 'Published' | 'Funded' | 'Rejected';

interface RequestedProjectType {
  id: number;
  title: string;
  status: ProjectStatus;
  image: string;
  submittedDate?: string;
}

const MyRequestProject = () => {
  const router = useRouter();

  // Mock data - replace with API call in future
  const requestedProjects: RequestedProjectType[] = [
    {
      id: 1,
      title: 'Solar Panel Installation',
      status: 'Pending',
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400',
      submittedDate: '2024-03-15'
    },
    {
      id: 2,
      title: 'Wind Turbine Project for',
      status: 'Published',
      image: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=400',
      submittedDate: '2024-02-10'
    },
    {
      id: 3,
      title: 'Hydroelectric Power for',
      status: 'Funded',
      image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400',
      submittedDate: '2024-01-05'
    }
  ];

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'Pending':
        return '#a3e635';
      case 'Published':
        return '#a3e635';
      case 'Funded':
        return '#a3e635';
      case 'Rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const handleViewProject = (projectId: number) => {
    // Navigate to project details
    router.push({
      pathname: '/(root)/RequestedProjectDetails',
      params: { id: projectId }
    } as any);
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <View style={{ flex: 1, backgroundColor: '#1a1a1a' }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 48,
          paddingBottom: 16,
          backgroundColor: '#1a1a1a'
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
            My Request Project
          </Text>
        </View>

        {/* Projects List */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {requestedProjects.map((project) => (
            <View
              key={project.id}
              style={{
                backgroundColor: '#1a2e1a',
                borderRadius: 20,
                padding: 16,
                marginBottom: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 16
              }}
            >
              {/* Project Image */}
              <Image
                source={{ uri: project.image }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 16,
                  backgroundColor: '#0a0a0a'
                }}
                resizeMode="cover"
              />

              {/* Project Info */}
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <Text style={{
                  color: 'white',
                  fontSize: 18,
                  fontWeight: '700',
                  marginBottom: 8,
                  lineHeight: 24
                }}>
                  {project.title}
                </Text>
                <Text style={{
                  color: getStatusColor(project.status),
                  fontSize: 16,
                  fontWeight: '500',
                  marginBottom: 12
                }}>
                  {project.status}
                </Text>
              </View>

              {/* View Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: '#2d5a2d',
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  borderRadius: 12
                }}
                onPress={() => handleViewProject(project.id)}
                activeOpacity={0.8}
              >
                <Text style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: '600'
                }}>
                  View
                </Text>
              </TouchableOpacity>
            </View>
          ))}

          {requestedProjects.length === 0 && (
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 60
            }}>
              <Text style={{ color: '#6b7280', fontSize: 16, textAlign: 'center' }}>
                No project requests yet
              </Text>
              <Text style={{ color: '#4b5563', fontSize: 14, marginTop: 8, textAlign: 'center' }}>
                Submit your first project request below
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom Button */}
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          paddingVertical: 20,
          paddingBottom: 32,
          backgroundColor: '#1a1a1a'
        }}>
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
            onPress={() => router.push('/(root)/RequestProject' as any)}
            activeOpacity={0.9}
          >
            <Text style={{
              color: '#1a1a1a',
              fontSize: 18,
              fontWeight: '700'
            }}>
              Request New Project
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default MyRequestProject;