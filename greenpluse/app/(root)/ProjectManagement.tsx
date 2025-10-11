import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, StatusBar, ActivityIndicator, Modal, TextInput } from 'react-native';
import { ArrowLeft, FolderCheck, Clock, CheckCircle, XCircle, TrendingUp, User, MapPin, Mail, Phone, DollarSign, FileText, Edit2, X, BarChart3, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { db, auth } from '@/config/firebaseConfig';
import { collection, getDocs, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { isAdmin } from '@/utils/adminAuth';

type ProjectStatus = 'Pending' | 'Approved' | 'Rejected' | 'Implemented' | 'Funded' | 'Published';
type TabType = 'all' | 'pending' | 'approved' | 'progress';

interface Project {
  id: string;
  docId: string;
  projectTitle: string;
  projectDescription?: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  location: string;
  energySystem: string;
  status: ProjectStatus;
  createdAt: any;
  fundingGoal?: number;
  currentFunding?: number;
  progress?: number;
}

const ProjectManagement = () => {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showFundingModal, setShowFundingModal] = useState(false);
  const [newFundingGoal, setNewFundingGoal] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const statuses: ProjectStatus[] = ['Pending', 'Approved', 'Published', 'Funded', 'Implemented', 'Rejected'];

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
          address: data.address,
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
    switch (activeTab) {
      case 'pending':
        return projects.filter(p => p.status === 'Pending');
      case 'approved':
        return projects.filter(p => ['Approved', 'Published', 'Funded'].includes(p.status));
      case 'progress':
        return projects.filter(p => p.status === 'Implemented');
      default:
        return projects;
    }
  };

  const updateProjectStatus = async (newStatus: ProjectStatus) => {
    if (!selectedProject) return;

    setUpdatingStatus(true);
    try {
      const projectRef = doc(db, 'projectRequests', selectedProject.docId);
      await updateDoc(projectRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      setProjects(projects.map(p => 
        p.docId === selectedProject.docId ? { ...p, status: newStatus } : p
      ));

      setSelectedProject({ ...selectedProject, status: newStatus });
      Alert.alert('Success', `Project status updated to "${newStatus}"`);
      setShowStatusModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update project status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const updateFundingGoal = async () => {
    if (!selectedProject) return;

    const goalAmount = parseFloat(newFundingGoal);
    if (isNaN(goalAmount) || goalAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid funding goal amount');
      return;
    }

    try {
      const projectRef = doc(db, 'projectRequests', selectedProject.docId);
      await updateDoc(projectRef, {
        fundingGoal: goalAmount,
        updatedAt: serverTimestamp()
      });

      setProjects(projects.map(p => 
        p.docId === selectedProject.docId ? { ...p, fundingGoal: goalAmount } : p
      ));

      setSelectedProject({ ...selectedProject, fundingGoal: goalAmount });
      Alert.alert('Success', `Funding goal updated to LKR ${goalAmount.toLocaleString()}`);
      setShowFundingModal(false);
      setNewFundingGoal('');
    } catch (error) {
      Alert.alert('Error', 'Failed to update funding goal');
    }
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

  const openProjectDetails = (project: Project) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
  };

  const tabs = [
    { id: 'all', label: 'All Projects', count: projects.length },
    { id: 'pending', label: 'Pending', count: projects.filter(p => p.status === 'Pending').length },
    { id: 'approved', label: 'Approved', count: projects.filter(p => ['Approved', 'Published', 'Funded'].includes(p.status)).length },
    { id: 'progress', label: 'In Progress', count: projects.filter(p => p.status === 'Implemented').length },
  ];

  const filteredProjects = getFilteredProjects();

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#122119" />
      <View style={{ flex: 1, backgroundColor: '#122119' }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 48,
          paddingBottom: 16,
          backgroundColor: '#122119'
        }}>
          <TouchableOpacity 
            style={{ marginRight: 16 }}
            onPress={() => router.back()}
          >
            <ArrowLeft size={28} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: 'white', fontSize: 24, fontWeight: '700' }}>
              Project Management
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: 13, marginTop: 2 }}>
              Manage all user project requests
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={{ maxHeight: 60 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12 }}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={{
                backgroundColor: activeTab === tab.id ? '#1AE57D' : '#2a3e3e',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 20,
                marginRight: 12,
                flexDirection: 'row',
                alignItems: 'center'
              }}
              onPress={() => setActiveTab(tab.id as TabType)}
              activeOpacity={0.8}
            >
              <Text style={{
                color: activeTab === tab.id ? '#122119' : 'white',
                fontSize: 14,
                fontWeight: '600',
                marginRight: 6
              }}>
                {tab.label}
              </Text>
              <View style={{
                backgroundColor: activeTab === tab.id ? '#122119' : '#1AE57D',
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 10
              }}>
                <Text style={{
                  color: activeTab === tab.id ? '#1AE57D' : '#122119',
                  fontSize: 12,
                  fontWeight: '700'
                }}>
                  {tab.count}
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
                  onPress={() => openProjectDetails(project)}
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
                      justifyContent: 'space-between'
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
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#2a3e3e',
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 10,
                      marginTop: 12,
                      alignItems: 'center'
                    }}
                    onPress={() => openProjectDetails(project)}
                    activeOpacity={0.8}
                  >
                    <Text style={{ color: '#1AE57D', fontSize: 13, fontWeight: '600' }}>
                      View Full Details & Manage
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>

      {/* Project Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#122119' }}>
          <StatusBar barStyle="light-content" />
          
          {/* Modal Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingTop: 48,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#2a3e3e'
          }}>
            <Text style={{ color: 'white', fontSize: 20, fontWeight: '700', flex: 1 }}>
              Project Details
            </Text>
            <TouchableOpacity
              onPress={() => setShowDetailsModal(false)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: '#2a3e3e',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <X size={20} color="white" />
            </TouchableOpacity>
          </View>

          {selectedProject && (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 20 }}
            >
              {/* Project Title & Status */}
              <View style={{
                backgroundColor: '#1a2e1a',
                borderRadius: 16,
                padding: 20,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: '#2a3e3e'
              }}>
                <Text style={{ color: 'white', fontSize: 22, fontWeight: '700', marginBottom: 8 }}>
                  {selectedProject.projectTitle}
                </Text>
                <Text style={{ color: '#9ca3af', fontSize: 13, marginBottom: 12 }}>
                  Project ID: {selectedProject.id}
                </Text>
                
                <View style={{
                  backgroundColor: `${getStatusColor(selectedProject.status)}20`,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 12,
                  alignSelf: 'flex-start',
                  flexDirection: 'row',
                  alignItems: 'center'
                }}>
                  {React.createElement(getStatusIcon(selectedProject.status), {
                    size: 18,
                    color: getStatusColor(selectedProject.status)
                  })}
                  <Text style={{
                    color: getStatusColor(selectedProject.status),
                    fontSize: 14,
                    fontWeight: '700',
                    marginLeft: 6
                  }}>
                    {selectedProject.status}
                  </Text>
                </View>
              </View>

              {/* Project Description */}
              {selectedProject.projectDescription && (
                <View style={{
                  backgroundColor: '#1a2e1a',
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: '#2a3e3e'
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <FileText size={18} color="#1AE57D" />
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '700', marginLeft: 8 }}>
                      Description
                    </Text>
                  </View>
                  <Text style={{ color: '#d1d5db', fontSize: 14, lineHeight: 22 }}>
                    {selectedProject.projectDescription}
                  </Text>
                </View>
              )}

              {/* Requester Information */}
              <View style={{
                backgroundColor: '#1a2e1a',
                borderRadius: 16,
                padding: 20,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: '#2a3e3e'
              }}>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '700', marginBottom: 16 }}>
                  Requester Information
                </Text>
                
                <View style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <User size={16} color="#1AE57D" />
                    <Text style={{ color: '#9ca3af', fontSize: 12, marginLeft: 6 }}>Full Name</Text>
                  </View>
                  <Text style={{ color: 'white', fontSize: 15, marginLeft: 22 }}>
                    {selectedProject.fullName}
                  </Text>
                </View>

                <View style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <Mail size={16} color="#1AE57D" />
                    <Text style={{ color: '#9ca3af', fontSize: 12, marginLeft: 6 }}>Email</Text>
                  </View>
                  <Text style={{ color: 'white', fontSize: 15, marginLeft: 22 }}>
                    {selectedProject.email}
                  </Text>
                </View>

                {selectedProject.phoneNumber && (
                  <View style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                      <Phone size={16} color="#1AE57D" />
                      <Text style={{ color: '#9ca3af', fontSize: 12, marginLeft: 6 }}>Phone</Text>
                    </View>
                    <Text style={{ color: 'white', fontSize: 15, marginLeft: 22 }}>
                      {selectedProject.phoneNumber}
                    </Text>
                  </View>
                )}

                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <MapPin size={16} color="#1AE57D" />
                    <Text style={{ color: '#9ca3af', fontSize: 12, marginLeft: 6 }}>Location</Text>
                  </View>
                  <Text style={{ color: 'white', fontSize: 15, marginLeft: 22 }}>
                    {selectedProject.location}
                  </Text>
                </View>
              </View>

              {/* Project Details */}
              <View style={{
                backgroundColor: '#1a2e1a',
                borderRadius: 16,
                padding: 20,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: '#2a3e3e'
              }}>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '700', marginBottom: 16 }}>
                  Project Details
                </Text>
                
                <View style={{ marginBottom: 12 }}>
                  <Text style={{ color: '#9ca3af', fontSize: 12, marginBottom: 4 }}>Energy System</Text>
                  <Text style={{ color: 'white', fontSize: 15 }}>⚡ {selectedProject.energySystem}</Text>
                </View>

                {selectedProject.createdAt && (
                  <View>
                    <Text style={{ color: '#9ca3af', fontSize: 12, marginBottom: 4 }}>Submitted On</Text>
                    <Text style={{ color: 'white', fontSize: 15 }}>
                      {new Date(selectedProject.createdAt.toDate()).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Text>
                  </View>
                )}
              </View>

              {/* Funding Information */}
              <View style={{
                backgroundColor: '#1a2e1a',
                borderRadius: 16,
                padding: 20,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: '#2a3e3e'
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <DollarSign size={18} color="#1AE57D" />
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '700', marginLeft: 8 }}>
                      Funding Information
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#2a3e3e',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                    onPress={() => {
                      setNewFundingGoal((selectedProject.fundingGoal || 0).toString());
                      setShowFundingModal(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <Edit2 size={14} color="#1AE57D" />
                    <Text style={{ color: '#1AE57D', fontSize: 12, marginLeft: 4, fontWeight: '600' }}>
                      Edit
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={{ marginBottom: 12 }}>
                  <Text style={{ color: '#9ca3af', fontSize: 12, marginBottom: 4 }}>Funding Goal</Text>
                  <Text style={{ color: '#10b981', fontSize: 20, fontWeight: '700' }}>
                    LKR {(selectedProject.fundingGoal || 0).toLocaleString()}
                  </Text>
                </View>

                {selectedProject.currentFunding !== undefined && (
                  <View>
                    <Text style={{ color: '#9ca3af', fontSize: 12, marginBottom: 4 }}>Current Funding</Text>
                    <Text style={{ color: '#1AE57D', fontSize: 20, fontWeight: '700' }}>
                      LKR {selectedProject.currentFunding.toLocaleString()}
                    </Text>
                    <View style={{ marginTop: 8 }}>
                      <View style={{ height: 8, backgroundColor: '#2a3e3e', borderRadius: 4, overflow: 'hidden' }}>
                        <View style={{
                          width: `${Math.min((selectedProject.currentFunding / (selectedProject.fundingGoal || 1)) * 100, 100)}%`,
                          height: '100%',
                          backgroundColor: '#1AE57D'
                        }} />
                      </View>
                      <Text style={{ color: '#9ca3af', fontSize: 11, marginTop: 4 }}>
                        {Math.round((selectedProject.currentFunding / (selectedProject.fundingGoal || 1)) * 100)}% funded
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Progress (for Implemented projects) */}
              {selectedProject.status === 'Implemented' && (
                <View style={{
                  backgroundColor: '#1a2e1a',
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: '#2a3e3e'
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <BarChart3 size={18} color="#1AE57D" />
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '700', marginLeft: 8 }}>
                      Implementation Progress
                    </Text>
                  </View>

                  <View style={{ marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ color: '#9ca3af', fontSize: 13 }}>Progress</Text>
                      <Text style={{ color: '#1AE57D', fontSize: 16, fontWeight: '700' }}>
                        {selectedProject.progress || 0}%
                      </Text>
                    </View>
                    <View style={{ height: 12, backgroundColor: '#2a3e3e', borderRadius: 6, overflow: 'hidden' }}>
                      <View style={{
                        width: `${selectedProject.progress || 0}%`,
                        height: '100%',
                        backgroundColor: '#1AE57D'
                      }} />
                    </View>
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              <TouchableOpacity
                style={{
                  backgroundColor: '#1AE57D',
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: 'center',
                  marginBottom: 12
                }}
                onPress={() => setShowStatusModal(true)}
                activeOpacity={0.8}
              >
                <Text style={{ color: '#122119', fontSize: 15, fontWeight: '700' }}>
                  Change Project Status
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Status Change Modal */}
      <Modal
        visible={showStatusModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20
        }}>
          <View style={{
            backgroundColor: '#122119',
            borderRadius: 20,
            padding: 24,
            width: '100%',
            maxWidth: 400
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>
                Change Status
              </Text>
              <TouchableOpacity
                onPress={() => setShowStatusModal(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#2a3e3e',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <X size={18} color="white" />
              </TouchableOpacity>
            </View>

            {selectedProject && (
              <>
                <Text style={{ color: '#9ca3af', fontSize: 13, marginBottom: 16 }}>
                  Select new status for: {selectedProject.projectTitle}
                </Text>

                {statuses.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={{
                      backgroundColor: selectedProject.status === status ? '#10b98120' : '#1a2e1a',
                      paddingVertical: 14,
                      paddingHorizontal: 16,
                      borderRadius: 12,
                      marginBottom: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderWidth: 1,
                      borderColor: selectedProject.status === status ? '#10b981' : '#2a3e3e'
                    }}
                    onPress={() => updateProjectStatus(status)}
                    disabled={updatingStatus}
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: getStatusColor(status),
                        marginRight: 10
                      }} />
                      <Text style={{
                        color: selectedProject.status === status ? '#10b981' : 'white',
                        fontSize: 15,
                        fontWeight: selectedProject.status === status ? '700' : '500'
                      }}>
                        {status}
                      </Text>
                    </View>
                    {selectedProject.status === status && (
                      <Check size={18} color="#10b981" />
                    )}
                  </TouchableOpacity>
                ))}

                {updatingStatus && (
                  <View style={{ marginTop: 12, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#1AE57D" />
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Funding Goal Modal */}
      <Modal
        visible={showFundingModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowFundingModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20
        }}>
          <View style={{
            backgroundColor: '#122119',
            borderRadius: 20,
            padding: 24,
            width: '100%',
            maxWidth: 400
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <DollarSign size={22} color="#1AE57D" />
                <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', marginLeft: 8 }}>
                  Update Funding Goal
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowFundingModal(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#2a3e3e',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <X size={18} color="white" />
              </TouchableOpacity>
            </View>

            {selectedProject && (
              <>
                <Text style={{ color: '#9ca3af', fontSize: 13, marginBottom: 16 }}>
                  {selectedProject.projectTitle}
                </Text>

                {selectedProject.fundingGoal && selectedProject.fundingGoal > 0 && (
                  <View style={{
                    backgroundColor: '#1a2e1a',
                    padding: 12,
                    borderRadius: 12,
                    marginBottom: 16
                  }}>
                    <Text style={{ color: '#9ca3af', fontSize: 12, marginBottom: 4 }}>Current Funding Goal</Text>
                    <Text style={{ color: '#10b981', fontSize: 18, fontWeight: '700' }}>
                      LKR {selectedProject.fundingGoal.toLocaleString()}
                    </Text>
                  </View>
                )}

                <View style={{ marginBottom: 20 }}>
                  <Text style={{ color: 'white', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                    New Funding Goal (LKR)
                  </Text>
                  <TextInput
                    style={{
                      backgroundColor: '#1a2e1a',
                      color: 'white',
                      padding: 16,
                      borderRadius: 12,
                      fontSize: 16,
                      borderWidth: 2,
                      borderColor: '#1AE57D'
                    }}
                    value={newFundingGoal}
                    onChangeText={setNewFundingGoal}
                    placeholder="Enter amount (e.g., 50000)"
                    placeholderTextColor="#6b7280"
                    keyboardType="numeric"
                  />
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: '#2a3e3e',
                      paddingVertical: 14,
                      borderRadius: 12,
                      alignItems: 'center'
                    }}
                    onPress={() => setShowFundingModal(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={{ color: 'white', fontSize: 15, fontWeight: '600' }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: '#10b981',
                      paddingVertical: 14,
                      borderRadius: 12,
                      alignItems: 'center'
                    }}
                    onPress={updateFundingGoal}
                    activeOpacity={0.8}
                  >
                    <Text style={{ color: 'white', fontSize: 15, fontWeight: '700' }}>
                      Update
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ProjectManagement;
