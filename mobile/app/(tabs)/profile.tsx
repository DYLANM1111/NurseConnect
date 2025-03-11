import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/client';

const DEFAULT_USER_DATA = {
  id: '',
  email: '',
  first_name: '',
  last_name: '',
  role: '',
  phone_number: '',
  nurse_profile_id: '',
  specialty: '',
  years_experience: 0,
  preferred_shift_type: [],
  preferred_distance: 0,
  min_hourly_rate: '0.00',
  max_hourly_rate: '0.00',
  licenses: [],
  certifications: []
};

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState(DEFAULT_USER_DATA);
  const [loading, setLoading] = useState(true);
  const [showAllCerts, setShowAllCerts] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userDataString = await AsyncStorage.getItem('user');
        
        if (userDataString) {
          const user = JSON.parse(userDataString);
          console.log('User data loaded:', user);

          try {
            const response = await apiClient.get(`/nurses/${user.id}/profile`);
            console.log('Fetched profile data:', response.data);

            if (response.data && response.data.data) {
              const profileData = response.data.data;

              setUserData({
                ...profileData,
                specialty: profileData.nurseProfile?.specialty || '',
                years_experience: profileData.nurseProfile?.yearsExperience || 0,
                preferred_shift_type: profileData.nurseProfile?.preferredShiftTypes || [],
                preferred_distance: profileData.nurseProfile?.preferredDistance || 25,
                min_hourly_rate: profileData.nurseProfile?.hourlyRateRange?.min || '0.00',
                max_hourly_rate: profileData.nurseProfile?.hourlyRateRange?.max || '0.00',
                licenses: profileData.licenses || [],
                certifications: profileData.certifications || []
              });
            } else {
              console.log('Unexpected API response format. Using cached data.');
              setUserData({
                ...user,
                licenses: [],
                certifications: []
              });
            }
          } catch (error) {
            console.error('Error fetching profile from API:', error);
            setUserData({
              ...user,
              specialty: user.specialty || '',
              years_experience: user.years_experience || 0,
              preferred_shift_type: user.preferred_shift_type || [],
              preferred_distance: user.preferred_distance || 25,
              min_hourly_rate: user.min_hourly_rate || '0.00',
              max_hourly_rate: user.max_hourly_rate || '0.00',
              licenses: [],
              certifications: []
            });
          }
        } else {
          console.log('No user data found, redirecting to login');
          router.replace('/signin');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleUploadDocument = () => {
    Alert.alert(
      'Upload Document',
      'Choose document type',
      [
        { text: 'License', onPress: () => console.log('Upload License') },
        { text: 'Certification', onPress: () => console.log('Upload Certification') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const getExpiryStatus = (date: string) => {
    const expiryDate = new Date(date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry < 30) return 'expiring';
    return 'valid';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0065FF" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile & Credentials</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/settings')}>
          <Text style={styles.settingsButtonText}>Settings</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Image source={require('../../assets/images/dog3.jpg')} style={styles.profileImage} />
            <View style={styles.profileInfo}>
              <Text style={styles.name}>
                {userData?.first_name} {userData?.last_name}
              </Text>
              <Text style={styles.title}>{userData?.role}</Text>
              <Text style={styles.specialty}>{userData?.specialty}</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Experience</Text>
              <Text style={styles.infoValue}>{userData?.years_experience} years</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Preferred Rate</Text>
              <Text style={styles.infoValue}>
                ${userData?.min_hourly_rate} - ${userData?.max_hourly_rate}/hr
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={() => router.push('/(tabs)/profile/edit')}>
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Licenses Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Licenses</Text>
          {userData.licenses.map((license) => (
            <View key={license.id} style={styles.licenseCard}>
              <Text style={styles.licenseTitle}>{license.license_type}</Text>
              <Text style={styles.licenseNumber}>License #: {license.license_number}</Text>
              <Text style={styles.licenseState}>State: {license.state}</Text>
              <Text style={styles.expiryDate}>
                Expires: {new Date(license.expiry_date).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>

        {/* Certifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          {userData.certifications.map((cert) => (
            <View key={cert.id} style={styles.certCard}>
              <Text style={styles.certTitle}>{cert.certification_name}</Text>
              <Text style={styles.certIssuer}>{cert.issuing_body}</Text>
              <Text style={styles.expiryDate}>
                Expires: {new Date(cert.expiry_date).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <Text>Preferred Distance: {userData?.preferred_distance} miles</Text>
          <Text>Hourly Rate: ${userData?.min_hourly_rate} - ${userData?.max_hourly_rate}/hr</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E9F2',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2E3A59',
  },
  settingsButton: {
    padding: 8,
  },
  settingsButtonText: {
    color: '#0065FF',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#1A1F33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    backgroundColor: '#F3F4F6',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: '#8F9BB3',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 16,
    color: '#2E3A59',
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E4E9F2',
    marginBottom: 16,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#8F9BB3',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E3A59',
  },
  editProfileButton: {
    backgroundColor: '#F0F4FF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editProfileButtonText: {
    color: '#0065FF',
    fontSize: 16,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E3A59',
  },
  uploadText: {
    color: '#0065FF',
    fontSize: 14,
    fontWeight: '500',
  },
  licenseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#1A1F33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  licenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  licenseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E3A59',
  },
  statusTag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  validTag: {
    backgroundColor: '#E3FCF2',
  },
  expiringTag: {
    backgroundColor: '#FFF3E3',
  },
  expiredTag: {
    backgroundColor: '#FFE9E9',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  validText: {
    color: '#36B37E',
  },
  expiringText: {
    color: '#FF9800',
  },
  expiredText: {
    color: '#FF5630',
  },
  licenseNumber: {
    fontSize: 16,
    color: '#2E3A59',
    marginBottom: 8,
  },
  licenseState: {
    fontSize: 14,
    color: '#8F9BB3',
    marginBottom: 4,
  },
  expiryDate: {
    fontSize: 14,
    color: '#8F9BB3',
    marginBottom: 16,
  },
  documentButton: {
    backgroundColor: '#F0F4FF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  documentButtonText: {
    color: '#0065FF',
    fontSize: 14,
    fontWeight: '500',
  },
  certCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#1A1F33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  certHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  certTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E3A59',
  },
  certIssuer: {
    fontSize: 14,
    color: '#8F9BB3',
    marginBottom: 4,
  },
  showMoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  showMoreText: {
    color: '#0065FF',
    fontSize: 14,
    fontWeight: '500',
  },
  preferencesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#1A1F33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  preferenceItem: {
    marginBottom: 16,
  },
  preferenceLabel: {
    fontSize: 14,
    color: '#8F9BB3',
    marginBottom: 8,
  },
  preferenceValue: {
    fontSize: 16,
    color: '#2E3A59',
    fontWeight: '500',
  },
  shiftTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  shiftTag: {
    backgroundColor: '#F0F4FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  shiftTagText: {
    color: '#0065FF',
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E4E9F2',
    marginVertical: 16,
  }
});