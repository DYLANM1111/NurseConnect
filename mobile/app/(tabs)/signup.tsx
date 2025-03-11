import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import apiClient, { authAPI } from '../api/client';
import * as signUpTypes from '../types/signUpTypes'

// Add this interface before your component
interface ImageDocument {
  uri: string;
  name: string;
  type: string;
}

export default function SignUpScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentUploadFor, setCurrentUploadFor] = useState('');

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('date');
  const [currentDateField, setCurrentDateField] = useState('');

  const [accountData, setAccountData] = useState<signUpTypes.AccountFormData>({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [personalData, setPersonalData] = useState<signUpTypes.PersonalFormData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });

  const [professionalData, setProfessionalData] = useState<signUpTypes.ProfessionalFormData>({
    specialty: '',
    yearsExperience: '',
    preferredShiftTypes: [],
    preferredDistance: '25',
    minHourlyRate: '',
    maxHourlyRate: '',
  });

  const [licenseData, setLicenseData] = useState<signUpTypes.LicenseFormData>({
    licenseType: '',
    licenseNumber: '',
    state: '',
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
    licenseImage: null,
  });

  const [certificationData, setCertificationData] = useState<signUpTypes.CertificationFormData>({
    certName: '',
    issuingBody: '',
    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)),
    certImage: null,
  });

  const [accountErrors, setAccountErrors] = useState<{ [key: string]: string }>({});
  const [personalErrors, setPersonalErrors] = useState<{ [key: string]: string }>({});
  const [professionalErrors, setProfessionalErrors] = useState<{ [key: string]: string }>({});
  const [licenseErrors, setLicenseErrors] = useState<{ [key: string]: string }>({});
  const [certificationErrors, setCertificationErrors] = useState<{ [key: string]: string }>({});

  // Open image picker for gallery
  const pickImage = async (for_field) => {
    try {
      // Request media library permissions if needed
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need gallery permissions to select photos');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
      
      if (!result.canceled) {
        if (for_field === 'license') {
          setLicenseData(prev => ({
            ...prev,
            licenseImage: result.assets[0].uri
          }));
        } else if (for_field === 'certification') {
          setCertificationData(prev => ({
            ...prev,
            certImage: result.assets[0].uri
          }));
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Take a photo with camera
  const takePhoto = async (for_field:any) => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need camera permissions to take photos');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
      
      if (!result.canceled) {
        if (for_field === 'license') {
          setLicenseData(prev => ({
            ...prev,
            licenseImage: result.assets[0].uri
          }));
        } else if (for_field === 'certification') {
          setCertificationData(prev => ({
            ...prev,
            certImage: result.assets[0].uri
          }));
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  // Handle date picker
  const showDatePickerModal = (field: string) => {
    setCurrentDateField(field);
    setShowDatePicker(true);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(false);
    
    if (currentDateField === 'licenseExpiry') {
      setLicenseData(prev => ({
        ...prev,
        expiryDate: currentDate
      }));
    } else if (currentDateField === 'certExpiry') {
      setCertificationData(prev => ({
        ...prev,
        expiryDate: currentDate
      }));
    }
  };

  // Update form data
  const updateAccountData = (key: keyof signUpTypes.AccountFormData, value: string) => {
    setAccountData((prev) => ({ ...prev, [key]: value }));
    if (accountErrors[key]) {
      setAccountErrors((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    }
  };

  const updatePersonalData = (key: keyof signUpTypes.PersonalFormData, value: string) => {
    setPersonalData((prev) => ({ ...prev, [key]: value }));
    if (personalErrors[key]) {
      setPersonalErrors((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    }
  };

  const updateProfessionalData = (key: keyof signUpTypes.ProfessionalFormData, value: any) => {
    setProfessionalData((prev) => ({ ...prev, [key]: value }));
    if (professionalErrors[key]) {
      setProfessionalErrors((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    }
  };

  const updateLicenseData = (key: keyof signUpTypes.LicenseFormData, value: any) => {
    setLicenseData((prev) => ({ ...prev, [key]: value }));
    if (licenseErrors[key]) {
      setLicenseErrors((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    }
  };

  const updateCertificationData = (key: keyof signUpTypes.CertificationFormData, value: any) => {
    setCertificationData((prev) => ({ ...prev, [key]: value }));
    if (certificationErrors[key]) {
      setCertificationErrors((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    }
  };

  // Toggle shift type selection
  const toggleShiftType = (shiftType: string) => {
    const currentTypes = [...professionalData.preferredShiftTypes];
    if (currentTypes.includes(shiftType)) {
      updateProfessionalData(
        'preferredShiftTypes',
        currentTypes.filter((type) => type !== shiftType)
      );
    } else {
      updateProfessionalData('preferredShiftTypes', [...currentTypes, shiftType]);
    }
  };

  // Validation functions
  const validateAccountData = () => {
    const errors: { [key: string]: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!accountData.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(accountData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!accountData.password) {
      errors.password = 'Password is required';
    } else if (accountData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (accountData.password !== accountData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setAccountErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePersonalData = () => {
    const errors: { [key: string]: string } = {};
    const phoneRegex = /^\d{10}$/;

    if (!personalData.firstName) {
      errors.firstName = 'First name is required';
    }

    if (!personalData.lastName) {
      errors.lastName = 'Last name is required';
    }

    if (!personalData.phoneNumber) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!phoneRegex.test(personalData.phoneNumber.replace(/\D/g, ''))) {
      errors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    setPersonalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateProfessionalData = () => {
    const errors: { [key: string]: string } = {};

    if (!professionalData.specialty) {
      errors.specialty = 'Specialty is required';
    }

    if (!professionalData.yearsExperience) {
      errors.yearsExperience = 'Years of experience is required';
    } else if (parseInt(professionalData.yearsExperience) < 0) {
      errors.yearsExperience = 'Years of experience must be positive';
    }

    if (professionalData.preferredShiftTypes.length === 0) {
      errors.preferredShiftTypes = 'Please select at least one shift type';
    }

    if (!professionalData.minHourlyRate) {
      errors.minHourlyRate = 'Minimum hourly rate is required';
    }

    if (!professionalData.maxHourlyRate) {
      errors.maxHourlyRate = 'Maximum hourly rate is required';
    } else if (
      parseFloat(professionalData.minHourlyRate) > parseFloat(professionalData.maxHourlyRate)
    ) {
      errors.maxHourlyRate = 'Maximum rate cannot be less than minimum rate';
    }

    setProfessionalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateLicenseData = () => {
    const errors: { [key: string]: string } = {};

    if (!licenseData.licenseType) {
      errors.licenseType = 'License type is required';
    }

    if (!licenseData.licenseNumber) {
      errors.licenseNumber = 'License number is required';
    }

    if (!licenseData.state) {
      errors.state = 'State is required';
    }

    if (!licenseData.licenseImage) {
      errors.licenseImage = 'License image is required';
    }

    setLicenseErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateCertificationData = () => {
    const errors: { [key: string]: string } = {};

    if (!certificationData.certName) {
      errors.certName = 'Certification name is required';
    }

    if (!certificationData.issuingBody) {
      errors.issuingBody = 'Issuing body is required';
    }

    if (!certificationData.certImage) {
      errors.certImage = 'Certification image is required';
    }

    setCertificationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Navigation between steps
  const handleNextStep = () => {
    if (step === 1 && validateAccountData()) {
      setStep(2);
    } else if (step === 2 && validatePersonalData()) {
      setStep(3);
    } else if (step === 3 && validateProfessionalData()) {
      setStep(4);
    } else if (step === 4 && validateLicenseData()) {
      setStep(5);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Form submission
  const handleSubmit = async () => {
    if (!validateCertificationData()) {
      return;
    }

    setLoading(true);

    try {
      const userData = {
        email: accountData.email,
        password: accountData.password,
        firstName: personalData.firstName,
        lastName: personalData.lastName,
        phoneNumber: personalData.phoneNumber,
        role: 'nurse',
        nurseProfile: {
          specialty: professionalData.specialty,
          yearsExperience: professionalData.yearsExperience,
          preferredShiftTypes: professionalData.preferredShiftTypes,
          preferredDistance: professionalData.preferredDistance,
          minHourlyRate: professionalData.minHourlyRate,
          maxHourlyRate: professionalData.maxHourlyRate
        },
        licenses: [
          {
            licenseType: licenseData.licenseType,
            licenseNumber: licenseData.licenseNumber,
            state: licenseData.state,
            expiryDate: licenseData.expiryDate.toISOString().split('T')[0]
          }
        ],
        certifications: [
          {
            certificationName: certificationData.certName,
            issuingBody: certificationData.issuingBody,
            expiryDate: certificationData.expiryDate.toISOString().split('T')[0]
          }
        ]
      };

      console.log('User data to be submitted:', userData);
      
      // Register the user
      const response = await authAPI.register(userData);
      console.log('Registration response:', response);
       
      // Show success message and navigate
      Alert.alert(
        "Registration Successful",
        "Your account has been created. You can now sign in.",
        [{ 
          text: "OK", 
          onPress: () => router.replace('/signin')
        }]
      );
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        "Registration Failed", 
        typeof error === 'string' ? error : "There was an error creating your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper function to upload images
  const uploadImage = async (imageUri:any, endpoint:any) => {
    try {
      // Create form data for image upload
      const formData = new FormData();
      const uriParts = imageUri.split('/');
      const fileName = uriParts[uriParts.length - 1];
      
      formData.append('document', {
        uri: imageUri,
        name: fileName,
        type: 'image/jpeg'
      } as unknown as Blob);
      
      // Upload image
      await apiClient.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload document image');
    }
  };

  // Helper function to upload license image
  const uploadLicenseImage = async (nurseId:any, imageUri:any, licenseId:any) => {
    const formData = new FormData();
    const uriParts = imageUri.split('/');
    const fileName = uriParts[uriParts.length - 1];
    
    formData.append('document', {
      uri: imageUri,
      name: fileName,
      type: 'image/jpeg' // Adjust if needed based on image type
    });
    
    try {
      await apiClient.put(`/licenses/${licenseId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error('Error uploading license image:', error);
      throw new Error('Failed to upload license image');
    }
  };

  // Helper function to upload certification image
  const uploadCertificationImage = async (nurseId:any, imageUri:any, certId:any) => {
    const formData = new FormData();
    // Extract filename from URI
    const uriParts = imageUri.split('/');
    const fileName = uriParts[uriParts.length - 1];
    
    formData.append('document', {
      uri: imageUri,
      name: fileName,
      type: 'image/jpeg' // Adjust if needed based on image type
    });
    
    try {
      await apiClient.put(`/certifications/${certId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error('Error uploading certification image:', error);
      throw new Error('Failed to upload certification image');
    }
  };

  // Render input field with label and error
  const renderInput = (
    label: string,
    value: string,
    placeholder: string,
    onChangeText: (text: string) => void,
    error?: string,
    secureTextEntry: boolean = false,
    keyboardType: any = 'default'
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A0A0A0"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

  // Render dropdown selector
  const renderDropdown = (
    label: string,
    options: string[],
    selectedValue: string,
    onSelect: (value: string) => void,
    error?: string
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.input, error ? styles.inputError : null]}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dropdownContainer}
        >
          {options.map(option => (
            <TouchableOpacity
              key={option}
              style={[
                styles.dropdownItem,
                selectedValue === option ? styles.dropdownItemSelected : null
              ]}
              onPress={() => onSelect(option)}
            >
              <Text
                style={[
                  styles.dropdownItemText,
                  selectedValue === option ? styles.dropdownItemTextSelected : null
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

  // Render date picker input
  const renderDatePicker = (
    label: string,
    value: Date,
    onPress: () => void,
    error?: string
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.input, styles.dateInput, error ? styles.inputError : null]}
        onPress={onPress}
      >
        <Text style={styles.dateText}>
          {value.toLocaleDateString()}
        </Text>
        <Ionicons name="calendar-outline" size={20} color="#777" />
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

  // Render image picker
  const renderImagePicker = (
    label: string,
    imageUri: string | null,
    onPress: () => void,
    onCameraPress: () => void,
    error?: string
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      {imageUri ? (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          <TouchableOpacity
            style={styles.removeImageButton}
            onPress={() => {
              if (label.includes('License')) {
                setLicenseData(prev => ({ ...prev, licenseImage: null }));
              } else {
                setCertificationData(prev => ({ ...prev, certImage: null }));
              }
            }}
          >
            <Ionicons name="close-circle" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.imagePickerButtons}>
          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={onPress}
          >
            <Ionicons name="image-outline" size={20} color="#0065FF" />
            <Text style={styles.imagePickerText}>Choose Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={onCameraPress}
          >
            <Ionicons name="camera-outline" size={20} color="#0065FF" />
            <Text style={styles.imagePickerText}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      )}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

  // Progress bar
  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${((step - 1) / 4) * 100}%` }
          ]}
        />
      </View>
      <View style={styles.stepsContainer}>
        <View style={styles.stepRow}>
          <View style={[styles.stepCircle, step >= 1 ? styles.activeStep : null]}>
            <Text style={[styles.stepNumber, step >= 1 ? styles.activeStepNumber : null]}>1</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={[styles.stepCircle, step >= 2 ? styles.activeStep : null]}>
            <Text style={[styles.stepNumber, step >= 2 ? styles.activeStepNumber : null]}>2</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={[styles.stepCircle, step >= 3 ? styles.activeStep : null]}>
            <Text style={[styles.stepNumber, step >= 3 ? styles.activeStepNumber : null]}>3</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={[styles.stepCircle, step >= 4 ? styles.activeStep : null]}>
            <Text style={[styles.stepNumber, step >= 4 ? styles.activeStepNumber : null]}>4</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={[styles.stepCircle, step >= 5 ? styles.activeStep : null]}>
            <Text style={[styles.stepNumber, step >= 5 ? styles.activeStepNumber : null]}>5</Text>
          </View>
        </View>
        <View style={styles.stepLabelRow}>
          <Text style={[styles.stepLabel, step === 1 ? styles.activeStepLabel : null]}>Account</Text>
          <Text style={[styles.stepLabel, step === 2 ? styles.activeStepLabel : null]}>Personal</Text>
          <Text style={[styles.stepLabel, step === 3 ? styles.activeStepLabel : null]}>Professional</Text>
          <Text style={[styles.stepLabel, step === 4 ? styles.activeStepLabel : null]}>License</Text>
          <Text style={[styles.stepLabel, step === 5 ? styles.activeStepLabel : null]}>Certification</Text>
        </View>
      </View>
    </View>
  );

  // Render form steps
  const renderAccountForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Create your account</Text>
      {renderInput(
        'Email Address',
        accountData.email,
        'Enter your email',
        (value) => updateAccountData('email', value),
        accountErrors.email,
        false,
        'email-address'
      )}
      {renderInput(
        'Password',
        accountData.password,
        'Create a password',
        (value) => updateAccountData('password', value),
        accountErrors.password,
        true
      )}
      {renderInput(
        'Confirm Password',
        accountData.confirmPassword,
        'Confirm your password',
        (value) => updateAccountData('confirmPassword', value),
        accountErrors.confirmPassword,
        true
      )}
    </View>
  );

  const renderPersonalForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Personal Information</Text>
      {renderInput(
        'First Name',
        personalData.firstName,
        'Enter your first name',
        (value) => updatePersonalData('firstName', value),
        personalErrors.firstName
      )}
      {renderInput(
        'Last Name',
        personalData.lastName,
        'Enter your last name',
        (value) => updatePersonalData('lastName', value),
        personalErrors.lastName
      )}
      {renderInput(
        'Phone Number',
        personalData.phoneNumber,
        '(XXX) XXX-XXXX',
        (value) => updatePersonalData('phoneNumber', value),
        personalErrors.phoneNumber,
        false,
        'phone-pad'
      )}
    </View>
  );

  const renderProfessionalForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Professional Details</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Specialty</Text>
        <View style={styles.specialtyContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.specialtyScrollContent}
          >
            {signUpTypes.SPECIALTIES.map(specialty => (
              <TouchableOpacity
                key={specialty}
                style={[
                  styles.specialtyButton,
                  professionalData.specialty === specialty ? styles.selectedSpecialty : null
                ]}
                onPress={() => updateProfessionalData('specialty', specialty)}
              >
                <Text
                  style={[
                    styles.specialtyButtonText,
                    professionalData.specialty === specialty ? styles.selectedSpecialtyText : null
                  ]}
                >
                  {specialty}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        {professionalErrors.specialty ? (
          <Text style={styles.errorText}>{professionalErrors.specialty}</Text>
        ) : null}
      </View>
      
      {renderInput(
        'Years of Experience',
        professionalData.yearsExperience,
        'Enter years of experience',
        (value) => updateProfessionalData('yearsExperience', value.replace(/[^0-9]/g, '')),
        professionalErrors.yearsExperience,
        false,
        'numeric'
      )}
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Preferred Shift Types</Text>
        <View style={styles.shiftTypeContainer}>
          {signUpTypes.SHIFT_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.shiftTypeButton,
                professionalData.preferredShiftTypes.includes(type) ? styles.selectedShiftType : null,
              ]}
              onPress={() => toggleShiftType(type)}
            >
              <Text
                style={[
                  styles.shiftTypeText,
                  professionalData.preferredShiftTypes.includes(type)
                    ? styles.selectedShiftTypeText
                    : null,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {professionalErrors.preferredShiftTypes ? (
          <Text style={styles.errorText}>{professionalErrors.preferredShiftTypes}</Text>
        ) : null}
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Preferred Distance (miles)</Text>
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderValue}>{professionalData.preferredDistance}</Text>
          <View style={styles.sliderTrack}>
            <View
              style={[
                styles.sliderFill,
                { width: `${(parseInt(professionalData.preferredDistance) / 100) * 100}%` },
              ]}
            />
          </View>
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>5</Text>
            <Text style={styles.sliderLabel}>25</Text>
            <Text style={styles.sliderLabel}>50</Text>
            <Text style={styles.sliderLabel}>75</Text>
            <Text style={styles.sliderLabel}>100+</Text>
          </View>
          <TextInput
            style={styles.hiddenInput}
            value={professionalData.preferredDistance}
            onChangeText={(value) => {
              const numericValue = value.replace(/[^0-9]/g, '');
              const intValue = numericValue ? parseInt(numericValue) : 0;
              const clampedValue = Math.min(Math.max(intValue, 5), 100).toString();
              updateProfessionalData('preferredDistance', clampedValue);
            }}
            keyboardType="numeric"
          />
        </View>
      </View>
      
      <View style={styles.rateContainer}>
        {renderInput(
          'Minimum Hourly Rate ($)',
          professionalData.minHourlyRate,
          'Min rate',
          (value) => {
            const formatted = value.replace(/[^0-9.]/g, '');
            updateProfessionalData('minHourlyRate', formatted);
          },
          professionalErrors.minHourlyRate,
          false,
          'decimal-pad'
        )}
        {renderInput(
          'Maximum Hourly Rate ($)',
          professionalData.maxHourlyRate,
          'Max rate',
          (value) => {
            const formatted = value.replace(/[^0-9.]/g, '');
            updateProfessionalData('maxHourlyRate', formatted);
          },
          professionalErrors.maxHourlyRate,
          false,
          'decimal-pad'
        )}
      </View>
    </View>
  );

  // Render license form
  const renderLicenseForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Nursing License</Text>
      
      {renderDropdown(
        'License Type',
        signUpTypes.LICENSE_TYPES,
        licenseData.licenseType,
        (value) => updateLicenseData('licenseType', value),
        licenseErrors.licenseType
      )}
      
      {renderInput(
        'License Number',
        licenseData.licenseNumber,
        'Enter license number',
        (value) => updateLicenseData('licenseNumber', value),
        licenseErrors.licenseNumber
      )}
      
      {renderDropdown(
        'State',
        signUpTypes.STATES,
        licenseData.state,
        (value) => updateLicenseData('state', value),
        licenseErrors.state
      )}
      
      {renderDatePicker(
        'Expiration Date',
        licenseData.expiryDate,
        () => showDatePickerModal('licenseExpiry'),
        licenseErrors.expiryDate as string
      )}
      
      {renderImagePicker(
        'License Image',
        licenseData.licenseImage,
        () => pickImage('license'),
        () => takePhoto('license'),
        licenseErrors.licenseImage
      )}
      
      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={20} color="#0065FF" />
        <Text style={styles.infoText}>
          Upload a clear photo of your nursing license. This will be verified before you can start accepting shifts.
        </Text>
      </View>
    </View>
  );

  // Render certification form
  const renderCertificationForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Certification</Text>
      
      {renderDropdown(
        'Certification Name',
        signUpTypes.CERTIFICATION_TYPES,
        certificationData.certName,
        (value) => updateCertificationData('certName', value),
        certificationErrors.certName
      )}
      
      {renderDropdown(
        'Issuing Body',
        signUpTypes.ISSUING_BODIES,
        certificationData.issuingBody,
        (value) => updateCertificationData('issuingBody', value),
        certificationErrors.issuingBody
      )}
      
      {renderDatePicker(
        'Expiration Date',
        certificationData.expiryDate,
        () => showDatePickerModal('certExpiry'),
        certificationErrors.expiryDate as string
      )}
      
      {renderImagePicker(
        'Certification Image',
        certificationData.certImage,
        () => pickImage('certification'),
        () => takePhoto('certification'),
        certificationErrors.certImage
      )}
      
      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={20} color="#0065FF" />
        <Text style={styles.infoText}>
          Upload a clear photo of your certification. This helps facilities verify your qualifications.
        </Text>
      </View>
    </View>
  );

  // Main render
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#006AFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nurse Sign Up</Text>
          <View style={styles.emptySpace} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderProgressBar()}
          
          {step === 1 && renderAccountForm()}
          {step === 2 && renderPersonalForm()}
          {step === 3 && renderProfessionalForm()}
          {step === 4 && renderLicenseForm()}
          {step === 5 && renderCertificationForm()}

          <View style={styles.buttonsContainer}>
            {step > 1 && (
              <TouchableOpacity
                style={styles.backStepButton}
                onPress={handlePrevStep}
              >
                <Text style={styles.backStepButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            
            {step < 5 ? (
              <TouchableOpacity
                style={[styles.nextStepButton, step > 1 ? { flex: 1 } : {}]}
                onPress={handleNextStep}
              >
                <Text style={styles.nextStepButtonText}>Next</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.submitButton, { flex: 1 }]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/signin')}>
            <Text style={styles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={
            currentDateField === 'licenseExpiry' 
              ? licenseData.expiryDate 
              : certificationData.expiryDate
          }
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E2022',
  },
  emptySpace: {
    width: 24,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 16,
  },
  progressFill: {
    height: 4,
    backgroundColor: '#006AFF',
    borderRadius: 2,
  },
  stepsContainer: {
    marginTop: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F5F7FF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStep: {
    backgroundColor: '#006AFF',
    borderColor: '#006AFF',
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeStepNumber: {
    color: '#FFFFFF',
  },
  stepLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  stepLabel: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    width: '20%',
  },
  activeStepLabel: {
    color: '#006AFF',
    fontWeight: '500',
  },
  formContainer: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E2022',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E2022',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#1E2022',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  specialtyContainer: {
    marginBottom: 8,
  },
  specialtyScrollContent: {
    paddingRight: 16,
  },
  specialtyButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  selectedSpecialty: {
    borderColor: '#006AFF',
    backgroundColor: '#EBF5FF',
  },
  specialtyButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedSpecialtyText: {
    color: '#006AFF',
    fontWeight: '500',
  },
  shiftTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  shiftTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    margin: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  selectedShiftType: {
    borderColor: '#006AFF',
    backgroundColor: '#EBF5FF',
  },
  shiftTypeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedShiftTypeText: {
    color: '#006AFF',
    fontWeight: '500',
  },
  sliderContainer: {
    marginTop: 10,
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E2022',
    marginBottom: 10,
    textAlign: 'center',
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
  },
  sliderFill: {
    height: 6,
    backgroundColor: '#006AFF',
    borderRadius: 3,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  rateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  backStepButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backStepButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  nextStepButton: {
    flex: 1,
    backgroundColor: '#006AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#006AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextStepButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#006AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#006AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  footerText: {
    color: '#6B7280',
    fontSize: 16,
  },
  signInLink: {
    color: '#006AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  imagePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imagePickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  imagePickerText: {
    fontSize: 14,
    color: '#006AFF',
    marginLeft: 8,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    padding: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownItem: {
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  dropdownItemSelected: {
    borderColor: '#006AFF',
    backgroundColor: '#EBF5FF',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#6B7280',
  },
  dropdownItemTextSelected: {
    color: '#006AFF',
    fontWeight: '500',
  }
});