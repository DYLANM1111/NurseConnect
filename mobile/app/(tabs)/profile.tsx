// app/(tabs)/profile.tsx
import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// Mock data
const USER_DATA = {
  name: 'Sarah Johnson',
  title: 'RN, BSN',
  specialty: 'ICU Nurse',
  experience: '5 years',
  email: 'sarah.johnson@email.com',
  phone: '(650) 555-0123',
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
    },
    {
      id: '3',
      name: 'PALS',
      issuingBody: 'American Heart Association',
      expiryDate: '2025-06-30',
      status: 'active'
    }
  ],
  preferredShifts: ['Day', 'Evening'],
  maxDistanceMiles: 50,
  hourlyRateRange: {
    min: 85,
    max: 110
  }
};

export default function ProfileScreen() {
  const router = useRouter();
  const [showAllCerts, setShowAllCerts] = useState(false);

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
              <Text style={styles.name}>{USER_DATA.name}</Text>
              <Text style={styles.title}>{USER_DATA.title}</Text>
              <Text style={styles.specialty}>{USER_DATA.specialty}</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Experience</Text>
              <Text style={styles.infoValue}>{USER_DATA.experience}</Text>
            </View>
            <View style={styles.infoItem}>r
              <Text style={styles.infoLabel}>Preferred Rate</Text>
              <Text style={styles.infoValue}>${USER_DATA.hourlyRateRange.min}-{USER_DATA.hourlyRateRange.max}/hr</Text>
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

          {USER_DATA.licenses.map((license) => (
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
          ))}
        </View>

        {/* Certifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <TouchableOpacity onPress={handleUploadDocument}>
              <Text style={styles.uploadText}>Add New</Text>
            </TouchableOpacity>
          </View>

          {USER_DATA.certifications
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

          {USER_DATA.certifications.length > 2 && (
            <TouchableOpacity 
              style={styles.showMoreButton}
              onPress={() => setShowAllCerts(!showAllCerts)}
            >
              <Text style={styles.showMoreText}>
                {showAllCerts ? 'Show Less' : 'Show All Certifications'}
              </Text>
            </TouchableOpacity>
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
                {USER_DATA.preferredShifts.map((shift, index) => (
                  <View key={index} style={styles.shiftTag}>
                    <Text style={styles.shiftTagText}>{shift}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.preferenceItem}>
              <Text style={styles.preferenceLabel}>Maximum Distance</Text>
              <Text style={styles.preferenceValue}>{USER_DATA.maxDistanceMiles} miles</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.preferenceItem}>
              <Text style={styles.preferenceLabel}>Hourly Rate Range</Text>
              <Text style={styles.preferenceValue}>
                ${USER_DATA.hourlyRateRange.min} - ${USER_DATA.hourlyRateRange.max}
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