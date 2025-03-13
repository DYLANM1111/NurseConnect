// app/shift/[id].tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Linking,
  Platform,
  Dimensions,
  ActivityIndicator,
  Modal
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { shiftsAPI } from '../../api/client';

const { width } = Dimensions.get('window');

// Types
type ShiftDetails = {
  id: string;
  hospital: string;
  unit: string;
  date: string;
  startTime: string;
  endTime: string;
  rate: number;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  requirements: string[];
  contactPerson: string;
  contactPhone: string;
  departmentCode: string;
  facilityNotes: string;
  shiftLength: number;
  breakDuration: number; // in minutes
};

// Time tracking types
type TimeLog = {
  id: string;
  type: 'clock-in' | 'clock-out' | 'break-start' | 'break-end' | 'lunch-start' | 'lunch-end';
  timestamp: Date;
  notes?: string;
};

export default function ShiftDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const shiftId = typeof params.id === 'string' ? params.id : '';
  
  // State
  const [shift, setShift] = useState<ShiftDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [activeTime, setActiveTime] = useState('00:00:00');
  const [totalWorkTime, setTotalWorkTime] = useState(0); // in milliseconds
  const [totalBreakTime, setTotalBreakTime] = useState(0); // in milliseconds
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [isOnLunch, setIsOnLunch] = useState(false);
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [breakStartTime, setBreakStartTime] = useState<Date | null>(null);
  const [earnings, setEarnings] = useState(0);
  const timerRef = useRef<NodeJS.Timer | null>(null);
  const [shiftEnded, setShiftEnded] = useState(false);

  // Fetch shift details
  useEffect(() => {
    const fetchShiftDetails = async () => {
      try {
        setLoading(true);
        console.log('Fetching shift details for ID:', shiftId);
        
        // For now, load the mock data
        // In production, you would uncomment the line below
        // const data = await shiftsAPI.getShiftDetails(shiftId);
        
        // Mock data for development
        const mockShift: ShiftDetails = {
          id: shiftId || '123',
          hospital: 'Stanford Medical Center',
          unit: 'Intensive Care Unit',
          date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          startTime: '07:00',
          endTime: '19:00',
          rate: 95.50,
          address: '300 Pasteur Drive, Stanford, CA 94305',
          coordinates: {
            latitude: 37.4337,
            longitude: -122.1751
          },
          requirements: [
            'Active RN License',
            'BLS/ACLS Certification',
            'Minimum 2 years ICU Experience',
            'Epic Systems Proficiency'
          ],
          contactPerson: 'Dr. Sarah Johnson, RN, MSN',
          contactPhone: '(650) 555-0123',
          departmentCode: 'ICU-47A',
          facilityNotes: 'Pre-shift briefing at 6:45 AM in ICU Conference Room. Please arrive 15 minutes early for handoff procedures.',
          shiftLength: 12, // hours
          breakDuration: 30 // minutes
        };
        
        setShift(mockShift);
        setError(null);
      } catch (err) {
        console.error('Error fetching shift details:', err);
        setError('Unable to load shift details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchShiftDetails();
  }, [shiftId]);

  // Timer for active shift
  useEffect(() => {
    if (timeLogs.length === 0) return;
    
    // Check if shift is active
    const isClockIn = timeLogs.some(log => log.type === 'clock-in');
    const isClockOut = timeLogs.some(log => log.type === 'clock-out');
    
    if (isClockIn && !isClockOut) {
      // Start timer
      timerRef.current = setInterval(() => {
        updateTimers();
      }, 1000);
    } else if (isClockOut) {
      // Final calculation when clocked out
      updateTimers();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeLogs, isOnBreak, isOnLunch]);

  // Update all timers
  const updateTimers = () => {
    const now = new Date();
    let workMs = 0;
    let breakMs = 0;
    
    // Create pairs of events (clock-in/out, break-start/end, etc.)
    for (let i = 0; i < timeLogs.length; i++) {
      const log = timeLogs[i];
      
      if (log.type === 'clock-in') {
        // Find next clock-out or current time
        let endTime = now;
        const clockOutLog = timeLogs.find((l, idx) => idx > i && l.type === 'clock-out');
        if (clockOutLog) {
          endTime = clockOutLog.timestamp;
        }
        
        // Add to work time, excluding breaks
        const timeSpan = endTime.getTime() - log.timestamp.getTime();
        workMs += timeSpan;
      }
      
      // Track break time
      if (log.type === 'break-start' || log.type === 'lunch-start') {
        // Find corresponding end or current time
        let endTime = now;
        const endType = log.type === 'break-start' ? 'break-end' : 'lunch-end';
        const endLog = timeLogs.find((l, idx) => idx > i && l.type === endType);
        
        if (endLog) {
          endTime = endLog.timestamp;
        } else if ((log.type === 'break-start' && isOnBreak) || 
                  (log.type === 'lunch-start' && isOnLunch)) {
          // Still on break
          breakMs += now.getTime() - log.timestamp.getTime();
          continue;
        }
        
        breakMs += endTime.getTime() - log.timestamp.getTime();
      }
    }
    
    // Subtract breaks from work time
    const netWorkMs = workMs - breakMs;
    
    // Format for display
    setTotalWorkTime(netWorkMs);
    setTotalBreakTime(breakMs);
    
    // Format active time display
    if (netWorkMs > 0) {
      const hours = Math.floor(netWorkMs / (1000 * 60 * 60));
      const minutes = Math.floor((netWorkMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((netWorkMs % (1000 * 60)) / 1000);
      
      setActiveTime(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
      
      // Calculate earnings (only count active work time)
      if (shift) {
        const hours = netWorkMs / (1000 * 60 * 60);
        setEarnings(Number((hours * shift.rate).toFixed(2)));
      }
    }
  };

  // Handle clock in
  const handleClockIn = () => {
    Alert.alert(
      'Start Shift',
      'Are you ready to start your shift?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clock In',
          onPress: () => {
            const newLog: TimeLog = {
              id: Date.now().toString(),
              type: 'clock-in',
              timestamp: new Date()
            };
            setTimeLogs([...timeLogs, newLog]);
            Alert.alert('Success', 'You have successfully clocked in.');
          }
        }
      ]
    );
  };

  // Handle clock out
  const handleClockOut = () => {
    // Check if on break first
    if (isOnBreak || isOnLunch) {
      Alert.alert(
        'Still on Break',
        'Please end your break before clocking out.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    Alert.alert(
      'End Shift',
      'Are you sure you want to end your shift?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clock Out',
          onPress: () => {
            const newLog: TimeLog = {
              id: Date.now().toString(),
              type: 'clock-out',
              timestamp: new Date()
            };
            setTimeLogs([...timeLogs, newLog]);
            setShiftEnded(true);
            Alert.alert('Success', 'Your shift has been completed. Thank you for your work!');
          }
        }
      ]
    );
  };

  // Handle break start/end
  const handleBreak = (breakType: 'break' | 'lunch') => {
    if ((breakType === 'break' && isOnBreak) || (breakType === 'lunch' && isOnLunch)) {
      // Ending break
      const newLog: TimeLog = {
        id: Date.now().toString(),
        type: breakType === 'break' ? 'break-end' : 'lunch-end',
        timestamp: new Date()
      };
      setTimeLogs([...timeLogs, newLog]);
      
      if (breakType === 'break') {
        setIsOnBreak(false);
      } else {
        setIsOnLunch(false);
      }
      
      Alert.alert('Break Ended', `Your ${breakType} has been recorded.`);
    } else {
      // Starting break
      setShowBreakModal(true);
      setBreakStartTime(new Date());
      
      // Create break log
      const newLog: TimeLog = {
        id: Date.now().toString(),
        type: breakType === 'break' ? 'break-start' : 'lunch-start',
        timestamp: new Date()
      };
      setTimeLogs([...timeLogs, newLog]);
      
      if (breakType === 'break') {
        setIsOnBreak(true);
      } else {
        setIsOnLunch(true);
      }
    }
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format duration
  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Open maps
  const openMaps = () => {
    if (!shift) return;
    
    const scheme = Platform.select({ ios: 'maps:', android: 'geo:' });
    const url = Platform.select({
      ios: `${scheme}${shift.coordinates.latitude},${shift.coordinates.longitude}?q=${encodeURIComponent(shift.hospital)}`,
      android: `${scheme}${shift.coordinates.latitude},${shift.coordinates.longitude}?q=${encodeURIComponent(shift.hospital)}`
    });
    
    if (url) Linking.openURL(url);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading shift details...</Text>
      </SafeAreaView>
    );
  }

  if (error || !shift) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#FF3B30" />
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{error || 'Shift not found'}</Text>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.back()}
        >
          <Text style={styles.actionButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isClockIn = timeLogs.some(log => log.type === 'clock-in');
  const isClockOut = timeLogs.some(log => log.type === 'clock-out');

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerTitle: "Shift Details",
          headerBackTitle: "Back"
        }}
      />
      
      {/* Timer Module */}
      <View style={styles.timerModule}>
        <Text style={styles.hospitalBadge}>{shift.hospital}</Text>
        <Text style={styles.timeDisplay}>{activeTime}</Text>
        <Text style={styles.dateDisplay}>{shift.date}</Text>
        
        <View style={styles.timeDetails}>
          <View style={styles.timeDetail}>
            <Text style={styles.timeDetailLabel}>Start</Text>
            <Text style={styles.timeDetailValue}>{shift.startTime}</Text>
          </View>
          
          <View style={styles.timeDetailDivider} />
          
          <View style={styles.timeDetail}>
            <Text style={styles.timeDetailLabel}>End</Text>
            <Text style={styles.timeDetailValue}>{shift.endTime}</Text>
          </View>
          
          <View style={styles.timeDetailDivider} />
          
          <View style={styles.timeDetail}>
            <Text style={styles.timeDetailLabel}>Rate</Text>
            <Text style={[styles.timeDetailValue, styles.rateValue]}>${shift.rate}/hr</Text>
          </View>
        </View>
      </View>
      
      {/* Action Buttons */}
      <View style={styles.actionButtonContainer}>
        {!isClockIn && !isClockOut ? (
          <TouchableOpacity 
            style={[styles.primaryButton, styles.clockInButton]}
            onPress={handleClockIn}
          >
            <Ionicons name="play-circle-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Start Shift</Text>
          </TouchableOpacity>
        ) : isClockIn && !isClockOut ? (
          <View style={styles.buttonsRow}>
            <TouchableOpacity 
              style={[styles.secondaryButton, isOnBreak || isOnLunch ? styles.activeBreakButton : {}]}
              onPress={() => handleBreak(isOnLunch ? 'lunch' : 'break')}
              disabled={isOnBreak && isOnLunch}
            >
              <Ionicons 
                name={isOnBreak || isOnLunch ? "cafe" : "cafe-outline"} 
                size={20} 
                color={isOnBreak || isOnLunch ? "#FFFFFF" : "#007AFF"} 
                style={styles.buttonIcon} 
              />
              <Text style={[styles.secondaryButtonText, isOnBreak || isOnLunch ? styles.activeButtonText : {}]}>
                {isOnBreak ? 'End Break' : isOnLunch ? 'End Lunch' : 'Take Break'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.primaryButton, styles.clockOutButton]}
              onPress={handleClockOut}
            >
              <Ionicons name="stop-circle-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>End Shift</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.primaryButton, styles.completedButton]}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Shift Completed</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.content}>
        {/* Time logs display */}
        {timeLogs.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Time Summary</Text>
              {isClockOut && (
                <View style={styles.earningsBadge}>
                  <Text style={styles.earningsBadgeText}>${earnings.toFixed(2)}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.timeLogsList}>
              {timeLogs.map((log, index) => (
                <View key={log.id} style={styles.timeLogItem}>
                  <View style={styles.timeLogIconContainer}>
                    <Ionicons 
                      name={
                        log.type === 'clock-in' ? 'play-circle' :
                        log.type === 'clock-out' ? 'stop-circle' :
                        log.type === 'break-start' || log.type === 'lunch-start' ? 'cafe' :
                        'checkmark-circle'
                      } 
                      size={24} 
                      color={
                        log.type === 'clock-in' ? '#34C759' :
                        log.type === 'clock-out' ? '#FF3B30' :
                        log.type === 'break-start' || log.type === 'lunch-start' ? '#FF9500' :
                        log.type === 'break-end' || log.type === 'lunch-end' ? '#5AC8FA' :
                        '#8E8E93'
                      } 
                    />
                    {index < timeLogs.length - 1 && <View style={styles.timeLogLine} />}
                  </View>
                  
                  <View style={styles.timeLogContent}>
                    <Text style={styles.timeLogTitle}>
                      {log.type === 'clock-in' ? 'Clock In' :
                       log.type === 'clock-out' ? 'Clock Out' :
                       log.type === 'break-start' ? 'Break Started' :
                       log.type === 'break-end' ? 'Break Ended' :
                       log.type === 'lunch-start' ? 'Lunch Started' :
                       'Lunch Ended'}
                    </Text>
                    <Text style={styles.timeLogTime}>{formatTime(log.timestamp)}</Text>
                  </View>
                </View>
              ))}
              
              {isClockOut && (
                <View style={styles.summaryContainer}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Work Time</Text>
                    <Text style={styles.summaryValue}>{formatDuration(totalWorkTime)}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Break Time</Text>
                    <Text style={styles.summaryValue}>{formatDuration(totalBreakTime)}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
        
        {/* Facility Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Facility Details</Text>
          
          <View style={styles.detailRow}>
            <Ionicons name="business-outline" size={20} color="#8E8E93" style={styles.detailIcon} />
            <View style={styles.detailContent}>
              <Text style={styles.detailTitle}>{shift.hospital}</Text>
              <View style={styles.unitTag}>
                <Text style={styles.unitText}>{shift.unit}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="keypad-outline" size={20} color="#8E8E93" style={styles.detailIcon} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Department Code</Text>
              <Text style={styles.detailValue}>{shift.departmentCode}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={20} color="#8E8E93" style={styles.detailIcon} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Address</Text>
              <Text style={styles.detailValue}>{shift.address}</Text>
              <TouchableOpacity 
                style={styles.mapButton}
                onPress={openMaps}
              >
                <Text style={styles.mapButtonText}>Open in Maps</Text>
                <Ionicons name="open-outline" size={16} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Requirements Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Requirements</Text>
          
          {shift.requirements.map((req, index) => (
            <View key={index} style={styles.requirementItem}>
              <Ionicons name="checkmark-circle" size={20} color="#34C759" style={styles.requirementIcon} />
              <Text style={styles.requirementText}>{req}</Text>
            </View>
          ))}
        </View>
        
        {/* Notes Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Facility Notes</Text>
          <Text style={styles.notesText}>{shift.facilityNotes}</Text>
        </View>
        
        {/* Contact Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact Information</Text>
          
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={20} color="#8E8E93" style={styles.detailIcon} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Contact Person</Text>
              <Text style={styles.detailValue}>{shift.contactPerson}</Text>
            </View>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={20} color="#8E8E93" style={styles.detailIcon} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Phone</Text>
              <TouchableOpacity
                onPress={() => Linking.openURL(`tel:${shift.contactPhone}`)}
              >
                <Text style={styles.phoneText}>{shift.contactPhone}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Break Modal */}
      <Modal
        visible={showBreakModal && (isOnBreak || isOnLunch)}
        transparent
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <BlurView intensity={50} style={styles.modalBlur}>
            <View style={styles.breakModalContent}>
              <View style={styles.breakModalHeader}>
                <Ionicons name="cafe" size={36} color="#FF9500" />
                <Text style={styles.breakModalTitle}>{isOnLunch ? 'Lunch Break' : 'Break'} in Progress</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.endBreakButton}
                onPress={() => handleBreak(isOnLunch ? 'lunch' : 'break')}
              >
                <Text style={styles.endBreakButtonText}>End {isOnLunch ? 'Lunch' : 'Break'}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.minimizeButton}
                onPress={() => setShowBreakModal(false)}
              >
                <Text style={styles.minimizeButtonText}>Minimize</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>
      
      {/* Break indicator */}
      {(isOnBreak || isOnLunch) && !showBreakModal && (
        <TouchableOpacity 
          style={styles.breakIndicator}
          onPress={() => setShowBreakModal(true)}
        >
          <Ionicons name="cafe" size={20} color="#FFFFFF" />
          <Text style={styles.breakIndicatorText}>{isOnLunch ? 'Lunch' : 'Break'} in progress</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F2F2F7',
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  timerModule: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  hospitalBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  timeDisplay: {
    fontSize: 48,
    fontWeight: '700',
    color: '#000000',
    fontVariant: ['tabular-nums'],
    marginBottom: 8,
  },
  dateDisplay: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 20,
  },
  timeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 12,
  },
  timeDetail: {
    alignItems: 'center',
    flex: 1,
  },
  timeDetailLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  timeDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  rateValue: {
    color: '#34C759',
  },
  timeDetailDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#E5E5EA',
  },
  actionButtonContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
  },
  clockInButton: {
    backgroundColor: '#34C759',
  },
  clockOutButton: {
    backgroundColor: '#FF3B30',
    flex: 1,
  },
  completedButton: {
    backgroundColor: '#8E8E93',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: 'transparent',
    marginRight: 12,
    flex: 1,
  },
  activeBreakButton: {
    backgroundColor: '#FF9500',
    borderColor: '#FF9500',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  activeButtonText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  earningsBadge: {
    backgroundColor: '#E9FBF0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  earningsBadgeText: {
    color: '#34C759',
    fontWeight: '600',
    fontSize: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  detailContent: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#000000',
  },
  unitTag: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  unitText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  mapButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  requirementIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  requirementText: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
  notesText: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
  },
  phoneText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  timeLogsList: {
    marginTop: 8,
  },
  timeLogItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeLogIconContainer: {
    alignItems: 'center',
    width: 40,
  },
  timeLogLine: {
    position: 'absolute',
    width: 2,
    backgroundColor: '#E5E5EA',
    top: 26,
    bottom: -16,
    left: 19,
  },
  timeLogContent: {
    flex: 1,
    paddingLeft: 8,
  },
  timeLogTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  timeLogTime: {
    fontSize: 14,
    color: '#8E8E93',
  },
  summaryContainer: {
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  breakModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: width * 0.85,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  breakModalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  breakModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 12,
  },
  endBreakButton: {
    backgroundColor: '#FF9500',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  endBreakButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  minimizeButton: {
    paddingVertical: 10,
  },
  minimizeButtonText: {
    color: '#8E8E93',
    fontSize: 16,
  },
  breakIndicator: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: '#FF9500',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  breakIndicatorText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});