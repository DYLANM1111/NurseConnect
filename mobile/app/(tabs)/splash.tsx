// app/splash.tsx
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, ImageBackground, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();

  const FeatureCard = ({ title, description }: { title: string; description: string }) => (
    <View style={styles.featureCard}>
      <View style={styles.featureContent}>
        <View style={styles.iconContainer} />
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SafeAreaView>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>NurseConnect</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => router.push('/login')}
              >
                <Text style={styles.loginButtonText}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Hero Section */}
          <View style={styles.hero}>
            <Text style={styles.heroSubtitle}>WELCOME TO NURSECONNECT</Text>
            <Text style={styles.heroTitle}>
              Your Next Shift{'\n'}
              <Text style={styles.heroTitleAccent}>Awaits</Text>
            </Text>
            <TouchableOpacity 
              style={styles.getStartedButton}
              onPress={() => router.push('/signup')}
            >
              <Text style={styles.getStartedButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <Text style={styles.sectionTitle}>Why NurseConnect?</Text>
            <FeatureCard
              title="Higher Pay Rates"
              description="Earn more with competitive rates and flexible scheduling options."
            />
            <FeatureCard
              title="Instant Booking"
              description="Find and secure shifts instantly with our easy-to-use platform."
            />
            <FeatureCard
              title="Verified Facilities"
              description="Work at top-rated healthcare facilities in your area."
            />
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <Text style={styles.statHeader}>Trusted by Healthcare Professionals</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statColumn}>
                <Text style={styles.statNumber}>50K+</Text>
                <Text style={styles.statLabel}>Active Nurses</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statColumn}>
                <Text style={styles.statNumber}>1M+</Text>
                <Text style={styles.statLabel}>Shifts Completed</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  logo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E2022',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loginButtonText: {
    color: '#006AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  hero: {
    padding: 24,
    paddingTop: 40,
    backgroundColor: '#F8FAFC',
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: '#006AFF',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: '700',
    color: '#1E2022',
    lineHeight: 48,
    marginBottom: 32,
  },
  heroTitleAccent: {
    color: '#006AFF',
  },
  getStartedButton: {
    backgroundColor: '#006AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#006AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  getStartedButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E2022',
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  featuresContainer: {
    paddingTop: 48,
    paddingBottom: 24,
  },
  featureCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureContent: {
    padding: 24,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F0F7FF',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E2022',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  statsSection: {
    backgroundColor: '#F8FAFC',
    padding: 24,
    paddingVertical: 48,
  },
  statHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E2022',
    textAlign: 'center',
    marginBottom: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statColumn: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#006AFF',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
});