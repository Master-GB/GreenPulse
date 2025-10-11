import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, StatusBar, ActivityIndicator, Modal, TextInput, Linking } from 'react-native';
import { ArrowLeft, User, MapPin, Mail, Phone, FileText, DollarSign, Edit2, X, Check, Calendar, BarChart3, Building2, Zap, Navigation, Image as ImageIcon, File, Trash2 } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { db, auth } from '@/config/firebaseConfig';
import { doc, getDoc, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { isAdmin } from '@/utils/adminAuth';

type ProjectStatus = 'Pending' | 'Approved' | 'Rejected' | 'Implemented' | 'Funded' | 'Published';

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
  licenseNumber?: string;
  landReference?: string;
  propertyType?: string;
  energySystem: string;
  energyNeed?: string;
  latitude?: number;
  longitude?: number;
  idDocument?: string;
  landDocument?: string;
  photos?: string[];
  status: ProjectStatus;
  createdAt: any;
  fundingGoal?: number;
  currentFunding?: number;
  progress?: number;
}

const AdminProjectDisplay = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showFundingModal, setShowFundingModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newFundingGoal, setNewFundingGoal] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const statuses: ProjectStatus[] = ['Pending', 'Approved', 'Published', 'Funded', 'Implemented', 'Rejected'];

  useEffect(() => {
    verifyAdminAndFetchProject();
  }, []);

  const verifyAdminAndFetchProject = async () => {
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

    fetchProjectDetails();
  };

  const fetchProjectDetails = async () => {
    try {
      const projectRef = doc(db, 'projectRequests', projectId);
      const projectDoc = await getDoc(projectRef);

      if (projectDoc.exists()) {
        const data = projectDoc.data();
        setProject({
          id: projectDoc.id.substring(0, 8).toUpperCase(),
          docId: projectDoc.id,
          projectTitle: data.projectTitle || 'Untitled Project',
          projectDescription: data.projectDescription || data.description,
          fullName: data.fullName || 'Unknown',
          email: data.email || 'N/A',
          phoneNumber: data.phoneNumber || data.phone,
          address: data.address,
          location: data.address || data.location || 'N/A',
          licenseNumber: data.licenseNumber,
          landReference: data.landReference,
          propertyType: data.propertyType,
          energySystem: data.energySystem || 'N/A',
          energyNeed: data.energyNeed,
          latitude: data.latitude,
          longitude: data.longitude,
          idDocument: data.idDocument,
          landDocument: data.landDocument,
          photos: data.photos || [],
          status: data.status || 'Pending',
          createdAt: data.createdAt,
          fundingGoal: data.fundingGoal,
          currentFunding: data.currentFunding || 0,
          progress: data.progress || 0
        });
      } else {
        Alert.alert('Error', 'Project not found');
        router.back();
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      Alert.alert('Error', 'Failed to load project details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const updateProjectStatus = async (newStatus: ProjectStatus) => {
    if (!project) return;

    setUpdatingStatus(true);
    try {
      const projectRef = doc(db, 'projectRequests', project.docId);
      await updateDoc(projectRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      setProject({ ...project, status: newStatus });
      Alert.alert('Success', `Project status updated to "${newStatus}"`);
      setShowStatusModal(false);
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update project status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const updateFundingGoal = async () => {
    if (!project) return;

    const goalAmount = parseFloat(newFundingGoal);
    if (isNaN(goalAmount) || goalAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid funding goal amount');
      return;
    }

    try {
      const projectRef = doc(db, 'projectRequests', project.docId);
      await updateDoc(projectRef, {
        fundingGoal: goalAmount,
        updatedAt: serverTimestamp()
      });

      setProject({ ...project, fundingGoal: goalAmount });
      Alert.alert('Success', `Funding goal updated to LKR ${goalAmount.toLocaleString()}`);
      setShowFundingModal(false);
      setNewFundingGoal('');
    } catch (error) {
      console.error('Error updating funding goal:', error);
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

  const openLocationInMap = () => {
    if (!project?.latitude || !project?.longitude) {
      Alert.alert('Location Not Available', 'No location coordinates found for this project');
      return;
    }

    const latitude = project.latitude;
    const longitude = project.longitude;
    const label = encodeURIComponent(project.projectTitle);

    // Try to open in Google Maps app, fallback to browser
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${label}`;
    
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open maps');
      }
    });
  };

  const handleDeleteProject = async () => {
    if (!project) return;

    setDeleting(true);
    try {
      const projectRef = doc(db, 'projectRequests', project.docId);
      await deleteDoc(projectRef);

      Alert.alert(
        'Success',
        'Project has been deleted successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowDeleteModal(false);
              router.back();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error deleting project:', error);
      Alert.alert('Error', 'Failed to delete project. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#122119', justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#1AE57D" />
        <Text style={{ color: '#6b7280', fontSize: 14, marginTop: 12 }}>Loading project details...</Text>
      </View>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#122119" />
      <View style={{ flex: 1, backgroundColor: '#122119' }}>
        

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20 }}
        >
          {/* Project Title & Status */}
          <View style={{
            backgroundColor: '#404040',
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: '#2a3e3e'
          }}>
            <Text style={{ color: 'white', fontSize: 22, fontWeight: '700', marginBottom: 8 }}>
              {project.projectTitle}
            </Text>
            <Text style={{ color: '#9ca3af', fontSize: 13, marginBottom: 12 }}>
              Project ID: {project.id}
            </Text>
            
            <View style={{
              backgroundColor: `${getStatusColor(project.status)}20`,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 12,
              alignSelf: 'flex-start'
            }}>
              <Text style={{
                color: getStatusColor(project.status),
                fontSize: 14,
                fontWeight: '700'
              }}>
                Status: {project.status}
              </Text>
            </View>
          </View>

          {/* Project Description */}
          {project.projectDescription && (
            <View style={{
              backgroundColor: '#404040',
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
                {project.projectDescription}
              </Text>
            </View>
          )}

          {/* Requester Information */}
          <View style={{
            backgroundColor: '#404040',
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
                {project.fullName}
              </Text>
            </View>

            {project.licenseNumber && (
              <View style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <FileText size={16} color="#1AE57D" />
                  <Text style={{ color: '#9ca3af', fontSize: 12, marginLeft: 6 }}>License Number</Text>
                </View>
                <Text style={{ color: 'white', fontSize: 15, marginLeft: 22 }}>
                  {project.licenseNumber}
                </Text>
              </View>
            )}

            <View style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Mail size={16} color="#1AE57D" />
                <Text style={{ color: '#9ca3af', fontSize: 12, marginLeft: 6 }}>Email</Text>
              </View>
              <Text style={{ color: 'white', fontSize: 15, marginLeft: 22 }}>
                {project.email}
              </Text>
            </View>

            {project.phoneNumber && (
              <View style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Phone size={16} color="#1AE57D" />
                  <Text style={{ color: '#9ca3af', fontSize: 12, marginLeft: 6 }}>Phone</Text>
                </View>
                <Text style={{ color: 'white', fontSize: 15, marginLeft: 22 }}>
                  {project.phoneNumber}
                </Text>
              </View>
            )}

            <View style={{ marginBottom: project.latitude && project.longitude ? 12 : 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <MapPin size={16} color="#1AE57D" />
                <Text style={{ color: '#9ca3af', fontSize: 12, marginLeft: 6 }}>Address</Text>
              </View>
              <Text style={{ color: 'white', fontSize: 15, marginLeft: 22 }}>
                {project.location}
              </Text>
            </View>

            {project.latitude && project.longitude && (
              <TouchableOpacity
                style={{
                  backgroundColor: '#2a3e3e',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 8
                }}
                onPress={openLocationInMap}
                activeOpacity={0.7}
              >
                <Navigation size={16} color="#1AE57D" />
                <Text style={{ color: '#1AE57D', fontSize: 14, fontWeight: '600', marginLeft: 8 }}>
                  View Location on Map
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Project Details */}
          <View style={{
            backgroundColor: '#404040',
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: '#2a3e3e'
          }}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '700', marginBottom: 16 }}>
              Project Details
            </Text>
            
            {project.propertyType && (
              <View style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Building2 size={14} color="#1AE57D" />
                  <Text style={{ color: '#9ca3af', fontSize: 12, marginLeft: 6 }}>Property Type</Text>
                </View>
                <Text style={{ color: 'white', fontSize: 15, marginLeft: 20 }}>{project.propertyType}</Text>
              </View>
            )}

            {project.landReference && (
              <View style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <FileText size={14} color="#1AE57D" />
                  <Text style={{ color: '#9ca3af', fontSize: 12, marginLeft: 6 }}>Land Reference</Text>
                </View>
                <Text style={{ color: 'white', fontSize: 15, marginLeft: 20 }}>{project.landReference}</Text>
              </View>
            )}
            
            <View style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Zap size={14} color="#1AE57D" />
                <Text style={{ color: '#9ca3af', fontSize: 12, marginLeft: 6 }}>Energy System</Text>
              </View>
              <Text style={{ color: 'white', fontSize: 15, marginLeft: 20 }}>⚡ {project.energySystem}</Text>
            </View>

            {project.energyNeed && (
              <View style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <BarChart3 size={14} color="#1AE57D" />
                  <Text style={{ color: '#9ca3af', fontSize: 12, marginLeft: 6 }}>Energy Need</Text>
                </View>
                <Text style={{ color: 'white', fontSize: 15, marginLeft: 20 }}>{project.energyNeed}</Text>
              </View>
            )}

            {project.createdAt && (
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Calendar size={14} color="#1AE57D" />
                  <Text style={{ color: '#9ca3af', fontSize: 12, marginLeft: 6 }}>Submitted On</Text>
                </View>
                <Text style={{ color: 'white', fontSize: 15, marginLeft: 20 }}>
                  {new Date(project.createdAt.toDate()).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
            )}
          </View>

          {/* Uploaded Documents */}
          {(project.idDocument || project.landDocument || (project.photos && project.photos.length > 0)) && (
            <View style={{
              backgroundColor: '#404040',
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: '#2a3e3e'
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <File size={18} color="#1AE57D" />
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '700', marginLeft: 8 }}>
                  Uploaded Documents
                </Text>
              </View>

              {project.idDocument && (
                <View style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <FileText size={14} color="#1AE57D" />
                    <Text style={{ color: '#9ca3af', fontSize: 12, marginLeft: 6 }}>ID Document</Text>
                  </View>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#2a3e3e',
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      borderRadius: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginLeft: 20
                    }}
                    onPress={() => {
                      Linking.openURL(project.idDocument!).catch(() => {
                        Alert.alert('Error', 'Unable to open document');
                      });
                    }}
                    activeOpacity={0.7}
                  >
                    <File size={16} color="#1AE57D" />
                    <Text style={{ color: '#1AE57D', fontSize: 13, fontWeight: '600', marginLeft: 8, flex: 1 }}>
                      View ID Document
                    </Text>
                    <Text style={{ color: '#6b7280', fontSize: 12 }}>→</Text>
                  </TouchableOpacity>
                </View>
              )}

              {project.landDocument && (
                <View style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <FileText size={14} color="#1AE57D" />
                    <Text style={{ color: '#9ca3af', fontSize: 12, marginLeft: 6 }}>Land Document</Text>
                  </View>
                  <TouchableOpacity
                    style={{
                      backgroundColor: '#2a3e3e',
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      borderRadius: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginLeft: 20
                    }}
                    onPress={() => {
                      Linking.openURL(project.landDocument!).catch(() => {
                        Alert.alert('Error', 'Unable to open document');
                      });
                    }}
                    activeOpacity={0.7}
                  >
                    <File size={16} color="#1AE57D" />
                    <Text style={{ color: '#1AE57D', fontSize: 13, fontWeight: '600', marginLeft: 8, flex: 1 }}>
                      View Land Document
                    </Text>
                    <Text style={{ color: '#6b7280', fontSize: 12 }}>→</Text>
                  </TouchableOpacity>
                </View>
              )}

              {project.photos && project.photos.length > 0 && (
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <ImageIcon size={14} color="#1AE57D" />
                    <Text style={{ color: '#9ca3af', fontSize: 12, marginLeft: 6 }}>
                      Project Photos ({project.photos.length})
                    </Text>
                  </View>
                  <View style={{ marginLeft: 20 }}>
                    {project.photos.map((photo, index) => (
                      <TouchableOpacity
                        key={index}
                        style={{
                          backgroundColor: '#2a3e3e',
                          paddingVertical: 10,
                          paddingHorizontal: 14,
                          borderRadius: 10,
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: 8
                        }}
                        onPress={() => {
                          Linking.openURL(photo).catch(() => {
                            Alert.alert('Error', 'Unable to open photo');
                          });
                        }}
                        activeOpacity={0.7}
                      >
                        <ImageIcon size={16} color="#1AE57D" />
                        <Text style={{ color: '#1AE57D', fontSize: 13, fontWeight: '600', marginLeft: 8, flex: 1 }}>
                          Photo {index + 1}
                        </Text>
                        <Text style={{ color: '#6b7280', fontSize: 12 }}>→</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Funding Information */}
          <View style={{
            backgroundColor: '#404040',
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
                  setNewFundingGoal((project.fundingGoal || 0).toString());
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
                LKR {(project.fundingGoal || 0).toLocaleString()}
              </Text>
            </View>

            {project.currentFunding !== undefined && (
              <View>
                <Text style={{ color: '#9ca3af', fontSize: 12, marginBottom: 4 }}>Current Funding</Text>
                <Text style={{ color: '#1AE57D', fontSize: 20, fontWeight: '700' }}>
                  LKR {project.currentFunding.toLocaleString()}
                </Text>
                <View style={{ marginTop: 8 }}>
                  <View style={{ height: 8, backgroundColor: '#2a3e3e', borderRadius: 4, overflow: 'hidden' }}>
                    <View style={{
                      width: `${Math.min((project.currentFunding / (project.fundingGoal || 1)) * 100, 100)}%`,
                      height: '100%',
                      backgroundColor: '#1AE57D'
                    }} />
                  </View>
                  <Text style={{ color: '#9ca3af', fontSize: 11, marginTop: 4 }}>
                    {Math.round((project.currentFunding / (project.fundingGoal || 1)) * 100)}% funded
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Progress (for Implemented projects) */}
          {project.status === 'Implemented' && (
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
                    {project.progress || 0}%
                  </Text>
                </View>
                <View style={{ height: 12, backgroundColor: '#2a3e3e', borderRadius: 6, overflow: 'hidden' }}>
                  <View style={{
                    width: `${project.progress || 0}%`,
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
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              marginBottom: 12
            }}
            onPress={() => setShowStatusModal(true)}
            activeOpacity={0.8}
          >
            <Text style={{ color: '#122119', fontSize: 16, fontWeight: '700' }}>
              Change Project Status
            </Text>
          </TouchableOpacity>

          {/* Delete Button */}
          <TouchableOpacity
            style={{
              backgroundColor: '#ef4444',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              marginBottom: 12,
              flexDirection: 'row',
              justifyContent: 'center'
            }}
            onPress={() => setShowDeleteModal(true)}
            activeOpacity={0.8}
          >
            <Trash2 size={20} color="white" />
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '700', marginLeft: 8 }}>
              Delete Project
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

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

            <Text style={{ color: '#9ca3af', fontSize: 13, marginBottom: 16 }}>
              Select new status for: {project.projectTitle}
            </Text>

            {statuses.map((status) => (
              <TouchableOpacity
                key={status}
                style={{
                  backgroundColor: project.status === status ? '#10b98120' : '#1a2e1a',
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  marginBottom: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderWidth: 1,
                  borderColor: project.status === status ? '#10b981' : '#2a3e3e'
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
                    color: project.status === status ? '#10b981' : 'white',
                    fontSize: 15,
                    fontWeight: project.status === status ? '700' : '500'
                  }}>
                    {status}
                  </Text>
                </View>
                {project.status === status && (
                  <Check size={18} color="#10b981" />
                )}
              </TouchableOpacity>
            ))}

            {updatingStatus && (
              <View style={{ marginTop: 12, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#1AE57D" />
              </View>
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

            <Text style={{ color: '#9ca3af', fontSize: 13, marginBottom: 16 }}>
              {project.projectTitle}
            </Text>

            {project.fundingGoal && project.fundingGoal > 0 && (
              <View style={{
                backgroundColor: '#1a2e1a',
                padding: 12,
                borderRadius: 12,
                marginBottom: 16
              }}>
                <Text style={{ color: '#9ca3af', fontSize: 12, marginBottom: 4 }}>Current Funding Goal</Text>
                <Text style={{ color: '#10b981', fontSize: 18, fontWeight: '700' }}>
                  LKR {project.fundingGoal.toLocaleString()}
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
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDeleteModal(false)}
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
                <Trash2 size={22} color="#ef4444" />
                <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', marginLeft: 8 }}>
                  Delete Project
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
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

            {project && (
              <>
                <View style={{
                  backgroundColor: '#ef444420',
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: '#ef444440'
                }}>
                  <Text style={{ color: '#ef4444', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                    ⚠️ Warning: This action cannot be undone
                  </Text>
                  <Text style={{ color: '#d1d5db', fontSize: 13, lineHeight: 20 }}>
                    You are about to permanently delete this project:
                  </Text>
                  <Text style={{ color: 'white', fontSize: 15, fontWeight: '600', marginTop: 8 }}>
                    "{project.projectTitle}"
                  </Text>
                  <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>
                    ID: {project.id}
                  </Text>
                </View>

                <Text style={{ color: '#9ca3af', fontSize: 13, marginBottom: 20, lineHeight: 20 }}>
                  All project data, including documents, funding information, and progress will be permanently removed from the system.
                </Text>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: '#2a3e3e',
                      paddingVertical: 14,
                      borderRadius: 12,
                      alignItems: 'center'
                    }}
                    onPress={() => setShowDeleteModal(false)}
                    activeOpacity={0.8}
                    disabled={deleting}
                  >
                    <Text style={{ color: 'white', fontSize: 15, fontWeight: '600' }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: '#ef4444',
                      paddingVertical: 14,
                      borderRadius: 12,
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center'
                    }}
                    onPress={handleDeleteProject}
                    activeOpacity={0.8}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        <Trash2 size={16} color="white" />
                        <Text style={{ color: 'white', fontSize: 15, fontWeight: '700', marginLeft: 6 }}>
                          Delete
                        </Text>
                      </>
                    )}
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

export default AdminProjectDisplay;
