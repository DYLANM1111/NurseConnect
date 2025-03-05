// app/signup.tsx
import React, { useState } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Define types for our form data
type AccountFormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

type PersonalFormData = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
};

type ProfessionalFormData = {
  specialty: string;
  yearsExperience: string;
  preferredShiftTypes: string[];
  preferredDistance: string;
  minHourlyRate: string;
  maxHourlyRate: string;
};

// Available shift types
const SHIFT_TYPES = ['Day', 'Night', 'Evening', 'Weekend', 'On-Call'];

// Available specialties
const SPECIALTIES = [
  'Registered Nurse (RN)',
  'Licensed Practical Nurse (LPN)',
  'Certified Nursing Assistant (CNA)',
  'Emergency Department',
  'Intensive Care Unit (ICU)',
  'Pediatric',
  'Operating Room',
  'Maternity',
  'Geriatric',
  'Psychiatric',
  'Other'
];

export default function SignUpScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form data for each step
  const [accountData, setAccountData] = useState<AccountFormData>({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [personalData, setPersonalData] = useState<PersonalFormData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });

  const [professionalData, setProfessionalData] = useState<ProfessionalFormData>({
    specialty: '',
    yearsExperience: '',
    preferredShiftTypes: [],
    preferredDistance: '25',
    minHourlyRate: '',
    maxHourlyRate: '',
  });

  // Error messages
  const [accountErrors, setAccountErrors] = useState<{ [key: string]: string }>({});
  const [personalErrors, setPersonalErrors] = useState<{ [key: string]: string }>({});
  const [professionalErrors, setProfessionalErrors] = useState<{ [key: string]: string }>({});

  // Update form data
  const updateAccountData = (key: keyof AccountFormData, value: string) => {
    setAccountData((prev) => ({ ...prev, [key]: value }));
    if (accountErrors[key]) {
      setAccountErrors((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    }
  };

  const updatePersonalData = (key: keyof PersonalFormData, value: string) => {
    setPersonalData((prev) => ({ ...prev, [key]: value }));
    if (personalErrors[key]) {
      setPersonalErrors((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    }
  };

  const updateProfessionalData = (key: keyof ProfessionalFormData, value: any) => {
    setProfessionalData((prev) => ({ ...prev, [key]: value }));
    if (professionalErrors[key]) {
      setProfessionalErrors((prev) => {
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

  // Validate account data
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

  // Validate personal data
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

  // Validate professional data
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

  // Handle next step
  const handleNextStep = () => {
    if (step === 1 && validateAccountData()) {
      setStep(2);
    } else if (step === 2 && validatePersonalData()) {
      setStep(3);
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateProfessionalData()) {
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Combine all form data
      const userData = {
        ...accountData,
        ...personalData,
        ...professionalData,
        role: 'nurse'
      };

      console.log('User data to be submitted:', userData);
      
      // Show success message and navigate
      Alert.alert(
        "Registration Successful",
        "Your account has been created. You can now sign in.",
        [
          { 
            text: "OK", 
            onPress: () => router.replace('/signin')
          }
        ]
      );
    } catch (error) {
      Alert.alert("Registration Failed", "There was an error creating your account. Please try again.");
    } finally {
      setLoading(false);
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

  // Progress bar
  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${((step - 1) / 2) * 100}%` }
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
        </View>
        <View style={styles.stepLabelRow}>
          <Text style={[styles.stepLabel, step === 1 ? styles.activeStepLabel : null]}>Account</Text>
          <Text style={[styles.stepLabel, step === 2 ? styles.activeStepLabel : null]}>Personal</Text>
          <Text style={[styles.stepLabel, step === 3 ? styles.activeStepLabel : null]}>Professional</Text>
        </View>
      </View>
    </View>
  );

  // Render account form
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

  // Render personal info form
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

  // Render professional info form
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
            {SPECIALTIES.map(specialty => (
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
          {SHIFT_TYPES.map((type) => (
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

          <View style={styles.buttonsContainer}>
            {step > 1 && (
              <TouchableOpacity
                style={styles.backStepButton}
                onPress={handlePrevStep}
              >
                <Text style={styles.backStepButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            
            {step < 3 ? (
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
    width: 28,
    height: 28,
    borderRadius: 14,
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
    fontSize: 14,
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
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    width: '33%',
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
});