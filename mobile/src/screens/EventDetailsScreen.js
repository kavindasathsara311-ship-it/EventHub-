import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEventByIdFromFirestore, deleteEventInFirestore } from '../services/firebaseService';
import { AuthContext } from '../context/AuthContext';
import { FavoritesContext } from '../context/FavoritesContext';
import LoadingSpinner from '../components/LoadingSpinner';

const EventDetailsScreen = ({ route, navigation }) => {
  const { eventId, initialEvent } = route.params || {};
  const { user } = useContext(AuthContext);
  const { isFavorite, toggleFavorite } = useContext(FavoritesContext);

  const [event, setEvent] = useState(initialEvent || null);
  const [loading, setLoading] = useState(!initialEvent);
  const [deleting, setDeleting] = useState(false);

  const fetchEventDetails = useCallback(async () => {
    if (!initialEvent) setLoading(true);
    try {
      const data = await getEventByIdFromFirestore(eventId);
      setEvent(data);
    } catch (error) {
      console.log('Error fetching event details from Firestore:', error.message);
    } finally {
      setLoading(false);
    }
  }, [eventId, initialEvent]);

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

  const handleDeleteEvent = () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event? All associated bookings will be cancelled.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteEventInFirestore(eventId);
              Alert.alert('Success', 'Event deleted from Firestore successfully.');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting event:', error);
              Alert.alert('Error', error.message || 'Failed to delete event from Firestore.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };


  if (loading || !event) {
    return <LoadingSpinner message="Loading event details..." />;
  }

  const isFav = isFavorite(event.id);
  const isOrganizer = user && (user.role === 'organizer' || user.id === event.organizerId);
  const isSoldOut = event.availableSeats <= 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Hero Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: event.image }} style={styles.image} resizeMode="cover" />

          {/* Top Bar Overlay */}
          <View style={styles.topBarOverlay}>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={20} color="#0F172A" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => toggleFavorite(event.id)}
            >
              <Ionicons
                name={isFav ? 'heart' : 'heart-outline'}
                size={22}
                color={isFav ? '#EF4444' : '#0F172A'}
              />
            </TouchableOpacity>
          </View>

          {/* Category Chip Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{event.category}</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{event.name}</Text>

          {/* Key Quick Info Row */}
          <View style={styles.infoCardContainer}>
            <View style={styles.infoItem}>
              <View style={styles.infoIconWrapper}>
                <Ionicons name="calendar" size={20} color="#6366F1" />
              </View>
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>Date & Time</Text>
                <Text style={styles.infoValue}>{event.date}</Text>
                <Text style={styles.infoSubValue}>{event.time}</Text>
              </View>
            </View>

            <View style={styles.infoDivider} />

            <View style={styles.infoItem}>
              <View style={styles.infoIconWrapper}>
                <Ionicons name="location" size={20} color="#6366F1" />
              </View>
              <View style={styles.infoTextWrapper}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue} numberOfLines={2}>
                  {event.location}
                </Text>
              </View>
            </View>
          </View>

          {/* Capacity Stats */}
          <View style={styles.capacityRow}>
            <View style={styles.capacityStat}>
              <Text style={styles.statLabel}>Ticket Price</Text>
              <Text style={styles.priceText}>
                {event.price > 0 ? `$${event.price}` : 'Free'}
              </Text>
            </View>

            <View style={styles.capacityStat}>
              <Text style={styles.statLabel}>Available Seats</Text>
              <Text
                style={[
                  styles.seatsText,
                  isSoldOut ? styles.seatsTextSoldOut : null,
                ]}
              >
                {event.availableSeats} / {event.totalSeats}
              </Text>
            </View>
          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Event</Text>
            <Text style={styles.descriptionText}>
              {event.description || 'No description provided for this event.'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        {isOrganizer ? (
          <View style={styles.organizerButtonBar}>
            <TouchableOpacity
              style={[styles.organizerBtn, styles.viewBookingsBtn]}
              onPress={() =>
                navigation.navigate('EventBookings', {
                  eventId: event.id,
                  eventName: event.name,
                })
              }
            >
              <Ionicons name="receipt-outline" size={18} color="#4338CA" />
              <Text style={styles.viewBookingsBtnText}>Bookings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.organizerBtn, styles.editBtn]}
              onPress={() =>
                navigation.navigate('CreateEditEvent', {
                  eventId: event.id,
                  eventData: event,
                })
              }
            >
              <Ionicons name="create-outline" size={18} color="#2563EB" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.organizerBtn, styles.deleteBtn]}
              onPress={handleDeleteEvent}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#DC2626" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={18} color="#DC2626" />
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.userButtonBar}>
            <View style={styles.bottomPriceContainer}>
              <Text style={styles.bottomPriceLabel}>Total Price</Text>
              <Text style={styles.bottomPriceValue}>
                {event.price > 0 ? `$${event.price}` : 'Free'}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.bookNowButton,
                isSoldOut && styles.bookNowButtonDisabled,
              ]}
              onPress={() => navigation.navigate('Booking', { event })}
              disabled={isSoldOut}
              activeOpacity={0.8}
            >
              <Text style={styles.bookNowButtonText}>
                {isSoldOut ? 'Sold Out' : 'Book Now'}
              </Text>
              {!isSoldOut && (
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    width: '100%',
    height: 260,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topBarOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
    lineHeight: 30,
  },
  infoCardContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconWrapper: {
    width: 42,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoTextWrapper: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
  },
  infoSubValue: {
    fontSize: 12,
    color: '#64748B',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  capacityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  capacityStat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '600',
  },
  priceText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#4338CA',
    marginTop: 2,
  },
  seatsText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#047857',
    marginTop: 2,
  },
  seatsTextSoldOut: {
    color: '#B91C1C',
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
  },
  userButtonBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomPriceContainer: {
    flexDirection: 'column',
  },
  bottomPriceLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  bottomPriceValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#6366F1',
  },
  bookNowButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  bookNowButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  bookNowButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  organizerButtonBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  organizerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    flex: 0.31,
  },
  viewBookingsBtn: {
    backgroundColor: '#EEF2FF',
  },
  viewBookingsBtnText: {
    color: '#4338CA',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  editBtn: {
    backgroundColor: '#EFF6FF',
  },
  editBtnText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
  deleteBtn: {
    backgroundColor: '#FEF2F2',
  },
  deleteBtnText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 4,
  },
});

export default EventDetailsScreen;
