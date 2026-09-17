import React, { useContext } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FavoritesContext } from '../context/FavoritesContext';

const EventCard = ({
  event,
  onPress,
  showOrganizerActions = false,
  onEdit,
  onDelete,
  onViewBookings,
}) => {
  const { isFavorite, toggleFavorite } = useContext(FavoritesContext);
  const fav = isFavorite(event.id);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800' }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{event.category}</Text>
        </View>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(event.id)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={fav ? 'heart' : 'heart-outline'}
            size={20}
            color={fav ? '#EF4444' : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {event.name}
        </Text>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={15} color="#6366F1" style={styles.infoIcon} />
          <Text style={styles.infoText}>{event.date} • {event.time}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={15} color="#6366F1" style={styles.infoIcon} />
          <Text style={styles.infoText} numberOfLines={1}>
            {event.location}
          </Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.priceValue}>
              {event.price > 0 ? `$${event.price}` : 'Free'}
            </Text>
          </View>

          <View
            style={[
              styles.seatsBadge,
              event.availableSeats === 0 ? styles.seatsBadgeSoldOut : null,
            ]}
          >
            <Ionicons
              name="people-outline"
              size={13}
              color={event.availableSeats === 0 ? '#B91C1C' : '#047857'}
            />
            <Text
              style={[
                styles.seatsText,
                event.availableSeats === 0 ? styles.seatsTextSoldOut : null,
              ]}
            >
              {event.availableSeats > 0 ? `${event.availableSeats} left` : 'Sold Out'}
            </Text>
          </View>
        </View>

        {showOrganizerActions ? (
          <View style={styles.organizerActions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.viewBookingsBtn]}
              onPress={onViewBookings}
            >
              <Ionicons name="receipt-outline" size={14} color="#4338CA" />
              <Text style={styles.viewBookingsText}>Bookings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={onEdit}>
              <Ionicons name="create-outline" size={14} color="#2563EB" />
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={onDelete}>
              <Ionicons name="trash-outline" size={14} color="#DC2626" />
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  imageContainer: {
    height: 160,
    width: '100%',
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoIcon: {
    marginRight: 6,
    width: 16,
  },
  infoText: {
    fontSize: 13,
    color: '#64748B',
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priceContainer: {
    flexDirection: 'column',
  },
  priceLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#6366F1',
  },
  seatsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  seatsBadgeSoldOut: {
    backgroundColor: '#FEE2E2',
  },
  seatsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#047857',
    marginLeft: 4,
  },
  seatsTextSoldOut: {
    color: '#B91C1C',
  },
  organizerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewBookingsBtn: {
    backgroundColor: '#EEF2FF',
  },
  viewBookingsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4338CA',
    marginLeft: 4,
  },
  editBtn: {
    backgroundColor: '#EFF6FF',
  },
  editText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
    marginLeft: 4,
  },
  deleteBtn: {
    backgroundColor: '#FEF2F2',
  },
  deleteText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
    marginLeft: 4,
  },
});

export default EventCard;
