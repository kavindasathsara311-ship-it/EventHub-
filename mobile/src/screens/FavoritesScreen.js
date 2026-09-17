import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../config/api';
import { FavoritesContext } from '../context/FavoritesContext';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';

const FavoritesScreen = ({ navigation }) => {
  const { favorites } = useContext(FavoritesContext);

  const [favEvents, setFavEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavoriteEvents = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);

    try {
      const response = await apiClient.get('/events');
      const allEvents = response.data;
      const filtered = allEvents.filter((e) => favorites.includes(e.id));
      setFavEvents(filtered);
    } catch (error) {
      console.error('Error fetching favorite events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [favorites]);

  useEffect(() => {
    fetchFavoriteEvents();
  }, [fetchFavoriteEvents]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFavoriteEvents(true);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Favorite Events</Text>
      <Text style={styles.subtitle}>Your saved events for quick access</Text>
    </View>
  );

  const renderEmptyComponent = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="heart-dislike-outline" size={48} color="#94A3B8" />
        <Text style={styles.emptyTitle}>No Favorites Saved</Text>
        <Text style={styles.emptyText}>
          Tap the heart icon on any event card to save it to your favorites list.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading && !refreshing ? (
        <View style={styles.loadingWrapper}>
          {renderHeader()}
          <LoadingSpinner message="Loading favorites..." />
        </View>
      ) : (
        <FlatList
          data={favEvents}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={() => navigation.navigate('EventDetails', { eventId: item.id })}
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
    marginBottom: 8,
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

export default FavoritesScreen;
