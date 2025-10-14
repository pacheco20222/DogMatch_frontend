import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  FadeIn,
  SlideInUp,
} from 'react-native-reanimated';
import { AuthContext } from '../auth/AuthContext';
import { apiFetch } from '../api/client';
import AnimatedButton from '../components/AnimatedButton';
import AnimatedInput from '../components/AnimatedInput';
import AnimatedCard from '../components/AnimatedCard';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/DesignSystem';

const CreateEventScreen = ({ navigation }) => {
  const { accessToken } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
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

  // Animation values
  const headerOpacity = useSharedValue(0);
  const formOpacity = useSharedValue(0);

  React.useEffect(() => {
    // Animate header and form
    headerOpacity.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 100 }));
    formOpacity.value = withDelay(400, withSpring(1, { damping: 15, stiffness: 100 }));
  }, []);

  const eventCategories = [
    { value: 'meetup', label: 'Dog Meetup', icon: '🐕' },
    { value: 'training', label: 'Training Workshop', icon: '🎓' },
    { value: 'adoption', label: 'Adoption Fair', icon: '🏠' },
    { value: 'competition', label: 'Dog Competition', icon: '🏆' },
    { value: 'social', label: 'Social Event', icon: '🎉' },
    { value: 'educational', label: 'Educational Workshop', icon: '📚' }
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

  const handlePickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload photos!');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9], // Good aspect ratio for event banners
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadEventPhoto = async (eventId, imageAsset) => {
    try {
      setUploadingPhoto(true);

      // Create form data
      const formData = new FormData();
      formData.append('photo', {
        uri: imageAsset.uri,
        type: 'image/jpeg',
        name: 'event_banner.jpg',
      });

      // Upload to backend
      const response = await fetch(`https://dogmatch-backend.onrender.com/api/s3/upload/event-photo/${eventId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('Event photo upload endpoint not available yet - skipping photo upload');
          return; // Silently skip if endpoint doesn't exist
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      console.log('Event photo uploaded successfully:', result);
      
    } catch (error) {
      console.log('Event photo upload failed (optional feature):', error.message);
      // Don't show error to user as event was created successfully
      // Photo upload is optional and endpoint might not be deployed yet
    } finally {
      setUploadingPhoto(false);
    }
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

      // Upload photo if one was selected
      if (selectedImage && response.event && response.event.id) {
        await uploadEventPhoto(response.event.id, selectedImage);
      }

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

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Modern Header */}
        <Animated.View style={[styles.header, headerAnimatedStyle]} entering={SlideInUp.duration(600)}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Create New Event</Text>
            <Text style={styles.subtitle}>Fill in the details to create your event</Text>
          </View>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.formContainer, formAnimatedStyle]} entering={FadeIn.delay(200).duration(600)}>
            {/* Basic Information */}
            <AnimatedCard variant="elevated" style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <AnimatedInput
                label="Event Title"
                placeholder="Enter event title"
                value={formData.title}
                onChangeText={(value) => handleInputChange('title', value)}
                maxLength={200}
              />

              <AnimatedInput
                label="Description"
                placeholder="Describe your event..."
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                multiline={true}
                numberOfLines={4}
                maxLength={2000}
              />

              <View style={styles.categorySection}>
                <Text style={styles.categoryLabel}>Category</Text>
                <View style={styles.categoryGrid}>
                  {eventCategories.map((category) => (
                    <TouchableOpacity
                      key={category.value}
                      style={[
                        styles.categoryButton,
                        formData.category === category.value && styles.categoryButtonSelected
                      ]}
                      onPress={() => handleInputChange('category', category.value)}
                    >
                      <Text style={styles.categoryIcon}>{category.icon}</Text>
                      <Text style={[
                        styles.categoryText,
                        formData.category === category.value && styles.categoryTextSelected
                      ]}>
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </AnimatedCard>

            {/* Event Photo */}
            <AnimatedCard variant="elevated" style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Event Banner Photo</Text>
              
              <View style={styles.photoSection}>
                {selectedImage ? (
                  <View style={styles.photoContainer}>
                    <Image
                      source={{ uri: selectedImage.uri }}
                      style={styles.eventPhoto}
                    />
                    <TouchableOpacity
                      style={styles.changePhotoButton}
                      onPress={handlePickImage}
                    >
                      <Text style={styles.changePhotoText}>📷</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.photoPlaceholder}
                    onPress={handlePickImage}
                  >
                    <Text style={styles.photoIcon}>📸</Text>
                    <Text style={styles.photoText}>Add Banner Photo</Text>
                    <Text style={styles.photoSubtext}>Optional: Add a banner image for your event</Text>
                  </TouchableOpacity>
                )}
              </View>
            </AnimatedCard>

            {/* Date & Time */}
            <AnimatedCard variant="elevated" style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Date & Time</Text>
              
              <AnimatedInput
                label="Event Date & Time"
                placeholder="2024-12-25T14:00:00"
                value={formData.event_date}
                onChangeText={(value) => handleInputChange('event_date', value)}
              />
              <Text style={styles.helpText}>
                Format: YYYY-MM-DDTHH:MM:SS (e.g., 2024-12-25T14:00:00)
              </Text>

              <AnimatedInput
                label="Duration (hours)"
                placeholder="2.5"
                value={formData.duration_hours}
                onChangeText={(value) => handleInputChange('duration_hours', value)}
                keyboardType="numeric"
              />
            </AnimatedCard>

            {/* Location */}
            <AnimatedCard variant="elevated" style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Location</Text>
              
              <AnimatedInput
                label="Address/Venue"
                placeholder="Enter full address or venue name"
                value={formData.location}
                onChangeText={(value) => handleInputChange('location', value)}
                maxLength={300}
              />

              <View style={styles.rowContainer}>
                <View style={styles.halfWidth}>
                  <AnimatedInput
                    label="City"
                    placeholder="Mérida"
                    value={formData.city}
                    onChangeText={(value) => handleInputChange('city', value)}
                    maxLength={100}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <AnimatedInput
                    label="State"
                    placeholder="Yucatán"
                    value={formData.state}
                    onChangeText={(value) => handleInputChange('state', value)}
                    maxLength={100}
                  />
                </View>
              </View>

              <AnimatedInput
                label="Venue Details"
                placeholder="Additional venue information..."
                value={formData.venue_details}
                onChangeText={(value) => handleInputChange('venue_details', value)}
                multiline={true}
                numberOfLines={3}
                maxLength={500}
              />
            </AnimatedCard>

            {/* Event Details */}
            <AnimatedCard variant="elevated" style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Event Details</Text>
              
              <View style={styles.rowContainer}>
                <View style={styles.halfWidth}>
                  <AnimatedInput
                    label="Max Participants"
                    placeholder="50"
                    value={formData.max_participants}
                    onChangeText={(value) => handleInputChange('max_participants', value)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <AnimatedInput
                    label="Price"
                    placeholder="0"
                    value={formData.price}
                    onChangeText={(value) => handleInputChange('price', value)}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.rowContainer}>
                <View style={styles.halfWidth}>
                  <AnimatedInput
                    label="Min Age Requirement"
                    placeholder="1"
                    value={formData.min_age_requirement}
                    onChangeText={(value) => handleInputChange('min_age_requirement', value)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <AnimatedInput
                    label="Max Age Requirement"
                    placeholder="15"
                    value={formData.max_age_requirement}
                    onChangeText={(value) => handleInputChange('max_age_requirement', value)}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <AnimatedInput
                label="Special Requirements"
                placeholder="Any special requirements for participants..."
                value={formData.special_requirements}
                onChangeText={(value) => handleInputChange('special_requirements', value)}
                multiline={true}
                numberOfLines={3}
                maxLength={500}
              />
            </AnimatedCard>

            {/* Contact Information */}
            <AnimatedCard variant="elevated" style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              
              <AnimatedInput
                label="Contact Email"
                placeholder="your@email.com"
                value={formData.contact_email}
                onChangeText={(value) => handleInputChange('contact_email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <AnimatedInput
                label="Contact Phone"
                placeholder="+52 999 123 4567"
                value={formData.contact_phone}
                onChangeText={(value) => handleInputChange('contact_phone', value)}
                keyboardType="phone-pad"
              />
            </AnimatedCard>

            {/* Additional Information */}
            <AnimatedCard variant="elevated" style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Additional Information</Text>
              
              <AnimatedInput
                label="Additional Info"
                placeholder="Any additional information for participants..."
                value={formData.additional_info}
                onChangeText={(value) => handleInputChange('additional_info', value)}
                multiline={true}
                numberOfLines={4}
                maxLength={1000}
              />

              <AnimatedInput
                label="Rules & Guidelines"
                placeholder="Event rules and guidelines..."
                value={formData.rules_and_guidelines}
                onChangeText={(value) => handleInputChange('rules_and_guidelines', value)}
                multiline={true}
                numberOfLines={4}
                maxLength={1000}
              />
            </AnimatedCard>

            {/* Submit Button */}
            <AnimatedButton
              title={loading ? 'Creating Event...' : 'Create Event'}
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              size="large"
              style={styles.submitButton}
            />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  
  keyboardAvoidingView: {
    flex: 1,
  },
  
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginTop: -Spacing.xs,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    padding: Spacing.lg,
  },
  
  formContainer: {
    flex: 1,
  },
  
  sectionCard: {
    marginBottom: Spacing.lg,
  },
  
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  
  categorySection: {
    marginTop: Spacing.lg,
  },
  
  categoryLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  categoryButton: {
    width: '48%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.neutral[300],
    backgroundColor: Colors.background.primary,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  
  categoryButtonSelected: {
    borderColor: Colors.primary[500],
    backgroundColor: Colors.primary[50],
  },
  
  categoryIcon: {
    fontSize: Typography.fontSize.xl,
    marginBottom: Spacing.xs,
  },
  
  categoryText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  
  categoryTextSelected: {
    color: Colors.primary[600],
  },
  
  photoSection: {
    alignItems: 'center',
  },
  
  photoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  
  eventPhoto: {
    width: 200,
    height: 112, // 16:9 aspect ratio
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  
  changePhotoButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.full,
  },
  
  changePhotoText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.inverse,
    fontWeight: Typography.fontWeight.medium,
  },
  
  photoPlaceholder: {
    width: 200,
    height: 112,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral[300],
    borderStyle: 'dashed',
    marginBottom: Spacing.md,
  },
  
  photoIcon: {
    fontSize: Typography.fontSize['2xl'],
    marginBottom: Spacing.sm,
  },
  
  photoText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  
  photoSubtext: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  
  helpText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  halfWidth: {
    flex: 0.48,
  },
  
  submitButton: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
});

export default CreateEventScreen;
