import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBookingInFirestore } from '../services/firebaseService';
import { AuthContext } from '../context/AuthContext';
import { sendBookingNotification } from '../utils/notifications';

const BookingScreen = ({ route, navigation }) => {
  const { event } = route.params;
  const { user } = useContext(AuthContext);

  const [attendeeName, setAttendeeName] = useState(user?.name || '');
  const [attendeeEmail, setAttendeeEmail] = useState(user?.email || '');
  const [seats, setSeats] = useState(1);
  const [loading, setLoading] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const pricePerSeat = parseFloat(event.price || 0);
  const totalPrice = seats * pricePerSeat;

  const handleSeatChange = (delta) => {
    const newSeats = seats + delta;
    if (newSeats >= 1 && newSeats <= event.availableSeats) {
      setSeats(newSeats);
      setErrorMsg('');
    }
  };

  const handleValidateForm = () => {
    setErrorMsg('');
    if (!attendeeName.trim() || !attendeeEmail.trim()) {
      setErrorMsg('Please enter attendee name and email.');
      return;
    }

    if (seats < 1) {
      setErrorMsg('Please select at least 1 seat.');
      return;
    }

    if (seats > event.availableSeats) {
      setErrorMsg(`Only ${event.availableSeats} seat(s) available.`);
      return;
    }

    // Open confirmation modal
    setConfirmModalVisible(true);
  };

  const handleConfirmBooking = async () => {
    setLoading(true);
    try {
      await createBookingInFirestore({
        eventId: event.id,
        userId: user?.id || 'u1',
        attendeeName: attendeeName.trim(),
        attendeeEmail: attendeeEmail.toLowerCase().trim(),
        seats: parseInt(seats, 10),
      });

      setConfirmModalVisible(false);
      setLoading(false);

      // Trigger local notification
      await sendBookingNotification(event.name, seats);

      Alert.alert(
        'Booking Confirmed! 🎉',
        `Your ${seats} ticket(s) for "${event.name}" have been saved to Firestore.`,
        [
          {
            text: 'View My Bookings',
            onPress: () => {
              navigation.navigate('Main', { screen: 'BookingsTab' });
            },
          },
        ]
      );
    } catch (error) {
      setLoading(false);
      setConfirmModalVisible(false);
      Alert.alert('Booking Error', error.message || 'Failed to complete booking.');
    }
  };


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Event Header Banner */}
        <View style={styles.eventBanner}>
          <Text style={styles.eventBannerLabel}>Booking For</Text>
          <Text style={styles.eventBannerTitle}>{event.name}</Text>
          <View style={styles.eventBannerMetaRow}>
            <Ionicons name="calendar-outline" size={14} color="#C7D2FE" />
            <Text style={styles.eventBannerMetaText}>
              {event.date} • {event.time}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Attendee Information</Text>

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#DC2626" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={attendeeName}
                onChangeText={setAttendeeName}
                placeholder="Attendee Full Name"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={attendeeEmail}
                onChangeText={setAttendeeEmail}
                placeholder="Attendee Email"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Seat Selector */}
          <View style={styles.inputGroup}>
            <View style={styles.seatHeader}>
              <Text style={styles.label}>Number of Seats *</Text>
              <Text style={styles.availableBadge}>
                {event.availableSeats} available
              </Text>
            </View>

            <View style={styles.seatCounterRow}>
              <TouchableOpacity
                style={[styles.counterBtn, seats <= 1 && styles.counterBtnDisabled]}
                onPress={() => handleSeatChange(-1)}
                disabled={seats <= 1}
              >
                <Ionicons name="remove" size={20} color={seats <= 1 ? '#CBD5E1' : '#475569'} />
              </TouchableOpacity>

              <Text style={styles.counterValue}>{seats}</Text>

              <TouchableOpacity
                style={[
                  styles.counterBtn,
                  seats >= event.availableSeats && styles.counterBtnDisabled,
                ]}
                onPress={() => handleSeatChange(1)}
                disabled={seats >= event.availableSeats}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={seats >= event.availableSeats ? '#CBD5E1' : '#475569'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Price Breakdown Summary */}
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Order Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Price per seat</Text>
              <Text style={styles.summaryValue}>
                {pricePerSeat > 0 ? `$${pricePerSeat}` : 'Free'}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Seats selected</Text>
              <Text style={styles.summaryValue}>{seats}</Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRowTotal}>
              <Text style={styles.summaryTotalLabel}>Total Amount</Text>
              <Text style={styles.summaryTotalValue}>
                {totalPrice > 0 ? `$${totalPrice}` : 'Free'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.reviewButton}
            onPress={handleValidateForm}
            activeOpacity={0.8}
          >
            <Text style={styles.reviewButtonText}>Review Order</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>

        {/* Confirmation Modal */}
        <Modal
          visible={confirmModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setConfirmModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Ionicons name="ticket" size={32} color="#6366F1" />
                <Text style={styles.modalTitle}>Confirm Booking</Text>
              </View>

              <Text style={styles.modalSubtitle}>
                Please review your details before confirming your tickets.
              </Text>

              <View style={styles.modalDetailsBox}>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Event:</Text>
                  <Text style={styles.modalDetailValue}>{event.name}</Text>
                </View>

                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Attendee:</Text>
                  <Text style={styles.modalDetailValue}>{attendeeName}</Text>
                </View>

                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Email:</Text>
                  <Text style={styles.modalDetailValue}>{attendeeEmail}</Text>
                </View>

                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Seats:</Text>
                  <Text style={styles.modalDetailValue}>{seats} ticket(s)</Text>
                </View>

                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Total Pay:</Text>
                  <Text style={[styles.modalDetailValue, { color: '#6366F1', fontWeight: '800' }]}>
                    {totalPrice > 0 ? `$${totalPrice}` : 'Free'}
                  </Text>
                </View>
              </View>

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setConfirmModalVisible(false)}
                  disabled={loading}
                >
                  <Text style={styles.modalCancelBtnText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalConfirmBtn}
                  onPress={handleConfirmBooking}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.modalConfirmBtnText}>Confirm Order</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
  },
  eventBanner: {
    backgroundColor: '#4338CA',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  eventBannerLabel: {
    fontSize: 11,
    color: '#A5B4FC',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  eventBannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  eventBannerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  eventBannerMetaText: {
    fontSize: 13,
    color: '#E0E7FF',
    marginLeft: 6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
  },
  seatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availableBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  seatCounterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 8,
    marginTop: 4,
  },
  counterBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBtnDisabled: {
    backgroundColor: '#F1F5F9',
  },
  counterValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginHorizontal: 32,
  },
  summaryContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginVertical: 12,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 8,
  },
  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#6366F1',
  },
  reviewButton: {
    backgroundColor: '#6366F1',
    borderRadius: 14,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  reviewButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    width: '100%',
    maxWidth: 380,
    elevation: 5,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalDetailsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalDetailLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  modalDetailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelBtn: {
    flex: 0.45,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelBtnText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '700',
  },
  modalConfirmBtn: {
    flex: 0.52,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default BookingScreen;
