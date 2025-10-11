import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
  fundingGoal?: number;
  currentFunding?: number;
  actualAmount?: number;
  location?: string;
  startDate?: string;
  endDate?: string;
  donors?: number;
}

const ProjectDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [project, setProject] = useState<ProjectType | null>(null);
  const [loading, setLoading] = useState(true);

  const donors = [
    { id: 1, image: 'https://i.pravatar.cc/150?img=1' },
    { id: 2, image: 'https://i.pravatar.cc/150?img=2' },
    { id: 3, image: 'https://i.pravatar.cc/150?img=3' }
  ];

  const handleDonatePress = () => {
    if (project) {
      router.push({
        pathname: '/(root)/PaymentPage',
        params: {
          projectId: project.docId,
          projectTitle: project.title,
          currentAmount: fundingAmount.toString(),
          goalAmount: fundingGoal.toString()
        }
      } as any);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      // Fetch all approved projects from Firebase
      const projectsRef = collection(db, 'projectRequests');
      const q = query(projectsRef, where('status', '==', 'Approved'));
      
      const querySnapshot = await getDocs(q);
      let foundProject: ProjectType | null = null;
      
      querySnapshot.forEach((doc) => {
        const projectId = parseInt(doc.id.slice(-6), 36);
        
        // Match the project by ID
        if (projectId === parseInt(id as string)) {
          const data = doc.data();
          
          // Map energy system to category
          let category: FilterCategory = 'All';
          if (data.energySystem === 'Solar Panel') category = 'Solar';
          else if (data.energySystem === 'Wind Turbine') category = 'Wind';
          else if (data.energySystem === 'Hydroelectric') category = 'Hydro';
          
          foundProject = {
            id: projectId,
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
          };
        }
      });
      
      if (foundProject) {
        setProject(foundProject);
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
      // Fallback to mock data
      const mockProject: ProjectType = {
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
      };
      setProject(mockProject);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'Published':
        return '#9ca3af';
      case 'Funded':
        return '#10b981';
      case 'In Progress':
        return '#f59e0b';
      case 'Completed':
        return '#3b82f6';
      case 'Approved':
        return '#22c55e';
      default:
        return '#9ca3af';
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#122119', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1AE57D" />
      </View>
    );
  }

  if (!project) {
    return (
      <View style={{ flex: 1, backgroundColor: '#122119', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'white', fontSize: 18 }}>Project not found</Text>
      </View>
    );
  }

  const fundingAmount = project.actualAmount || project.currentFunding || 0;
  const fundingGoal = project.fundingGoal || 0;
  const fundingPercentage = fundingGoal > 0 ? (fundingAmount / fundingGoal) * 100 : 0;
  const isFullyFunded = fundingAmount >= fundingGoal;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#122119' }}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Image */}
      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
        <Image
          source={{ uri: project.image }}
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
          {project.title}
        </Text>
        <Text style={{
          color: '#9ca3af',
          fontSize: 15,
          lineHeight: 24,
          marginBottom: 16
        }}>
          {project.description}
        </Text>
        <Text style={{
          color: '#d1d5db',
          fontSize: 16,
          fontWeight: '600',
          marginBottom: 12
        }}>
          {project.category} Energy Project
        </Text>
        <View style={{
          backgroundColor: getStatusColor(project.status),
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 12,
          alignSelf: 'flex-start'
        }}>
          <Text style={{ color: 'white', fontSize: 15, fontWeight: '600' }}>
            {project.status}
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
            source={{ uri: project.image }}
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
            {project.category} Installation
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
            Community Benefits
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
          LKR {fundingAmount.toLocaleString()} / {fundingGoal.toLocaleString()} Credits
        </Text>
        <View style={{
          width: '100%',
          height: 12,
          backgroundColor: '#2a2a2a',
          borderRadius: 6,
          overflow: 'hidden'
        }}>
          <View style={{
            width: `${fundingPercentage}%`,
            height: '100%',
            backgroundColor: '#1AE57D',
            borderRadius: 6
          }} />
        </View>
        <Text style={{
          color: isFullyFunded ? '#22c55e' : '#1AE57D',
          fontSize: 14,
          fontWeight: '600',
          marginTop: 8
        }}>
          {fundingPercentage >= 100 ? '100% Funded - Goal Reached! 🎉' : `${fundingPercentage.toFixed(1)}% Funded`}
        </Text>
      </View>
      
      {/* Top Donors */}
      <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
        <Text style={{
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
        {isFullyFunded ? (
          <View style={{
            backgroundColor: '#2a3e3e',
            paddingVertical: 18,
            borderRadius: 16,
            alignItems: 'center',
            borderWidth: 2,
            borderColor: '#22c55e'
          }}>
            <Text style={{
              color: '#22c55e',
              fontSize: 18,
              fontWeight: '700',
              marginBottom: 4
            }}>
              ✓ Fully Funded
            </Text>
            <Text style={{
              color: '#9ca3af',
              fontSize: 14
            }}>
              This project has reached its funding goal
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={{
              backgroundColor: '#1AE57D',
              paddingVertical: 18,
              borderRadius: 16,
              alignItems: 'center',
              elevation: 4,
              shadowColor: '#1AE57D',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8
            }}
            onPress={handleDonatePress}
            activeOpacity={0.9}
          >
            <Text style={{
              color: 'black',
              fontSize: 18,
              fontWeight: '700'
            }}>
              Donate Now
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Track Project Button */}
      <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#1AEE',
            paddingVertical: 16,
            borderRadius: 16,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            elevation: 4,
            shadowColor: '#A855F7',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8
          }}
          onPress={() => router.push({
            pathname: '/TrackProject',
            params: { 
              projectId: project.docId,
              projectTitle: project.title,
              location: project.location
            }
          } as any)}
          activeOpacity={0.9}
        >
          <Text style={{
            color: 'white',
            fontSize: 18,
            fontWeight: '700',
            marginRight: 8
          }}>
            📍 Track Project Location
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
