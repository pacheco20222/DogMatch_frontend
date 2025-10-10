import React, { useState, useContext } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
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

const CreateDogScreen = ({ navigation }) => {
  const { accessToken } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    age_months: '',
    breed: '',
    gender: '',
    size: '',
    weight: '',
    color: '',
    energy_level: '',
    good_with_kids: null,
    good_with_dogs: null,
    good_with_cats: null,
    is_vaccinated: false,
    is_neutered: null,
    description: '',
    location: ''
  });

  // Animation values
  const headerOpacity = useSharedValue(0);
  const formOpacity = useSharedValue(0);

  React.useEffect(() => {
    // Animate header and form
    headerOpacity.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 100 }));
    formOpacity.value = withDelay(400, withSpring(1, { damping: 15, stiffness: 100 }));
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

  const uploadPhoto = async (dogId, imageUri) => {
    const formData = new FormData();
    formData.append('photo', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'dog_photo.jpg',
    });
    formData.append('is_primary', 'true');

    const response = await fetch(`https://dogmatch-backend.onrender.com/api/dogs/${dogId}/photos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload photo');
    }

    return response.json();
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Dog name is required');
      return;
    }
    if (!formData.gender) {
      Alert.alert('Error', 'Please select gender');
      return;
    }
    if (!formData.size) {
      Alert.alert('Error', 'Please select size');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare data for API
      const submitData = {
        name: formData.name.trim(),
        gender: formData.gender,
        size: formData.size,
        age: formData.age ? parseInt(formData.age) : null,
        age_months: formData.age_months ? parseInt(formData.age_months) : null,
        breed: formData.breed.trim() || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        color: formData.color.trim() || null,
        energy_level: formData.energy_level || null,
        good_with_kids: formData.good_with_kids,
        good_with_dogs: formData.good_with_dogs,
        good_with_cats: formData.good_with_cats,
        is_vaccinated: formData.is_vaccinated,
        is_neutered: formData.is_neutered,
        description: formData.description.trim() || null,
        location: formData.location.trim() || null
      };

      const response = await apiFetch('/api/dogs', {
        method: 'POST',
        token: accessToken,
        body: submitData
      });

      // Upload photo if one was selected
      if (selectedImage && response.Dog && response.Dog.id) {
        try {
          await uploadPhoto(response.Dog.id, selectedImage.uri);
        } catch (photoError) {
          console.log('Photo upload failed:', photoError);
        }
      }

      Alert.alert(
        'Success!',
        `${formData.name} has been added to your profile!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to create dog profile');
    } finally {
      setLoading(false);
    }
  };

  const renderSelectField = (label, field, options) => (
    <View style={styles.selectField}>
      <Text style={styles.selectLabel}>{label}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionButton,
              formData[field] === option.value && styles.optionButtonSelected
            ]}
            onPress={() => handleInputChange(field, option.value)}
          >
            <Text style={[
              styles.optionText,
              formData[field] === option.value && styles.optionTextSelected
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderBooleanField = (label, field) => (
    <View style={styles.selectField}>
      <Text style={styles.selectLabel}>{label}</Text>
      <View style={styles.optionsContainer}>
        {[
          { value: true, label: 'Yes' },
          { value: false, label: 'No' },
          { value: null, label: 'Not sure' }
        ].map((option) => (
          <TouchableOpacity
            key={option.label}
            style={[
              styles.optionButton,
              formData[field] === option.value && styles.optionButtonSelected
            ]}
            onPress={() => handleInputChange(field, option.value)}
          >
            <Text style={[
              styles.optionText,
              formData[field] === option.value && styles.optionTextSelected
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

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
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Add New Dog</Text>
          </View>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.formContainer, formAnimatedStyle]} entering={FadeIn.delay(200).duration(600)}>
            {/* Photo Upload */}
            <AnimatedCard variant="elevated" style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Dog Photo</Text>
              
              <View style={styles.photoSection}>
                {selectedImage ? (
                  <View style={styles.photoContainer}>
                    <Image
                      source={{ uri: selectedImage.uri }}
                      style={styles.dogPhoto}
                    />
                    <AnimatedButton
                      title="Change Photo"
                      onPress={pickImage}
                      variant="outline"
                      size="small"
                      style={styles.changePhotoButton}
                    />
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.photoPlaceholder}
                    onPress={pickImage}
                  >
                    <Text style={styles.photoIcon}>📷</Text>
                    <Text style={styles.photoText}>Add Photo</Text>
                  </TouchableOpacity>
                )}
                <Text style={styles.photoHelpText}>
                  Optional: Add a photo of your dog
                </Text>
              </View>
            </AnimatedCard>

            {/* Basic Information */}
            <AnimatedCard variant="elevated" style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <AnimatedInput
                label="Dog Name"
                placeholder="Enter your dog's name"
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                maxLength={50}
              />

              <View style={styles.rowContainer}>
                <View style={styles.halfWidth}>
                  <AnimatedInput
                    label="Age (years)"
                    placeholder="2"
                    value={formData.age}
                    onChangeText={(value) => handleInputChange('age', value)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <AnimatedInput
                    label="Age (months)"
                    placeholder="6"
                    value={formData.age_months}
                    onChangeText={(value) => handleInputChange('age_months', value)}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <AnimatedInput
                label="Breed"
                placeholder="Golden Retriever"
                value={formData.breed}
                onChangeText={(value) => handleInputChange('breed', value)}
                maxLength={100}
              />

              <AnimatedInput
                label="Color"
                placeholder="Golden"
                value={formData.color}
                onChangeText={(value) => handleInputChange('color', value)}
                maxLength={50}
              />

              <AnimatedInput
                label="Weight (kg)"
                placeholder="25.5"
                value={formData.weight}
                onChangeText={(value) => handleInputChange('weight', value)}
                keyboardType="numeric"
              />

              {renderSelectField('Gender', 'gender', [
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' }
              ])}

              {renderSelectField('Size', 'size', [
                { value: 'small', label: 'Small' },
                { value: 'medium', label: 'Medium' },
                { value: 'large', label: 'Large' },
                { value: 'extra_large', label: 'Extra Large' }
              ])}

              {renderSelectField('Energy Level', 'energy_level', [
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' }
              ])}
            </AnimatedCard>

            {/* Social Behavior */}
            <AnimatedCard variant="elevated" style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Social Behavior</Text>
              
              {renderBooleanField('Good with Kids', 'good_with_kids')}
              {renderBooleanField('Good with Dogs', 'good_with_dogs')}
              {renderBooleanField('Good with Cats', 'good_with_cats')}
            </AnimatedCard>

            {/* Health Information */}
            <AnimatedCard variant="elevated" style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Health Information</Text>
              
              {renderBooleanField('Vaccinated', 'is_vaccinated')}
              {renderBooleanField('Neutered/Spayed', 'is_neutered')}
            </AnimatedCard>

            {/* Additional Information */}
            <AnimatedCard variant="elevated" style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Additional Information</Text>
              
              <AnimatedInput
                label="Description"
                placeholder="Tell us about your dog's personality, likes, and special traits..."
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                multiline={true}
                numberOfLines={4}
                maxLength={500}
              />

              <AnimatedInput
                label="Location"
                placeholder="City, State"
                value={formData.location}
                onChangeText={(value) => handleInputChange('location', value)}
                maxLength={100}
              />
            </AnimatedCard>

            {/* Submit Button */}
            <AnimatedButton
              title={loading ? 'Creating Profile...' : 'Create Dog Profile'}
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
  },
  
  backButton: {
    marginRight: Spacing.lg,
  },
  
  backButtonText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.primary[500],
    fontWeight: Typography.fontWeight.medium,
  },
  
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
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
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
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
    borderRadius: BorderRadius.full,
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
    marginBottom: Spacing.xs,
  },
  
  photoText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  
  photoHelpText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  halfWidth: {
    flex: 0.48,
  },
  
  selectField: {
    marginBottom: Spacing.lg,
  },
  
  selectLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  
  optionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.neutral[300],
    backgroundColor: Colors.background.primary,
  },
  
  optionButtonSelected: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  
  optionText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
  },
  
  optionTextSelected: {
    color: Colors.text.inverse,
  },
  
  submitButton: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
});

export default CreateDogScreen;
