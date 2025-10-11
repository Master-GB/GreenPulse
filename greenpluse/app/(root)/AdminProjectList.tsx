import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import { ArrowLeft, FolderCheck, Clock, CheckCircle, XCircle, TrendingUp, User, MapPin, DollarSign, Filter } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { db, auth } from '@/config/firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { isAdmin } from '@/utils/adminAuth';

type ProjectStatus = 'Pending' | 'Approved' | 'Rejected' | 'Implemented' | 'Funded' | 'Published';
type FilterType = 'all' | 'pending' | 'approved' | 'rejected' | 'funded' | 'implemented' | 'published';

interface Project {
  id: string;
  docId: string;
  projectTitle: string;
  projectDescription?: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  location: string;
  energySystem: string;
  status: ProjectStatus;
  createdAt: any;
  fundingGoal?: number;
  currentFunding?: number;
  progress?: number;
}

const AdminProjectList = () => {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('pending');

  useEffect(() => {
    verifyAdminAccess();
  }, []);

  const verifyAdminAccess = async () => {
    const user = auth.currentUser;
    if (!user || !isAdmin()) {
      Alert.alert('Access Denied', 'Admin access required');
      router.back();
      return;
    }

    const { checkAdminAccess } = await import('@/utils/adminAuth');
    const hasAccess = await checkAdminAccess();
    if (!hasAccess) {
      router.replace('/AdminLogin' as any);
      return;
    }

    fetchAllProjects();
  };

  const fetchAllProjects = async () => {
    try {
      const projectsRef = collection(db, 'projectRequests');
      const q = query(projectsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const projectsList: Project[] = [];
      querySnapshot.forEach((document) => {
        const data = document.data();
        projectsList.push({
          id: document.id.substring(0, 8).toUpperCase(),
          docId: document.id,
          projectTitle: data.projectTitle || 'Untitled Project',
          projectDescription: data.projectDescription || data.description,
          fullName: data.fullName || 'Unknown',
          email: data.email || 'N/A',
          phoneNumber: data.phoneNumber || data.phone,
          location: data.address || data.location || 'N/A',
          energySystem: data.energySystem || 'N/A',
          status: data.status || 'Pending',
          createdAt: data.createdAt,
          fundingGoal: data.fundingGoal,
          currentFunding: data.currentFunding || 0,
          progress: data.progress || 0
        });
      });
      
      setProjects(projectsList);
    } catch (error) {
      console.error('Error fetching projects:', error);
      Alert.alert('Error', 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProjects = () => {
    if (activeFilter === 'all') return projects;
    return projects.filter(p => p.status.toLowerCase() === activeFilter);
  };

  const getStatusColor = (status: ProjectStatus) => {
    const colors: Record<ProjectStatus, string> = {
      'Pending': '#fbbf24',
      'Approved': '#22c55e',
      'Published': '#a3e635',
      'Funded': '#10b981',
      'Implemented': '#3b82f6',
      'Rejected': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status: ProjectStatus) => {
    const icons: Record<ProjectStatus, any> = {
      'Pending': Clock,
      'Approved': CheckCircle,
      'Rejected': XCircle,
      'Implemented': TrendingUp,
      'Funded': DollarSign,
      'Published': FolderCheck
    };
    return icons[status] || FolderCheck;
  };

  const navigateToProjectDetails = (project: Project) => {
    router.push({
      pathname: '/AdminProjectDisplay',
      params: { projectId: project.docId }
    } as any);
  };

  const filters = [
    { id: 'pending', label: 'Pending', count: projects.filter(p => p.status === 'Pending').length },
    { id: 'all', label: 'All', count: projects.length },
    { id: 'approved', label: 'Approved', count: projects.filter(p => p.status === 'Approved').length },
    { id: 'published', label: 'Published', count: projects.filter(p => p.status === 'Published').length },
    { id: 'funded', label: 'Funded', count: projects.filter(p => p.status === 'Funded').length },
    { id: 'implemented', label: 'Implemented', count: projects.filter(p => p.status === 'Implemented').length },
    { id: 'rejected', label: 'Rejected', count: projects.filter(p => p.status === 'Rejected').length },
  ];

  const filteredProjects = getFilteredProjects();

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#122119" />
      <View style={{ flex: 1, backgroundColor: '#122119' }}>
       

        {/* Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={{ maxHeight: 60 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12 }}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={{
                backgroundColor: activeFilter === filter.id ? '#1AE57D' : '#2a3e3e',
                paddingHorizontal: 20,
                paddingVertical: 6,
                borderRadius: 20,
                marginRight: 12,
                flexDirection: 'row',
                alignItems: 'center'
              }}
              onPress={() => setActiveFilter(filter.id as FilterType)}
              activeOpacity={0.8}
            >
              <Text style={{
                color: activeFilter === filter.id ? '#122119' : 'white',
                fontSize: 14,
                fontWeight: '600',
                marginRight: 6
              }}>
                {filter.label}
              </Text>
              <View style={{
                backgroundColor: activeFilter === filter.id ? '#122119' : '#1AE57D',
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 10
              }}>
                <Text style={{
                  color: activeFilter === filter.id ? '#1AE57D' : '#122119',
                  fontSize: 12,
                  fontWeight: '700'
                }}>
                  {filter.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Projects List */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 }}
        >
          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
              <ActivityIndicator size="large" color="#1AE57D" />
              <Text style={{ color: '#6b7280', fontSize: 14, marginTop: 12 }}>Loading projects...</Text>
            </View>
          ) : filteredProjects.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
              <FolderCheck size={48} color="#6b7280" />
              <Text style={{ color: '#6b7280', fontSize: 16, marginTop: 12 }}>No projects found</Text>
              <Text style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
                Try selecting a different filter
              </Text>
            </View>
          ) : (
            filteredProjects.map((project) => {
              const StatusIcon = getStatusIcon(project.status);
              return (
                <TouchableOpacity
                  key={project.docId}
                  style={{
                    backgroundColor: '#1a2e1a',
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: '#2a3e3e'
                  }}
                  onPress={() => navigateToProjectDetails(project)}
                  activeOpacity={0.7}
                >
                  {/* Project Header */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', marginBottom: 4 }}>
                        {project.projectTitle}
                      </Text>
                      <Text style={{ color: '#9ca3af', fontSize: 12 }}>
                        ID: {project.id}
                      </Text>
                    </View>
                    <View style={{
                      backgroundColor: `${getStatusColor(project.status)}20`,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 12,
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}>
                      <StatusIcon size={14} color={getStatusColor(project.status)} />
                      <Text style={{ color: getStatusColor(project.status), fontSize: 12, fontWeight: '700', marginLeft: 4 }}>
                        {project.status}
                      </Text>
                    </View>
                  </View>

                  {/* Project Info */}
                  <View style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                      <User size={14} color="#6b7280" />
                      <Text style={{ color: '#d1d5db', fontSize: 13, marginLeft: 6 }}>
                        {project.fullName}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                      <MapPin size={14} color="#6b7280" />
                      <Text style={{ color: '#d1d5db', fontSize: 13, marginLeft: 6 }}>
                        {project.location}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ color: '#6b7280', fontSize: 13 }}>⚡ {project.energySystem}</Text>
                    </View>
                  </View>

                  {/* Progress Bar (for Implemented projects) */}
                  {project.status === 'Implemented' && (
                    <View style={{ marginBottom: 12 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                        <Text style={{ color: '#9ca3af', fontSize: 12 }}>Progress</Text>
                        <Text style={{ color: '#1AE57D', fontSize: 12, fontWeight: '600' }}>
                          {project.progress || 0}%
                        </Text>
                      </View>
                      <View style={{ height: 6, backgroundColor: '#2a3e3e', borderRadius: 3, overflow: 'hidden' }}>
                        <View style={{
                          width: `${project.progress || 0}%`,
                          height: '100%',
                          backgroundColor: '#1AE57D'
                        }} />
                      </View>
                    </View>
                  )}

                  {/* Funding Info */}
                  {project.fundingGoal && project.fundingGoal > 0 && (
                    <View style={{
                      backgroundColor: '#122119',
                      padding: 10,
                      borderRadius: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 12
                    }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#6b7280', fontSize: 11, marginBottom: 2 }}>Funding Goal</Text>
                        <Text style={{ color: '#10b981', fontSize: 14, fontWeight: '700' }}>
                          LKR {project.fundingGoal.toLocaleString()}
                        </Text>
                      </View>
                      {project.currentFunding !== undefined && (
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                          <Text style={{ color: '#6b7280', fontSize: 11, marginBottom: 2 }}>Raised</Text>
                          <Text style={{ color: '#1AE57D', fontSize: 14, fontWeight: '700' }}>
                            LKR {project.currentFunding.toLocaleString()}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* View Details Button */}
                  <View style={{
                    backgroundColor: '#2a3e3e',
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: 10,
                    alignItems: 'center'
                  }}>
                    <Text style={{ color: '#1AE57D', fontSize: 13, fontWeight: '600' }}>
                      View Details & Manage Status →
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>
    </>
  );
};

export default AdminProjectList;
