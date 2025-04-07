import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Dimensions,
  Platform,
  StatusBar,
  Alert
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { authAPI } from '../api/client';
import apiClient from '../api/client';

// Get screen dimensions for responsive design
const { width } = Dimensions.get('window');

// Define types for our application data
type Application = {
  id: string;
  shift_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  submitted_at: string;
  hospital: string;
  unit: string;
  date: string;
  startTime: string;
  endTime: string;
  hourlyRate: number;
  specialNotes?: string;
  shiftLength: number;
};

export default function ApplicationsScreen() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const fetchApplications = async () => {
    try {
      const userData = await authAPI.getCurrentUser();
      
      if (userData) {
        // Replace mock data with actual API call
        const response = await apiClient.get(`/nurses/${userData.nurse_profile_id}/applications`);
        
        // Transform the API response to match our Application type
        const apiApplications = response.data.map(app => ({
          id: app.id,
          shift_id: app.shift_id,
          status: app.status,
          submitted_at: app.created_at,
          hospital: app.shift.hospital.name,
          unit: app.shift.unit,
          date: new Date(app.shift.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          }),
          startTime: app.shift.start_time,
          endTime: app.shift.end_time,
          hourlyRate: parseFloat(app.shift.hourly_rate),
          specialNotes: app.notes,
          shiftLength: calculateShiftLength(app.shift.start_time, app.shift.end_time)
        }));
        
        setApplications(apiApplications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      Alert.alert(
        "Error",
        "Failed to load your applications. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Helper function to calculate shift length from start and end times
  const calculateShiftLength = (startTime: string, endTime: string) => {
    try {
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      let hours = endHour - startHour;
      let minutes = endMinute - startMinute;
      
      if (minutes < 0) {
        hours -= 1;
        minutes += 60;
      }
      
      if (hours < 0) {
        hours += 24; // Handle overnight shifts
      }
      
      return hours + (minutes / 60);
    } catch (error) {
      console.error('Error calculating shift length:', error);
      return 0;
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchApplications();
  };

  const handleViewShift = (shiftId: string) => {
    router.push(`/shift/${shiftId}`);
  };

  const handleWithdrawApplication = (applicationId: string, hospital: string) => {
    Alert.alert(
      "Withdraw Application",
      `Are you sure you want to withdraw your application to ${hospital}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Withdraw", 
          onPress: async () => {
            try {
              setLoading(true);
              // Call API to withdraw application
              await apiClient.post(`/applications/${applicationId}/withdraw`);
              
              // Update local state to reflect withdrawal
              setApplications(prev => 
                prev.map(app => 
                  app.id === applicationId 
                    ? {...app, status: 'withdrawn' as const} 
                    : app
                )
              );
              
              Alert.alert(
                "Success",
                "Your application has been withdrawn.",
                [{ text: "OK" }]
              );
            } catch (error) {
              console.error('Error withdrawing application:', error);
              Alert.alert(
                "Error",
                "Failed to withdraw your application. Please try again.",
                [{ text: "OK" }]
              );
            } finally {
              setLoading(false);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#F59E0B'; // Amber
      case 'approved':
        return '#10B981'; // Green
      case 'rejected':
        return '#EF4444'; // Red
      case 'withdrawn':
        return '#6B7280'; // Gray
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'approved':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      case 'withdrawn':
        return 'remove-circle';
      default:
        return 'help-circle';
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const calculateEarnings = (hourlyRate: number, shiftLength: number) => {
    return hourlyRate * shiftLength;
  };

  const filteredApplications = applications.filter(app => {
    if (selectedFilter === 'all') return true;
    return app.status === selectedFilter;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const renderApplicationItem = ({ item }: { item: Application }) => {
    const isPending = item.status === 'pending';
    const potential_earnings = calculateEarnings(item.hourlyRate, item.shiftLength);
    
    return (
      <View style={styles.applicationCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Ionicons name={getStatusIcon(item.status)} size={14} color="#FFFFFF" style={styles.statusIcon} />
            <Text style={styles.statusText}>{formatStatus(item.status)}</Text>
          </View>
          <Text style={styles.submittedDate}>
            Applied {formatDate(item.submitted_at)}
          </Text>
        </View>
        
        <Text style={styles.hospitalName}>{item.hospital}</Text>
        <Text style={styles.unitName}>{item.unit}</Text>
        
        <View style={styles.divider} />
        
        <View style={styles.detailsRow}>
          <View style={styles.detailsColumn}>
            <View style={styles.iconLabelContainer}>
              <Ionicons name="calendar-outline" size={16} color="#6B7280" style={styles.detailIcon} />
              <Text style={styles.detailLabel}>Date</Text>
            </View>
            <Text style={styles.detailValue}>{item.date}</Text>
          </View>
          <View style={styles.detailsColumn}>
            <View style={styles.iconLabelContainer}>
              <Ionicons name="time-outline" size={16} color="#6B7280" style={styles.detailIcon} />
              <Text style={styles.detailLabel}>Shift</Text>
            </View>
            <Text style={styles.detailValue}>{item.startTime} - {item.endTime}</Text>
          </View>
        </View>
        
        <View style={styles.detailsRow}>
          <View style={styles.detailsColumn}>
            <View style={styles.iconLabelContainer}>
              <Ionicons name="cash-outline" size={16} color="#6B7280" style={styles.detailIcon} />
              <Text style={styles.detailLabel}>Rate</Text>
            </View>
            <Text style={styles.rateValue}>${item.hourlyRate.toFixed(2)}/hr</Text>
          </View>
          <View style={styles.detailsColumn}>
            <View style={styles.iconLabelContainer}>
              <MaterialCommunityIcons name="cash-multiple" size={16} color="#6B7280" style={styles.detailIcon} />
              <Text style={styles.detailLabel}>Potential Earnings</Text>
            </View>
            <Text style={styles.rateValue}>${potential_earnings.toFixed(2)}</Text>
          </View>
        </View>
        
        {item.specialNotes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Your Notes:</Text>
            <Text style={styles.notesText}>{item.specialNotes}</Text>
          </View>
        )}
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.viewShiftButton}
            onPress={() => handleViewShift(item.shift_id)}
            accessibilityLabel={`View shift details for ${item.hospital} ${item.unit}`}
            accessibilityRole="button"
          >
            <Ionicons name="eye-outline" size={16} color="#0065FF" style={styles.buttonIcon} />
            <Text style={styles.viewShiftButtonText}>View Details</Text>
          </TouchableOpacity>
          
          {isPending && (
            <TouchableOpacity 
              style={styles.withdrawButton}
              onPress={() => handleWithdrawApplication(item.id, item.hospital)}
              accessibilityLabel={`Withdraw application for ${item.hospital} ${item.unit}`}
              accessibilityRole="button"
              accessibilityHint="Double tap to withdraw your application"
            >
              <Ionicons name="close-circle-outline" size={16} color="#EF4444" style={styles.buttonIcon} />
              <Text style={styles.withdrawButtonText}>Withdraw</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    if (selectedFilter !== 'all') {
      return (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="filter-outline" size={50} color="#D1D5DB" />
          <Text style={styles.emptyStateTitle}>No {formatStatus(selectedFilter)} Applications</Text>
          <Text style={styles.emptyStateText}>
            You don't have any applications with this status.
          </Text>
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => setSelectedFilter('all')}
            accessibilityLabel="View all applications"
            accessibilityRole="button"
          >
            <Text style={styles.viewAllButtonText}>View All Applications</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyStateContainer}>
        <Ionicons name="document-text-outline" size={60} color="#D1D5DB" />
        <Text style={styles.emptyStateTitle}>No Applications Yet</Text>
        <Text style={styles.emptyStateText}>
          You haven't applied to any shifts yet. Start browsing available shifts to apply.
        </Text>
        <TouchableOpacity 
          style={styles.findShiftsButton}
          onPress={() => router.push('/find-shifts')}
          accessibilityLabel="Find shifts to apply for"
          accessibilityRole="button"
        >
          <Ionicons name="search" size={16} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.findShiftsButtonText}>Find Shifts</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFilterTab = (label: string, value: string) => {
    const isActive = selectedFilter === value;
    
    return (
      <TouchableOpacity
        style={[styles.filterTab, isActive && styles.activeFilterTab]}
        onPress={() => setSelectedFilter(value)}
        accessibilityLabel={`Filter by ${label}`}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive }}
      >
        <Text style={[styles.filterTabText, isActive && styles.activeFilterTabText]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  // Count applications by status
  const counts = {
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    withdrawn: applications.filter(a => a.status === 'withdrawn').length,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen 
        options={{
          title: 'My Applications',
          headerBackTitle: 'Back',
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: '#F9FAFB',
          }
        }}
      />
      
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0065FF" />
            <Text style={styles.loadingText}>Loading your applications...</Text>
          </View>
        ) : (
          <>
            {applications.length > 0 && (
              <View style={styles.filtersContainer}>
                {renderFilterTab('All', 'all')}
                {renderFilterTab(`Pending (${counts.pending})`, 'pending')}
                {renderFilterTab(`Approved (${counts.approved})`, 'approved')}
                {renderFilterTab(`Rejected (${counts.rejected})`, 'rejected')}
                {renderFilterTab(`Withdrawn (${counts.withdrawn})`, 'withdrawn')}
              </View>
            )}
            
            <FlatList
              data={filteredApplications}
              renderItem={renderApplicationItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={renderEmptyState}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#0065FF']}
                  tintColor="#0065FF"
                />
              }
              ListHeaderComponent={
                applications.length > 0 ? (
                  <View style={styles.headerContainer}>
                    <Text style={styles.headerTitle}>Your Applications</Text>
                    <Text style={styles.headerText}>
                      Applications are typically reviewed within 24-48 hours.
                    </Text>
                  </View>
                ) : null
              }
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  headerText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterTab: {
    backgroundColor: '#EBF5FF',
  },
  filterTabText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: '#0065FF',
    fontWeight: '600',
  },
  applicationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusIcon: {
    marginRight: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  submittedDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  unitName: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailsColumn: {
    flex: 1,
  },
  iconLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailIcon: {
    marginRight: 6,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  rateValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#059669',
  },
  notesSection: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 6,
  },
  notesText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 4,
  },
  viewShiftButton: {
    flex: 1,
    backgroundColor: '#EBF5FF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginRight: 8,
  },
  viewShiftButtonText: {
    color: '#0065FF',
    fontSize: 15,
    fontWeight: '600',
  },
  withdrawButton: {
    flex: 1,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginLeft: 8,
  },
  withdrawButtonText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  findShiftsButton: {
    backgroundColor: '#0065FF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  findShiftsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  viewAllButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  viewAllButtonText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '600',
  },
});