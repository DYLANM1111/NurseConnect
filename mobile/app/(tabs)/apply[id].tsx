import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Dimensions
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authAPI, shiftsAPI } from '../api/client';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Shift = {
  id: string;
  hospital: string;
  unit: string;
  date: string;
  startTime: string;
  endTime: string;
  rate: number;
  distance: string;
  specialty: string;
  facilityRating: number;
  shiftLength: number;
  urgentFill?: boolean;
  requirements?: string[];
  description?: string;
  contact?: string;
};

type NurseProfile = {
  id: string;
  name: string;
  specialty: string;
  licenses: string[];
  certifications: string[];
  experience: number;
  preferences: {
    hourlyRate: { min: number; max: number };
    shiftTypes: string[];
    distance: number;
  };
};

export default function ApplyShiftScreen() {
  const params = useLocalSearchParams();
  const shiftId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const resetKey = typeof params.reset === 'string' ? params.reset : 'default';

  
  const [loading, setLoading] = useState(true);
  const [shift, setShift] = useState<Shift | null>(null);
  const [nurseProfile, setNurseProfile] = useState<NurseProfile | null>(null);
  const [specialNotes, setSpecialNotes] = useState('');
  const [availability, setAvailability] = useState(true);
  const [qualificationsMatch, setQualificationsMatch] = useState(true);
  const [step, setStep] = useState(1); // 1: Review, 2: Qualifications, 3: Confirmation
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    console.log('ShiftId received:', shiftId);

    // Fetch user data
    const fetchUserData = async () => {
      try {
        const userData = await authAPI.getCurrentUser();
        console.log('User data:', userData);
        
        if (userData) {
          try {
            const response = await authAPI.nurseDetails(userData.id);
            console.log('Nurse profile data:', response);
            
            // Note the updated property paths
            const nurseProfileData = response.data;
            const nurseDetails = nurseProfileData.nurseProfile;
            // Extract license types from the licenses array
            const licenses = nurseProfileData.licenses?.map((license: { license_type: any; state: any; }) => 
              `${license.license_type} (${license.state})`
            ) || [];
            
            // Extract certification names from the certifications array
            const certifications = nurseProfileData.certifications?.map((cert: { certification_name: any; }) => 
              cert.certification_name
            ) || [];
            setNurseProfile({
              id: userData.id || 'unknown',
              name: `${userData.first_name} ${userData.last_name}`,
              specialty: nurseDetails.specialty || 'Not specified',
              licenses: licenses,
              certifications: certifications,
              experience: nurseDetails.yearsExperience || 0,
              preferences: {
                hourlyRate: nurseDetails.hourlyRateRange || { min: 0, max: 100 },
                shiftTypes: nurseDetails.preferredShiftTypes || [],
                distance: nurseDetails.preferredDistance || 25,
              }
            });
          } catch (profileError) {
            console.error('Error fetching nurse profile:', profileError);
            
            // Fallback to basic user data
            setNurseProfile({
              id: userData.id || 'unknown',
              name: `${userData.first_name} ${userData.last_name}`,
              specialty: 'Not specified',
              licenses: [],
              certifications: [],
              experience: 0,
              preferences: {
                hourlyRate: { min: 0, max: 100 },
                shiftTypes: [],
                distance: 25,
              }
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    // Fetch shift data
    const fetchShiftData = async () => {
      try {
        const shiftData = await shiftsAPI.getShiftDetails(shiftId);
        console.log('Shift data from API:', shiftData);
        setShift(shiftData);
      } catch (error) {
        console.error('Error fetching shift from API:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
    fetchShiftData();
  }, [shiftId]);


useEffect(() => {
  setStep(1);
}, [resetKey]);
  useEffect(() => {
    if (shift && nurseProfile) {
      console.log('Comparing specialties:', shift.specialty, nurseProfile.specialty);
      setQualificationsMatch(shift.specialty === nurseProfile.specialty);
    }
  }, [shift, nurseProfile]);
  
const handleSubmitApplication = async () => {
  console.log('Starting application submission, current step:', step);
  if (!availability) {
    Alert.alert(
      "Availability Conflict",
      "You've indicated a potential conflict with this shift. Please confirm your availability before applying.",
      [{ text: "OK" }]
    );
    return;
  }
  
  setSubmitting(true);
  
  try {
    console.log('Sending application data to API:', {
      specialNotes,
      availabilityConfirmed: availability,
      status: "pending" 
    });
    
    await shiftsAPI.applyForShift(shiftId, {
      specialNotes: specialNotes,
      availabilityConfirmed: availability,
      status: "pending" 
    });
    
    console.log('Application successfully submitted, advancing to step 3');
    setStep(3); 
  } catch (error) {
    console.error('Error applying for shift:', error);
    
   
    Alert.alert(
      "Application Error",
      "There was an error submitting your application. Please try again.",
      [{ text: "OK" }]
    );
  } finally {
    setSubmitting(false);
  }
};

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#006AFF" />
        <Text style={styles.loadingText}>Loading shift details...</Text>
      </SafeAreaView>
    );
  }

  if (!shift) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
        <Text style={styles.errorTitle}>Shift Not Found</Text>
        <Text style={styles.errorText}>We couldn't find the shift you're looking for.</Text>
        <TouchableOpacity 
          style={styles.returnButton}
          onPress={() => router.back()}
        >
          <Text style={styles.returnButtonText}>Return to Shifts</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Calculate bottom padding to avoid tab bar overlap
  const bottomPadding = Platform.OS === 'ios' ? Math.max(insets.bottom, 20) + 50 : 70;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoid}
    >
      <SafeAreaView style={styles.container}>
        <Stack.Screen 
          options={{
            title: step === 3 ? 'Application Submitted' : 'Apply for Shift',
            headerBackTitle: 'Back',
          }}
        />
        
        <ScrollView 
          style={styles.content}
          contentContainerStyle={{ paddingBottom: bottomPadding }}
        >
          {step === 1 && (
            <View style={styles.stepContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '33%' }]} />
              </View>
              <Text style={styles.stepTitle}>Step 1: Review Shift Details</Text>
              
              <View style={styles.shiftCard}>
                {shift.urgentFill && (
                  <View style={styles.urgentBadge}>
                    <Ionicons name="flash" size={14} color="#FFFFFF" />
                    <Text style={styles.urgentBadgeText}>Urgent Fill</Text>
                  </View>
                )}
                
                <View style={styles.hospitalInfoSection}>
                  <Text style={styles.hospitalName}>{shift.hospital}</Text>
                  <View style={styles.unitContainer}>
                    <Text style={styles.unitName}>{shift.unit}</Text>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color="#FFBC00" />
                      <Text style={styles.ratingText}>{shift.facilityRating.toFixed(1)}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Date</Text>
                    <Text style={styles.detailValue}>{shift.date}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Time</Text>
                    <Text style={styles.detailValue}>{shift.startTime} - {shift.endTime}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Length</Text>
                    <Text style={styles.detailValue}>{shift.shiftLength} hours</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Rate</Text>
                    <Text style={[styles.detailValue, styles.rateText]}>${shift.rate.toFixed(2)}/hr</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Distance</Text>
                    <Text style={styles.detailValue}>{shift.distance}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Specialty</Text>
                    <Text style={styles.detailValue}>{shift.specialty}</Text>
                  </View>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.descriptionSection}>
                  <Text style={styles.sectionTitle}>Shift Description</Text>
                  <Text style={styles.descriptionText}>{shift.description || "No additional description provided."}</Text>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.requirementsSection}>
                  <Text style={styles.sectionTitle}>Requirements</Text>
                  {shift.requirements && shift.requirements.length > 0 ? (
                    shift.requirements.map((req, index) => (
                      <View key={index} style={styles.requirementItem}>
                        <Ionicons name="checkmark-circle" size={18} color="#10B981" style={styles.requirementIcon} />
                        <Text style={styles.requirementText}>{req}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noDataText}>No specific requirements listed</Text>
                  )}
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.contactSection}>
                  <Text style={styles.sectionTitle}>Contact</Text>
                  <Text style={styles.contactText}>{shift.contact || "Contact information will be provided after application is approved."}</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.continueButton}
                onPress={() => setStep(2)}
              >
                <Text style={styles.continueButtonText}>Continue to Apply</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {step === 2 && nurseProfile && (
            <View style={styles.stepContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '66%' }]} />
              </View>
              <Text style={styles.stepTitle}>Step 2: Confirm Qualifications</Text>
              
              <View style={styles.qualificationsCard}>
                <Text style={styles.qualificationsTitle}>Your Qualifications</Text>
                
                <View style={styles.qualificationSection}>
                  <Text style={styles.qualificationLabel}>Name</Text>
                  <Text style={styles.qualificationValue}>{nurseProfile.name}</Text>
                </View>
                
                <View style={styles.qualificationSection}>
                  <Text style={styles.qualificationLabel}>Specialty</Text>
                  <Text style={[
                    styles.qualificationValue, 
                    nurseProfile.specialty === shift.specialty 
                      ? styles.matchText 
                      : styles.mismatchText
                  ]}>
                    {nurseProfile.specialty}
                    {nurseProfile.specialty === shift.specialty 
                      ? ' (Match)' 
                      : ' (Mismatch)'}
                  </Text>
                </View>
                
                <View style={styles.qualificationSection}>
                  <Text style={styles.qualificationLabel}>Licenses</Text>
                  <View style={styles.tagsContainer}>
                    {nurseProfile.licenses.length > 0 ? (
                      nurseProfile.licenses.map((license, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{license}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noDataText}>No licenses added</Text>
                    )}
                  </View>
                </View>
                
                <View style={styles.qualificationSection}>
                  <Text style={styles.qualificationLabel}>Certifications</Text>
                  <View style={styles.tagsContainer}>
                    {nurseProfile.certifications.length > 0 ? (
                      nurseProfile.certifications.map((cert, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{cert}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noDataText}>No certifications added</Text>
                    )}
                  </View>
                </View>
                
                <View style={styles.qualificationSection}>
                  <Text style={styles.qualificationLabel}>Experience</Text>
                  <Text style={styles.qualificationValue}>{nurseProfile.experience} years</Text>
                </View>
              </View>
              
              {!qualificationsMatch && (
                <View style={styles.warningCard}>
                  <Ionicons name="warning-outline" size={24} color="#F59E0B" style={styles.warningIcon} />
                  <Text style={styles.warningText}>
                    Your specialty doesn't match this shift's requirements. You can still apply, but priority may be given to nurses with matching qualifications.
                  </Text>
                </View>
              )}
              
              <View style={styles.availabilitySection}>
                <Text style={styles.sectionTitle}>Confirm Availability</Text>
                <TouchableOpacity 
                  style={styles.checkboxContainer}
                  onPress={() => setAvailability(!availability)}
                >
                  <View style={[styles.checkbox, availability && styles.checkboxChecked]}>
                    {availability && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    I confirm that I am available on {shift.date} from {shift.startTime} to {shift.endTime}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.notesSection}>
                <Text style={styles.sectionTitle}>Special Notes (Optional)</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Any additional information you'd like to share..."
                  placeholderTextColor="#A0A0A0"
                  multiline={true}
                  numberOfLines={4}
                  value={specialNotes}
                  onChangeText={setSpecialNotes}
                />
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.submitButton, 
                  submitting && styles.submitButtonDisabled
                ]}
                onPress={handleSubmitApplication}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Application</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setStep(1)}
                disabled={submitting}
              >
                <Text style={styles.backButtonText}>Back to Details</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {step === 3 && (
            <View style={styles.confirmationContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '100%' }]} />
              </View>
              
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={80} color="#10B981" />
              </View>
              
              <Text style={styles.confirmationTitle}>Application Submitted!</Text>
              <Text style={styles.confirmationText}>
                Your application for {shift.hospital} ({shift.unit}) on {shift.date} has been successfully submitted.
              </Text>
              
              <View style={styles.applicationDetails}>
                <Text style={styles.applicationDetailsTitle}>What's Next?</Text>
                <View style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <Text style={styles.stepText}>The facility will review your application</Text>
                </View>
                <View style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <Text style={styles.stepText}>You'll receive a notification when your application is approved</Text>
                </View>
                <View style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <Text style={styles.stepText}>Once approved, you can confirm the shift in your schedule</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.viewApplicationsButton}
                onPress={() => router.push('/applications')}
              >
                <Text style={styles.viewApplicationsButtonText}>View My Applications</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.returnHomeButton}
                onPress={() => router.push('/home')}
              >
                <Text style={styles.returnHomeButtonText}>Return to Shifts</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 20,
  },
  progressFill: {
    height: 6,
    backgroundColor: '#006AFF',
    borderRadius: 3,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E2022',
    marginBottom: 16,
  },
  shiftCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  urgentBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  urgentBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  hospitalInfoSection: {
    marginBottom: 16,
  },
  hospitalName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E2022',
    marginBottom: 8,
  },
  unitContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unitName: {
    fontSize: 16,
    color: '#6B7280',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E2022',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  detailItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1E2022',
  },
  noDataText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#9CA3AF',
  },
  rateText: {
    color: '#059669',
    fontWeight: '700',
  },
  descriptionSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E2022',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
  },
  requirementsSection: {
    marginBottom: 16,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementIcon: {
    marginRight: 7,
  },
  requirementText: {
    fontSize: 14,
    color: '#4B5563',
  },
  contactSection: {
    marginBottom: 0,
  },
  contactText: {
    fontSize: 14,
    color: '#4B5563',
  },
  continueButton: {
    backgroundColor: '#006AFF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 0,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  qualificationsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  qualificationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E2022',
    marginBottom: 16,
  },
  qualificationSection: {
    marginBottom: 16,
  },
  qualificationLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  qualificationValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E2022',
  },
  matchText: {
    color: '#10B981',
  },
  mismatchText: {
    color: '#F59E0B',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
  },
  warningCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  availabilitySection: {
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#006AFF',
    borderColor: '#006AFF',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
  },
  notesSection: {
    marginBottom: 24,
  },
  notesInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#1E2022',
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#006AFF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E2022',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  returnButton: {
    backgroundColor: '#006AFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  returnButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmationContainer: {
    padding: 16,
    alignItems: 'center',
  },
  successIcon: {
    marginVertical: 24,
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E2022',
    marginBottom: 12,
  },
  confirmationText: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  applicationDetails: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  applicationDetailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E2022',
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#006AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  viewApplicationsButton: {
    backgroundColor: '#006AFF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  viewApplicationsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  returnHomeButton: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    width: '100%',
  },
  returnHomeButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
});