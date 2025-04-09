import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Image,
  Platform,
  StatusBar
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authAPI } from '../api/client';

// Define notification types
type NotificationType = 
  | 'application_status'
  | 'new_shift'
  | 'shift_reminder'
  | 'earnings'
  | 'message'
  | 'system';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionable: boolean;
  actionText?: string;
  actionRoute?: string;
  actionParams?: Record<string, string>;
  relatedId?: string;
}

export default function NotificationsFeedScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = useCallback(async () => {
    try {
      // In a real app, you would fetch notifications from your API
      // For now, we'll use mock data
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock notifications data
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'application_status',
          title: 'Application Approved',
          message: 'Your application for ICU shift at Duke University Hospital has been approved.',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
          read: false,
          actionable: true,
          actionText: 'View Details',
          actionRoute: '/shift/',
          actionParams: { id: '101' },
          relatedId: '101'
        },
        {
          id: '2',
          type: 'new_shift',
          title: 'New ICU Shift Available',
          message: 'A new ICU shift matching your preferences is available at UNC Medical Center.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          read: false,
          actionable: true,
          actionText: 'View Shift',
          actionRoute: '/shift/',
          actionParams: { id: '102' },
          relatedId: '102'
        },
        {
          id: '3',
          type: 'shift_reminder',
          title: 'Upcoming Shift Tomorrow',
          message: 'Reminder: You have a shift at Wake Forest Baptist Medical Center tomorrow at 7:00 AM.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
          read: true,
          actionable: true,
          actionText: 'View Schedule',
          actionRoute: '/shifts',
          relatedId: '103'
        },
        {
          id: '4',
          type: 'earnings',
          title: 'Weekly Earnings Update',
          message: 'Your earnings for this week have been calculated. You earned $1,920 from 2 shifts.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // 1 day ago
          read: true,
          actionable: true,
          actionText: 'View Earnings',
          actionRoute: '/earnings',
          relatedId: null
        },
        {
          id: '5',
          type: 'message',
          title: 'Message from Stanford Medical Center',
          message: 'Thank you for your great work during last weeks shift. Wed like to offer you another opportunity.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
          read: true,
          actionable: true,
          actionText: 'Reply',
          actionRoute: '/messages/',
          actionParams: { id: '201' },
          relatedId: '201'
        },
        {
          id: '6',
          type: 'system',
          title: 'Profile Completion Reminder',
          message: 'Your profile is 80% complete. Add your certifications to maximize your chances of getting shifts.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
          read: true,
          actionable: true,
          actionText: 'Complete Profile',
          actionRoute: '/profile/edit',
          relatedId: null
        },
        {
          id: '7',
          type: 'application_status',
          title: 'Application Rejected',
          message: 'Your application for ER shift at Rex Hospital was not approved. The shift has been filled.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(), // 6 days ago
          read: true,
          actionable: false,
          relatedId: '104'
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read when pressed
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    
    // Navigate to related screen if actionable
    if (notification.actionable && notification.actionRoute) {
      const route = notification.actionRoute + (notification.relatedId || '');
      router.push(route as any);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (selectedFilter === 'all') return true;
    return !notification.read;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  // Format a timestamp in a human-readable format
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) {
      return 'Just now';
    } else if (diffMin < 60) {
      return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDay === 1) {
      return 'Yesterday';
    } else if (diffDay < 7) {
      return `${diffDay} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  // Get icon based on notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'application_status':
        return 'document-text-outline';
      case 'new_shift':
        return 'briefcase-outline';
      case 'shift_reminder':
        return 'alarm-outline';
      case 'earnings':
        return 'cash-outline';
      case 'message':
        return 'chatbubble-outline';
      case 'system':
        return 'information-circle-outline';
      default:
        return 'notifications-outline';
    }
  };

  // Get icon background color based on notification type
  const getIconBackground = (type: NotificationType) => {
    switch (type) {
      case 'application_status':
        return '#EBF5FF'; // Light blue
      case 'new_shift':
        return '#ECFDF5'; // Light green
      case 'shift_reminder':
        return '#FEF3C7'; // Light amber
      case 'earnings':
        return '#E0F2FE'; // Light sky blue
      case 'message':
        return '#F3E8FF'; // Light purple
      case 'system':
        return '#F3F4F6'; // Light gray
      default:
        return '#F3F4F6';
    }
  };

  // Get icon color based on notification type
  const getIconColor = (type: NotificationType) => {
    switch (type) {
      case 'application_status':
        return '#0284C7'; // Blue
      case 'new_shift':
        return '#059669'; // Green
      case 'shift_reminder':
        return '#D97706'; // Amber
      case 'earnings':
        return '#0369A1'; // Sky blue
      case 'message':
        return '#7E22CE'; // Purple
      case 'system':
        return '#6B7280'; // Gray
      default:
        return '#6B7280';
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadItem]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
      accessibilityLabel={`${item.read ? 'Read' : 'Unread'} notification: ${item.title}`}
      accessibilityHint={item.actionable ? `Tap to ${item.actionText?.toLowerCase() || 'view'}` : ''}
      accessibilityRole="button"
    >
      <View style={[
        styles.iconContainer, 
        { backgroundColor: getIconBackground(item.type) }
      ]}>
        <Ionicons 
          name={getNotificationIcon(item.type)} 
          size={22} 
          color={getIconColor(item.type)} 
        />
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
        </View>
        
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>
        
        {item.actionable && (
          <View style={styles.actionContainer}>
            <Text style={styles.actionText}>{item.actionText}</Text>
            <Ionicons name="chevron-forward" size={16} color="#0284C7" />
          </View>
        )}
      </View>
      
      {!item.read && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={60} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>
        {selectedFilter === 'all' ? 'No Notifications Yet' : 'No Unread Notifications'}
      </Text>
      <Text style={styles.emptyText}>
        {selectedFilter === 'all' 
          ? 'New notifications will appear here when you receive them.'
          : 'You\'ve read all your notifications. Check back later for new ones.'}
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.listHeaderTop}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.length > 0 && unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllReadButton}
            onPress={handleMarkAllAsRead}
            accessibilityLabel="Mark all as read"
            accessibilityRole="button"
          >
            <Text style={styles.markAllReadText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {notifications.length > 0 && (
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'all' && styles.activeFilterButton
            ]}
            onPress={() => setSelectedFilter('all')}
            accessibilityLabel="Show all notifications"
            accessibilityRole="button"
            accessibilityState={{ selected: selectedFilter === 'all' }}
          >
            <Text style={[
              styles.filterButtonText,
              selectedFilter === 'all' && styles.activeFilterText
            ]}>
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedFilter === 'unread' && styles.activeFilterButton
            ]}
            onPress={() => setSelectedFilter('unread')}
            accessibilityLabel="Show unread notifications only"
            accessibilityRole="button"
            accessibilityState={{ selected: selectedFilter === 'unread' }}
          >
            <Text style={[
              styles.filterButtonText,
              selectedFilter === 'unread' && styles.activeFilterText
            ]}>
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284C7" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: false
        }}
      />
      
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0284C7']}
            tintColor="#0284C7"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  listHeader: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  listHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  markAllReadButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  markAllReadText: {
    fontSize: 14,
    color: '#0284C7',
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
  },
  activeFilterButton: {
    backgroundColor: '#E0F2FE',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#0284C7',
    fontWeight: '600',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  unreadItem: {
    backgroundColor: '#F9FAFB',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0284C7',
    marginRight: 4,
  },
  unreadIndicator: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0284C7',
    top: 16,
    right: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});