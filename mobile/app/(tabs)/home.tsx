// app/(tabs)/home.tsx
import { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';

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
};

export default function HomeScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [viewType, setViewType] = useState<'list' | 'calendar'>('list');

  // Mock data for shifts
  const shifts: Shift[] = [
    {
      id: '1',
      hospital: 'Wake Baptist Hospital',
      unit: 'ICU',
      date: '2025-02-14',
      startTime: '07:00',
      endTime: '19:00',
      rate: 75.50,
      distance: '5.2 miles',
      specialty: 'ICU',
      facilityRating: 4.5
    },
    {
      id: '2',
      hospital: 'Duke Hospital',
      unit: 'ER',
      date: '2025-02-14',
      startTime: '07:00',
      endTime: '19:00',
      rate: 50.00,
      distance: '7.2 miles',
      specialty: 'ER',
      facilityRating: 3.5
    },
    {
      id: '3',
      hospital: 'WakeMed Hospital',
      unit: 'OR',
      date: '2025-02-14',
      startTime: '07:00',
      endTime: '19:00',
      rate: 75.50,
      distance: '5.2 miles',
      specialty: 'OR',
      facilityRating: 4.5
    },
  ];

  const nextSevenDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short',
      day: 'numeric' 
    });
  };

  const ShiftCard = ({ shift }: { shift: Shift }) => (
    <TouchableOpacity 
      style={styles.shiftCard}
      onPress={() => router.push(`/shift/${shift.id}`)}
    >
      <View style={styles.shiftHeader}>
        <View>
          <Text style={styles.hospitalName}>{shift.hospital}</Text>
          <Text style={styles.unitName}>{shift.unit}</Text>
        </View>
        <View style={styles.rateContainer}>
          <Text style={styles.rateAmount}>${shift.rate}</Text>
          <Text style={styles.rateLabel}>/hr</Text>
        </View>
      </View>

      <View style={styles.shiftDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>{shift.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Time:</Text>
          <Text style={styles.detailValue}>{shift.startTime} - {shift.endTime}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Distance:</Text>
          <Text style={styles.detailValue}>{shift.distance}</Text>
        </View>
      </View>

      <View style={styles.shiftFooter}>
        <View style={styles.tagContainer}>
          <Text style={styles.tag}>{shift.specialty}</Text>
        </View>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>{shift.facilityRating}</Text>
          {/* Add star icon here */}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.welcomeText}>Hi, Sarah</Text>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
          >
            <View style={styles.avatarPlaceholder} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerBottom}>
          <Text style={styles.location}>San Francisco Bay Area</Text>
          <TouchableOpacity 
            style={styles.locationButton}
            onPress={() => router.push('/location')}
          >
            <Text style={styles.locationButtonText}>Change</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateFilters}
        >
          {nextSevenDays.map((date, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateButton,
                selectedDate.toDateString() === date.toDateString() && styles.dateButtonActive
              ]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[
                styles.dateButtonText,
                selectedDate.toDateString() === date.toDateString() && styles.dateButtonTextActive
              ]}>
                {formatDate(date)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.specialtyFilters}
        >
          {['All', 'ICU', 'ER', 'Med-Surg', 'OR'].map((specialty) => (
            <TouchableOpacity
              key={specialty}
              style={[
                styles.specialtyButton,
                selectedSpecialty === specialty && styles.specialtyButtonActive
              ]}
              onPress={() => setSelectedSpecialty(specialty)}
            >
              <Text style={[
                styles.specialtyButtonText,
                selectedSpecialty === specialty && styles.specialtyButtonTextActive
              ]}>
                {specialty}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              // Add refresh logic here
              setTimeout(() => setRefreshing(false), 1000);
            }}
          />
        }
      >
        <View style={styles.contentHeader}>
          <Text style={styles.contentTitle}>Available Shifts</Text>
          <View style={styles.viewToggle}>
            <TouchableOpacity 
              style={[styles.viewToggleButton, viewType === 'list' && styles.viewToggleButtonActive]}
              onPress={() => setViewType('list')}
            >
              <Text style={[
                styles.viewToggleText,
                viewType === 'list' && styles.viewToggleTextActive
              ]}>List</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.viewToggleButton, viewType === 'calendar' && styles.viewToggleButtonActive]}
              onPress={() => setViewType('calendar')}
            >
              <Text style={[
                styles.viewToggleText,
                viewType === 'calendar' && styles.viewToggleTextActive
              ]}>Calendar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Shifts List */}
        <View style={styles.shiftsContainer}>
          {shifts.map((shift) => (
            <ShiftCard key={shift.id} shift={shift} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E2022',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  headerBottom: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 16,
    color: '#6B7280',
  },
  locationButton: {
    marginLeft: 8,
    padding: 4,
  },
  locationButtonText: {
    color: '#006AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dateFilters: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  dateButtonActive: {
    backgroundColor: '#006AFF',
  },
  dateButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  dateButtonTextActive: {
    color: '#FFFFFF',
  },
  specialtyFilters: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  specialtyButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  specialtyButtonActive: {
    backgroundColor: '#EBF5FF',
  },
  specialtyButtonText: {
    color: '#6B7280',
    fontSize: 14,
  },
  specialtyButtonTextActive: {
    color: '#006AFF',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E2022',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },
  viewToggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewToggleButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  viewToggleText: {
    color: '#6B7280',
    fontSize: 14,
  },
  viewToggleTextActive: {
    color: '#1E2022',
    fontWeight: '500',
  },
  shiftsContainer: {
    padding: 16,
    gap: 16,
  },
  shiftCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E2022',
    marginBottom: 4,
  },
  unitName: {
    fontSize: 14,
    color: '#6B7280',
  },
  rateContainer: {
    alignItems: 'flex-end',
  },
  rateAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#059669',
  },
  rateLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  shiftDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#1E2022',
    fontWeight: '500',
  },
  shiftFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagContainer: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tag: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E2022',
  },
});