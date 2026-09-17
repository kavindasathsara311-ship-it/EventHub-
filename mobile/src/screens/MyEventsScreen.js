import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEventsFromFirestore, deleteEventInFirestore } from '../services/firebaseService';
import { AuthContext } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';

const MyEventsScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);

  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMyEvents = useCallback(async (isRefresh = false) => {
    const organizerId = user?.id || 'u1';
    if (!isRefresh) setLoading(true);

    try {
      const data = await getEventsFromFirestore('', 'All', organizerId);
      setMyEvents(data);
    } catch (error) {
      console.error('Error fetching organizer events from Firestore:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchMyEvents();
    });
    return unsubscribe;
  }, [navigation, fetchMyEvents]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyEvents(true);
  };

  const handleDeleteEvent = (eventId, eventName) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${eventName}"? All associated bookings will be cancelled.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEventInFirestore(eventId);
              Alert.alert('Success', 'Event deleted from Firestore successfully.');
              fetchMyEvents(true);
            } catch (error) {
              console.error('Error deleting event from Firestore:', error);
              Alert.alert('Error', error.message || 'Failed to delete event.');
            }
          },
        },
      ]
    );
  };


  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.title}>My Events</Text>
          <Text style={styles.subtitle}>Manage events you host and publish</Text>
        </View>

        <TouchableOpacity
          style={styles.addEventButton}
          onPress={() => navigation.navigate('CreateEditEvent')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addEventText}>New Event</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyComponent = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={48} color="#94A3B8" />
        <Text style={styles.emptyTitle}>No Events Created Yet</Text>
        <Text style={styles.emptyText}>
          You haven't posted any events. Tap "+ New Event" above to create your first event!
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading && !refreshing ? (
        <View style={styles.loadingWrapper}>
          {renderHeader()}
          <LoadingSpinner message="Fetching your events..." />
        </View>
      ) : (
        <FlatList
          data={myEvents}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={() => navigation.navigate('EventDetails', { eventId: item.id })}
              showOrganizerActions={true}
              onEdit={() =>
                navigation.navigate('CreateEditEvent', {
                  eventId: item.id,
                  eventData: item,
                })
              }
              onDelete={() => handleDeleteEvent(item.id, item.name)}
              onViewBookings={() =>
                navigation.navigate('EventBookings', {
                  eventId: item.id,
                  eventName: item.name,
                })
              }
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  },
  addEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  addEventText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
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

export default MyEventsScreen;
