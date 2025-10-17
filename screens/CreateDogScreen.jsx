import React, { useState } from 'react';
import { 
  View, 
  ScrollView, 
  Alert, 
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
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
import { createDog, uploadDogPhoto, clearError } from '../store/slices/dogsSlice';
import { useAuth } from '../hooks/useAuth';
import { createDogSchema } from '../validation/dogSchemas';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../styles/DesignSystem';

const CreateDogScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.dogs);
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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload photos!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Create the dog
      const dog = await dispatch(createDog(values)).unwrap();

      // Upload photo if one was selected
      if (selectedImage && dog.id) {
        try {
          await dispatch(uploadDogPhoto({
            dogId: dog.id,
            photoData: {
              uri: selectedImage.uri,
              type: 'image/jpeg',
              name: 'dog_photo.jpg',
            }
          })).unwrap();
        } catch (photoError) {
          console.log('Photo upload failed:', photoError);
        }
      }

      Alert.alert(
        'Success!',
        `${values.name} has been added to your profile!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error) {
      console.error('Error creating dog:', error);
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

  const renderBooleanField = (label, field, values, setFieldValue, errors, touched) => (
    <View style={styles.selectField}>
      <Text variant="bodyLarge" style={styles.selectLabel}>{label}</Text>
      <View style={styles.optionsContainer}>
        {[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'not_sure', label: 'Not sure' }
        ].map((option) => (
          <Chip
            key={option.label}
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
              <Text variant="headlineMedium" style={styles.title}>
                Add New Dog
              </Text>
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
              name: '',
              age: '',
              breed: '',
              gender: '',
              size: '',
              energy_level: '',
              good_with_kids: '',
              good_with_dogs: '',
              good_with_cats: '',
              is_vaccinated: false,
              is_spayed_neutered: false,
              description: '',
              location: ''
            }}
            validationSchema={createDogSchema}
            onSubmit={handleSubmit}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue, isSubmitting }) => (
              <Animated.View style={[styles.formContainer, formAnimatedStyle]} entering={FadeIn.delay(200).duration(600)}>
                {/* Photo Upload */}
                <Card style={styles.sectionCard} mode="elevated">
                  <Card.Content>
                    <Text variant="titleLarge" style={styles.sectionTitle}>
                      Dog Photo
                    </Text>
                    
                    <View style={styles.photoSection}>
                      {selectedImage ? (
                        <View style={styles.photoContainer}>
                          <Image
                            source={{ uri: selectedImage.uri }}
                            style={styles.dogPhoto}
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
                          Add Photo
                        </Button>
                      )}
                      <Text variant="bodySmall" style={styles.photoHelpText}>
                        Optional: Add a photo of your dog
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
                      label="Dog Name"
                      placeholder="Enter your dog's name"
                      value={values.name}
                      onChangeText={handleChange('name')}
                      onBlur={handleBlur('name')}
                      error={touched.name && errors.name}
                      mode="outlined"
                      style={styles.input}
                    />
                    <HelperText type="error" visible={touched.name && errors.name}>
                      {errors.name}
                    </HelperText>

                    <TextInput
                      label="Age (years)"
                      placeholder="2"
                      value={values.age}
                      onChangeText={handleChange('age')}
                      onBlur={handleBlur('age')}
                      error={touched.age && errors.age}
                      mode="outlined"
                      keyboardType="numeric"
                      style={styles.input}
                    />
                    <HelperText type="error" visible={touched.age && errors.age}>
                      {errors.age}
                    </HelperText>

                    <TextInput
                      label="Breed"
                      placeholder="Golden Retriever"
                      value={values.breed}
                      onChangeText={handleChange('breed')}
                      onBlur={handleBlur('breed')}
                      error={touched.breed && errors.breed}
                      mode="outlined"
                      style={styles.input}
                    />
                    <HelperText type="error" visible={touched.breed && errors.breed}>
                      {errors.breed}
                    </HelperText>

                    {renderSelectField('Gender', 'gender', [
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' }
                    ], values, setFieldValue, errors, touched)}

                    {renderSelectField('Size', 'size', [
                      { value: 'small', label: 'Small' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'large', label: 'Large' },
                      { value: 'extra_large', label: 'Extra Large' }
                    ], values, setFieldValue, errors, touched)}

                    {renderSelectField('Energy Level', 'energy_level', [
                      { value: 'low', label: 'Low' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'high', label: 'High' }
                    ], values, setFieldValue, errors, touched)}
                  </Card.Content>
                </Card>

                {/* Social Behavior */}
                <Card style={styles.sectionCard} mode="elevated">
                  <Card.Content>
                    <Text variant="titleLarge" style={styles.sectionTitle}>
                      Social Behavior
                    </Text>
                    
                    {renderBooleanField('Good with Kids', 'good_with_kids', values, setFieldValue, errors, touched)}
                    {renderBooleanField('Good with Dogs', 'good_with_dogs', values, setFieldValue, errors, touched)}
                    {renderBooleanField('Good with Cats', 'good_with_cats', values, setFieldValue, errors, touched)}
                  </Card.Content>
                </Card>

                {/* Health Information */}
                <Card style={styles.sectionCard} mode="elevated">
                  <Card.Content>
                    <Text variant="titleLarge" style={styles.sectionTitle}>
                      Health Information
                    </Text>
                    
                    <View style={styles.radioGroup}>
                      <Text variant="bodyLarge" style={styles.radioLabel}>Vaccinated</Text>
                      <View style={styles.radioOptions}>
                        <View style={styles.radioOption}>
                          <RadioButton
                            value="true"
                            status={values.is_vaccinated === true ? 'checked' : 'unchecked'}
                            onPress={() => setFieldValue('is_vaccinated', true)}
                          />
                          <Text variant="bodyMedium">Yes</Text>
                        </View>
                        <View style={styles.radioOption}>
                          <RadioButton
                            value="false"
                            status={values.is_vaccinated === false ? 'checked' : 'unchecked'}
                            onPress={() => setFieldValue('is_vaccinated', false)}
                          />
                          <Text variant="bodyMedium">No</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.radioGroup}>
                      <Text variant="bodyLarge" style={styles.radioLabel}>Spayed/Neutered</Text>
                      <View style={styles.radioOptions}>
                        <View style={styles.radioOption}>
                          <RadioButton
                            value="true"
                            status={values.is_spayed_neutered === true ? 'checked' : 'unchecked'}
                            onPress={() => setFieldValue('is_spayed_neutered', true)}
                          />
                          <Text variant="bodyMedium">Yes</Text>
                        </View>
                        <View style={styles.radioOption}>
                          <RadioButton
                            value="false"
                            status={values.is_spayed_neutered === false ? 'checked' : 'unchecked'}
                            onPress={() => setFieldValue('is_spayed_neutered', false)}
                          />
                          <Text variant="bodyMedium">No</Text>
                        </View>
                      </View>
                    </View>
                  </Card.Content>
                </Card>

                {/* Additional Information */}
                <Card style={styles.sectionCard} mode="elevated">
                  <Card.Content>
                    <Text variant="titleLarge" style={styles.sectionTitle}>
                      Additional Information
                    </Text>
                    
                    <TextInput
                      label="Description"
                      placeholder="Tell us about your dog's personality, likes, and special traits..."
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

                    <TextInput
                      label="Location"
                      placeholder="City, State"
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
                  {isSubmitting ? 'Creating Profile...' : 'Create Dog Profile'}
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
  
  title: {
    color: Colors.text.primary,
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
  
  dogPhoto: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  
  changePhotoButton: {
    paddingHorizontal: Spacing.lg,
  },
  
  photoPlaceholder: {
    width: 120,
    height: 120,
    marginBottom: Spacing.md,
  },
  
  photoHelpText: {
    color: Colors.text.tertiary,
    textAlign: 'center',
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

export default CreateDogScreen;
