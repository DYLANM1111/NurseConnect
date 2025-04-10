import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { shiftsAPI } from '../api/client';
import { authAPI } from '../api/client';

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
  shiftLength: number;
  urgentFill?: boolean;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    marginRight: 16,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E2022',
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
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBottom: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
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
  searchContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginRight: 12,
    height: 36,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 36,
    fontSize: 14,
    color: '#1E2022',
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedFilters: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E2022',
    marginBottom: 12,
  },
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rangeBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginHorizontal: 12,
    position: 'relative',
  },
  rangeFill: {
    position: 'absolute',
    height: 6,
    backgroundColor: '#006AFF',
    borderRadius: 3,
  },
  rangeValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  rangeButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeButton: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  rangeButtonActive: {
    backgroundColor: '#EBF5FF',
  },
  rangeButtonText: {
    fontSize: 12,
    color: '#6B7280',
  },
  rangeButtonTextActive: {
    color: '#006AFF',
    fontWeight: '500',
  },
  distanceButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  distanceButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  distanceButtonActive: {
    backgroundColor: '#EBF5FF',
    borderColor: '#006AFF',
  },
  distanceButtonText: {
    fontSize: 12,
    color: '#6B7280',
  },
  distanceButtonTextActive: {
    color: '#006AFF',
    fontWeight: '500',
  },
  shiftLengthButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  shiftLengthButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  shiftLengthButtonActive: {
    backgroundColor: '#EBF5FF',
    borderColor: '#006AFF',
  },
  shiftLengthButtonText: {
    fontSize: 12,
    color: '#6B7280',
  },
  shiftLengthButtonTextActive: {
    color: '#006AFF',
    fontWeight: '500',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  resetButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resetButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  applyFiltersButton: {
    backgroundColor: '#006AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  applyFiltersButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  /* Compact date filter styles */
  dateFilterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dateFilters: {
    paddingHorizontal: 12,
    gap: 8,
  },
  dateButton: {
    alignItems: 'center',
    width: 50,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  dateButtonActive: {
    backgroundColor: '#EBF5FF',
    borderWidth: 1,
    borderColor: '#006AFF',
  },
  dateButtonDay: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  dateButtonDayActive: {
    color: '#006AFF',
  },
  dateButtonNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E2022',
  },
  dateButtonNumberActive: {
    color: '#006AFF',
  },
  /* Compact specialty filter styles */
  specialtyFiltersContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  specialtyFilters: {
    paddingHorizontal: 12,
    gap: 6,
  },
  specialtyButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  specialtyButtonActive: {
    backgroundColor: '#EBF5FF',
    borderColor: '#006AFF',
  },
  specialtyButtonText: {
    color: '#6B7280',
    fontSize: 12,
  },
  specialtyButtonTextActive: {
    color: '#006AFF',
    fontWeight: '500',
  },
  /* Content header - more compact */
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  contentTitleContainer: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E2022',
  },
  shiftCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },
  viewToggleButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewToggleButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  /* Shift cards and content */
  content: {
    flex: 1,
  },
  shiftsContainer: {
    padding: 16,
    paddingTop: 16,
  },
  /* Enhanced shift card - bigger and more prominent */
  shiftCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  urgentCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  urgentBadge: {
    position: 'absolute',
    bottom: 72,
    left: 80,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  urgentBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingTop: 20,
  },
  hospitalInfo: {
    flex: 1,
    paddingRight: 16,
  },
  hospitalName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E2022',
    marginBottom: 4,
  },
  unitName: {
    fontSize: 16,
    color: '#6B7280',
  },
  rateContainer: {
    alignItems: 'flex-end',
  },
  rateAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#059669',
  },
  rateLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  shiftDetails: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailColumn: {
    flex: 1,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailIcon: {
    marginRight: 8,
  },
  detailValue: {
    fontSize: 15,
    color: '#1E2022',
  },
  shiftFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  applyButton: {
    backgroundColor: '#006AFF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E2022',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  resetFiltersButton: {
    backgroundColor: '#006AFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  resetFiltersButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#006AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#006AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  // New styles for loading and error states
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E2022',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#006AFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
export default function HomeScreen() {
  const router = useRouter();
  
  // State for shifts and loading
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtering state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [viewType, setViewType] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([40, 100]);
  const [maxDistance, setMaxDistance] = useState(25);
  const [shiftLength, setShiftLength] = useState([8, 12]);
  const [user, setUser] = useState(null);



  // Fetch shifts from API
  const fetchShifts = async () => {
    try {
      setLoading(true);
      const data = await shiftsAPI.getShifts();
      setShifts(data);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch shifts:', error);
      setError('Could not load shifts. Please try again later.');
      setShifts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const fetchCurrentUser = async () => {
    try {
      const currentUser = await authAPI.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };
  

  // Load shifts on component mount
  useEffect(() => {
    fetchShifts();
    fetchCurrentUser();

  }, []);

  // Filter shifts based on selected criteria
  const filteredShifts = shifts.filter(shift => {
    // Filter by specialty
    const specialtyMatches = selectedSpecialty === 'All' || shift.specialty === selectedSpecialty;
    
    // Filter by search (hospital name or unit)
    const searchMatches = searchQuery === '' || 
      shift.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shift.unit.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by price range
    const rateMatches = shift.rate >= priceRange[0] && shift.rate <= priceRange[1];
    
    // Filter by distance - parse distance string to get number
    const distanceValue = parseFloat(shift.distance?.split(' ')[0] || '0');
    const distanceMatches = distanceValue <= maxDistance;
    
    // Filter by shift length
    const lengthMatches = shiftLength.includes(shift.shiftLength);
    
    return specialtyMatches && searchMatches && rateMatches && distanceMatches && lengthMatches;
  });

  const nextSevenDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  const formatDay = (date) => {
    const today = new Date();
    
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return 'Today';
    }

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear()
    ) {
      return 'Tmrw';
    }

    return date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3);
  };

  const formatDateNumber = (date) => {
    return date.getDate().toString();
  };

  const toggleFilter = (length) => {
    if (shiftLength.includes(length)) {
      setShiftLength(shiftLength.filter(l => l !== length));
    } else {
      setShiftLength([...shiftLength, length]);
    }
  };

  // Handle refreshing
  const handleRefresh = () => {
    setRefreshing(true);
    fetchShifts();
  };

  const ShiftCard = ({ shift }) => (
    <TouchableOpacity 
      style={[styles.shiftCard, shift.urgentFill && styles.urgentCard]}
      onPress={() => router.push(`/apply/${shift.id}`)}
    >
      {shift.urgentFill && (
        <View style={styles.urgentBadge}>
          <Ionicons name="flash" size={12} color="#FFFFFF" />
          <Text style={styles.urgentBadgeText}>Urgent</Text>
        </View>
      )}
      
      <View style={styles.shiftHeader}>
        <View style={styles.hospitalInfo}>
          <Text style={styles.hospitalName}>{shift.hospital}</Text>
          <Text style={styles.unitName}>{shift.unit}</Text>
        </View>
        <View style={styles.rateContainer}>
          <Text style={styles.rateAmount}>${shift.rate.toFixed(2)}</Text>
          <Text style={styles.rateLabel}>/hr</Text>
        </View>
      </View>

      <View style={styles.shiftDetails}>
        <View style={styles.detailColumn}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" style={styles.detailIcon} />
            <Text style={styles.detailValue}>{shift.date}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color="#6B7280" style={styles.detailIcon} />
            <Text style={styles.detailValue}>{shift.startTime} - {shift.endTime}</Text>
          </View>
        </View>
        <View style={styles.detailColumn}>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={16} color="#6B7280" style={styles.detailIcon} />
            <Text style={styles.detailValue}>{shift.distance}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="hourglass-outline" size={16} color="#6B7280" style={styles.detailIcon} />
            <Text style={styles.detailValue}>{shift.shiftLength} hours</Text>
          </View>
        </View>
      </View>

      <View style={styles.shiftFooter}>
        <View style={styles.tagContainer}>
          <Text style={styles.tag}>{shift.specialty}</Text>
        </View>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFBC00" />
          <Text style={styles.ratingText}>{shift.facilityRating.toFixed(1)}</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.applyButton}
        onPress={() => router.push(`/apply[id]?id=${shift.id}`)}
        >
        <Text style={styles.applyButtonText}>Apply</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Ionicons name="calendar-outline" size={60} color="#D1D5DB" />
      <Text style={styles.emptyStateTitle}>No shifts available</Text>
      <Text style={styles.emptyStateText}>
        No shifts match your current filters. Try adjusting your filters or check back later for new opportunities.
      </Text>
      <TouchableOpacity 
        style={styles.resetFiltersButton}
        onPress={() => {
          setSelectedSpecialty('All');
          setPriceRange([40, 100]);
          setMaxDistance(25);
          setShiftLength([8, 12]);
          setSearchQuery('');
        }}
      >
        <Text style={styles.resetFiltersButtonText}>Reset Filters</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.welcomeText}>Hi, {user ? `${user.first_name}` : 'Guest'}</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => router.push('/notifications')}
            >
              <Ionicons name="notifications-outline" size={24} color="#1E2022" />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => router.push('/profile')}
            >
              <Image 
  source={require('../../assets/images/dog3.jpg')}
  style={{ width: '100%', height: '100%', borderRadius: 20 }}
/>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.headerBottom}>
          <Text style={styles.location}>
            <Ionicons name="location" size={16} color="#006AFF" />
            {' '} Piedmont Triad Area
          </Text>
          <TouchableOpacity 
            style={styles.locationButton}
            onPress={() => router.push('/location')}
          >
            <Text style={styles.locationButtonText}>Change</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search facilities or units"
            placeholderTextColor="#A0A0A0"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <Ionicons name="close-circle" size={16} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options-outline" size={20} color={showFilters ? "#006AFF" : "#1E2022"} />
        </TouchableOpacity>
      </View>

      {/* Expanded Filters */}
      {showFilters && (
        <View style={styles.expandedFilters}>
          {/* Filter content */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Price Range ($/hr)</Text>
            <View style={styles.priceRangeContainer}>
              <Text style={styles.rangeValue}>${priceRange[0]}</Text>
              <View style={styles.rangeBar}>
                <View style={[styles.rangeFill, {width: `${((priceRange[1] - priceRange[0]) / 60) * 100}%`, left: `${((priceRange[0] - 40) / 60) * 100}%`}]} />
              </View>
              <Text style={styles.rangeValue}>${priceRange[1]}+</Text>
            </View>
            <View style={styles.rangeButtonsContainer}>
              {[40, 50, 60, 70, 80, 90, 100].map(value => (
                <TouchableOpacity 
                  key={value}
                  style={[
                    styles.rangeButton, 
                    value >= priceRange[0] && value <= priceRange[1] && styles.rangeButtonActive
                  ]}
                  onPress={() => {
                    if (value < priceRange[1]) setPriceRange([value, priceRange[1]]);
                    else if (value > priceRange[0]) setPriceRange([priceRange[0], value]);
                  }}
                >
                  <Text style={[
                    styles.rangeButtonText,
                    value >= priceRange[0] && value <= priceRange[1] && styles.rangeButtonTextActive
                  ]}>${value}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterActions}>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={() => {
                setPriceRange([40, 100]);
                setMaxDistance(25);
                setShiftLength([8, 12]);
              }}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyFiltersButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyFiltersButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Main Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        {/* Main Content Header */}
        <View style={styles.contentHeader}>
          <View style={styles.contentTitleContainer}>
            <Text style={styles.contentTitle}>Available Shifts</Text>
            {!loading && (
              <Text style={styles.shiftCount}>
                {filteredShifts.length} {filteredShifts.length === 1 ? 'shift' : 'shifts'} found
              </Text>
            )}
          </View>
          <View style={styles.viewToggle}>
            <TouchableOpacity 
              style={[styles.viewToggleButton, viewType === 'list' && styles.viewToggleButtonActive]}
              onPress={() => setViewType('list')}
            >
              <Ionicons 
                name="list" 
                size={18} 
                color={viewType === 'list' ? '#1E2022' : '#6B7280'} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.viewToggleButton, viewType === 'calendar' && styles.viewToggleButtonActive]}
              onPress={() => setViewType('calendar')}
            >
              <Ionicons 
                name="calendar" 
                size={18} 
                color={viewType === 'calendar' ? '#1E2022' : '#6B7280'} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.shiftsContainer}>
          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#006AFF" />
              <Text style={styles.loadingText}>Loading shifts...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
              <Text style={styles.errorTitle}>Unable to load shifts</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={fetchShifts}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : filteredShifts.length > 0 ? (
            filteredShifts.map((shift) => (
              <ShiftCard key={shift.id} shift={shift} />
            ))
          ) : (
            <EmptyState />
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => {
          if (showFilters) {
            setShowFilters(false);
          } else {
            setShowFilters(true);
          }
        }}
      >
        <Ionicons name="options" size={22} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}