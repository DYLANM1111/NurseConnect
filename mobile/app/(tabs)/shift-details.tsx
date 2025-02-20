// app/shift/[id].tsx
import { useState, useEffect } from 'react';
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
  Dimensions
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// Mock data
const MOCK_SHIFT = {
  id: '123',
  hospital: 'Stanford Medical Center',
  unit: 'Intensive Care Unit',
  date: '2025-02-14',
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
  facilityNotes: 'Pre-shift briefing at 6:45 AM in ICU Conference Room.'
};

export default function ShiftDetailsScreen() {
  const router = useRouter();
  const [clockInTime, setClockInTime] = useState<Date | null>(null);
  const [clockOutTime, setClockOutTime] = useState<Date | null>(null);
  const [activeTime, setActiveTime] = useState('00:00:00');
  const [totalHours, setTotalHours] = useState(0);
  const [earnings, setEarnings] = useState(0);

  // Timer for active shift
  useEffect(() => {
    let interval: NodeJS.Timer;
    if (clockInTime && !clockOutTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - clockInTime.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setActiveTime(
          `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [clockInTime, clockOutTime]);

  const handleClockIn = () => {
    Alert.alert(
      'Start Shift',
      'Are you ready to start your shift?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clock In',
          onPress: () => {
            setClockInTime(new Date());
            Alert.alert('Success', 'You have successfully clocked in.');
          }
        }
      ]
    );
  };

  const handleClockOut = () => {
    Alert.alert(
      'End Shift',
      'Are you sure you want to end your shift?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clock Out',
          onPress: () => {
            const endTime = new Date();
            setClockOutTime(endTime);
            if (clockInTime) {
              const hours = (endTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
              setTotalHours(Number(hours.toFixed(2)));
              setEarnings(Number((hours * MOCK_SHIFT.rate).toFixed(2)));
            }
            Alert.alert('Success', 'Your shift has been completed.');
          }
        }
      ]
    );
  };

  const openMaps = () => {
    const scheme = Platform.select({ ios: 'maps:', android: 'geo:' });
    const url = Platform.select({
      ios: `${scheme}${MOCK_SHIFT.coordinates.latitude},${MOCK_SHIFT.coordinates.longitude}?q=${MOCK_SHIFT.hospital}`,
      android: `${scheme}${MOCK_SHIFT.coordinates.latitude},${MOCK_SHIFT.coordinates.longitude}?q=${MOCK_SHIFT.hospital}`
    });
    Linking.openURL(url!);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shift Details</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Timer Module */}
      <View style={styles.timerModule}>
        <Text style={styles.timeDisplay}>{activeTime}</Text>
        <Text style={styles.dateDisplay}>{MOCK_SHIFT.date}</Text>
        
        {!clockInTime && !clockOutTime ? (
          <TouchableOpacity style={styles.clockInButton} onPress={handleClockIn}>
            <Text style={styles.buttonText}>Start Shift</Text>
          </TouchableOpacity>
        ) : clockInTime && !clockOutTime ? (
          <TouchableOpacity style={styles.clockOutButton} onPress={handleClockOut}>
            <Text style={styles.buttonText}>End Shift</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.completedButton}>
            <Text style={styles.buttonText}>Shift Completed</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.content}>
        {/* Facility Card */}
        <View style={styles.card}>
          <Text style={styles.hospitalName}>{MOCK_SHIFT.hospital}</Text>
          <View style={styles.unitTag}>
            <Text style={styles.unitText}>{MOCK_SHIFT.unit}</Text>
          </View>
          <Text style={styles.deptCode}>Department Code: {MOCK_SHIFT.departmentCode}</Text>
        </View>

        {/* Time Summary */}
        {clockInTime && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Time Summary</Text>
            <View style={styles.timeGrid}>
              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>Clock In</Text>
                <Text style={styles.timeValue}>
                  {clockInTime.toLocaleTimeString()}
                </Text>
              </View>
              {clockOutTime && (
                <>
                  <View style={styles.timeItem}>
                    <Text style={styles.timeLabel}>Clock Out</Text>
                    <Text style={styles.timeValue}>
                      {clockOutTime.toLocaleTimeString()}
                    </Text>
                  </View>
                  <View style={styles.summaryContainer}>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Total Hours</Text>
                      <Text style={styles.summaryValue}>{totalHours}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Earnings</Text>
                      <Text style={styles.earningsValue}>${earnings}</Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* Location Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Location</Text>
          <Text style={styles.address}>{MOCK_SHIFT.address}</Text>
          <TouchableOpacity style={styles.mapButton} onPress={openMaps}>
            <Text style={styles.mapButtonText}>Open in Maps →</Text>
          </TouchableOpacity>
        </View>

        {/* Requirements Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Requirements</Text>
          {MOCK_SHIFT.requirements.map((req, index) => (
            <View key={index} style={styles.requirementItem}>
              <View style={styles.bullet} />
              <Text style={styles.requirementText}>{req}</Text>
            </View>
          ))}
        </View>

        {/* Notes Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Facility Notes</Text>
          <Text style={styles.notes}>{MOCK_SHIFT.facilityNotes}</Text>
        </View>

        {/* Contact Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact Information</Text>
          <Text style={styles.contactName}>{MOCK_SHIFT.contactPerson}</Text>
          <TouchableOpacity 
            style={styles.phoneButton}
            onPress={() => Linking.openURL(`tel:${MOCK_SHIFT.contactPhone}`)}
          >
            <Text style={styles.phoneText}>{MOCK_SHIFT.contactPhone}</Text>
          </TouchableOpacity>
        </View>
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
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: '#E4E9F2',
    },
    backButton: {
      fontSize: 24,
      color: '#2E3A59',
      padding: 4,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#2E3A59',
    },
    placeholder: {
      width: 32,
    },
    timerModule: {
      backgroundColor: '#FFFFFF',
      padding: 24,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: '#E4E9F2',
    },
    timeDisplay: {
      fontSize: 48,
      fontWeight: '700',
      color: '#2E3A59',
      fontVariant: ['tabular-nums'],
    },
    dateDisplay: {
      fontSize: 16,
      color: '#8F9BB3',
      marginBottom: 24,
    },
    clockInButton: {
      backgroundColor: '#36B37E',
      width: width * 0.8,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    clockOutButton: {
      backgroundColor: '#FF5630',
      width: width * 0.8,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    completedButton: {
      backgroundColor: '#8F9BB3',
      width: width * 0.8,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600',
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
      shadowColor: '#1A1F33',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    },
    hospitalName: {
      fontSize: 22,
      fontWeight: '700',
      color: '#2E3A59',
      marginBottom: 8,
    },
    unitTag: {
      backgroundColor: '#E3F5FF',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
      alignSelf: 'flex-start',
      marginBottom: 8,
    },
    unitText: {
      color: '#0065FF',
      fontSize: 14,
      fontWeight: '500',
    },
    deptCode: {
      color: '#8F9BB3',
      fontSize: 14,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#2E3A59',
      marginBottom: 16,
    },
    timeGrid: {
      gap: 16,
    },
    timeItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    timeLabel: {
      fontSize: 16,
      color: '#8F9BB3',
    },
    timeValue: {
      fontSize: 16,
      color: '#2E3A59',
      fontWeight: '500',
    },
    summaryContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: '#E4E9F2',
    },
    summaryItem: {
      alignItems: 'center',
    },
    summaryLabel: {
      fontSize: 14,
      color: '#8F9BB3',
      marginBottom: 4,
    },
    summaryValue: {
      fontSize: 24,
      fontWeight: '700',
      color: '#2E3A59',
    },
    earningsValue: {
      fontSize: 24,
      fontWeight: '700',
      color: '#36B37E',
    },
    address: {
      fontSize: 16,
      color: '#2E3A59',
      marginBottom: 16,
    },
    mapButton: {
      backgroundColor: '#F0F4FF',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    mapButtonText: {
      color: '#0065FF',
      fontSize: 16,
      fontWeight: '500',
    },
    requirementItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    bullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#0065FF',
      marginRight: 12,
    },
    requirementText: {
      fontSize: 16,
      color: '#2E3A59',
      flex: 1,
    },
    notes: {
      fontSize: 16,
      color: '#2E3A59',
      lineHeight: 24,
    },
    contactName: {
      fontSize: 16,
      color: '#2E3A59',
      marginBottom: 12,
    },
    phoneButton: {
      backgroundColor: '#F0F4FF',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    phoneText: {
      color: '#0065FF',
      fontSize: 16,
      fontWeight: '500',
    },
  });