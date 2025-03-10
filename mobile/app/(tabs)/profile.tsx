// app/(tabs)/profile.tsx
import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Fallback data (used while loading or if data is missing)
const DEFAULT_USER_DATA = {
  first_name: '',
  last_name: '',
  title: '',
  specialty: '',
  experience: '',
  email: '',
  phone_number: '',
  licenses: [],
  certifications: [],
  preferredShiftTypes: [],
  preferredDistance: 0,
  minHourlyRate: 0,
  maxHourlyRate: 0
};

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState(DEFAULT_USER_DATA);
  const [loading, setLoading] = useState(true);
  const [showAllCerts, setShowAllCerts] = useState(false);
 console.log(userData,'This is the')
  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userDataString = await AsyncStorage.getItem('user');
        
        if (userDataString) {
          const user = JSON.parse(userDataString);
          console.log('User data loaded:', user);
          
          // If the user has a nurse_profile_id, fetch their full profile details
          // For now, we'll just use the data we have and mock some of the missing fields
          
          // Combine user data with additional profile info
          const enhancedUserData = {
            ...user,
            title: user.specialty || 'RN',
            experience: user.yearsExperience ? `${user.yearsExperience} years` : '',
            // Mock data for licenses and certifications, to be replaced with API data
            licenses: [
              {
                id: '1',
                type: 'RN License',
                number: 'RN 12345678',
                state: 'CA',
                expiryDate: '2025-12-31',
                status: 'active',
                verificationStatus: 'verified'
              }
            ],
            certifications: [
              {
                id: '1',
                name: 'BLS',
                issuingBody: 'American Heart Association',
                expiryDate: '2025-06-30',
                status: 'active'
              },
              {
                id: '2',
                name: 'ACLS',
                issuingBody: 'American Heart Association',
                expiryDate: '2025-06-30',
                status: 'active'
              }
            ],
            preferredShifts: user.preferredShiftTypes || [],
            maxDistanceMiles: user.preferredDistance || 25,
            hourlyRateRange: {
              min: user.minHourlyRate || 0,
              max: user.maxHourlyRate || 0
            }
          };
          
          setUserData(enhancedUserData);
        } else {
          // No user data found, redirect to login
          console.log('No user data found, redirecting to login test');
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

  // Show loading indicator while fetching data
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
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
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
        >
          <Text style={styles.settingsButtonText}>Settings</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Image
              source={require('../../assets/images/dog3.jpg')}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{userData.first_name} {userData.last_name}</Text>
              <Text style={styles.title}>{userData.title}</Text>
              <Text style={styles.specialty}>{userData.specialty}</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Experience</Text>
              <Text style={styles.infoValue}>{userData.experience || 'Not specified'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Preferred Rate</Text>
              <Text style={styles.infoValue}>
                ${userData.minHourlyRate}-{userData.maxHourlyRate}/hr
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => router.push('/profile/edit')}
          >
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* License Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nursing License</Text>
            <TouchableOpacity onPress={handleUploadDocument}>
              <Text style={styles.uploadText}>Upload</Text>
            </TouchableOpacity>
          </View>

          {userData.licenses && userData.licenses.length > 0 ? (
            userData.licenses.map((license) => (
              <View key={license.id} style={styles.licenseCard}>
                <View style={styles.licenseHeader}>
                  <Text style={styles.licenseTitle}>{license.type}</Text>
                  <View style={[
                    styles.statusTag,
                    getExpiryStatus(license.expiryDate) === 'valid' && styles.validTag,
                    getExpiryStatus(license.expiryDate) === 'expiring' && styles.expiringTag,
                    getExpiryStatus(license.expiryDate) === 'expired' && styles.expiredTag,
                  ]}>
                    <Text style={[
                      styles.statusText,
                      getExpiryStatus(license.expiryDate) === 'valid' && styles.validText,
                      getExpiryStatus(license.expiryDate) === 'expiring' && styles.expiringText,
                      getExpiryStatus(license.expiryDate) === 'expired' && styles.expiredText,
                    ]}>
                      {getExpiryStatus(license.expiryDate) === 'valid' ? 'Active' :
                      getExpiryStatus(license.expiryDate) === 'expiring' ? 'Expiring Soon' :
                      'Expired'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.licenseNumber}>License # {license.number}</Text>
                <Text style={styles.licenseState}>State: {license.state}</Text>
                <Text style={styles.expiryDate}>Expires: {new Date(license.expiryDate).toLocaleDateString()}</Text>
                
                <TouchableOpacity 
                  style={styles.documentButton}
                  onPress={() => console.log('View document')}
                >
                  <Text style={styles.documentButtonText}>View Document</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No licenses added yet</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={handleUploadDocument}
              >
                <Text style={styles.addButtonText}>Add License</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Certifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <TouchableOpacity onPress={handleUploadDocument}>
              <Text style={styles.uploadText}>Add New</Text>
            </TouchableOpacity>
          </View>

          {userData.certifications && userData.certifications.length > 0 ? (
            <>
              {userData.certifications
                .slice(0, showAllCerts ? undefined : 2)
                .map((cert) => (
                  <View key={cert.id} style={styles.certCard}>
                    <View style={styles.certHeader}>
                      <Text style={styles.certTitle}>{cert.name}</Text>
                      <View style={[
                        styles.statusTag,
                        getExpiryStatus(cert.expiryDate) === 'valid' && styles.validTag,
                        getExpiryStatus(cert.expiryDate) === 'expiring' && styles.expiringTag,
                        getExpiryStatus(cert.expiryDate) === 'expired' && styles.expiredTag,
                      ]}>
                        <Text style={[
                          styles.statusText,
                          getExpiryStatus(cert.expiryDate) === 'valid' && styles.validText,
                          getExpiryStatus(cert.expiryDate) === 'expiring' && styles.expiringText,
                          getExpiryStatus(cert.expiryDate) === 'expired' && styles.expiredText,
                        ]}>
                          {getExpiryStatus(cert.expiryDate) === 'valid' ? 'Active' :
                          getExpiryStatus(cert.expiryDate) === 'expiring' ? 'Expiring Soon' :
                          'Expired'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.certIssuer}>{cert.issuingBody}</Text>
                    <Text style={styles.expiryDate}>Expires: {new Date(cert.expiryDate).toLocaleDateString()}</Text>
                    
                    <TouchableOpacity 
                      style={styles.documentButton}
                      onPress={() => console.log('View certification')}
                    >
                      <Text style={styles.documentButtonText}>View Certificate</Text>
                    </TouchableOpacity>
                  </View>
              ))}

              {userData.certifications.length > 2 && (
                <TouchableOpacity 
                  style={styles.showMoreButton}
                  onPress={() => setShowAllCerts(!showAllCerts)}
                >
                  <Text style={styles.showMoreText}>
                    {showAllCerts ? 'Show Less' : 'Show All Certifications'}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No certifications added yet</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={handleUploadDocument}
              >
                <Text style={styles.addButtonText}>Add Certification</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <TouchableOpacity onPress={() => router.push('/preferences')}>
              <Text style={styles.uploadText}>Edit</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.preferencesCard}>
            <View style={styles.preferenceItem}>
              <Text style={styles.preferenceLabel}>Preferred Shifts</Text>
              <View style={styles.shiftTags}>
                {userData.preferredShifts && userData.preferredShifts.length > 0 ? (
                  userData.preferredShifts.map((shift, index) => (
                    <View key={index} style={styles.shiftTag}>
                      <Text style={styles.shiftTagText}>{shift}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noPreferenceText}>No preferences set</Text>
                )}
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.preferenceItem}>
              <Text style={styles.preferenceLabel}>Maximum Distance</Text>
              <Text style={styles.preferenceValue}>{userData.maxDistanceMiles} miles</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.preferenceItem}>
              <Text style={styles.preferenceLabel}>Hourly Rate Range</Text>
              <Text style={styles.preferenceValue}>
                ${userData.hourlyRateRange.min} - ${userData.hourlyRateRange.max}
              </Text>
            </View>
          </View>
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
  // Continuing the styles...
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