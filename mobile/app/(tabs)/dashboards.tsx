// app/(tabs)/dashboard.tsx
import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// Mock data
const MOCK_SHIFTS = [
  {
    id: '1',
    hospital: 'Stanford Medical Center',
    unit: 'ICU',
    date: '2025-02-14',
    hours: 12,
    earnings: 1146.00,
    status: 'completed'
  },
  {
    id: '2',
    hospital: 'UCSF Medical Center',
    unit: 'Emergency',
    date: '2025-02-12',
    hours: 8,
    earnings: 764.00,
    status: 'completed'
  },
];

const EARNINGS_SUMMARY = {
  weekly: 1910.00,
  monthly: 7640.00,
  totalHours: 20,
  completedShifts: 2
};

export default function DashboardScreen() {
  const router = useRouter();
  const [timeframe, setTimeframe] = useState('week');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => router.push('/profile')}
        >
          <View style={styles.avatar} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
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
            ${timeframe === 'week' ? EARNINGS_SUMMARY.weekly : EARNINGS_SUMMARY.monthly}
          </Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{EARNINGS_SUMMARY.totalHours}</Text>
              <Text style={styles.statLabel}>Hours</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{EARNINGS_SUMMARY.completedShifts}</Text>
              <Text style={styles.statLabel}>Shifts</Text>
            </View>
          </View>
        </View>

        {/* Upcoming Shift Card - If any */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Next Shift</Text>
          <TouchableOpacity onPress={() => router.push('/shifts')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.upcomingShiftCard}
          onPress={() => router.push('/shift/123')}
        >
          <View style={styles.shiftTimeTag}>
            <Text style={styles.shiftTimeText}>Tomorrow • 7:00 AM</Text>
          </View>
          <Text style={styles.hospitalName}>Stanford Medical Center</Text>
          <Text style={styles.unitName}>Intensive Care Unit</Text>
          <View style={styles.shiftDetail}>
            <Text style={styles.shiftDetailText}>12 Hour Shift • $95.50/hr</Text>
          </View>
        </TouchableOpacity>

        {/* Past Shifts */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Past Shifts</Text>
          <TouchableOpacity onPress={() => router.push('/shifts/history')}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {MOCK_SHIFTS.map((shift) => (
          <TouchableOpacity 
            key={shift.id}
            style={styles.pastShiftCard}
            onPress={() => router.push(`/shift/${shift.id}`)}
          >
            <View style={styles.pastShiftHeader}>
              <Text style={styles.pastShiftDate}>{shift.date}</Text>
              <Text style={styles.pastShiftEarnings}>${shift.earnings}</Text>
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
        ))}
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
  },
  avatar: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  content: {
    flex: 1,
    padding: 16,
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
});