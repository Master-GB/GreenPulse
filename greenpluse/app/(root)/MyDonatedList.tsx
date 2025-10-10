import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StatusBar, ActivityIndicator } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { db, auth } from '@/config/firebaseConfig';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

type CertificateStatus = 'Pending' | 'Available';

interface DonationType {
  id: string;
  title: string;
  amount: number;
  date: string;
  image: string;
  certificateStatus: CertificateStatus;
  projectId: string;
  timestamp?: number;
}

const MyDonatedList = () => {
  const router = useRouter();
  const [donations, setDonations] = useState<DonationType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDonations();
  }, []);

  const fetchUserDonations = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('No user logged in');
        setLoading(false);
        return;
      }

      // Query donations collection for current user
      const donationsRef = collection(db, 'donations');
      const q = query(
        donationsRef,
        where('userId', '==', user.uid)
      );

      const querySnapshot = await getDocs(q);
      const fetchedDonations: DonationType[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedDonations.push({
          id: doc.id,
          title: data.projectTitle || 'Untitled Project',
          amount: data.amount || 0,
          date: data.donatedAt?.toDate?.()?.toLocaleString() || 'Recent',
          image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400',
          certificateStatus: 'Available',
          projectId: data.projectId,
          timestamp: data.donatedAt?.toDate?.()?.getTime() || 0
        });
      });

      // Sort by date descending (newest first)
      fetchedDonations.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      setDonations(fetchedDonations);
    } catch (error) {
      console.error('Error fetching donations:', error);
      // Fallback to mock data
      setDonations([
        {
          id: '1',
          title: 'Solar Panel Installation in Rural Village',
          amount: 500,
          date: '2024-03-15 10:30 AM',
          image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400',
          certificateStatus: 'Pending',
          projectId: 'mock1'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCertificate = (donationId: string) => {
    // Navigate to certificate view
    router.push({
      pathname: '/(root)/Certificate',
      params: { id: donationId }
    } as any);
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <View style={{ flex: 1, backgroundColor: '#122119' }}>
        

        {/* Donations List */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 }}>
              <ActivityIndicator size="large" color="#10b981" />
              <Text style={{ color: '#6b7280', fontSize: 14, marginTop: 12 }}>Loading your donations...</Text>
            </View>
          ) : donations.map((donation) => (
            <View
              key={donation.id}
              style={{
                backgroundColor: '#2a2a2a',
                borderRadius: 20,
                padding: 16,
                marginBottom: 20,
                flexDirection: 'row',
                gap: 16
              }}
            >
              {/* Project Image */}
              <Image
                source={{ uri: donation.image }}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 16,
                  backgroundColor: '#1a1a1a'
                }}
                resizeMode="cover"
              />

              {/* Donation Info */}
              <View style={{ flex: 1, justifyContent: 'space-between' }}>
                <View>
                  <Text style={{
                    color: 'white',
                    fontSize: 18,
                    fontWeight: '700',
                    marginBottom: 8,
                    lineHeight: 24
                  }}>
                    {donation.title}
                  </Text>
                  <Text style={{
                    color: '#a3e635',
                    fontSize: 15,
                    fontWeight: '600',
                    marginBottom: 4
                  }}>
                    Donated: {donation.amount} coins
                  </Text>
                  <Text style={{
                    color: '#9ca3af',
                    fontSize: 13,
                    marginBottom: 12
                  }}>
                    Donated on: {donation.date}
                  </Text>
                </View>

                {/* Certificate Button */}
                <TouchableOpacity
                  style={{
                    backgroundColor: donation.certificateStatus === 'Available' ? '#16a34a' : '#15803d',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 12,
                    alignItems: 'center',
                    alignSelf: 'flex-start'
                  }}
                  onPress={() => donation.certificateStatus === 'Available' && handleViewCertificate(donation.id)}
                  disabled={donation.certificateStatus === 'Pending'}
                  activeOpacity={0.8}
                >
                  <Text style={{
                    color: 'white',
                    fontSize: 14,
                    fontWeight: '600'
                  }}>
                    {donation.certificateStatus === 'Pending' ? 'Certificate Pending' : 'View Certificate'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {donations.length === 0 && (
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 60
            }}>
              <Text style={{ color: '#6b7280', fontSize: 16, textAlign: 'center' }}>
                No donations yet
              </Text>
              <Text style={{ color: '#4b5563', fontSize: 14, marginTop: 8, textAlign: 'center' }}>
                Start supporting projects to see your donations here
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
            onPress={() => router.push('/project' as any)}
            activeOpacity={0.9}
          >
            <Text style={{
              color: '#1a1a1a',
              fontSize: 18,
              fontWeight: '700'
            }}>
              Donate More
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default MyDonatedList;