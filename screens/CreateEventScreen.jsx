import React, { useState } from 'react';
import { 
  View, 
  ScrollView, 
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Card,
  Surface,
  Button,
  TextInput,
  HelperText,
  Chip,
  IconButton,
  ActivityIndicator,
  Snackbar,
  Portal,
  Divider,
  RadioButton,
} from 'react-native-paper';
import { Formik } from 'formik';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  FadeIn,
  SlideInUp,
} from 'react-native-reanimated';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { createEvent, uploadEventPhoto, clearError } from '../store/slices/eventsSlice';
import { useAuth } from '../hooks/useAuth';
import { createEventSchema } from '../validation/eventSchemas';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/DesignSystem';

const CreateEventScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.events);
  const [selectedImage, setSelectedImage] = useState(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const formOpacity = useSharedValue(0);

  React.useEffect(() => {
    // Animate header and form
    headerOpacity.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 100 }));
    formOpacity.value = withDelay(400, withSpring(1, { damping: 15, stiffness: 100 }));
  }, []);

  // Clear error when component unmounts
  React.useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const eventCategories = [
    { value: 'meetup', label: 'Dog Meetup' },
    { value: 'training', label: 'Training Workshop' },
    { value: 'adoption', label: 'Adoption Fair' },
    { value: 'competition', label: 'Dog Competition' },
    { value: 'social', label: 'Social Event' },
    { value: 'educational', label: 'Educational Workshop' }
  ];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload photos!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Create the event
      const event = await dispatch(createEvent(values)).unwrap();

      // Upload photo if one was selected
      if (selectedImage && event.id) {
        try {
          await dispatch(uploadEventPhoto({
            eventId: event.id,
            photoData: {
              uri: selectedImage.uri,
              type: 'image/jpeg',
              name: 'event_photo.jpg',
            }
          })).unwrap();
        } catch (photoError) {
          console.log('Photo upload failed:', photoError);
        }
      }

      Alert.alert(
        'Success!',
        `${values.title} has been created successfully!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error) {
      console.error('Error creating event:', error);
      setSnackbarVisible(true);
    } finally {
      setSubmitting(false);
    }
  };

  const renderSelectField = (label, field, options, values, setFieldValue, errors, touched) => (
    <View style={styles.selectField}>
      <Text variant="bodyLarge" style={styles.selectLabel}>{label}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <Chip
            key={option.value}
            mode={values[field] === option.value ? "flat" : "outlined"}
            selected={values[field] === option.value}
            onPress={() => setFieldValue(field, option.value)}
            style={styles.optionChip}
            textStyle={styles.optionChipText}
          >
            {option.label}
          </Chip>
        ))}
      </View>
      {touched[field] && errors[field] && (
        <HelperText type="error" visible={true}>
          {errors[field]}
        </HelperText>
      )}
    </View>
  );

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Modern Header */}
        <Animated.View style={[styles.header, headerAnimatedStyle]} entering={SlideInUp.duration(600)}>
          <Surface style={styles.headerSurface} elevation={2}>
            <View style={styles.headerContent}>
              <IconButton
                icon="arrow-left"
                size={24}
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              />
              <View style={styles.titleContainer}>
                <Text variant="headlineMedium" style={styles.title}>
                  Create New Event
                </Text>
                <Text variant="bodyMedium" style={styles.subtitle}>
                  Fill in the details to create your event
                </Text>
              </View>
            </View>
          </Surface>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Formik
            initialValues={{
              title: '',
              description: '',
              category: 'meetup',
              event_date: '',
              start_time: '',
              end_time: '',
              location: '',
              capacity: '',
              price: '0',
              requirements: '',
              contact_email: '',
              contact_phone: '',
              website: '',
              is_public: true,
              requires_approval: false
            }}
            validationSchema={createEventSchema}
            onSubmit={handleSubmit}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue, isSubmitting }) => (
              <Animated.View style={[styles.formContainer, formAnimatedStyle]} entering={FadeIn.delay(200).duration(600)}>
                {/* Event Photo */}
                <Card style={styles.sectionCard} mode="elevated">
                  <Card.Content>
                    <Text variant="titleLarge" style={styles.sectionTitle}>
                      Event Photo
                    </Text>
                    
                    <View style={styles.photoSection}>
                      {selectedImage ? (
                        <View style={styles.photoContainer}>
                          <Image
                            source={{ uri: selectedImage.uri }}
                            style={styles.eventPhoto}
                          />
                          <Button
                            mode="outlined"
                            onPress={pickImage}
                            style={styles.changePhotoButton}
                            icon="camera"
                          >
                            Change Photo
                          </Button>
                        </View>
                      ) : (
                        <Button
                          mode="outlined"
                          onPress={pickImage}
                          style={styles.photoPlaceholder}
                          icon="camera"
                        >
                          Add Event Photo
                        </Button>
                      )}
                      <Text variant="bodySmall" style={styles.photoHelpText}>
                        Optional: Add a banner photo for your event
                      </Text>
                    </View>
                  </Card.Content>
                </Card>

                {/* Basic Information */}
                <Card style={styles.sectionCard} mode="elevated">
                  <Card.Content>
                    <Text variant="titleLarge" style={styles.sectionTitle}>
                      Basic Information
                    </Text>
                    
                    <TextInput
                      label="Event Title"
                      placeholder="Enter event title"
                      value={values.title}
                      onChangeText={handleChange('title')}
                      onBlur={handleBlur('title')}
                      error={touched.title && errors.title}
                      mode="outlined"
                      style={styles.input}
                    />
                    <HelperText type="error" visible={touched.title && errors.title}>
                      {errors.title}
                    </HelperText>

                    <TextInput
                      label="Description"
                      placeholder="Describe your event..."
                      value={values.description}
                      onChangeText={handleChange('description')}
                      onBlur={handleBlur('description')}
                      error={touched.description && errors.description}
                      mode="outlined"
                      multiline={true}
                      numberOfLines={4}
                      style={styles.input}
                    />
                    <HelperText type="error" visible={touched.description && errors.description}>
                      {errors.description}
                    </HelperText>

                    {renderSelectField('Category', 'category', eventCategories, values, setFieldValue, errors, touched)}
                  </Card.Content>
                </Card>

                {/* Date & Time */}
                <Card style={styles.sectionCard} mode="elevated">
                  <Card.Content>
                    <Text variant="titleLarge" style={styles.sectionTitle}>
                      Date & Time
                    </Text>
                    
                    <TextInput
                      label="Event Date"
                      placeholder="YYYY-MM-DD"
                      value={values.event_date}
                      onChangeText={handleChange('event_date')}
                      onBlur={handleBlur('event_date')}
                      error={touched.event_date && errors.event_date}
                      mode="outlined"
                      style={styles.input}
                    />
                    <HelperText type="error" visible={touched.event_date && errors.event_date}>
                      {errors.event_date}
                    </HelperText>

                    <View style={styles.timeRow}>
                      <View style={styles.halfWidth}>
                        <TextInput
                          label="Start Time"
                          placeholder="HH:MM"
                          value={values.start_time}
                          onChangeText={handleChange('start_time')}
                          onBlur={handleBlur('start_time')}
                          error={touched.start_time && errors.start_time}
                          mode="outlined"
                          style={styles.input}
                        />
                        <HelperText type="error" visible={touched.start_time && errors.start_time}>
                          {errors.start_time}
                        </HelperText>
                      </View>
                      <View style={styles.halfWidth}>
                        <TextInput
                          label="End Time"
                          placeholder="HH:MM"
                          value={values.end_time}
                          onChangeText={handleChange('end_time')}
                          onBlur={handleBlur('end_time')}
                          error={touched.end_time && errors.end_time}
                          mode="outlined"
                          style={styles.input}
                        />
                        <HelperText type="error" visible={touched.end_time && errors.end_time}>
                          {errors.end_time}
                        </HelperText>
                      </View>
                    </View>
                  </Card.Content>
                </Card>

                {/* Location & Capacity */}
                <Card style={styles.sectionCard} mode="elevated">
                  <Card.Content>
                    <Text variant="titleLarge" style={styles.sectionTitle}>
                      Location & Capacity
                    </Text>
                    
                    <TextInput
                      label="Location"
                      placeholder="Enter event location"
                      value={values.location}
                      onChangeText={handleChange('location')}
                      onBlur={handleBlur('location')}
                      error={touched.location && errors.location}
                      mode="outlined"
                      style={styles.input}
                    />
                    <HelperText type="error" visible={touched.location && errors.location}>
                      {errors.location}
                    </HelperText>

                    <TextInput
                      label="Capacity"
                      placeholder="Maximum number of participants"
                      value={values.capacity}
                      onChangeText={handleChange('capacity')}
                      onBlur={handleBlur('capacity')}
                      error={touched.capacity && errors.capacity}
                      mode="outlined"
                      keyboardType="numeric"
                      style={styles.input}
                    />
                    <HelperText type="error" visible={touched.capacity && errors.capacity}>
                      {errors.capacity}
                    </HelperText>

                    <TextInput
                      label="Price (MXN)"
                      placeholder="0"
                      value={values.price}
                      onChangeText={handleChange('price')}
                      onBlur={handleBlur('price')}
                      error={touched.price && errors.price}
                      mode="outlined"
                      keyboardType="numeric"
                      style={styles.input}
                    />
                    <HelperText type="error" visible={touched.price && errors.price}>
                      {errors.price}
                    </HelperText>
                  </Card.Content>
                </Card>

                {/* Contact Information */}
                <Card style={styles.sectionCard} mode="elevated">
                  <Card.Content>
                    <Text variant="titleLarge" style={styles.sectionTitle}>
                      Contact Information
                    </Text>
                    
                    <TextInput
                      label="Contact Email"
                      placeholder="your@email.com"
                      value={values.contact_email}
                      onChangeText={handleChange('contact_email')}
                      onBlur={handleBlur('contact_email')}
                      error={touched.contact_email && errors.contact_email}
                      mode="outlined"
                      keyboardType="email-address"
                      style={styles.input}
                    />
                    <HelperText type="error" visible={touched.contact_email && errors.contact_email}>
                      {errors.contact_email}
                    </HelperText>

                    <TextInput
                      label="Contact Phone"
                      placeholder="+52 123 456 7890"
                      value={values.contact_phone}
                      onChangeText={handleChange('contact_phone')}
                      onBlur={handleBlur('contact_phone')}
                      error={touched.contact_phone && errors.contact_phone}
                      mode="outlined"
                      keyboardType="phone-pad"
                      style={styles.input}
                    />
                    <HelperText type="error" visible={touched.contact_phone && errors.contact_phone}>
                      {errors.contact_phone}
                    </HelperText>

                    <TextInput
                      label="Website (Optional)"
                      placeholder="https://example.com"
                      value={values.website}
                      onChangeText={handleChange('website')}
                      onBlur={handleBlur('website')}
                      error={touched.website && errors.website}
                      mode="outlined"
                      keyboardType="url"
                      style={styles.input}
                    />
                    <HelperText type="error" visible={touched.website && errors.website}>
                      {errors.website}
                    </HelperText>
                  </Card.Content>
                </Card>

                {/* Additional Information */}
                <Card style={styles.sectionCard} mode="elevated">
                  <Card.Content>
                    <Text variant="titleLarge" style={styles.sectionTitle}>
                      Additional Information
                    </Text>
                    
                    <TextInput
                      label="Requirements"
                      placeholder="Any special requirements for participants..."
                      value={values.requirements}
                      onChangeText={handleChange('requirements')}
                      onBlur={handleBlur('requirements')}
                      error={touched.requirements && errors.requirements}
                      mode="outlined"
                      multiline={true}
                      numberOfLines={3}
                      style={styles.input}
                    />
                    <HelperText type="error" visible={touched.requirements && errors.requirements}>
                      {errors.requirements}
                    </HelperText>

                    <View style={styles.radioGroup}>
                      <Text variant="bodyLarge" style={styles.radioLabel}>Public Event</Text>
                      <View style={styles.radioOptions}>
                        <View style={styles.radioOption}>
                          <RadioButton
                            value="true"
                            status={values.is_public === true ? 'checked' : 'unchecked'}
                            onPress={() => setFieldValue('is_public', true)}
                          />
                          <Text variant="bodyMedium">Yes</Text>
                        </View>
                        <View style={styles.radioOption}>
                          <RadioButton
                            value="false"
                            status={values.is_public === false ? 'checked' : 'unchecked'}
                            onPress={() => setFieldValue('is_public', false)}
                          />
                          <Text variant="bodyMedium">No</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.radioGroup}>
                      <Text variant="bodyLarge" style={styles.radioLabel}>Requires Approval</Text>
                      <View style={styles.radioOptions}>
                        <View style={styles.radioOption}>
                          <RadioButton
                            value="true"
                            status={values.requires_approval === true ? 'checked' : 'unchecked'}
                            onPress={() => setFieldValue('requires_approval', true)}
                          />
                          <Text variant="bodyMedium">Yes</Text>
                        </View>
                        <View style={styles.radioOption}>
                          <RadioButton
                            value="false"
                            status={values.requires_approval === false ? 'checked' : 'unchecked'}
                            onPress={() => setFieldValue('requires_approval', false)}
                          />
                          <Text variant="bodyMedium">No</Text>
                        </View>
                      </View>
                    </View>
                  </Card.Content>
                </Card>

                {/* Submit Button */}
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  style={styles.submitButton}
                  icon="plus"
                >
                  {isSubmitting ? 'Creating Event...' : 'Create Event'}
                </Button>
              </Animated.View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Snackbar for errors */}
      <Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={4000}
          action={{
            label: 'Dismiss',
            onPress: () => setSnackbarVisible(false),
          }}
        >
          {error || 'Something went wrong'}
        </Snackbar>
      </Portal>
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
  },
  
  headerSurface: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background.primary,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  backButton: {
    marginRight: Spacing.lg,
  },
  
  titleContainer: {
    flex: 1,
  },
  
  title: {
    color: Colors.text.primary,
    marginBottom: -Spacing.xs,
  },
  
  subtitle: {
    color: Colors.text.secondary,
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
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  
  input: {
    marginBottom: Spacing.sm,
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
    height: 112,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  
  changePhotoButton: {
    paddingHorizontal: Spacing.lg,
  },
  
  photoPlaceholder: {
    width: 200,
    height: 112,
    marginBottom: Spacing.md,
  },
  
  photoHelpText: {
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  
  halfWidth: {
    flex: 1,
  },
  
  selectField: {
    marginBottom: Spacing.lg,
  },
  
  selectLabel: {
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  
  optionChip: {
    marginBottom: Spacing.sm,
  },
  
  optionChipText: {
    fontSize: Typography.fontSize.sm,
  },
  
  radioGroup: {
    marginBottom: Spacing.lg,
  },
  
  radioLabel: {
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  
  radioOptions: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  
  submitButton: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
});

export default CreateEventScreen;