import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { ArrowLeft, Edit, Trash2, Eye } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { db, auth } from '@/config/firebaseConfig';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { ProjectDetailsModal } from '@/components/ProjectDetailsModal';

type ProjectStatus = 'Pending' | 'Published' | 'Funded' | 'Rejected' | 'Approved';

interface RequestedProjectType {
  id: number;
  docId: string;
  title: string;
  status: ProjectStatus;
  image: string;
  submittedDate?: string;
}

const MyRequestProject = () => {
  const router = useRouter();
  const [requestedProjects, setRequestedProjects] = useState<RequestedProjectType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('No user logged in');
        setIsLoading(false);
        return;
      }

      // Query Firestore for user's project requests
      const projectsRef = collection(db, 'projectRequests');
      const q = query(
        projectsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const projects: RequestedProjectType[] = [];

      querySnapshot.forEach((document) => {
        const data = document.data();
        projects.push({
          id: parseInt(document.id.slice(-6), 36), // Convert doc ID to number
          docId: document.id, // Store Firestore document ID
          title: data.projectTitle,
          status: data.status as ProjectStatus,
          image: data.energySystem === 'Solar Panel' 
            ? 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400'
            : data.energySystem === 'Wind Turbine'
            ? 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=400'
            : 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400',
          submittedDate: data.submittedDate?.toDate?.()?.toLocaleDateString() || 'Recent'
        });
      });

      setRequestedProjects(projects);
    } catch (error) {
      console.error('Fetch error:', error);
      // Use mock data as fallback
      setRequestedProjects(mockProjects);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for development
  const mockProjects: RequestedProjectType[] = [
    {
      id: 1,
      docId: 'mock1',
      title: 'Solar Panel Installation',
      status: 'Pending',
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400',
      submittedDate: '2024-03-15'
    },
    {
      id: 2,
      docId: 'mock2',
      title: 'Wind Turbine Project for',
      status: 'Published',
      image: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=400',
      submittedDate: '2024-02-10'
    },
    {
      id: 3,
      docId: 'mock3',
      title: 'Hydroelectric Dam Upgrade',
      status: 'Approved',
      image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400',
      submittedDate: '2024-01-05'
    }
  ];

  const handleDeleteProject = async (project: RequestedProjectType) => {
    if (project.status !== 'Pending') {
      Alert.alert(
        'Cannot Delete',
        `You can only delete projects with "Pending" status. This project is "${project.status}".`
      );
      return;
    }

    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${project.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'projectRequests', project.docId));
              Alert.alert('Success', 'Project deleted successfully');
              fetchProjects(); // Refresh the list
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete project');
            }
          }
        }
      ]
    );
  };

  const handleEditProject = (project: RequestedProjectType) => {
    if (project.status !== 'Pending') {
      Alert.alert(
        'Cannot Edit',
        `You can only edit projects with "Pending" status. This project is "${project.status}".`
      );
      return;
    }

    // Navigate to RequestProject page with docId for editing
    router.push({
      pathname: '/(root)/RequestProject',
      params: { docId: project.docId }
    } as any);
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'Pending':
        return '#fbbf24';
      case 'Published':
        return '#a3e635';
      case 'Funded':
        return '#10b981';
      case 'Approved':
        return '#22c55e';
      case 'Rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const handleViewProject = async (project: RequestedProjectType) => {
    try {
      // Fetch full project details from Firestore
      const projectRef = doc(db, 'projectRequests', project.docId);
      const projectSnap = await getDoc(projectRef);
      
      if (projectSnap.exists()) {
        const fullProjectData = {
          ...projectSnap.data(),
          docId: project.docId,
          id: project.id
        };
        setSelectedProject(fullProjectData);
        setShowDetailsModal(true);
      } else {
        Alert.alert('Error', 'Project details not found');
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
      Alert.alert('Error', 'Failed to load project details');
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <View style={{ flex: 1, backgroundColor: '#122119' }}>


        {/* Projects List */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
              <ActivityIndicator size="large" color="#10b981" />
              <Text style={{ color: '#6b7280', fontSize: 14, marginTop: 12 }}>Loading your projects...</Text>
            </View>
          ) : requestedProjects.length > 0 ? (
            requestedProjects.map((project) => (
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
                
                {/* Action Buttons Row */}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {/* Edit Button - Only for Pending */}
                  {project.status === 'Pending' && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#3B82F6',
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4
                      }}
                      onPress={() => handleEditProject(project)}
                      activeOpacity={0.8}
                    >
                      <Edit size={16} color="white" />
                      <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>
                        Edit
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  {/* Delete Button - Only for Pending */}
                  {project.status === 'Pending' && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#EF4444',
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4
                      }}
                      onPress={() => handleDeleteProject(project)}
                      activeOpacity={0.8}
                    >
                      <Trash2 size={16} color="white" />
                      <Text style={{ color: 'white', fontSize: 13, fontWeight: '600' }}>
                        Delete
                      </Text>
                    </TouchableOpacity>
                  )}
                  {/* View Button */}
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#2d5a2d',
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                    onPress={() => handleViewProject(project)}
                    activeOpacity={0.8}
                  >
                    <Eye size={14} color="white" />
                    <Text style={{ color: 'white', fontSize: 13, fontWeight: '600', marginLeft: 4 }}>
                      View
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            ))
          ) : (
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

      {/* Project Details Modal */}
      <ProjectDetailsModal
        visible={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
      />
    </>
  );
};

export default MyRequestProject;