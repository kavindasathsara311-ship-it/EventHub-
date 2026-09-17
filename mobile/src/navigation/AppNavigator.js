import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import { AuthContext } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import AttendeeTabNavigator from './AttendeeTabNavigator';
import OrganizerTabNavigator from './OrganizerTabNavigator';

import EventDetailsScreen from '../screens/EventDetailsScreen';
import BookingScreen from '../screens/BookingScreen';
import CreateEditEventScreen from '../screens/CreateEditEventScreen';
import EventBookingsScreen from '../screens/EventBookingsScreen';
import LoadingSpinner from '../components/LoadingSpinner';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user } = useContext(AuthContext);

  return (

    <NavigationContainer>
      {!user ? (
        <AuthNavigator />
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#FFFFFF',
            },
            headerTintColor: '#0F172A',
            headerTitleStyle: {
              fontWeight: '700',
            },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen
            name="Main"
            component={user.role === 'organizer' ? OrganizerTabNavigator : AttendeeTabNavigator}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="EventDetails"
            component={EventDetailsScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Booking"
            component={BookingScreen}
            options={{ title: 'Book Tickets' }}
          />

          <Stack.Screen
            name="CreateEditEvent"
            component={CreateEditEventScreen}
            options={({ route }) => ({
              title: route.params?.eventData ? 'Edit Event' : 'Create Event',
            })}
          />

          <Stack.Screen
            name="EventBookings"
            component={EventBookingsScreen}
            options={{ title: 'Attendee Bookings' }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
