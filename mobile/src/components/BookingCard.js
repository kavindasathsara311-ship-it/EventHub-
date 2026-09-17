import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BookingCard = ({ booking, onCancel }) => {
  const event = booking.event || {};
  const isConfirmed = booking.status === 'confirmed';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {event.image ? (
          <Image source={{ uri: event.image }} style={styles.eventImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="calendar-outline" size={24} color="#6366F1" />
          </View>
        )}
        <View style={styles.headerText}>
          <Text style={styles.eventTitle} numberOfLines={1}>
            {event.name || 'Event Details Unavailable'}
          </Text>
          {event.date ? (
            <Text style={styles.eventMeta}>
              <Ionicons name="calendar" size={12} color="#6366F1" /> {event.date} • {event.time}
            </Text>
          ) : null}
          {event.location ? (
            <Text style={styles.eventLocation} numberOfLines={1}>
              <Ionicons name="location" size={12} color="#6366F1" /> {event.location}
            </Text>
          ) : null}
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

      <View style={styles.divider} />

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Attendee</Text>
          <Text style={styles.detailValue} numberOfLines={1}>
            {booking.attendeeName}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Seats</Text>
          <Text style={styles.detailValue}>{booking.seats} seat(s)</Text>
        </View>

        <View style={styles.detailItemRight}>
          <Text style={styles.detailLabel}>Total Price</Text>
          <Text style={styles.totalPrice}>${booking.totalPrice}</Text>
        </View>
      </View>

      {isConfirmed ? (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          activeOpacity={0.8}
        >
          <Ionicons name="close-circle-outline" size={16} color="#DC2626" />
          <Text style={styles.cancelButtonText}>Cancel Booking</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 12,
  },
  placeholderImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
    marginRight: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  eventMeta: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 12,
    color: '#94A3B8',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
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
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    flex: 1,
  },
  detailItemRight: {
    alignItems: 'flex-end',
  },
  detailLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginTop: 2,
  },
  totalPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: '#6366F1',
    marginTop: 2,
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  cancelButtonText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default BookingCard;
