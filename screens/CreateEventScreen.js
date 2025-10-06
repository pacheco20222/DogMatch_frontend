import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlobalStyles from '../styles/GlobalStyles';
import { AuthContext } from '../auth/AuthContext';
import { apiFetch } from '../api/client';

export default function CreateEventScreen({ navigation }) {
  const { accessToken } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'meetup',
    event_date: '',
    duration_hours: '',
    location: '',
    city: '',
    state: '',
    country: 'Mexico',
    venue_details: '',
    max_participants: '',
    price: '0',
    currency: 'MXN',
    min_age_requirement: '',
    max_age_requirement: '',
    vaccination_required: true,
    special_requirements: '',
    requires_approval: false,
    contact_email: '',
    contact_phone: '',
    additional_info: '',
    rules_and_guidelines: ''
  });

  const eventCategories = [
    { value: 'meetup', label: 'Dog Meetup' },
    { value: 'training', label: 'Training Workshop' },
    { value: 'adoption', label: 'Adoption Fair' },
    { value: 'competition', label: 'Dog Competition' },
    { value: 'social', label: 'Social Event' },
    { value: 'educational', label: 'Educational Workshop' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Validation Error', 'Event title is required');
      return false;
    }
    if (!formData.event_date) {
      Alert.alert('Validation Error', 'Event date is required');
      return false;
    }
    if (!formData.location.trim()) {
      Alert.alert('Validation Error', 'Event location is required');
      return false;
    }

    // Validate event date format and that it's in the future
    const eventDate = new Date(formData.event_date);
    if (isNaN(eventDate.getTime())) {
      Alert.alert('Validation Error', 'Please enter a valid date in format: YYYY-MM-DDTHH:MM:SS');
      return false;
    }
    
    const now = new Date();
    if (eventDate <= now) {
      Alert.alert('Validation Error', 'Event date must be in the future');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Prepare data for API
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        event_date: formData.event_date,
        location: formData.location.trim(),
        city: formData.city.trim() || null,
        state: formData.state.trim() || null,
        country: formData.country,
        venue_details: formData.venue_details.trim() || null,
        contact_email: formData.contact_email.trim() || null,
        contact_phone: formData.contact_phone.trim() || null,
        additional_info: formData.additional_info.trim() || null,
        rules_and_guidelines: formData.rules_and_guidelines.trim() || null,
        vaccination_required: formData.vaccination_required,
        requires_approval: formData.requires_approval
      };

      // Add optional numeric fields
      if (formData.duration_hours) {
        submitData.duration_hours = parseFloat(formData.duration_hours);
      }
      if (formData.max_participants) {
        submitData.max_participants = parseInt(formData.max_participants);
      }
      if (formData.price) {
        submitData.price = parseFloat(formData.price);
      }
      if (formData.min_age_requirement) {
        submitData.min_age_requirement = parseInt(formData.min_age_requirement);
      }
      if (formData.max_age_requirement) {
        submitData.max_age_requirement = parseInt(formData.max_age_requirement);
      }
      if (formData.special_requirements) {
        submitData.special_requirements = formData.special_requirements.trim();
      }

      const response = await apiFetch('/api/events', {
        method: 'POST',
        token: accessToken,
        body: submitData
      });

      Alert.alert(
        'Success!', 
        'Event created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert(
        'Error', 
        error.message || 'Failed to create event. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView 
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={GlobalStyles.title}>Create New Event</Text>
        <Text style={[GlobalStyles.label, { marginBottom: 20 }]}>
          Fill in the details to create your event
        </Text>

        {/* Basic Information */}
        <View style={[GlobalStyles.card, { marginBottom: 20 }]}>
          <Text style={[GlobalStyles.label, { fontWeight: '600', marginBottom: 15 }]}>
            Basic Information
          </Text>
          
          <Text style={[GlobalStyles.label, { marginBottom: 5 }]}>Event Title *</Text>
          <TextInput
            style={GlobalStyles.input}
            value={formData.title}
            onChangeText={(value) => handleInputChange('title', value)}
            placeholder="Enter event title"
            maxLength={200}
          />

          <Text style={[GlobalStyles.label, { marginBottom: 5, marginTop: 15 }]}>Description</Text>
          <TextInput
            style={[GlobalStyles.input, { height: 80, textAlignVertical: 'top' }]}
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            placeholder="Describe your event..."
            multiline
            maxLength={2000}
          />

          <Text style={[GlobalStyles.label, { marginBottom: 5, marginTop: 15 }]}>Category *</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 }}>
            {eventCategories.map((category) => (
              <TouchableOpacity
                key={category.value}
                style={[
                  {
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 8,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: '#E5E7EB'
                  },
                  formData.category === category.value && {
                    backgroundColor: '#4F8EF7',
                    borderColor: '#4F8EF7'
                  }
                ]}
                onPress={() => handleInputChange('category', category.value)}
              >
                <Text style={[
                  { fontSize: 12, fontWeight: '500' },
                  formData.category === category.value && { color: 'white' }
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date & Time */}
        <View style={[GlobalStyles.card, { marginBottom: 20 }]}>
          <Text style={[GlobalStyles.label, { fontWeight: '600', marginBottom: 15 }]}>
            Date & Time
          </Text>
          
          <Text style={[GlobalStyles.label, { marginBottom: 5 }]}>Event Date & Time *</Text>
          <TextInput
            style={GlobalStyles.input}
            value={formData.event_date}
            onChangeText={(value) => handleInputChange('event_date', value)}
            placeholder="2024-12-25T14:00:00"
          />
          <Text style={[GlobalStyles.label, { fontSize: 12, color: '#6B7280', marginTop: 5 }]}>
            Format: YYYY-MM-DDTHH:MM:SS (e.g., 2024-12-25T14:00:00)
          </Text>

          <Text style={[GlobalStyles.label, { marginBottom: 5, marginTop: 15 }]}>Duration (hours)</Text>
          <TextInput
            style={GlobalStyles.input}
            value={formData.duration_hours}
            onChangeText={(value) => handleInputChange('duration_hours', value)}
            placeholder="2.5"
            keyboardType="numeric"
          />
        </View>

        {/* Location */}
        <View style={[GlobalStyles.card, { marginBottom: 20 }]}>
          <Text style={[GlobalStyles.label, { fontWeight: '600', marginBottom: 15 }]}>
            Location
          </Text>
          
          <Text style={[GlobalStyles.label, { marginBottom: 5 }]}>Address/Venue *</Text>
          <TextInput
            style={GlobalStyles.input}
            value={formData.location}
            onChangeText={(value) => handleInputChange('location', value)}
            placeholder="Enter full address or venue name"
            maxLength={300}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[GlobalStyles.label, { marginBottom: 5, marginTop: 15 }]}>City</Text>
              <TextInput
                style={GlobalStyles.input}
                value={formData.city}
                onChangeText={(value) => handleInputChange('city', value)}
                placeholder="Mérida"
                maxLength={100}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[GlobalStyles.label, { marginBottom: 5, marginTop: 15 }]}>State</Text>
              <TextInput
                style={GlobalStyles.input}
                value={formData.state}
                onChangeText={(value) => handleInputChange('state', value)}
                placeholder="Yucatán"
                maxLength={100}
              />
            </View>
          </View>

          <Text style={[GlobalStyles.label, { marginBottom: 5, marginTop: 15 }]}>Venue Details</Text>
          <TextInput
            style={[GlobalStyles.input, { height: 60, textAlignVertical: 'top' }]}
            value={formData.venue_details}
            onChangeText={(value) => handleInputChange('venue_details', value)}
            placeholder="Parking info, accessibility, etc."
            multiline
          />
        </View>

        {/* Capacity & Pricing */}
        <View style={[GlobalStyles.card, { marginBottom: 20 }]}>
          <Text style={[GlobalStyles.label, { fontWeight: '600', marginBottom: 15 }]}>
            Capacity & Pricing
          </Text>
          
          <Text style={[GlobalStyles.label, { marginBottom: 5 }]}>Max Participants</Text>
          <TextInput
            style={GlobalStyles.input}
            value={formData.max_participants}
            onChangeText={(value) => handleInputChange('max_participants', value)}
            placeholder="50"
            keyboardType="numeric"
          />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[GlobalStyles.label, { marginBottom: 5, marginTop: 15 }]}>Price (MXN)</Text>
              <TextInput
                style={GlobalStyles.input}
                value={formData.price}
                onChangeText={(value) => handleInputChange('price', value)}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[GlobalStyles.label, { marginBottom: 5, marginTop: 15 }]}>Currency</Text>
              <TextInput
                style={GlobalStyles.input}
                value={formData.currency}
                onChangeText={(value) => handleInputChange('currency', value)}
                placeholder="MXN"
                maxLength={3}
              />
            </View>
          </View>
        </View>

        {/* Requirements */}
        <View style={[GlobalStyles.card, { marginBottom: 20 }]}>
          <Text style={[GlobalStyles.label, { fontWeight: '600', marginBottom: 15 }]}>
            Requirements
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[GlobalStyles.label, { marginBottom: 5 }]}>Min Age (months)</Text>
              <TextInput
                style={GlobalStyles.input}
                value={formData.min_age_requirement}
                onChangeText={(value) => handleInputChange('min_age_requirement', value)}
                placeholder="6"
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[GlobalStyles.label, { marginBottom: 5 }]}>Max Age (months)</Text>
              <TextInput
                style={GlobalStyles.input}
                value={formData.max_age_requirement}
                onChangeText={(value) => handleInputChange('max_age_requirement', value)}
                placeholder="120"
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={[GlobalStyles.label, { marginBottom: 5, marginTop: 15 }]}>Special Requirements</Text>
          <TextInput
            style={[GlobalStyles.input, { height: 60, textAlignVertical: 'top' }]}
            value={formData.special_requirements}
            onChangeText={(value) => handleInputChange('special_requirements', value)}
            placeholder="Any special requirements for participants"
            multiline
          />

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15 }}>
            <TouchableOpacity
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                borderWidth: 2,
                borderColor: '#4F8EF7',
                backgroundColor: formData.vaccination_required ? '#4F8EF7' : 'transparent',
                marginRight: 10,
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onPress={() => handleInputChange('vaccination_required', !formData.vaccination_required)}
            >
              {formData.vaccination_required && (
                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
              )}
            </TouchableOpacity>
            <Text style={GlobalStyles.label}>Vaccination Required</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
            <TouchableOpacity
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                borderWidth: 2,
                borderColor: '#4F8EF7',
                backgroundColor: formData.requires_approval ? '#4F8EF7' : 'transparent',
                marginRight: 10,
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onPress={() => handleInputChange('requires_approval', !formData.requires_approval)}
            >
              {formData.requires_approval && (
                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
              )}
            </TouchableOpacity>
            <Text style={GlobalStyles.label}>Requires Approval</Text>
          </View>
        </View>

        {/* Contact Information */}
        <View style={[GlobalStyles.card, { marginBottom: 20 }]}>
          <Text style={[GlobalStyles.label, { fontWeight: '600', marginBottom: 15 }]}>
            Contact Information
          </Text>
          
          <Text style={[GlobalStyles.label, { marginBottom: 5 }]}>Contact Email</Text>
          <TextInput
            style={GlobalStyles.input}
            value={formData.contact_email}
            onChangeText={(value) => handleInputChange('contact_email', value)}
            placeholder="contact@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={[GlobalStyles.label, { marginBottom: 5, marginTop: 15 }]}>Contact Phone</Text>
          <TextInput
            style={GlobalStyles.input}
            value={formData.contact_phone}
            onChangeText={(value) => handleInputChange('contact_phone', value)}
            placeholder="+52 999 123 4567"
            keyboardType="phone-pad"
          />
        </View>

        {/* Additional Information */}
        <View style={[GlobalStyles.card, { marginBottom: 20 }]}>
          <Text style={[GlobalStyles.label, { fontWeight: '600', marginBottom: 15 }]}>
            Additional Information
          </Text>
          
          <Text style={[GlobalStyles.label, { marginBottom: 5 }]}>Additional Info</Text>
          <TextInput
            style={[GlobalStyles.input, { height: 60, textAlignVertical: 'top' }]}
            value={formData.additional_info}
            onChangeText={(value) => handleInputChange('additional_info', value)}
            placeholder="Any additional information for participants"
            multiline
          />

          <Text style={[GlobalStyles.label, { marginBottom: 5, marginTop: 15 }]}>Rules & Guidelines</Text>
          <TextInput
            style={[GlobalStyles.input, { height: 80, textAlignVertical: 'top' }]}
            value={formData.rules_and_guidelines}
            onChangeText={(value) => handleInputChange('rules_and_guidelines', value)}
            placeholder="Event rules and guidelines for participants"
            multiline
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            GlobalStyles.button,
            { marginBottom: 20 },
            loading && { opacity: 0.6 }
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={GlobalStyles.buttonText}>
            {loading ? 'Creating Event...' : 'Create Event'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
