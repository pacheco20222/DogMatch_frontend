import React, { useContext, useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import GlobalStyles from '../styles/GlobalStyles';
import { AuthContext } from '../auth/AuthContext';
import { canCreateEvents } from '../utils/permissions';
import { apiFetch } from '../api/client';

export default function EventsScreen({ navigation }) {
  const { user, accessToken } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if user can create events (admin or shelter only)
  const userCanCreateEvents = canCreateEvents(user);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiFetch('/api/events', {
        method: 'GET',
        token: accessToken
      });
      
      setEvents(response.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchEvents();
    }, [])
  );

  const formatEventDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatPrice = (price, currency) => {
    if (price === 0 || price === '0') {
      return 'Free';
    }
    return `${currency} ${price}`;
  };

  const getCategoryDisplayName = (category) => {
    const categoryMap = {
      'meetup': 'Dog Meetup',
      'training': 'Training Workshop',
      'adoption': 'Adoption Fair',
      'competition': 'Dog Competition',
      'social': 'Social Event',
      'educational': 'Educational Workshop'
    };
    return categoryMap[category] || category;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView 
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={GlobalStyles.title}>Events</Text>
        <Text style={GlobalStyles.label}>
          Join community events and meetups
        </Text>
        
        {/* Show Create Event button only for admins and shelters */}
        {userCanCreateEvents && (
          <View style={{ marginVertical: 20 }}>
            <TouchableOpacity
              style={[GlobalStyles.button, { marginBottom: 20 }]}
              onPress={() => navigation.navigate('CreateEvent')}
            >
              <Text style={GlobalStyles.buttonText}>Create Event</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Loading State */}
        {loading && (
          <View style={{ alignItems: 'center', marginVertical: 40 }}>
            <ActivityIndicator size="large" color="#4F8EF7" />
            <Text style={[GlobalStyles.label, { marginTop: 10 }]}>Loading events...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <View style={[GlobalStyles.card, { marginVertical: 20, backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
            <Text style={[GlobalStyles.label, { color: '#DC2626' }]}>Error loading events</Text>
            <Text style={[GlobalStyles.label, { fontSize: 14, color: '#DC2626', marginTop: 5 }]}>
              {error}
            </Text>
            <TouchableOpacity
              style={[GlobalStyles.button, { marginTop: 15, backgroundColor: '#DC2626' }]}
              onPress={fetchEvents}
            >
              <Text style={GlobalStyles.buttonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Events List */}
        {!loading && !error && events.length > 0 && (
          <View style={{ marginTop: 10 }}>
            {events.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={[GlobalStyles.card, { marginBottom: 15 }]}
                onPress={() => {
                  navigation.navigate('RegisterEvent', { eventId: event.id });
                }}
              >
                {/* Event Header */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
                  {/* Event Icon */}
                  <View style={{
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                    backgroundColor: '#4F8EF7',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 15
                  }}>
                    <Image
                      source={require('../assets/icons/calendar.png')}
                      style={{ width: 24, height: 24, tintColor: 'white' }}
                    />
                  </View>
                  
                  {/* Event Info */}
                  <View style={{ flex: 1 }}>
                    <Text style={[GlobalStyles.label, { fontWeight: '600', fontSize: 16, marginBottom: 4 }]}>
                      {event.title}
                    </Text>
                    <Text style={[GlobalStyles.label, { fontSize: 12, color: '#4F8EF7', marginBottom: 2 }]}>
                      {getCategoryDisplayName(event.category)}
                    </Text>
                    <Text style={[GlobalStyles.label, { fontSize: 12, color: '#6B7280' }]}>
                      by {event.organizer?.full_name || event.organizer?.username || 'Unknown'}
                    </Text>
                  </View>
                  
                  {/* Price Badge */}
                  <View style={{
                    backgroundColor: event.price > 0 ? '#FEF3C7' : '#D1FAE5',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12,
                    alignSelf: 'flex-start'
                  }}>
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: event.price > 0 ? '#D97706' : '#059669'
                    }}>
                      {formatPrice(event.price, event.currency)}
                    </Text>
                  </View>
                </View>

                {/* Event Description */}
                {event.description && (
                  <Text style={[GlobalStyles.label, { fontSize: 14, marginBottom: 10, lineHeight: 20 }]} numberOfLines={2}>
                    {event.description}
                  </Text>
                )}

                {/* Event Details */}
                <View style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                    <Text style={[GlobalStyles.label, { fontSize: 12, color: '#6B7280', width: 80 }]}>
                      📅 Date:
                    </Text>
                    <Text style={[GlobalStyles.label, { fontSize: 12, flex: 1 }]}>
                      {formatEventDate(event.event_date)}
                    </Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                    <Text style={[GlobalStyles.label, { fontSize: 12, color: '#6B7280', width: 80 }]}>
                      📍 Location:
                    </Text>
                    <Text style={[GlobalStyles.label, { fontSize: 12, flex: 1 }]} numberOfLines={1}>
                      {event.location}
                    </Text>
                  </View>
                  
                  {event.max_participants && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[GlobalStyles.label, { fontSize: 12, color: '#6B7280', width: 80 }]}>
                        👥 Capacity:
                      </Text>
                      <Text style={[GlobalStyles.label, { fontSize: 12, flex: 1 }]}>
                        {event.current_participants}/{event.max_participants} participants
                      </Text>
                    </View>
                  )}
                </View>

                {/* Event Status */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{
                    backgroundColor: event.is_registered ? '#DBEAFE' : (event.is_registration_open ? '#D1FAE5' : '#FEE2E2'),
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 12
                  }}>
                    <Text style={{
                      fontSize: 11,
                      fontWeight: '600',
                      color: event.is_registered ? '#2563EB' : (event.is_registration_open ? '#059669' : '#DC2626')
                    }}>
                      {event.is_registered ? 'Registered' : (event.is_registration_open ? 'Registration Open' : 'Registration Closed')}
                    </Text>
                  </View>
                  
                  {event.is_full && !event.is_registered && (
                    <Text style={[GlobalStyles.label, { fontSize: 11, color: '#DC2626', fontWeight: '600' }]}>
                      FULL
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Empty State */}
        {!loading && !error && events.length === 0 && (
          <View style={[GlobalStyles.card, { marginVertical: 20, alignItems: 'center', paddingVertical: 40 }]}>
            <Image
              source={require('../assets/icons/calendar.png')}
              style={{ width: 64, height: 64, tintColor: '#9CA3AF', marginBottom: 20 }}
            />
            <Text style={[GlobalStyles.label, { fontSize: 18, fontWeight: '600', marginBottom: 10 }]}>
              No events available
            </Text>
            <Text style={[GlobalStyles.label, { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 }]}>
              {userCanCreateEvents 
                ? 'Create your first event to get started!'
                : 'Check back soon for upcoming events in your area.'
              }
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}