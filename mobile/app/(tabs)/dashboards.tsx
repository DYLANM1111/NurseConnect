import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dashboardAPI } from '../api/client';

const { width } = Dimensions.get('window');

interface EarningsSummary {
  weekly: number;
  monthly: number;
  totalHours: number;
  completedShifts: number;
}

interface UpcomingShift {
  id: string;
  hospital: string;
  unit: string;
  date: string;
  time: string;
  hours: number;
  rate: number;
}

interface CompletedShift {
  id: string;
  hospital: string;
  unit: string;
  date: string;
  hours: number;
  earnings: number;
  status: string;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  nurse_profile_id?: string;
}

const DEFAULT_EARNINGS_SUMMARY: EarningsSummary = {
  weekly: 0,
  monthly: 0,
  totalHours: 0,
  completedShifts: 0
};

export default function DashboardScreen() {
  const router = useRouter();
  const [timeframe, setTimeframe] = useState('week');
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [earningsSummary, setEarningsSummary] = useState<EarningsSummary>(DEFAULT_EARNINGS_SUMMARY);
  const [upcomingShift, setUpcomingShift] = useState<UpcomingShift | null>(null);
  const [completedShifts, setCompletedShifts] = useState<CompletedShift[]>([]);
  const [loadingShifts, setLoadingShifts] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userDataString = await AsyncStorage.getItem('user');
        
        if (userDataString) {
          const user = JSON.parse(userDataString);
          setUserData(user);
          console.log('User data loaded:', user);
          
          await fetchDashboardData(user.id);
        } else {
          console.log('No user data found, redirecting to login');
          router.replace('/signin');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to load your data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchDashboardData = async (userId: string) => {
    setLoadingShifts(true);
    
    try {
      const [earningsData, upcomingShiftData, completedShiftsData] = await Promise.all([
        dashboardAPI.getUserEarnings(userId),
        dashboardAPI.getUpcomingShift(userId),
        dashboardAPI.getCompletedShifts(userId)
      ]);

      setEarningsSummary(earningsData);
      setUpcomingShift(upcomingShiftData);
      setCompletedShifts(completedShiftsData);
      
      console.log('Dashboard data loaded successfully');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Alert.alert('Error', 'Failed to load your dashboard data. Please try again.');
    } finally {
      setLoadingShifts(false);
    }
  };

  const handleFindShifts = () => {
    router.push('/find-shifts');
  };

  const handleViewProfile = () => {
    router.push('/(tabs)/profile');
  };

  // Show loading screen while fetching user data
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#0065FF" />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={handleViewProfile}
        >
          <View style={styles.avatar}>
            <Ionicons name="person" size={22} color="#8F9BB3" />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Banner */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.welcomeName}>
              {userData ? userData.first_name : 'Nurse'}
            </Text>
            <TouchableOpacity 
              style={styles.findShiftsButton}
              onPress={handleFindShifts}
            >
              <Ionicons name="search" size={18} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.findShiftsButtonText}>Find Shifts</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.welcomeImageContainer}>
            <View style={styles.welcomeImage}>
              <Ionicons name="calendar" size={32} color="#0065FF" />
            </View>
          </View>
        </View>

        {/* Earnings Card */}
        <View style={styles.earningsCard}>
          <View style={styles.earningsHeader}>
            <Text style={styles.earningsTitle}>Earnings</Text>
            <View style={styles.timeframeToggle}>
              <TouchableOpacity 
                style={[
                  styles.timeframeButton,
                  timeframe === 'week' && styles.timeframeActive
                ]}
                onPress={() => setTimeframe('week')}
              >
                <Text style={[
                  styles.timeframeText,
                  timeframe === 'week' && styles.timeframeTextActive
                ]}>Week</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.timeframeButton,
                  timeframe === 'month' && styles.timeframeActive
                ]}
                onPress={() => setTimeframe('month')}
              >
                <Text style={[
                  styles.timeframeText,
                  timeframe === 'month' && styles.timeframeTextActive
                ]}>Month</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={styles.earningsAmount}>
            ${timeframe === 'week' ? earningsSummary.weekly.toLocaleString() : earningsSummary.monthly.toLocaleString()}
          </Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{earningsSummary.totalHours}</Text>
              <Text style={styles.statLabel}>Hours</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{earningsSummary.completedShifts}</Text>
              <Text style={styles.statLabel}>Shifts</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleFindShifts}
          >
            <View style={[styles.actionIconContainer, {backgroundColor: '#E3F5FF'}]}>
              <Ionicons name="search" size={22} color="#0065FF" />
            </View>
            <Text style={styles.actionButtonText}>Find Shifts</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/shifts')}
          >
            <View style={[styles.actionIconContainer, {backgroundColor: '#FFF4E3'}]}>
              <Ionicons name="calendar-outline" size={22} color="#FF9500" />
            </View>
            <Text style={styles.actionButtonText}>My Schedule</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/earnings')}
          >
            <View style={[styles.actionIconContainer, {backgroundColor: '#E6FFEF'}]}>
              <Ionicons name="cash-outline" size={22} color="#36B37E" />
            </View>
            <Text style={styles.actionButtonText}>Earnings</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Shift Card - If any */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Next Shift</Text>
          <TouchableOpacity onPress={() => router.push('/shifts')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {loadingShifts ? (
          <View style={styles.loadingShifts}>
            <ActivityIndicator size="small" color="#0065FF" />
            <Text style={styles.loadingShiftsText}>Loading shifts...</Text>
          </View>
        ) : upcomingShift ? (
          <TouchableOpacity 
            style={styles.upcomingShiftCard}
            onPress={() => router.push(`/shift/${upcomingShift.id}`)}
          >
            <View style={styles.shiftTimeTag}>
              <Text style={styles.shiftTimeText}>{upcomingShift.date} • {upcomingShift.time}</Text>
            </View>
            <Text style={styles.hospitalName}>{upcomingShift.hospital}</Text>
            <Text style={styles.unitName}>{upcomingShift.unit}</Text>
            <View style={styles.shiftDetail}>
              <Text style={styles.shiftDetailText}>{upcomingShift.hours} Hour Shift • ${upcomingShift.rate.toFixed(2)}/hr</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.noShiftsContainer}>
            <Text style={styles.noShiftsText}>No upcoming shifts found</Text>
            <TouchableOpacity 
              style={styles.findShiftsButton}
              onPress={handleFindShifts}
            >
              <Ionicons name="search" size={18} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.findShiftsButtonText}>Find Shifts</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Past Shifts */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Past Shifts</Text>
          <TouchableOpacity onPress={() => router.push('/shifts/history')}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {loadingShifts ? (
          <View style={styles.loadingShifts}>
            <ActivityIndicator size="small" color="#0065FF" />
            <Text style={styles.loadingShiftsText}>Loading past shifts...</Text>
          </View>
        ) : completedShifts.length > 0 ? (
          completedShifts.map((shift) => (
            <TouchableOpacity 
              key={shift.id}
              style={styles.pastShiftCard}
              onPress={() => router.push(`/shift/${shift.id}`)}
            >
              <View style={styles.pastShiftHeader}>
                <Text style={styles.pastShiftDate}>{shift.date}</Text>
                <Text style={styles.pastShiftEarnings}>${shift.earnings.toLocaleString()}</Text>
              </View>
              <Text style={styles.pastShiftHospital}>{shift.hospital}</Text>
              <Text style={styles.pastShiftUnit}>{shift.unit}</Text>
              <View style={styles.pastShiftFooter}>
                <Text style={styles.pastShiftHours}>{shift.hours} Hours</Text>
                <View style={styles.statusTag}>
                  <Text style={styles.statusText}>Completed</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noShiftsContainer}>
            <Text style={styles.noShiftsText}>No completed shifts found</Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Find Shifts Button */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={handleFindShifts}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
        <Text style={styles.floatingButtonText}>Find Shifts</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8F9BB3',
  },
  loadingShifts: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1A1F33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  loadingShiftsText: {
    marginTop: 8,
    fontSize: 14,
    color: '#8F9BB3',
  },
  noShiftsContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#1A1F33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  noShiftsText: {
    fontSize: 16,
    color: '#8F9BB3',
    marginBottom: 16,
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
    fontSize: 24,
    fontWeight: '700',
    color: '#2E3A59',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#1A1F33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  welcomeContent: {
    flex: 3,
  },
  welcomeText: {
    fontSize: 14,
    color: '#8F9BB3',
    marginBottom: 4,
  },
  welcomeName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 16,
  },
  welcomeImageContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  welcomeImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E3F5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  findShiftsButton: {
    backgroundColor: '#0065FF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    shadowColor: '#0065FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 6,
  },
  findShiftsButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#1A1F33',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#2E3A59',
    fontWeight: '500',
  },
  earningsCard: {
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
  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  earningsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E3A59',
  },
  timeframeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },
  timeframeButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  timeframeActive: {
    backgroundColor: '#FFFFFF',
  },
  timeframeText: {
    color: '#8F9BB3',
    fontSize: 14,
    fontWeight: '500',
  },
  timeframeTextActive: {
    color: '#2E3A59',
  },
  earningsAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#36B37E',
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E3A59',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#8F9BB3',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E4E9F2',
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
  seeAllText: {
    color: '#0065FF',
    fontSize: 14,
    fontWeight: '500',
  },
  upcomingShiftCard: {
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
  shiftTimeTag: {
    backgroundColor: '#E3F5FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  shiftTimeText: {
    color: '#0065FF',
    fontSize: 14,
    fontWeight: '500',
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E3A59',
    marginBottom: 4,
  },
  unitName: {
    fontSize: 16,
    color: '#8F9BB3',
    marginBottom: 12,
  },
  shiftDetail: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  shiftDetailText: {
    color: '#2E3A59',
    fontSize: 14,
    fontWeight: '500',
  },
  pastShiftCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#1A1F33',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  pastShiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pastShiftDate: {
    fontSize: 14,
    color: '#8F9BB3',
  },
  pastShiftEarnings: {
    fontSize: 16,
    fontWeight: '600',
    color: '#36B37E',
  },
  pastShiftHospital: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E3A59',
    marginBottom: 4,
  },
  pastShiftUnit: {
    fontSize: 14,
    color: '#8F9BB3',
    marginBottom: 12,
  },
  pastShiftFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pastShiftHours: {
    fontSize: 14,
    color: '#2E3A59',
  },
  statusTag: {
    backgroundColor: '#E3F5FF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusText: {
    color: '#0065FF',
    fontSize: 12,
    fontWeight: '500',
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#0065FF',
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: '#0065FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  floatingButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});