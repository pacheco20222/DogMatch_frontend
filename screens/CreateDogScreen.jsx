import React, { useState } from 'react';
import { 
  View, 
  ScrollView, 
  Alert, 
  Image,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Formik } from 'formik';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, Camera, Check } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { createDog, uploadDogPhoto, clearError } from '../store/slices/dogsSlice';
import { createDogSchema } from '../validation/dogSchemas';
import { useTheme } from '../theme/ThemeContext';
import { logger } from '../utils/logger';
import GlassCard from '../components/glass/GlassCard';
import GlassInput from '../components/glass/GlassInput';
import GlassButton from '../components/glass/GlassButton';

const CreateDogScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.dogs);
  const [selectedImage, setSelectedImage] = useState(null);
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

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
      mediaTypes: ['images'],
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
      // Process personality: convert comma-separated string to array
      const personalityArray = values.personality
        ? values.personality.split(',').map(trait => trait.trim()).filter(trait => trait.length > 0)
        : [];

      // Create the dog with processed personality
      const dogData = {
        ...values,
        personality: personalityArray
      };

      const dog = await dispatch(createDog(dogData)).unwrap();

      // Upload photo if one was selected
      if (selectedImage && dog.id) {
        logger.log('Uploading photo for dog:', dog.id);
        try {
          const photoResult = await dispatch(uploadDogPhoto({
            dogId: dog.id,
            photoData: {
              uri: selectedImage.uri,
              type: 'image/jpeg',
              name: 'dog_photo.jpg',
            }
          })).unwrap();
          logger.log('Photo upload success:', photoResult);
        } catch (photoError) {
          logger.error('Photo upload failed:', photoError);
          Alert.alert('Photo Upload Failed', 'The dog was created but the photo failed to upload. You can add a photo later.');
        }
      } else {
        logger.log('No photo selected or dog.id missing:', { selectedImage: !!selectedImage, dogId: dog?.id });
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
      logger.error('Error creating dog:', error);
      Alert.alert('Error', error.message || 'Failed to create dog profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderSelectField = (label, field, options, values, setFieldValue, errors, touched) => (
    <View className="mb-4">
      <Text className={`text-base font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {label}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => setFieldValue(field, option.value)}
            className={`px-4 py-2.5 rounded-xl ${values[field] === option.value
              ? (isDark ? 'bg-primary-500' : 'bg-primary-500')
              : (isDark ? 'bg-white/10 border border-white/20' : 'bg-gray-100 border border-gray-300')
            }`}
          >
            <Text className={`font-medium ${values[field] === option.value
              ? 'text-white'
              : (isDark ? 'text-gray-300' : 'text-gray-700')
            }`}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {touched[field] && errors[field] && (
        <Text className="text-error-500 text-sm mt-1">{errors[field]}</Text>
      )}
    </View>
  );

  const renderBooleanField = (label, field, values, setFieldValue, errors, touched) => (
    <View className="mb-4">
      <Text className={`text-base font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {label}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'not_sure', label: 'Not sure' }
        ].map((option) => (
          <TouchableOpacity
            key={option.label}
            onPress={() => setFieldValue(field, option.value)}
            className={`px-4 py-2.5 rounded-xl ${values[field] === option.value
              ? (isDark ? 'bg-primary-500' : 'bg-primary-500')
              : (isDark ? 'bg-white/10 border border-white/20' : 'bg-gray-100 border border-gray-300')
            }`}
          >
            <Text className={`font-medium ${values[field] === option.value
              ? 'text-white'
              : (isDark ? 'text-gray-300' : 'text-gray-700')
            }`}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {touched[field] && errors[field] && (
        <Text className="text-error-500 text-sm mt-1">{errors[field]}</Text>
      )}
    </View>
  );

  const renderRadioGroup = (label, field, values, setFieldValue) => (
    <View className="mb-4">
      <Text className={`text-base font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {label}
      </Text>
      <View className="flex-row gap-4">
        {[{ value: true, label: 'Yes' }, { value: false, label: 'No' }].map((option) => (
          <TouchableOpacity
            key={option.label}
            onPress={() => setFieldValue(field, option.value)}
            className="flex-row items-center gap-2"
          >
            <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
              values[field] === option.value
                ? 'border-primary-500'
                : (isDark ? 'border-gray-500' : 'border-gray-400')
            }`}>
              {values[field] === option.value && (
                <View className="w-2.5 h-2.5 rounded-full bg-primary-500" />
              )}
            </View>
            <Text className={isDark ? 'text-gray-300' : 'text-gray-700'}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View className={`flex-1 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
      {/* Header */}
      <View className="px-6 pt-4 pb-3 flex-row items-center" style={{ paddingTop: insets.top + 16 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <ArrowLeft size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Add New Dog
        </Text>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Formik
            initialValues={{
              name: '',
              age_years: '',
              breed: '',
              gender: '',
              size: '',
              weight: '',
              personality: '',
              energy_level: '',
              good_with_kids: '',
              good_with_dogs: '',
              good_with_cats: '',
              is_vaccinated: false,
              is_neutered: false,
              description: '',
              location: ''
            }}
            validationSchema={createDogSchema}
            onSubmit={handleSubmit}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue, isSubmitting }) => (
              <Animated.View entering={FadeInDown.delay(200).duration(600)}>
                {/* Photo Upload */}
                <GlassCard className="mb-4">
                  <Text className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Dog Photo
                  </Text>
                  
                  <View className="items-center">
                    {selectedImage ? (
                      <View className="items-center">
                        <Image
                          source={{ uri: selectedImage.uri }}
                          className="w-32 h-32 rounded-full mb-4"
                        />
                        <TouchableOpacity
                          onPress={pickImage}
                          className={`flex-row items-center px-6 py-3 rounded-xl ${isDark ? 'bg-white/10 border border-white/20' : 'bg-gray-100 border border-gray-300'}`}
                        >
                          <Camera size={20} color={isDark ? '#fff' : '#000'} />
                          <Text className={`ml-2 font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Change Photo
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={pickImage}
                        className={`w-32 h-32 rounded-full items-center justify-center ${isDark ? 'bg-white/10 border-2 border-dashed border-white/30' : 'bg-gray-100 border-2 border-dashed border-gray-300'}`}
                      >
                        <Camera size={40} color={isDark ? '#9CA3AF' : '#6B7280'} />
                        <Text className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Add Photo
                        </Text>
                      </TouchableOpacity>
                    )}
                    <Text className={`mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Optional: Add a photo of your dog
                    </Text>
                  </View>
                </GlassCard>

                {/* Basic Information */}
                <GlassCard className="mb-4">
                  <Text className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Basic Information
                  </Text>
                  
                  <GlassInput
                    label="Dog Name"
                    placeholder="Enter your dog's name"
                    value={values.name}
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                    error={touched.name && errors.name ? errors.name : ''}
                  />

                  <GlassInput
                    label="Age (years)"
                    placeholder="2"
                    value={values.age_years}
                    onChangeText={handleChange('age_years')}
                    onBlur={handleBlur('age_years')}
                    keyboardType="numeric"
                    error={touched.age_years && errors.age_years ? errors.age_years : ''}
                  />

                  <GlassInput
                    label="Breed"
                    placeholder="Golden Retriever"
                    value={values.breed}
                    onChangeText={handleChange('breed')}
                    onBlur={handleBlur('breed')}
                    error={touched.breed && errors.breed ? errors.breed : ''}
                  />

                  <GlassInput
                    label="Weight (kg)"
                    placeholder="25"
                    value={values.weight}
                    onChangeText={handleChange('weight')}
                    onBlur={handleBlur('weight')}
                    keyboardType="decimal-pad"
                    error={touched.weight && errors.weight ? errors.weight : ''}
                  />

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

                  <GlassInput
                    label="Personality Traits"
                    placeholder="Friendly, Energetic, Playful, Loyal"
                    value={values.personality}
                    onChangeText={handleChange('personality')}
                    onBlur={handleBlur('personality')}
                    multiline
                    numberOfLines={2}
                    error={touched.personality && errors.personality ? errors.personality : ''}
                  />
                  <Text className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Separate traits with commas
                  </Text>
                </GlassCard>

                {/* Social Behavior */}
                <GlassCard className="mb-4">
                  <Text className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Social Behavior
                  </Text>
                  
                  {renderBooleanField('Good with Kids', 'good_with_kids', values, setFieldValue, errors, touched)}
                  {renderBooleanField('Good with Dogs', 'good_with_dogs', values, setFieldValue, errors, touched)}
                  {renderBooleanField('Good with Cats', 'good_with_cats', values, setFieldValue, errors, touched)}
                </GlassCard>

                {/* Health Information */}
                <GlassCard className="mb-4">
                  <Text className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Health Information
                  </Text>
                  
                  {renderRadioGroup('Vaccinated', 'is_vaccinated', values, setFieldValue)}
                  {renderRadioGroup('Spayed/Neutered', 'is_neutered', values, setFieldValue)}
                </GlassCard>

                {/* Additional Information */}
                <GlassCard className="mb-4">
                  <Text className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Additional Information
                  </Text>
                  
                  <GlassInput
                    label="Description"
                    placeholder="Tell us about your dog's personality, likes, and special traits..."
                    value={values.description}
                    onChangeText={handleChange('description')}
                    onBlur={handleBlur('description')}
                    multiline
                    numberOfLines={4}
                    error={touched.description && errors.description ? errors.description : ''}
                  />

                  <GlassInput
                    label="Location"
                    placeholder="City, State"
                    value={values.location}
                    onChangeText={handleChange('location')}
                    onBlur={handleBlur('location')}
                    error={touched.location && errors.location ? errors.location : ''}
                  />
                </GlassCard>

                {/* Submit Button */}
                <GlassButton
                  variant="primary"
                  size="lg"
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator size="small" color="#fff" />
                      <Text className="ml-2 text-white font-semibold">Creating Profile...</Text>
                    </View>
                  ) : (
                    <Text className="text-white font-semibold">Create Dog Profile</Text>
                  )}
                </GlassButton>
              </Animated.View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};


export default CreateDogScreen;
