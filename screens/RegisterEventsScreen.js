import React, { useState, useContext, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlobalStyles from '../styles/GlobalStyles';
import { AuthContext } from '../auth/AuthContext';
import { apiFetch } from '../api/client';

export default function RegisterEventsScreen({ route, navigation }) {
  const { eventId } = route.params;
  const { user, accessToken } = useContext(AuthContext);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiFetch(`/api/events/${eventId}`, {
        method: 'GET',
        token: accessToken
      });
      
      setEvent(response.event);
    } catch (error) {
      console.error('Error fetching event details:', error);
      setError(error.message || 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const formatEventDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
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

  const handleRegister = async () => {
    if (!event) return;

    try {
      setRegistering(true);

      // For now, we'll register without a dog since users might not have dogs yet
      // TODO: Add dog selection functionality
      const response = await apiFetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        token: accessToken,
        body: {
          // dog_id: null, // Optional - user can register without a dog
          notes: '',
          special_requests: '',
          emergency_contact_name: '',
          emergency_contact_phone: ''
        }
      });

      Alert.alert(
        'Success!', 
        response.message || 'Successfully registered for the event!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error) {
      console.error('Error registering for event:', error);
      Alert.alert(
        'Registration Failed', 
        error.message || 'Failed to register for the event. Please try again.'
      );
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!event) return;

    Alert.alert(
      'Unregister from Event',
      'Are you sure you want to unregister from this event?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Unregister',
          style: 'destructive',
          onPress: async () => {
            try {
              setRegistering(true);

              await apiFetch(`/api/events/${eventId}/unregister`, {
                method: 'DELETE',
                token: accessToken
              });

              Alert.alert(
                'Success!', 
                'Successfully unregistered from the event.',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack()
                  }
                ]
              );

            } catch (error) {
              console.error('Error unregistering from event:', error);
              Alert.alert(
                'Unregistration Failed', 
                error.message || 'Failed to unregister from the event. Please try again.'
              );
            } finally {
              setRegistering(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#4F8EF7" />
          <Text style={[GlobalStyles.label, { marginTop: 10 }]}>Loading event details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={[GlobalStyles.label, { color: '#DC2626', textAlign: 'center', marginBottom: 20 }]}>
            Error loading event details
          </Text>
          <Text style={[GlobalStyles.label, { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 20 }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[GlobalStyles.button, { backgroundColor: '#DC2626' }]}
            onPress={fetchEventDetails}
          >
            <Text style={GlobalStyles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={GlobalStyles.label}>Event not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView 
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Event Header */}
        <View style={[GlobalStyles.card, { marginBottom: 20 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 }}>
            {/* Event Icon */}
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: '#4F8EF7',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 15
            }}>
              <Image
                source={require('../assets/icons/calendar.png')}
                style={{ width: 30, height: 30, tintColor: 'white' }}
              />
            </View>
            
            {/* Event Info */}
            <View style={{ flex: 1 }}>
              <Text style={[GlobalStyles.title, { fontSize: 20, marginBottom: 5 }]}>
                {event.title}
              </Text>
              <Text style={[GlobalStyles.label, { fontSize: 14, color: '#4F8EF7', marginBottom: 5 }]}>
                {getCategoryDisplayName(event.category)}
              </Text>
              <Text style={[GlobalStyles.label, { fontSize: 12, color: '#6B7280' }]}>
                by {event.organizer?.full_name || event.organizer?.username || 'Unknown'}
              </Text>
            </View>
            
            {/* Price Badge */}
            <View style={{
              backgroundColor: event.price > 0 ? '#FEF3C7' : '#D1FAE5',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              alignSelf: 'flex-start'
            }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: event.price > 0 ? '#D97706' : '#059669'
              }}>
                {formatPrice(event.price, event.currency)}
              </Text>
            </View>
          </View>

          {/* Event Description */}
          {event.description && (
            <Text style={[GlobalStyles.label, { fontSize: 16, lineHeight: 24, marginBottom: 15 }]}>
              {event.description}
            </Text>
          )}
        </View>

        {/* Event Details */}
        <View style={[GlobalStyles.card, { marginBottom: 20 }]}>
          <Text style={[GlobalStyles.label, { fontWeight: '600', fontSize: 18, marginBottom: 15 }]}>
            Event Details
          </Text>
          
          <View style={{ marginBottom: 12 }}>
            <Text style={[GlobalStyles.label, { fontSize: 12, color: '#6B7280', marginBottom: 4 }]}>
              📅 Date & Time
            </Text>
            <Text style={[GlobalStyles.label, { fontSize: 16, fontWeight: '500' }]}>
              {formatEventDate(event.event_date)}
            </Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={[GlobalStyles.label, { fontSize: 12, color: '#6B7280', marginBottom: 4 }]}>
              📍 Location
            </Text>
            <Text style={[GlobalStyles.label, { fontSize: 16, fontWeight: '500' }]}>
              {event.location}
            </Text>
            {event.city && event.state && (
              <Text style={[GlobalStyles.label, { fontSize: 14, color: '#6B7280', marginTop: 2 }]}>
                {event.city}, {event.state}, {event.country}
              </Text>
            )}
          </View>

          {event.duration_hours && (
            <View style={{ marginBottom: 12 }}>
              <Text style={[GlobalStyles.label, { fontSize: 12, color: '#6B7280', marginBottom: 4 }]}>
                ⏱️ Duration
              </Text>
              <Text style={[GlobalStyles.label, { fontSize: 16, fontWeight: '500' }]}>
                {event.duration_hours} hours
              </Text>
            </View>
          )}

          {event.max_participants && (
            <View style={{ marginBottom: 12 }}>
              <Text style={[GlobalStyles.label, { fontSize: 12, color: '#6B7280', marginBottom: 4 }]}>
                👥 Capacity
              </Text>
              <Text style={[GlobalStyles.label, { fontSize: 16, fontWeight: '500' }]}>
                {event.current_participants}/{event.max_participants} participants
              </Text>
            </View>
          )}

          {event.venue_details && (
            <View style={{ marginBottom: 12 }}>
              <Text style={[GlobalStyles.label, { fontSize: 12, color: '#6B7280', marginBottom: 4 }]}>
                🏢 Venue Details
              </Text>
              <Text style={[GlobalStyles.label, { fontSize: 14, lineHeight: 20 }]}>
                {event.venue_details}
              </Text>
            </View>
          )}
        </View>

        {/* Requirements */}
        {(event.min_age_requirement || event.max_age_requirement || event.vaccination_required || event.special_requirements) && (
          <View style={[GlobalStyles.card, { marginBottom: 20 }]}>
            <Text style={[GlobalStyles.label, { fontWeight: '600', fontSize: 18, marginBottom: 15 }]}>
              Requirements
            </Text>
            
            {event.min_age_requirement && (
              <View style={{ marginBottom: 8 }}>
                <Text style={[GlobalStyles.label, { fontSize: 14, color: '#6B7280' }]}>
                  • Minimum age: {event.min_age_requirement} months
                </Text>
              </View>
            )}

            {event.max_age_requirement && (
              <View style={{ marginBottom: 8 }}>
                <Text style={[GlobalStyles.label, { fontSize: 14, color: '#6B7280' }]}>
                  • Maximum age: {event.max_age_requirement} months
                </Text>
              </View>
            )}

            {event.vaccination_required && (
              <View style={{ marginBottom: 8 }}>
                <Text style={[GlobalStyles.label, { fontSize: 14, color: '#6B7280' }]}>
                  • Vaccination required
                </Text>
              </View>
            )}

            {event.special_requirements && (
              <View style={{ marginBottom: 8 }}>
                <Text style={[GlobalStyles.label, { fontSize: 14, color: '#6B7280' }]}>
                  • {event.special_requirements}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Contact Information */}
        {(event.contact_email || event.contact_phone) && (
          <View style={[GlobalStyles.card, { marginBottom: 20 }]}>
            <Text style={[GlobalStyles.label, { fontWeight: '600', fontSize: 18, marginBottom: 15 }]}>
              Contact Information
            </Text>
            
            {event.contact_email && (
              <View style={{ marginBottom: 8 }}>
                <Text style={[GlobalStyles.label, { fontSize: 12, color: '#6B7280', marginBottom: 2 }]}>
                  📧 Email
                </Text>
                <Text style={[GlobalStyles.label, { fontSize: 14 }]}>
                  {event.contact_email}
                </Text>
              </View>
            )}

            {event.contact_phone && (
              <View style={{ marginBottom: 8 }}>
                <Text style={[GlobalStyles.label, { fontSize: 12, color: '#6B7280', marginBottom: 2 }]}>
                  📞 Phone
                </Text>
                <Text style={[GlobalStyles.label, { fontSize: 14 }]}>
                  {event.contact_phone}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Additional Information */}
        {(event.additional_info || event.rules_and_guidelines) && (
          <View style={[GlobalStyles.card, { marginBottom: 20 }]}>
            <Text style={[GlobalStyles.label, { fontWeight: '600', fontSize: 18, marginBottom: 15 }]}>
              Additional Information
            </Text>
            
            {event.additional_info && (
              <View style={{ marginBottom: 12 }}>
                <Text style={[GlobalStyles.label, { fontSize: 12, color: '#6B7280', marginBottom: 4 }]}>
                  ℹ️ Additional Info
                </Text>
                <Text style={[GlobalStyles.label, { fontSize: 14, lineHeight: 20 }]}>
                  {event.additional_info}
                </Text>
              </View>
            )}

            {event.rules_and_guidelines && (
              <View style={{ marginBottom: 12 }}>
                <Text style={[GlobalStyles.label, { fontSize: 12, color: '#6B7280', marginBottom: 4 }]}>
                  📋 Rules & Guidelines
                </Text>
                <Text style={[GlobalStyles.label, { fontSize: 14, lineHeight: 20 }]}>
                  {event.rules_and_guidelines}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Registration Status */}
        <View style={[GlobalStyles.card, { marginBottom: 20 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <Text style={[GlobalStyles.label, { fontWeight: '600', fontSize: 18 }]}>
              Registration Status
            </Text>
            <View style={{
              backgroundColor: event.is_registration_open ? '#D1FAE5' : '#FEE2E2',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16
            }}>
              <Text style={{
                fontSize: 12,
                fontWeight: '600',
                color: event.is_registration_open ? '#059669' : '#DC2626'
              }}>
                {event.is_registration_open ? 'Registration Open' : 'Registration Closed'}
              </Text>
            </View>
          </View>

          {event.is_full && (
            <View style={{ marginBottom: 15 }}>
              <Text style={[GlobalStyles.label, { fontSize: 14, color: '#DC2626', fontWeight: '600' }]}>
                ⚠️ This event is full
              </Text>
            </View>
          )}

          {event.is_registered && (
            <View style={{ marginBottom: 15 }}>
              <Text style={[GlobalStyles.label, { fontSize: 14, color: '#059669', fontWeight: '600' }]}>
                ✅ You are registered for this event
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={{ marginBottom: 20 }}>
          {event.is_registered ? (
            <TouchableOpacity
              style={[
                GlobalStyles.button,
                { backgroundColor: '#DC2626', marginBottom: 10 },
                registering && { opacity: 0.6 }
              ]}
              onPress={handleUnregister}
              disabled={registering}
            >
              <Text style={GlobalStyles.buttonText}>
                {registering ? 'Unregistering...' : 'Unregister from Event'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                GlobalStyles.button,
                { marginBottom: 10 },
                (!event.is_registration_open || event.is_full || registering) && { opacity: 0.6 }
              ]}
              onPress={handleRegister}
              disabled={!event.is_registration_open || event.is_full || registering}
            >
              <Text style={GlobalStyles.buttonText}>
                {registering ? 'Registering...' : 'Register for Event'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[GlobalStyles.button, { backgroundColor: '#6B7280' }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={GlobalStyles.buttonText}>Back to Events</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
