// app/signup.tsx
import { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';

export default function SignUpScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    licenseNumber: '',
    state: '',
    specialty: ''
  });
  const [errorMessage, setErrorMessage] = useState('');

  const updateFormData = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
    setErrorMessage('');
  };

  const handleContinue = () => {
    // Validate current step
    if (step === 1) {
      if (!formData.firstName || !formData.lastName) {
        setErrorMessage('Please enter your full name');
        return;
      }
    } else if (step === 2) {
      if (!formData.email || !formData.password) {
        setErrorMessage('Please fill in all fields');
        return;
      }
      // Add email validation here
    } else if (step === 3) {
      if (!formData.phoneNumber) {
        setErrorMessage('Please enter your phone number');
        return;
      }
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      // Handle registration
      console.log('Registering with:', formData);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Let's get started</Text>
      <Text style={styles.stepDescription}>Enter your name as it appears on your license</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          value={formData.firstName}
          onChangeText={(value) => updateFormData('firstName', value)}
          placeholder="Enter your first name"
          placeholderTextColor="#A0A0A0"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          value={formData.lastName}
          onChangeText={(value) => updateFormData('lastName', value)}
          placeholder="Enter your last name"
          placeholderTextColor="#A0A0A0"
          autoCapitalize="words"
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Create your account</Text>
      <Text style={styles.stepDescription}>Enter your email and create a password</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(value) => updateFormData('email', value)}
          placeholder="Enter your email"
          placeholderTextColor="#A0A0A0"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={formData.password}
          onChangeText={(value) => updateFormData('password', value)}
          placeholder="Create a password"
          placeholderTextColor="#A0A0A0"
          secureTextEntry
          autoCapitalize="none"
        />
        <Text style={styles.passwordHint}>Must be at least 8 characters</Text>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Add your phone number</Text>
      <Text style={styles.stepDescription}>We'll send you a verification code</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={formData.phoneNumber}
          onChangeText={(value) => updateFormData('phoneNumber', value)}
          placeholder="(123) 456-7890"
          placeholderTextColor="#A0A0A0"
          keyboardType="phone-pad"
        />
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>License Information</Text>
      <Text style={styles.stepDescription}>Enter your nursing license details</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>License Number</Text>
        <TextInput
          style={styles.input}
          value={formData.licenseNumber}
          onChangeText={(value) => updateFormData('licenseNumber', value)}
          placeholder="Enter license number"
          placeholderTextColor="#A0A0A0"
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>State</Text>
        <TextInput
          style={styles.input}
          value={formData.state}
          onChangeText={(value) => updateFormData('state', value)}
          placeholder="Select state"
          placeholderTextColor="#A0A0A0"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Specialty</Text>
        <TextInput
          style={styles.input}
          value={formData.specialty}
          onChangeText={(value) => updateFormData('specialty', value)}
          placeholder="Select specialty"
          placeholderTextColor="#A0A0A0"
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => step === 1 ? router.back() : setStep(step - 1)}
            >
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <View style={styles.stepIndicator}>
              {[1, 2, 3, 4].map((i) => (
                <View 
                  key={i}
                  style={[
                    styles.stepDot,
                    i === step && styles.stepDotActive
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Main Content */}
          <ScrollView style={styles.content}>
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}

            <TouchableOpacity 
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>
                {step === 4 ? 'Create Account' : 'Continue'}
              </Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/signin')}>
                <Text style={styles.signInLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    paddingVertical: 4,
  },
  backText: {
    color: '#006AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  stepDotActive: {
    backgroundColor: '#006AFF',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  stepContainer: {
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E2022',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginBottom: 16,
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
  passwordHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  continueButton: {
    backgroundColor: '#006AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#006AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 24,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
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