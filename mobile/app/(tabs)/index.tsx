import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, ImageBackground, Dimensions, StatusBar, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';

const { width, height } = Dimensions.get('window');

interface FeatureCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

interface PaginationDotProps {
  active: boolean;
}

export default function SplashScreen() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);

  // Auto-scroll pagination
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPage((prevPage) => (prevPage + 1) % 3);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
    <View style={styles.featureCard}>
      <View style={styles.featureContent}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={24} color="#006AFF" />
        </View>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );

  const PaginationDot = ({ active }: PaginationDotProps) => (
    <View style={[styles.paginationDot, active && styles.activePaginationDot]} />
  );

  const pages = [
    {
      image: require('../../assets/images/stock1.jpg'), 
      title: "Find Shifts That Work For You",
      subtitle: "Browse thousands of available shifts at top healthcare facilities"
    },
    {
      image: require('../../assets/images/stock2.jpg'),
      title: "Higher Pay, Better Benefits",
      subtitle: "Earn more with competitive rates and flexible scheduling"
    },
    {
      image: require('../../assets/images/stock3.jpg'),
      title: "Apply With One Tap",
      subtitle: "Secure shifts instantly with our streamlined booking process"
    }
  ];

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      
      
      <View style={styles.carouselContainer}>
        <ImageBackground
          source={pages[currentPage].image}
          style={styles.heroBackground}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
            style={styles.gradientOverlay}
          >
            {/* Header */}
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.header}>
                <Text style={styles.logo}>NurseConnect</Text>
                <TouchableOpacity 
                  style={styles.loginButton}
                  onPress={() => router.push('/Login')}
                >
                  <Text style={styles.loginButtonText}>Log In</Text>
                </TouchableOpacity>
              </View>
              
              {/* Hero Content */}
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>{pages[currentPage].title}</Text>
                <Text style={styles.heroSubtitle}>{pages[currentPage].subtitle}</Text>
              </View>
              
              {/* Pagination */}
              <View style={styles.pagination}>
                {pages.map((_, index) => (
                  <PaginationDot key={index} active={currentPage === index} />
                ))}
              </View>
            </SafeAreaView>
          </LinearGradient>
        </ImageBackground>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.push('/signup')}
          >
            <Text style={styles.primaryButtonText}>Create Account</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.push('/learn-more')}
          >
            <Text style={styles.secondaryButtonText}>Learn More</Text>
          </TouchableOpacity>
        </View>
        
        {/* Features */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>Why Nurses Choose Us</Text>
          
          <FeatureCard
            icon="cash-outline"
            title="Higher Pay Rates"
            description="Earn up to 40% more than traditional staffing agencies with transparent, competitive rates."
          />
          
          <FeatureCard
            icon="flash-outline"
            title="Instant Booking"
            description="Find and secure shifts with a single tap. No more waiting for callbacks or approvals."
          />
          
          <FeatureCard
            icon="shield-checkmark-outline"
            title="Verified Facilities"
            description="Work at top-rated healthcare facilities that have been thoroughly vetted for quality."
          />
        </View>

        {/* Testimonial */}
        <View style={styles.testimonialContainer}>
          <View style={styles.quoteMark}>
            <Ionicons name="chatbubble" size={24} color="#006AFF" />
          </View>
          <Text style={styles.testimonialText}>
            "NurseConnect has completely changed how I approach my career. I have more flexibility, better pay, and work at facilities I love."
          </Text>
          <View style={styles.testimonialAuthor}>
            <Image 
              source={require('../../assets/images/dogselfie.jpeg')} 
              style={styles.authorImage} 
            />
            <View>
              <Text style={styles.authorName}>Sarah Johnson, RN</Text>
              <Text style={styles.authorDetails}>Critical Care • 5 years with NurseConnect</Text>
            </View>
          </View>
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
            
            <View style={styles.statDivider} />
            
            <View style={styles.statColumn}>
              <Text style={styles.statNumber}>500+</Text>
              <Text style={styles.statLabel}>Partner Facilities</Text>
            </View>
          </View>
        </View>
        
        
        <View style={styles.finalCTA}>
          <Text style={styles.ctaTitle}>Ready to find your next shift?</Text>
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => router.push('/signup')}
          >
            <Text style={styles.ctaButtonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  carouselContainer: {
    height: height * 0.45, 
    width: width,
  },
  heroBackground: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  logo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loginButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  heroContent: {
    padding: 24,
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 60,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 30,
    width: '100%',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activePaginationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  actionContainer: {
    padding: 24,
    paddingTop: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#006AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#006AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#006AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 12,
  },
  secondaryButtonText: {
    color: '#006AFF',
    fontSize: 16,
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
    paddingTop: 20,
    paddingBottom: 32,
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
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  featureContent: {
    padding: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F7FF',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E2022',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
  testimonialContainer: {
    margin: 24,
    padding: 24,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#006AFF',
  },
  quoteMark: {
    position: 'absolute',
    top: -10,
    left: 24,
    backgroundColor: '#FFFFFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  testimonialText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#1E2022',
    lineHeight: 24,
    marginBottom: 16,
  },
  testimonialAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E2022',
  },
  authorDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsSection: {
    backgroundColor: '#F8FAFC',
    padding: 24,
    paddingVertical: 40,
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
    paddingHorizontal: 16,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#006AFF',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  finalCTA: {
    alignItems: 'center',
    padding: 24,
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E2022',
    marginBottom: 20,
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: '#006AFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#006AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});