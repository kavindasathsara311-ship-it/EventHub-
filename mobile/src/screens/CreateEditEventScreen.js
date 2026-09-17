import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createEventInFirestore, updateEventInFirestore } from '../services/firebaseService';
import { AuthContext } from '../context/AuthContext';

const IMAGE_PRESETS = [
  { label: 'Tech', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800' },
  { label: 'Music', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800' },
  { label: 'Business', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800' },
  { label: 'Arts', url: 'https://images.unsplash.com/photo-1531058240690-006c446962d8?w=800' },
];

const CATEGORIES = ['Technology', 'Music', 'Business', 'Arts', 'Sports', 'Food'];

const CreateEditEventScreen = ({ route, navigation }) => {
  const { user } = useContext(AuthContext);
  const eventData = route.params?.eventData;
  const isEditing = !!eventData;

  const [name, setName] = useState(eventData?.name || '');
  const [image, setImage] = useState(
    eventData?.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
  );
  const [description, setDescription] = useState(eventData?.description || '');
  const [date, setDate] = useState(eventData?.date || '2026-10-30');
  const [time, setTime] = useState(eventData?.time || '10:00 AM');
  const [location, setLocation] = useState(eventData?.location || '');
  const [category, setCategory] = useState(eventData?.category || 'Technology');
  const [price, setPrice] = useState(eventData?.price !== undefined ? String(eventData.price) : '0');
  const [totalSeats, setTotalSeats] = useState(
    eventData?.totalSeats !== undefined ? String(eventData.totalSeats) : '100'
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    setErrorMsg('');
    if (!name.trim() || !location.trim() || !date.trim() || !time.trim() || !totalSeats.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    const seatsNum = parseInt(totalSeats, 10);
    if (isNaN(seatsNum) || seatsNum <= 0) {
      setErrorMsg('Total seats must be a positive number.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        image: image.trim(),
        description: description.trim(),
        date: date.trim(),
        time: time.trim(),
        location: location.trim(),
        category,
        price: parseFloat(price) || 0,
        totalSeats: seatsNum,
        organizerId: user?.id || 'u1',
      };

      if (isEditing) {
        await updateEventInFirestore(eventData.id, payload);
        Alert.alert('Success 🎉', 'Event updated in Firestore successfully.');
      } else {
        await createEventInFirestore(payload);
        Alert.alert('Success 🎉', 'New event published to Firestore successfully.');
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving event:', error);
      setErrorMsg(error.message || 'Failed to save event to Firestore.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.screenTitle}>{isEditing ? 'Edit Event' : 'Create New Event'}</Text>
          <Text style={styles.screenSubtitle}>
            {isEditing ? 'Update event parameters and info' : 'Fill in event details to publish'}
          </Text>

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#DC2626" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <View style={styles.card}>
            {/* Event Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Event Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. AI & Cloud Summit 2026"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Category Chips Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catChip, category === cat && styles.catChipActive]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[styles.catChipText, category === cat && styles.catChipTextActive]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Image URL & Presets */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Banner Image URL</Text>
              <TextInput
                style={styles.input}
                value={image}
                onChangeText={setImage}
                placeholder="https://example.com/image.jpg"
                placeholderTextColor="#94A3B8"
              />
              <Text style={styles.presetLabel}>Quick Presets:</Text>
              <View style={styles.presetsRow}>
                {IMAGE_PRESETS.map((preset) => (
                  <TouchableOpacity
                    key={preset.label}
                    style={styles.presetBtn}
                    onPress={() => setImage(preset.url)}
                  >
                    <Text style={styles.presetBtnText}>{preset.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date & Time */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 0.48 }]}>
                <Text style={styles.label}>Date *</Text>
                <TextInput
                  style={styles.input}
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 0.48 }]}>
                <Text style={styles.label}>Time *</Text>
                <TextInput
                  style={styles.input}
                  value={time}
                  onChangeText={setTime}
                  placeholder="e.g. 10:00 AM"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* Location */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location / Venue *</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="e.g. Convention Center, San Francisco"
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Price & Seats */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 0.48 }]}>
                <Text style={styles.label}>Price ($)</Text>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0 for Free"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 0.48 }]}>
                <Text style={styles.label}>Total Capacity *</Text>
                <TextInput
                  style={styles.input}
                  value={totalSeats}
                  onChangeText={setTotalSeats}
                  placeholder="100"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                />
              </View>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Event details, keynotes, schedule, speakers..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isEditing ? 'Save Event Changes' : 'Publish Event'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  screenSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
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
  inputGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catChipActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  catChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  catChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  presetLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
    marginBottom: 4,
  },
  presetsRow: {
    flexDirection: 'row',
  },
  presetBtn: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
  },
  presetBtnText: {
    fontSize: 11,
    color: '#4338CA',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CreateEditEventScreen;
