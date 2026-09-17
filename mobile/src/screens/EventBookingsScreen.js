import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEventBookingsFromFirestore } from '../services/firebaseService';
import LoadingSpinner from '../components/LoadingSpinner';

const EventBookingsScreen = ({ route }) => {
  const { eventId, eventName } = route.params;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEventBookings = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);

    try {
      const data = await getEventBookingsFromFirestore(eventId);
      setBookings(data);
    } catch (error) {
      console.error('Error fetching event bookings from Firestore:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEventBookings();
  }, [fetchEventBookings]);


  const onRefresh = () => {
    setRefreshing(true);
    fetchEventBookings(true);
  };

  const activeBookings = bookings.filter((b) => b.status === 'confirmed');
  const totalSeatsBooked = activeBookings.reduce((sum, b) => sum + (b.seats || 0), 0);
  const totalRevenue = activeBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.eventTitle} numberOfLines={2}>
        {eventName}
      </Text>
      <Text style={styles.subtitle}>Attendee Bookings & Revenue Overview</Text>

      {/* Stats Summary Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="people" size={20} color="#6366F1" />
          <Text style={styles.statValue}>{totalSeatsBooked}</Text>
          <Text style={styles.statLabel}>Seats Booked</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="receipt" size={20} color="#059669" />
          <Text style={styles.statValue}>{activeBookings.length}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="wallet" size={20} color="#D97706" />
          <Text style={styles.statValue}>${totalRevenue}</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
      </View>
    </View>
  );

  const renderBookingItem = ({ item }) => {
    const isConfirmed = item.status === 'confirmed';

    return (
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <View style={styles.attendeeAvatar}>
            <Text style={styles.avatarText}>
              {item.attendeeName ? item.attendeeName.charAt(0).toUpperCase() : 'A'}
            </Text>
          </View>

          <View style={styles.attendeeInfo}>
            <Text style={styles.attendeeName}>{item.attendeeName}</Text>
            <Text style={styles.attendeeEmail}>{item.attendeeEmail}</Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              isConfirmed ? styles.statusConfirmed : styles.statusCancelled,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isConfirmed ? styles.statusTextConfirmed : styles.statusTextCancelled,
              ]}
            >
              {isConfirmed ? 'Confirmed' : 'Cancelled'}
            </Text>
          </View>
        </View>

        <View style={styles.itemFooter}>
          <View style={styles.footerDetail}>
            <Text style={styles.footerLabel}>Seats</Text>
            <Text style={styles.footerValue}>{item.seats} ticket(s)</Text>
          </View>

          <View style={styles.footerDetail}>
            <Text style={styles.footerLabel}>Total Paid</Text>
            <Text style={styles.footerPrice}>${item.totalPrice}</Text>
          </View>

          <View style={styles.footerDetailRight}>
            <Text style={styles.footerLabel}>Booked Date</Text>
            <Text style={styles.footerValue}>
              {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={48} color="#94A3B8" />
        <Text style={styles.emptyTitle}>No Bookings Yet</Text>
        <Text style={styles.emptyText}>
          No attendee bookings have been made for this event.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading && !refreshing ? (
        <View style={styles.loadingWrapper}>
          {renderHeader()}
          <LoadingSpinner message="Fetching event bookings..." />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          renderItem={renderBookingItem}
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
    padding: 16,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statCard: {
    flex: 0.31,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  listContent: {
    paddingBottom: 24,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendeeAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6366F1',
  },
  attendeeInfo: {
    flex: 1,
  },
  attendeeName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  attendeeEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusConfirmed: {
    backgroundColor: '#DCFCE7',
  },
  statusCancelled: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextConfirmed: {
    color: '#15803D',
  },
  statusTextCancelled: {
    color: '#B91C1C',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  footerDetail: {
    flex: 1,
  },
  footerDetailRight: {
    alignItems: 'flex-end',
  },
  footerLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  footerValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginTop: 2,
  },
  footerPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6366F1',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 20,
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
  },
});

export default EventBookingsScreen;
