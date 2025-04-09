import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
  Switch,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import apiClient from '../api/client';

const EditProfileScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState({
    id: '',
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    specialty: '',
    years_experience: 0,
    preferred_shift_type: [],
    preferred_distance: 25,
    min_hourly_rate: '0.00',
    max_hourly_rate: '0.00',
  });

  // Form validation state
  const [errors, setErrors] = useState({});
  
  // Available options for select fields
  const specialties = [
    'Critical Care', 'Emergency', 'Medical-Surgical', 'Pediatric', 
    'Psychiatric', 'Maternity', 'Telemetry', 'Operating Room', 'Other'
  ];
  
  const shiftTypes = [
    { id: 'day', label: 'Day', selected: false },
    { id: 'night', label: 'Night', selected: false },
    { id: 'evening', label: 'Evening', selected: false },
    { id: '12hr', label: '12 Hour', selected: false },
    { id: '8hr', label: '8 Hour', selected: false },
  ];
  
  const [selectedShifts, setSelectedShifts] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [rateRange, setRateRange] = useState([30, 60]); // Default range

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userDataString = await AsyncStorage.getItem('user');
        
        if (userDataString) {
          const user = JSON.parse(userDataString);
          
          try {
            const response = await apiClient.get(`/nurses/${user.id}/profile`);
            
            if (response.data && response.data.data) {
              const profileData = response.data.data;
              
              // Update shift types from API data
              const userShiftTypes = profileData.nurseProfile?.preferredShiftTypes || [];
              setSelectedShifts(userShiftTypes);
              
              // Set hourly rate range
              const minRate = parseFloat(profileData.nurseProfile?.hourlyRateRange?.min || '30.00');
              const maxRate = parseFloat(profileData.nurseProfile?.hourlyRateRange?.max || '60.00');
              setRateRange([minRate, maxRate]);

              setUserData({
                id: profileData.id || '',
                email: profileData.email || '',
                first_name: profileData.firstName || '',
                last_name: profileData.lastName || '',
                phone_number: profileData.phoneNumber || '',
                specialty: profileData.nurseProfile?.specialty || '',
                years_experience: profileData.nurseProfile?.yearsExperience || 0,
                preferred_distance: profileData.nurseProfile?.preferredDistance || 25,
                min_hourly_rate: profileData.nurseProfile?.hourlyRateRange?.min || '30.00',
                max_hourly_rate: profileData.nurseProfile?.hourlyRateRange?.max || '60.00',
              });
            } else {
              console.log('Unexpected API response format. Using cached data.');
              setUserData({
                ...user,
              });
            }
          } catch (error) {
            console.error('Error fetching profile from API:', error);
            setUserData({
              ...user,
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

  // Handler for changing user data
  const handleChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user edits field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Handler for selecting/deselecting shift types
  const toggleShiftType = (shiftId) => {
    if (selectedShifts.includes(shiftId)) {
      setSelectedShifts(selectedShifts.filter(id => id !== shiftId));
    } else {
      setSelectedShifts([...selectedShifts, shiftId]);
    }
  };

  // Handler for slider change
  const handleRateRangeChange = (values) => {
    setRateRange(values);
    setUserData(prev => ({
      ...prev,
      min_hourly_rate: values[0].toFixed(2),
      max_hourly_rate: values[1].toFixed(2)
    }));
  };

  // Image picker function
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to change your profile picture.'
      );
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    // First name and last name validation removed since they're no longer editable
    
    if (!userData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!userData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    }
    
    if (!userData.specialty) {
      newErrors.specialty = 'Please select a specialty';
    }
    
    if (!userData.years_experience) {
      newErrors.years_experience = 'Please enter years of experience';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save profile function
const saveProfile = async () => {
    if (!validateForm()) {
      Alert.alert(
        'Validation Error',
        'Please correct the errors in the form before saving.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    try {
      setSaving(true);
      
      // Create payload with properly formatted data
      const payload = {
        // User data fields
        firstName: userData.first_name,
        lastName: userData.last_name,
        phoneNumber: userData.phone_number,
        
        // Nurse profile data with correct structure
        nurseProfile: {
          specialty: userData.specialty,
          yearsExperience: parseInt(userData.years_experience) || 0,
          preferredShiftTypes: selectedShifts,
          preferredDistance: parseInt(userData.preferred_distance) || 25,
          hourlyRateRange: {
            min: userData.min_hourly_rate,
            max: userData.max_hourly_rate
          }
        }
      };
      
      console.log('Sending profile update with payload:', payload);
      
      // Make API call to update profile
      const response = await apiClient.put(`/nurses/${userData.id}/profile`, payload);
      
      if (response.status === 200) {
        console.log('Profile updated successfully:', response.data);
        
        // Update local storage with the new data
        const userDataString = await AsyncStorage.getItem('user');
        const storedUser = JSON.parse(userDataString);
        
        // Merge the updated data with existing user data
        const updatedUser = {
          ...storedUser,
          phone_number: userData.phone_number,
          specialty: userData.specialty,
          years_experience: userData.years_experience,
          preferred_distance: userData.preferred_distance,
          min_hourly_rate: userData.min_hourly_rate,
          max_hourly_rate: userData.max_hourly_rate,
          preferred_shift_type: selectedShifts
        };
        
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        
        Alert.alert(
          'Success',
          'Your profile has been updated successfully.',
          [{ 
            text: 'OK', 
            onPress: () => router.push('/(tabs)/profile')
          }]
        );
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert(
        'Update Failed',
        error.response?.data?.message || 'There was an error updating your profile. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSaving(false);
    }
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#2E3A59" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile Image Section */}
          <View style={styles.imageSection}>
            <View style={styles.profileImageContainer}>
              <Image 
                source={profileImage ? { uri: profileImage } : require('../../assets/images/dog3.jpg')} 
                style={styles.profileImage} 
              />
              <TouchableOpacity 
                style={styles.editImageButton}
                onPress={pickImage}
              >
                <Ionicons name="camera" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.changePhotoText}>Tap to change photo</Text>
          </View>

          {/* Form Sections */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First Name</Text>
              <View style={styles.disabledInputContainer}>
                <Text style={styles.disabledInputText}>{userData.first_name}</Text>
              </View>
              <Text style={styles.helperText}>Name cannot be changed</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <View style={styles.disabledInputContainer}>
                <Text style={styles.disabledInputText}>{userData.last_name}</Text>
              </View>
              <Text style={styles.helperText}>Name cannot be changed</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={userData.email}
                onChangeText={(text) => handleChange('email', text)}
                placeholder="Enter your email"
                placeholderTextColor="#8F9BB3"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={[styles.input, errors.phone_number && styles.inputError]}
                value={userData.phone_number}
                onChangeText={(text) => handleChange('phone_number', text)}
                placeholder="Enter your phone number"
                placeholderTextColor="#8F9BB3"
                keyboardType="phone-pad"
              />
              {errors.phone_number && (
                <Text style={styles.errorText}>{errors.phone_number}</Text>
              )}
            </View>
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Professional Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Specialty</Text>
              <TouchableOpacity 
                style={[styles.specialtySelector, errors.specialty && styles.inputError]}
                onPress={() => {
                  // We'd use a modal or action sheet in a complete implementation
                  Alert.alert(
                    "Select Specialty",
                    "Choose your specialty",
                    specialties.map(specialty => ({
                      text: specialty,
                      onPress: () => handleChange('specialty', specialty)
                    })).concat([
                      { text: "Cancel", style: "cancel" }
                    ])
                  );
                }}
              >
                <Text style={userData.specialty ? styles.specialtyText : styles.specialtyPlaceholder}>
                  {userData.specialty || "Select a specialty"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#8F9BB3" />
              </TouchableOpacity>
              {errors.specialty && (
                <Text style={styles.errorText}>{errors.specialty}</Text>
              )}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Years of Experience</Text>
              <TextInput
                style={[styles.input, errors.years_experience && styles.inputError]}
                value={userData.years_experience.toString()}
                onChangeText={(text) => handleChange('years_experience', text.replace(/[^0-9]/g, ''))}
                placeholder="Enter years of experience"
                placeholderTextColor="#8F9BB3"
                keyboardType="numeric"
              />
              {errors.years_experience && (
                <Text style={styles.errorText}>{errors.years_experience}</Text>
              )}
            </View>
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Preferred Shift Types</Text>
              <View style={styles.shiftTypesContainer}>
                {shiftTypes.map((shift) => (
                  <TouchableOpacity
                    key={shift.id}
                    style={[
                      styles.shiftTypeButton,
                      selectedShifts.includes(shift.id) && styles.shiftTypeButtonSelected
                    ]}
                    onPress={() => toggleShiftType(shift.id)}
                  >
                    <Text
                      style={[
                        styles.shiftTypeText,
                        selectedShifts.includes(shift.id) && styles.shiftTypeTextSelected
                      ]}
                    >
                      {shift.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Preferred Distance (miles)</Text>
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderValue}>{userData.preferred_distance} miles</Text>
                <MultiSlider
                  values={[parseInt(userData.preferred_distance)]}
                  min={5}
                  max={100}
                  step={5}
                  sliderLength={280}
                  onValuesChange={(values) => handleChange('preferred_distance', values[0])}
                  selectedStyle={{
                    backgroundColor: '#0065FF',
                  }}
                  unselectedStyle={{
                    backgroundColor: '#E4E9F2',
                  }}
                  containerStyle={{
                    height: 40,
                  }}
                  trackStyle={{
                    height: 6,
                    borderRadius: 3,
                  }}
                  markerStyle={{
                    height: 20,
                    width: 20,
                    borderRadius: 10,
                    backgroundColor: '#FFFFFF',
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 3,
                    elevation: 3,
                  }}
                  pressedMarkerStyle={{
                    height: 24,
                    width: 24,
                    borderRadius: 12,
                  }}
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Hourly Rate Range (${rateRange[0]} - ${rateRange[1]})</Text>
              <View style={styles.sliderContainer}>
                <MultiSlider
                  values={rateRange}
                  min={20}
                  max={150}
                  step={1}
                  sliderLength={280}
                  onValuesChange={handleRateRangeChange}
                  selectedStyle={{
                    backgroundColor: '#0065FF',
                  }}
                  unselectedStyle={{
                    backgroundColor: '#E4E9F2',
                  }}
                  containerStyle={{
                    height: 40,
                  }}
                  trackStyle={{
                    height: 6,
                    borderRadius: 3,
                  }}
                  markerStyle={{
                    height: 20,
                    width: 20,
                    borderRadius: 10,
                    backgroundColor: '#FFFFFF',
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 3,
                    elevation: 3,
                  }}
                  pressedMarkerStyle={{
                    height: 24,
                    width: 24,
                    borderRadius: 12,
                  }}
                  isMarkersSeparated={true}
                  minMarkerOverlapDistance={10}
                />
                <View style={styles.rangeLabels}>
                  <Text style={styles.rangeLabel}>${rateRange[0]}</Text>
                  <Text style={styles.rangeLabel}>${rateRange[1]}</Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* Save and Cancel Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.cancelButton]}
              onPress={() => router.back()}
              disabled={saving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={saveProfile}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Bottom padding */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  keyboardAvoid: {
    flex: 1,
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E3A59',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  imageSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0065FF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  changePhotoText: {
    marginTop: 12,
    color: '#0065FF',
    fontSize: 14,
    fontWeight: '500',
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#1A1F33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E3A59',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F7F9FC',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#2E3A59',
    borderWidth: 1,
    borderColor: '#EDF1F7',
  },
  inputError: {
    borderColor: '#FF3D71',
  },
  errorText: {
    color: '#FF3D71',
    fontSize: 12,
    marginTop: 4,
  },
  disabledInputContainer: {
    backgroundColor: '#F0F2F5',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E4E9F2',
  },
  disabledInputText: {
    fontSize: 16,
    color: '#2E3A59',
    opacity: 0.7,
  },
  helperText: {
    fontSize: 12,
    color: '#8F9BB3',
    marginTop: 4,
    fontStyle: 'italic',
  },
  specialtySelector: {
    backgroundColor: '#F7F9FC',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EDF1F7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  specialtyText: {
    fontSize: 16,
    color: '#2E3A59',
  },
  specialtyPlaceholder: {
    fontSize: 16,
    color: '#8F9BB3',
  },
  shiftTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  shiftTypeButton: {
    backgroundColor: '#F7F9FC',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EDF1F7',
    margin: 4,
  },
  shiftTypeButtonSelected: {
    backgroundColor: '#0065FF',
    borderColor: '#0065FF',
  },
  shiftTypeText: {
    color: '#2E3A59',
    fontSize: 14,
    fontWeight: '500',
  },
  shiftTypeTextSelected: {
    color: '#FFFFFF',
  },
  sliderContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2E3A59',
    marginBottom: 8,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 8,
  },
  rangeLabel: {
    fontSize: 14,
    color: '#8F9BB3',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#EDF1F7',
  },
  cancelButtonText: {
    color: '#2E3A59',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#0065FF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#8F9BB3',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfileScreen;