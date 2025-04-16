import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  useColorScheme,
  AccessibilityInfo,
  Alert
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { shiftsAPI } from '../api/client'; 

export default function ShiftDetailsScreen() {
  const params = useLocalSearchParams();
  const id = params.id;
  
  const [shift, setShift] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // Check if screen reader is enabled
  useEffect(() => {
    const checkScreenReader = async () => {
      const isEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      setScreenReaderEnabled(isEnabled);
    };
    
    checkScreenReader();
    
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setScreenReaderEnabled
    );
    
    return () => {
      subscription.remove();
    };
  }, []);

  // Fetch shift details
  useEffect(() => {
    const fetchShiftDetails = async () => {
      if (!id) {
        setError("No shift ID provided");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const shiftData = await shiftsAPI.getShiftDetails(id);
        console.log('Shift data fetched successfully:', shiftData);
        
        // Process data for display
        const processedShift = {
          ...shiftData,
          hospital: shiftData.hospital || "Unnamed Facility",
          unit: shiftData.unit || "Unspecified Unit",
          startTime: shiftData.startTime || shiftData.start_time || "Not specified",
          endTime: shiftData.endTime || shiftData.end_time || "Not specified",
          shiftLength: shiftData.shiftLength || shiftData.shift_length || calculateShiftLength(shiftData),
          rate: shiftData.rate || shiftData.hourly_rate || 0,
          total_pay: shiftData.total_pay || calculateTotalPay(shiftData),
          description: shiftData.description === "No description provided" ? null : shiftData.description,
          location: shiftData.location || shiftData.city_state || formatLocation(shiftData),
          requirements: Array.isArray(shiftData.requirements) ? shiftData.requirements : [],
          specialtyLabel: shiftData.specialty || shiftData.speciality || "General"
        };
        
        setShift(processedShift);
      } catch (err) {
        console.error('Error fetching shift details:', err);
        setError(err.toString());
        
        // Show alert for the error
        Alert.alert(
          'Error',
          typeof err === 'string' ? err : 'Failed to load shift details. Please try again.',
          [{ text: 'OK' }]
        );
      } finally {
        setLoading(false);
      }
    };
    
    fetchShiftDetails();
  }, [id]);

  // Helper function to calculate shift length if not provided
  const calculateShiftLength = (shiftData) => {
    if (shiftData.start_time && shiftData.end_time && typeof shiftData.start_time === 'string') {
      // In a real app, you'd parse the times properly and calculate hours
      return 12; // Default to 12 hours if we can't calculate
    }
    return null;
  };

  // Helper function to calculate total pay
  const calculateTotalPay = (shiftData) => {
    const rate = shiftData.rate || shiftData.hourly_rate || 0;
    const hours = shiftData.shiftLength || shiftData.shift_length || 12;
    return rate * hours;
  };

  // Helper function to format location
  const formatLocation = (shiftData) => {
    if (shiftData.city && shiftData.state) {
      return `${shiftData.city}, ${shiftData.state}`;
    }
    return "Location not specified";
  };

  const handleGoBack = () => {
    router.push('/dashboards');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, isDarkMode && styles.darkSafeArea]}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0065FF" />
          <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>Loading shift details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !shift) {
    return (
      <SafeAreaView style={[styles.safeArea, isDarkMode && styles.darkSafeArea]}>
        <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={[styles.errorText, isDarkMode && styles.darkText]}>
            {error || 'Shift not found'}
          </Text>
          <TouchableOpacity 
            style={styles.errorBackButton} 
            onPress={handleGoBack}
            accessible={true}
            accessibilityLabel="Go back to previous screen"
            accessibilityRole="button"
          >
            <Text style={styles.errorBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Function to format the shift status based on API data
  const getShiftStatus = () => {
    // Use status from API if available
    if (shift.status) {
      // Convert to proper format if needed (e.g., 'open' -> 'Open')
      const status = shift.status.charAt(0).toUpperCase() + shift.status.slice(1).toLowerCase();
      return status;
    }
    
    // Fallback logic if status is not directly available
    const now = new Date();
    const shiftDate = new Date(shift.date);
    
    if (shiftDate > now) return 'Upcoming';
    return 'Past';
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDarkMode && styles.darkSafeArea]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        {/* Header with back button */}
        <View style={[styles.header, isDarkMode && styles.darkHeader]}>
          <TouchableOpacity 
            onPress={handleGoBack} 
            style={styles.backButton}
            accessible={true}
            accessibilityLabel="Go back to previous screen"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={24} color={isDarkMode ? "#FFFFFF" : "#0065FF"} />
            <Text style={[styles.backButtonLabel, isDarkMode && styles.darkText]}>Back</Text>
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Shift Details</Text>
          
          <View style={styles.placeholder} />
        </View>
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Status Badge */}
          <View style={styles.badgeContainer}>
            {(shift.urgentFill || shift.urgent_fill) && (
              <View 
                style={styles.urgentBadge}
                accessible={true}
                accessibilityLabel="Urgent fill needed"
              >
                <Ionicons name="flash" size={14} color="#FFFFFF" />
                <Text style={styles.urgentBadgeText}>Urgent Fill</Text>
              </View>
            )}
            <View 
              style={[styles.statusBadge, 
                getShiftStatus() === 'Upcoming' || getShiftStatus() === 'Open' ? styles.upcomingBadge : 
                getShiftStatus() === 'Completed' ? styles.completedBadge : 
                getShiftStatus() === 'Cancelled' || getShiftStatus() === 'Canceled' ? styles.canceledBadge : 
                getShiftStatus() === 'Assigned' ? styles.assignedBadge : styles.defaultBadge
              ]}
              accessible={true}
              accessibilityLabel={`Status: ${getShiftStatus()}`}
            >
              <Text style={styles.statusBadgeText}>{getShiftStatus()}</Text>
            </View>
          </View>
          
          {/* Facility Information */}
          <View style={[styles.card, isDarkMode && styles.darkCard]}>
            <View style={styles.facilityHeader}>
              <View>
                <Text 
                  style={[styles.facilityName, isDarkMode && styles.darkText]}
                  accessible={true}
                  accessibilityLabel={`Facility: ${shift.hospital}`}
                >
                  {shift.hospital}
                </Text>
                <View 
                  style={styles.locationContainer}
                  accessible={true}
                  accessibilityLabel={`Location: ${shift.location}`}
                >
                  <Ionicons name="location-outline" size={16} color={isDarkMode ? "#94A3B8" : "#64748B"} />
                  <Text style={[styles.locationText, isDarkMode && styles.darkSubText]}>
                    {shift.location}
                  </Text>
                </View>
              </View>
              {(shift.facilityRating || shift.facility_rating) && (
                <View 
                  style={styles.ratingContainer}
                  accessible={true}
                  accessibilityLabel={`Facility rating: ${(shift.facilityRating || shift.facility_rating).toFixed(1)} out of 5`}
                >
                  <Ionicons name="star" size={14} color="#FFBC00" />
                  <Text style={styles.ratingText}>{(shift.facilityRating || shift.facility_rating).toFixed(1)}</Text>
                </View>
              )}
            </View>
            
            <View 
              style={styles.unitSpecialtyContainer}
              accessible={true}
              accessibilityLabel={`Unit: ${shift.unit}, Specialty: ${shift.specialtyLabel}`}
            >
              <Text style={[styles.unitText, isDarkMode && styles.darkText]}>{shift.unit}</Text>
              {shift.specialtyLabel && (
                <Text style={[styles.specialtyText, isDarkMode && styles.darkSubText]}>• {shift.specialtyLabel}</Text>
              )}
            </View>
            
            {shift.facilityAddress && (
              <>
                <View style={styles.divider} />
                <View 
                  style={styles.addressContainer}
                  accessible={true}
                  accessibilityLabel={`Facility address: ${shift.facilityAddress}`}
                >
                  <Ionicons name="navigate" size={18} color={isDarkMode ? "#94A3B8" : "#64748B"} style={styles.addressIcon} />
                  <Text style={[styles.addressText, isDarkMode && styles.darkSubText]}>{shift.facilityAddress}</Text>
                </View>
              </>
            )}
          </View>
          
          {/* Shift Details */}
          <View style={[styles.card, isDarkMode && styles.darkCard]}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>Shift Information</Text>
            
            <View style={styles.detailsGrid}>
              <View 
                style={styles.detailItem}
                accessible={true}
                accessibilityLabel={`Date: ${shift.date || 'Not specified'}`}
              >
                <Text style={[styles.detailLabel, isDarkMode && styles.darkSubText]}>Date</Text>
                <Text style={[styles.detailValue, isDarkMode && styles.darkText]}>
                  {shift.date || 'Not specified'}
                </Text>
              </View>
              <View 
                style={styles.detailItem}
                accessible={true}
                accessibilityLabel={`Time: ${shift.startTime} to ${shift.endTime}`}
              >
                <Text style={[styles.detailLabel, isDarkMode && styles.darkSubText]}>Time</Text>
                <Text style={[styles.detailValue, isDarkMode && styles.darkText]}>
                  {shift.startTime} - {shift.endTime}
                </Text>
              </View>
              <View 
                style={styles.detailItem}
                accessible={true}
                accessibilityLabel={`Shift length: ${shift.shiftLength || 'Not specified'} hours`}
              >
                <Text style={[styles.detailLabel, isDarkMode && styles.darkSubText]}>Length</Text>
                <Text style={[styles.detailValue, isDarkMode && styles.darkText]}>
                  {shift.shiftLength ? `${shift.shiftLength} hours` : 'Not specified'}
                </Text>
              </View>
              {shift.distance && (
                <View 
                  style={styles.detailItem}
                  accessible={true}
                  accessibilityLabel={`Distance: ${shift.distance}`}
                >
                  <Text style={[styles.detailLabel, isDarkMode && styles.darkSubText]}>Distance</Text>
                  <Text style={[styles.detailValue, isDarkMode && styles.darkText]}>{shift.distance}</Text>
                </View>
              )}
              {shift.patientRatio && (
                <View 
                  style={styles.detailItem}
                  accessible={true}
                  accessibilityLabel={`Patient ratio: ${shift.patientRatio}`}
                >
                  <Text style={[styles.detailLabel, isDarkMode && styles.darkSubText]}>Patient Ratio</Text>
                  <Text style={[styles.detailValue, isDarkMode && styles.darkText]}>{shift.patientRatio}</Text>
                </View>
              )}
              {shift.dateApplied && (
                <View 
                  style={styles.detailItem}
                  accessible={true}
                  accessibilityLabel={`Date applied: ${shift.dateApplied}`}
                >
                  <Text style={[styles.detailLabel, isDarkMode && styles.darkSubText]}>Applied On</Text>
                  <Text style={[styles.detailValue, isDarkMode && styles.darkText]}>{shift.dateApplied}</Text>
                </View>
              )}
            </View>
            
            {/* Payment Information */}
            {(shift.rate > 0 || shift.total_pay > 0) && (
              <View 
                style={styles.paymentContainer}
                accessible={true}
                accessibilityLabel={`Payment details: Hourly rate $${shift.rate?.toFixed(2)} per hour, Total pay $${shift.total_pay?.toFixed(2)}`}
              >
                {shift.rate > 0 && (
                  <View style={styles.paymentItem}>
                    <Text style={[styles.paymentLabel, isDarkMode && styles.darkSubText]}>Hourly Rate</Text>
                    <Text style={styles.paymentValue}>${shift.rate.toFixed(2)}/hr</Text>
                  </View>
                )}
                {shift.rate > 0 && shift.total_pay > 0 && <View style={styles.paymentDivider} />}
                {shift.total_pay > 0 && (
                  <View style={styles.paymentItem}>
                    <Text style={[styles.paymentLabel, isDarkMode && styles.darkSubText]}>Total Pay</Text>
                    <Text style={styles.paymentValue}>${shift.total_pay.toFixed(2)}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
          
          {/* Requirements */}
          {shift.requirements.length > 0 && (
            <View style={[styles.card, isDarkMode && styles.darkCard]}>
              <Text 
                style={[styles.sectionTitle, isDarkMode && styles.darkText]}
                accessible={true}
                accessibilityLabel="Requirements"
              >
                Requirements
              </Text>
              
              {shift.requirements.map((requirement, index) => (
                <View 
                  key={`req-${index}`} 
                  style={styles.requirementItem}
                  accessible={true}
                  accessibilityLabel={`Requirement: ${requirement}`}
                >
                  <Ionicons 
                    name="checkmark-circle" 
                    size={20} 
                    color="#10B981" 
                    style={styles.requirementIcon} 
                  />
                  <Text style={[styles.requirementText, isDarkMode && styles.darkText]}>
                    {requirement}
                  </Text>
                </View>
              ))}
              
              {/* Optional requirement tags */}
              <View style={styles.requirementRow}>
                {shift.vaccinationRequired !== undefined && (
                  <View 
                    style={styles.requirementTag}
                    accessible={true}
                    accessibilityLabel={`Vaccination ${shift.vaccinationRequired ? 'required' : 'not required'}`}
                  >
                    <Ionicons 
                      name={shift.vaccinationRequired ? "checkmark-circle" : "close-circle"} 
                      size={14} 
                      color={shift.vaccinationRequired ? "#10B981" : "#64748B"} 
                    />
                    <Text style={styles.requirementTagText}>Vaccination</Text>
                  </View>
                )}
                
                {shift.floatRequired !== undefined && (
                  <View 
                    style={styles.requirementTag}
                    accessible={true}
                    accessibilityLabel={`Floating ${shift.floatRequired ? 'required' : 'not required'}`}
                  >
                    <Ionicons 
                      name={shift.floatRequired ? "checkmark-circle" : "close-circle"} 
                      size={14} 
                      color={shift.floatRequired ? "#10B981" : "#64748B"} 
                    />
                    <Text style={styles.requirementTagText}>Float Required</Text>
                  </View>
                )}
              </View>
            </View>
          )}
          
          {/* Description */}
          <View style={[styles.card, isDarkMode && styles.darkCard]}>
            <Text 
              style={[styles.sectionTitle, isDarkMode && styles.darkText]}
              accessible={true}
              accessibilityLabel="Shift description"
            >
              Description
            </Text>
            <Text 
              style={[styles.descriptionText, !shift.description && styles.placeholderText, isDarkMode && shift.description ? styles.darkText : styles.darkSubText]}
              accessible={true}
              accessibilityLabel={shift.description ? `Description: ${shift.description}` : "No description provided"}
            >
              {shift.description || "No detailed description has been provided for this shift. For more information, please contact the facility directly."}
            </Text>
          </View>
          
          {/* Contact Information */}
          {shift.contact && (
            <View style={[styles.card, isDarkMode && styles.darkCard]}>
              <Text 
                style={[styles.sectionTitle, isDarkMode && styles.darkText]}
                accessible={true}
                accessibilityLabel="Contact Information"
              >
                Contact Information
              </Text>
              <View 
                style={styles.contactItem}
                accessible={true}
                accessibilityLabel={`Contact: ${shift.contact}`}
              >
                <Ionicons name="call-outline" size={20} color={isDarkMode ? "#94A3B8" : "#64748B"} style={styles.contactIcon} />
                <Text style={[styles.contactText, isDarkMode && styles.darkText]}>{shift.contact}</Text>
              </View>
            </View>
          )}
          
          {/* Facility Notes */}
          {shift.notesFromFacility && (
            <View style={[styles.card, isDarkMode && styles.darkCard]}>
              <Text 
                style={[styles.sectionTitle, isDarkMode && styles.darkText]}
                accessible={true}
                accessibilityLabel="Notes from facility"
              >
                Notes from Facility
              </Text>
              <Text 
                style={[styles.notesText, isDarkMode && styles.darkText]}
                accessible={true}
                accessibilityLabel={`Facility notes: ${shift.notesFromFacility}`}
              >
                {shift.notesFromFacility}
              </Text>
            </View>
          )}
          
          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  darkSafeArea: {
    backgroundColor: '#121827',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  darkContainer: {
    backgroundColor: '#121827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  darkHeader: {
    borderBottomColor: '#2D3748',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0065FF',
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  placeholder: {
    width: 70,
  },
  darkText: {
    color: '#FFFFFF',
  },
  darkSubText: {
    color: '#94A3B8',
  },
  scrollContent: {
    padding: 16,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
  },
  urgentBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  upcomingBadge: {
    backgroundColor: '#EBF5FF',
  },
  completedBadge: {
    backgroundColor: '#ECFDF5',
  },
  canceledBadge: {
    backgroundColor: '#FEF2F2',
  },
  assignedBadge: {
    backgroundColor: '#FFF7ED',
  },
  defaultBadge: {
    backgroundColor: '#F1F5F9',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0065FF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  darkCard: {
    backgroundColor: '#1E293B',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
  },
  facilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  facilityName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 6,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B45309',
    marginLeft: 4,
  },
  unitSpecialtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  unitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginRight: 8,
  },
  specialtyText: {
    fontSize: 14,
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  detailItem: {
    width: '50%',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  paymentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  paymentItem: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  paymentDivider: {
    width: 1,
    backgroundColor: '#BFDBFE',
  },
  paymentLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  paymentValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0369A1',
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requirementIcon: {
    marginRight: 10,
    marginTop: 1,
  },
  requirementText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#334155',
  },
  requirementRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  requirementTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  requirementTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginLeft: 6,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#334155',
  },
  placeholderText: {
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  notesText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#334155',
    fontStyle: 'italic',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactIcon: {
    marginRight: 10,
  },
  contactText: {
    fontSize: 15,
    color: '#334155',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  errorBackButton: {
    backgroundColor: '#0065FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  errorBackButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  bottomSpacing: {
    height: 40,
  }
});