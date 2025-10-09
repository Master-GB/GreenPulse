import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { X, MapPin, User, Phone, Mail, FileText, Zap, Calendar, Hash } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface ProjectDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  project: any;
}

export const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  visible,
  onClose,
  project
}) => {
  if (!project) return null;

  const getStatusColor = (status: string) => {
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
      case 'Implemented':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <FileText size={24} color="#1AE57D" />
              <Text style={styles.headerTitle}>Project Details</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Project ID & Status */}
            <View style={styles.idStatusContainer}>
              <View style={styles.idBox}>
                <Hash size={16} color="#9ca3af" />
                <Text style={styles.idText}>ID: {project.docId?.substring(0, 8).toUpperCase()}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(project.status)}20` }]}>
                <Text style={[styles.statusText, { color: getStatusColor(project.status) }]}>
                  {project.status}
                </Text>
              </View>
            </View>

            {/* Project Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Project Information</Text>
              
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <FileText size={18} color="#1AE57D" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Project Title</Text>
                    <Text style={styles.infoValue}>{project.projectTitle || 'N/A'}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Zap size={18} color="#1AE57D" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Energy System</Text>
                    <Text style={styles.infoValue}>{project.energySystem || 'N/A'}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <FileText size={18} color="#1AE57D" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Description</Text>
                    <Text style={styles.infoValue}>{project.projectDescription || 'No description provided'}</Text>
                  </View>
                </View>

                {project.energyNeed && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                      <Zap size={18} color="#1AE57D" />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Energy Need</Text>
                        <Text style={styles.infoValue}>{project.energyNeed}</Text>
                      </View>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Personal Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <User size={18} color="#1AE57D" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Full Name</Text>
                    <Text style={styles.infoValue}>{project.fullName || 'N/A'}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Hash size={18} color="#1AE57D" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>ID/License Number</Text>
                    <Text style={styles.infoValue}>{project.licenseNumber || 'N/A'}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Phone size={18} color="#1AE57D" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Phone Number</Text>
                    <Text style={styles.infoValue}>{project.phoneNumber || 'N/A'}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Mail size={18} color="#1AE57D" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{project.email || 'N/A'}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Location & Property */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location & Property</Text>
              
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <MapPin size={18} color="#1AE57D" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Address</Text>
                    <Text style={styles.infoValue}>{project.address || project.location || 'N/A'}</Text>
                  </View>
                </View>

                {project.propertyType && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                      <FileText size={18} color="#1AE57D" />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Property Type</Text>
                        <Text style={styles.infoValue}>{project.propertyType}</Text>
                      </View>
                    </View>
                  </>
                )}

                {project.landReference && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                      <Hash size={18} color="#1AE57D" />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Land Reference</Text>
                        <Text style={styles.infoValue}>{project.landReference}</Text>
                      </View>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Submission Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Submission Information</Text>
              
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Calendar size={18} color="#1AE57D" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Submitted Date</Text>
                    <Text style={styles.infoValue}>
                      {project.createdAt?.toDate?.()?.toLocaleDateString() || project.submittedDate || 'Recent'}
                    </Text>
                  </View>
                </View>

                {project.fundingGoal && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                      <FileText size={18} color="#1AE57D" />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Funding Goal</Text>
                        <Text style={styles.infoValue}>LKR {project.fundingGoal.toLocaleString()}</Text>
                      </View>
                    </View>
                  </>
                )}

                {project.currentFunding !== undefined && (
                  <>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                      <FileText size={18} color="#1AE57D" />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Current Funding</Text>
                        <Text style={styles.infoValue}>LKR {(project.currentFunding || 0).toLocaleString()}</Text>
                      </View>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Status Note */}
            <View style={styles.noteContainer}>
              <Text style={styles.noteText}>
                {project.status === 'Pending' && '⏳ Your project is under review. You will be notified once it\'s approved.'}
                {project.status === 'Approved' && '✅ Your project has been approved and is ready for funding.'}
                {project.status === 'Published' && '🎉 Your project is live and accepting donations!'}
                {project.status === 'Funded' && '💰 Your project has reached its funding goal!'}
                {project.status === 'Implemented' && '🚀 Your project has been successfully implemented!'}
                {project.status === 'Rejected' && '❌ Your project was not approved. Please contact support for details.'}
              </Text>
            </View>
          </ScrollView>

          {/* Close Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeFooterButton} onPress={onClose}>
              <Text style={styles.closeFooterButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#122119',
    borderRadius: 24,
    width: width * 0.95,
    height: '85%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a3e3e',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a3e3e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  idStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  idBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a3e3e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  idText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#2a3e3e',
    borderRadius: 16,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: '#374151',
    marginVertical: 12,
  },
  noteContainer: {
    backgroundColor: '#1AE57D20',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1AE57D',
    marginBottom: 20,
  },
  noteText: {
    color: '#1AE57D',
    fontSize: 13,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#2a3e3e',
  },
  closeFooterButton: {
    backgroundColor: '#2a3e3e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeFooterButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
