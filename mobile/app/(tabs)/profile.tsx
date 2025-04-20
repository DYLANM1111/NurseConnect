import { useState, useEffect, } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../api/client';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { authAPI } from '../api/client';

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
 
  
 // Replace your useEffect with this:
  useFocusEffect(
    React.useCallback(() => {
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
                  first_name: profileData.firstName || 'fName',
                  last_name: profileData.lastName || 'lName',
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
      
      return () => {
        // This runs when the screen loses focus or unmounts
        // Clean up any subscriptions/timers if needed
      };
    }, [])
  );

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

  const getExpiryStatus = (date) => {
    const expiryDate = new Date(date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry < 30) return 'expiring';
    return 'valid';
  };

  const renderStatusBadge = (expiryDate) => {
    const status = getExpiryStatus(expiryDate);
    let badgeStyle, textStyle, label;
    
    switch(status) {
      case 'valid':
        badgeStyle = styles.validBadge;
        textStyle = styles.validText;
        label = 'Active';
        break;
      case 'expiring':
        badgeStyle = styles.expiringBadge;
        textStyle = styles.expiringText;
        label = 'Expiring Soon';
        break;
      case 'expired':
        badgeStyle = styles.expiredBadge;
        textStyle = styles.expiredText;
        label = 'Expired';
        break;
    }
    
    return (
      <View style={[styles.statusBadge, badgeStyle]}>
        <Text style={[styles.statusText, textStyle]}>{label}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
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
  onPress={async () => {
   
 await AsyncStorage.removeItem('userSignupComplete');
 await authAPI.logout();
    router.push('/(tabs)/index');
  }}
>
  <Ionicons name="log-out-outline" size={24} color="#0065FF" />
</TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              <Image 
                source={require('../../assets/images/dog3.jpg')} 
                style={styles.profileImage} 
              />
              <TouchableOpacity style={styles.editImageButton}>
                <Ionicons name="camera" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>
                {userData.first_name} {userData.last_name}
              </Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{userData.role || 'Registered Nurse'}</Text>
              </View>
              <Text style={styles.specialty}>{userData.specialty || 'Not specified'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="briefcase-outline" size={24} color="#0065FF" style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Experience</Text>
              <Text style={styles.infoValue}>{userData.years_experience} years</Text>
            </View>
            <View style={styles.infoSeparator} />
            <View style={styles.infoItem}>
              <Ionicons name="cash-outline" size={24} color="#0065FF" style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Hourly Rate</Text>
              <Text style={styles.infoValue}>
                ${userData.min_hourly_rate} - ${userData.max_hourly_rate}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => router.push('/(tabs)/editProfile')}
          >
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Licenses Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Licenses</Text>
            <TouchableOpacity onPress={handleUploadDocument}>
              <Text style={styles.addButtonText}>+ Add License</Text>
            </TouchableOpacity>
          </View>
          
          {userData.licenses && userData.licenses.length > 0 ? (
            userData.licenses.map((license) => (
              <View key={license.id} style={styles.cardContainer}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{license.license_type}</Text>
                  {renderStatusBadge(license.expiry_date)}
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.cardRow}>
                    <Ionicons name="card-outline" size={18} color="#8F9BB3" />
                    <Text style={styles.cardLabel}>License #:</Text>
                    <Text style={styles.cardValue}>{license.license_number}</Text>
                  </View>
                  <View style={styles.cardRow}>
                    <Ionicons name="location-outline" size={18} color="#8F9BB3" />
                    <Text style={styles.cardLabel}>State:</Text>
                    <Text style={styles.cardValue}>{license.state}</Text>
                  </View>
                  <View style={styles.cardRow}>
                    <Ionicons name="calendar-outline" size={18} color="#8F9BB3" />
                    <Text style={styles.cardLabel}>Expires:</Text>
                    <Text style={styles.cardValue}>
                      {new Date(license.expiry_date).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.viewDocumentButton}>
                  <Text style={styles.viewDocumentText}>View Document</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color="#D7E3F8" />
              <Text style={styles.emptyStateText}>No licenses uploaded yet</Text>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={handleUploadDocument}
              >
                <Text style={styles.emptyStateButtonText}>Upload License</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Certifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <TouchableOpacity onPress={handleUploadDocument}>
              <Text style={styles.addButtonText}>+ Add Certification</Text>
            </TouchableOpacity>
          </View>

          {userData.certifications && userData.certifications.length > 0 ? (
            userData.certifications.map((cert, index) => (
              <View key={cert.id} style={styles.cardContainer}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{cert.certification_name}</Text>
                  {renderStatusBadge(cert.expiry_date)}
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.cardRow}>
                    <Ionicons name="business-outline" size={18} color="#8F9BB3" />
                    <Text style={styles.cardLabel}>Issuer:</Text>
                    <Text style={styles.cardValue}>{cert.issuing_body}</Text>
                  </View>
                  <View style={styles.cardRow}>
                    <Ionicons name="calendar-outline" size={18} color="#8F9BB3" />
                    <Text style={styles.cardLabel}>Expires:</Text>
                    <Text style={styles.cardValue}>
                      {new Date(cert.expiry_date).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.viewDocumentButton}>
                  <Text style={styles.viewDocumentText}>View Document</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="ribbon-outline" size={48} color="#D7E3F8" />
              <Text style={styles.emptyStateText}>No certifications uploaded yet</Text>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={handleUploadDocument}
              >
                <Text style={styles.emptyStateButtonText}>Upload Certification</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Preferences Section */}
        <View style={[styles.section, styles.preferencesSection]}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.preferencesCard}>
            <View style={styles.preferenceItem}>
              <View style={styles.preferenceHeader}>
                <Ionicons name="location-outline" size={20} color="#0065FF" />
                <Text style={styles.preferenceLabel}>Preferred Distance</Text>
              </View>
              <Text style={styles.preferenceValue}>{userData.preferred_distance} miles</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.preferenceItem}>
              <View style={styles.preferenceHeader}>
                <Ionicons name="cash-outline" size={20} color="#0065FF" />
                <Text style={styles.preferenceLabel}>Hourly Rate Range</Text>
              </View>
              <Text style={styles.preferenceValue}>${userData.min_hourly_rate} - ${userData.max_hourly_rate}/hr</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.preferenceItem}>
              <View style={styles.preferenceHeader}>
                <Ionicons name="time-outline" size={20} color="#0065FF" />
                <Text style={styles.preferenceLabel}>Preferred Shifts</Text>
              </View>
              {userData.preferred_shift_type && userData.preferred_shift_type.length > 0 ? (
                <View style={styles.shiftTags}>
                  {userData.preferred_shift_type.map((shift, index) => (
                    <View key={index} style={styles.shiftTag}>
                      <Text style={styles.shiftTagText}>{shift}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.preferenceValue}>No preferences set</Text>
              )}
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
    backgroundColor: '#F7F9FC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#2E3A59',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1F7',
    elevation: 2,
    shadowColor: '#1A1F33',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E3A59',
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#1A1F33',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 20,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F3F4F6',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0065FF',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  roleText: {
    color: '#0065FF',
    fontSize: 14,
    fontWeight: '600',
  },
  specialty: {
    fontSize: 16,
    color: '#8F9BB3',
  },
  divider: {
    height: 1,
    backgroundColor: '#EDF1F7',
    marginVertical: 20,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoSeparator: {
    width: 1,
    backgroundColor: '#EDF1F7',
    marginHorizontal: 10,
  },
  infoIcon: {
    marginBottom: 8,
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
    backgroundColor: '#0065FF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  editProfileButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E3A59',
  },
  addButtonText: {
    color: '#0065FF',
    fontSize: 14,
    fontWeight: '600',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#1A1F33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFD',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1F7',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E3A59',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  validBadge: {
    backgroundColor: '#E3FCF2',
  },
  expiringBadge: {
    backgroundColor: '#FFF3E3',
  },
  expiredBadge: {
    backgroundColor: '#FFE9E9',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  validText: {
    color: '#00875A',
  },
  expiringText: {
    color: '#FF8B00',
  },
  expiredText: {
    color: '#DE350B',
  },
  cardContent: {
    padding: 16,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 14,
    color: '#8F9BB3',
    marginLeft: 8,
    marginRight: 4,
  },
  cardValue: {
    fontSize: 14,
    color: '#2E3A59',
    fontWeight: '500',
    flex: 1,
  },
  viewDocumentButton: {
    borderTopWidth: 1,
    borderTopColor: '#EDF1F7',
    padding: 14,
    alignItems: 'center',
  },
  viewDocumentText: {
    color: '#0065FF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#1A1F33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8F9BB3',
    marginTop: 16,
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: '#0065FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  preferencesSection: {
    marginBottom: 32,
  },
  preferencesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#1A1F33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  preferenceItem: {
    marginVertical: 12,
  },
  preferenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  preferenceLabel: {
    fontSize: 16,
    color: '#2E3A59',
    fontWeight: '500',
    marginLeft: 8,
  },
  preferenceValue: {
    fontSize: 16,
    color: '#8F9BB3',
    paddingLeft: 28,
  },
  shiftTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingLeft: 28,
  },
  shiftTag: {
    backgroundColor: '#F0F4FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  shiftTagText: {
    color: '#0065FF',
    fontSize: 14,
    fontWeight: '500',
  },
});