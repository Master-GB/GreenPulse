import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, StatusBar, ActivityIndicator, TextInput, Modal } from 'react-native';
import { ArrowLeft, ChevronDown, Check, User, MapPin, DollarSign, Edit2, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { db, auth } from '@/config/firebaseConfig';
import { collection, getDocs, doc, updateDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { isAdmin } from '@/utils/adminAuth';

type ProjectStatus = 'Pending' | 'Approved' | 'Rejected' | 'Implemented' | 'Funded' | 'Published';

interface Project {
  id: string;
  docId: string;
  projectTitle: string;
  fullName: string;
  email: string;
  location: string;
  energySystem: string;
  status: ProjectStatus;
  createdAt: any;
  fundingGoal?: number;
}

const UpdateProjectStatus = () => {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingProjectId, setUpdatingProjectId] = useState<string | null>(null);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [showFundingModal, setShowFundingModal] = useState(false);
  const [selectedProjectForFunding, setSelectedProjectForFunding] = useState<Project | null>(null);
  const [newFundingGoal, setNewFundingGoal] = useState('');

  const statuses: ProjectStatus[] = ['Pending', 'Approved', 'Published', 'Funded', 'Implemented', 'Rejected'];

  useEffect(() => {
    verifyAdminAccess();
  }, []);

  const verifyAdminAccess = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Access Denied', 'Please login first');
      router.replace('/(root)/(MainTabs)/home' as any);
      return;
    }

    if (!isAdmin()) {
      Alert.alert('Access Denied', 'Only administrators can access this page', [
        { text: 'OK', onPress: () => router.back() }
      ]);
      return;
    }

    // Check if admin has authenticated with password
    const { checkAdminAccess } = await import('@/utils/adminAuth');
    const hasAccess = await checkAdminAccess();
    if (!hasAccess) {
      Alert.alert('Authentication Required', 'Please login to admin dashboard first', [
        { text: 'OK', onPress: () => router.replace('/AdminLogin' as any) }
      ]);
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
          fullName: data.fullName || 'Unknown',
          email: data.email || 'N/A',
          location: data.address || data.location || 'N/A',
          energySystem: data.energySystem || 'N/A',
          status: data.status || 'Pending',
          createdAt: data.createdAt,
          fundingGoal: data.fundingGoal
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

  const updateProjectStatus = async (projectDocId: string, newStatus: ProjectStatus) => {
    setUpdatingProjectId(projectDocId);
    try {
      const projectRef = doc(db, 'projectRequests', projectDocId);
      await updateDoc(projectRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      // Update local state
      setProjects(projects.map(p => 
        p.docId === projectDocId ? { ...p, status: newStatus } : p
      ));

      Alert.alert('Success', `Project status updated to "${newStatus}"`);
      setExpandedProjectId(null);
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update project status');
    } finally {
      setUpdatingProjectId(null);
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'Pending':
        return '#fbbf24';
      case 'Approved':
        return '#22c55e';
      case 'Published':
        return '#a3e635';
      case 'Funded':
        return '#10b981';
      case 'Implemented':
        return '#3b82f6';
      case 'Rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const openFundingModal = (project: Project) => {
    setSelectedProjectForFunding(project);
    setNewFundingGoal((project.fundingGoal || 0).toString());
    setShowFundingModal(true);
  };

  const updateFundingGoal = async () => {
    if (!selectedProjectForFunding) return;

    const goalAmount = parseFloat(newFundingGoal);
    if (isNaN(goalAmount) || goalAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid funding goal amount');
      return;
    }

    try {
      const projectRef = doc(db, 'projectRequests', selectedProjectForFunding.docId);
      await updateDoc(projectRef, {
        fundingGoal: goalAmount,
        updatedAt: serverTimestamp()
      });

      // Update local state
      setProjects(projects.map(p => 
        p.docId === selectedProjectForFunding.docId ? { ...p, fundingGoal: goalAmount } : p
      ));

      Alert.alert('Success', `Funding goal updated to LKR ${goalAmount.toLocaleString()}`);
      setShowFundingModal(false);
      setSelectedProjectForFunding(null);
      setNewFundingGoal('');
    } catch (error) {
      console.error('Error updating funding goal:', error);
      Alert.alert('Error', 'Failed to update funding goal');
    }
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
            Update Project Status
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
        >
          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
              <ActivityIndicator size="large" color="#10b981" />
              <Text style={{ color: '#6b7280', fontSize: 14, marginTop: 12 }}>Loading projects...</Text>
            </View>
          ) : projects.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
              <Text style={{ color: '#6b7280', fontSize: 16 }}>No projects found</Text>
            </View>
          ) : (
            projects.map((project) => (
              <View
                key={project.docId}
                style={{
                  backgroundColor: '#1a2e1a',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: '#2a3e3e'
                }}
              >
                {/* Project Header */}
                <View style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', flex: 1 }}>
                      {project.projectTitle}
                    </Text>
                    <View style={{
                      backgroundColor: `${getStatusColor(project.status)}20`,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 12
                    }}>
                      <Text style={{ color: getStatusColor(project.status), fontSize: 12, fontWeight: '700' }}>
                        {project.status}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={{ color: '#9ca3af', fontSize: 12, marginBottom: 4 }}>
                    ID: {project.id}
                  </Text>
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
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={{ color: '#6b7280', fontSize: 13 }}>⚡ {project.energySystem}</Text>
                  </View>
                  
                  {/* Funding Goal */}
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    backgroundColor: '#122119',
                    padding: 10,
                    borderRadius: 8,
                    marginTop: 8
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <DollarSign size={14} color="#10b981" />
                      <Text style={{ color: '#10b981', fontSize: 13, marginLeft: 4, fontWeight: '600' }}>
                        Funding Goal: LKR {(project.fundingGoal || 0).toLocaleString()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#2a3e3e',
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 6,
                        flexDirection: 'row',
                        alignItems: 'center'
                      }}
                      onPress={() => openFundingModal(project)}
                      activeOpacity={0.7}
                    >
                      <Edit2 size={12} color="#1AE57D" />
                      <Text style={{ color: '#1AE57D', fontSize: 11, marginLeft: 4, fontWeight: '600' }}>
                        Edit
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Change Status Button */}
                <TouchableOpacity
                  style={{
                    backgroundColor: '#2a3e3e',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                  onPress={() => setExpandedProjectId(expandedProjectId === project.docId ? null : project.docId)}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                    Change Status
                  </Text>
                  <ChevronDown 
                    size={20} 
                    color="white" 
                    style={{ 
                      transform: [{ rotate: expandedProjectId === project.docId ? '180deg' : '0deg' }] 
                    }} 
                  />
                </TouchableOpacity>

                {/* Status Options */}
                {expandedProjectId === project.docId && (
                  <View style={{ marginTop: 12 }}>
                    {statuses.map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={{
                          backgroundColor: project.status === status ? '#10b98120' : '#122119',
                          paddingVertical: 12,
                          paddingHorizontal: 16,
                          borderRadius: 8,
                          marginBottom: 8,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderWidth: 1,
                          borderColor: project.status === status ? '#10b981' : '#2a3e3e'
                        }}
                        onPress={() => updateProjectStatus(project.docId, status)}
                        disabled={updatingProjectId === project.docId}
                        activeOpacity={0.7}
                      >
                        <Text style={{
                          color: project.status === status ? '#10b981' : 'white',
                          fontSize: 14,
                          fontWeight: project.status === status ? '700' : '500'
                        }}>
                          {status}
                        </Text>
                        {project.status === status && (
                          <Check size={18} color="#10b981" />
                        )}
                        {updatingProjectId === project.docId && (
                          <ActivityIndicator size="small" color="#10b981" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </View>

      {/* Funding Goal Modal */}
      <Modal
        visible={showFundingModal}
        animationType="slide"
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
            {/* Modal Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <DollarSign size={24} color="#1AE57D" />
                <Text style={{ color: 'white', fontSize: 20, fontWeight: '700', marginLeft: 8 }}>
                  Update Funding Goal
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowFundingModal(false)}
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

            {/* Project Info */}
            {selectedProjectForFunding && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: '#9ca3af', fontSize: 12, marginBottom: 4 }}>Project</Text>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                  {selectedProjectForFunding.projectTitle}
                </Text>
                <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>
                  ID: {selectedProjectForFunding.id}
                </Text>
              </View>
            )}

            {/* Current Funding Goal */}
            {selectedProjectForFunding && selectedProjectForFunding.fundingGoal && (
              <View style={{
                backgroundColor: '#1a2e1a',
                padding: 12,
                borderRadius: 12,
                marginBottom: 16
              }}>
                <Text style={{ color: '#9ca3af', fontSize: 12, marginBottom: 4 }}>Current Funding Goal</Text>
                <Text style={{ color: '#10b981', fontSize: 18, fontWeight: '700' }}>
                  LKR {selectedProjectForFunding.fundingGoal.toLocaleString()}
                </Text>
              </View>
            )}

            {/* New Funding Goal Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: 'white', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                New Funding Goal (LKR)
              </Text>
              <TextInput
                style={{
                  backgroundColor: '#2a2a2a',
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
              <Text style={{ color: '#6b7280', fontSize: 11, marginTop: 6 }}>
                Enter the required funding amount in Sri Lankan Rupees
              </Text>
            </View>

            {/* Action Buttons */}
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
          </View>
        </View>
      </Modal>
    </>
  );
};

export default UpdateProjectStatus;
