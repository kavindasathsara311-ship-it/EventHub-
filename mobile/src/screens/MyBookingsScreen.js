import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  RefreshControl,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getUserBookingsFromFirestore, cancelBookingInFirestore } from '../services/firebaseService';
import { AuthContext } from '../context/AuthContext';
import BookingCard from '../components/BookingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { sendCancellationNotification } from '../utils/notifications';

const MyBookingsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchUserBookings = useCallback(async (isRefresh = false) => {
    const userId = user?.id || 'u1';
    if (!isRefresh) setLoading(true);

    try {
      const data = await getUserBookingsFromFirestore(userId);
      setBookings(data);
    } catch (error) {
      console.error('Error fetching user bookings from Firestore:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserBookings();
    });
    return unsubscribe;
  }, [navigation, fetchUserBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserBookings(true);
  };

  const handleCancelBooking = (booking) => {
    const eventName = booking.event?.name || 'this event';
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel your booking for "${eventName}"? Your seats will be released.`,
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelBookingInFirestore(booking.id);

              // Send cancellation notification
              await sendCancellationNotification(eventName);

              Alert.alert('Booking Cancelled', 'Your booking was cancelled in Firestore.');
              fetchUserBookings(true);
            } catch (error) {
              console.error('Error cancelling booking in Firestore:', error);
              Alert.alert('Error', error.message || 'Failed to cancel booking.');
            }
          },
        },
      ]
    );
  };


  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'All') return true;
    return b.status === statusFilter.toLowerCase();
  });

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>My Bookings</Text>
      <Text style={styles.subtitle}>Track and manage your event tickets</Text>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {['All', 'Confirmed', 'Cancelled'].map((status) => {
          const isActive = statusFilter === status;
          return (
            <TouchableOpacity
              key={status}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setStatusFilter(status)}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {status}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderEmptyComponent = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={48} color="#94A3B8" />
        <Text style={styles.emptyTitle}>No Bookings Found</Text>
        <Text style={styles.emptyText}>
          {statusFilter === 'All'
            ? "You haven't booked any events yet. Explore upcoming events and book your tickets!"
            : `You have no ${statusFilter.toLowerCase()} bookings.`}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading && !refreshing ? (
        <View style={styles.loadingWrapper}>
          {renderHeader()}
          <LoadingSpinner message="Loading your tickets..." />
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <BookingCard
              booking={item}
              onCancel={() => handleCancelBooking(item)}
            />
          )}
          ListEmptyComponent={renderEmptyComponent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6366F1']}
              tintColor="#6366F1"
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingWrapper: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#6366F1',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});

export default MyBookingsScreen;
