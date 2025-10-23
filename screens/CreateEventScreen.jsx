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
import { ArrowLeft, Camera, Calendar, MapPin, Users, DollarSign } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { createEvent, uploadEventPhoto, clearError } from '../store/slices/eventsSlice';
import { createEventSchema } from '../validation/eventSchemas';
import { useTheme } from '../theme/ThemeContext';
import GlassCard from '../components/glass/GlassCard';
import GlassInput from '../components/glass/GlassInput';
import GlassButton from '../components/glass/GlassButton';

const CreateEventScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector(state => state.events);
  const [selectedImage, setSelectedImage] = useState(null);
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Clear error when component unmounts
  React.useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Event categories based on Event model
  const eventCategories = [
    { value: 'meetup', label: 'Dog Meetup' },
    { value: 'training', label: 'Training Workshop' },
    { value: 'adoption', label: 'Adoption Fair' },
    { value: 'competition', label: 'Dog Competition' },
    { value: 'social', label: 'Social Event' },
    { value: 'educational', label: 'Educational Workshop' }
  ];

  const pickImage = async () => {
    const { status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
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
      Alert.alert('Error', error.message || 'Failed to create event. Please try again.');
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
      {/* Header with iPhone notch support */}
      <View className="px-6 pt-4 pb-3 flex-row items-center" style={{ paddingTop: insets.top + 16 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <ArrowLeft size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Create Event
        </Text>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Formik
            initialValues={{
              title: '',
              description: '',
              category: 'meetup',
              event_date: '',
              location: '',
              max_participants: '',
              price: '0',
              special_requirements: '',
              contact_email: '',
              contact_phone: '',
              vaccination_required: true,
              requires_approval: false
            }}
            validationSchema={createEventSchema}
            onSubmit={handleSubmit}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue, isSubmitting }) => (
              <View>
                {/* Event Photo */}
                <Animated.View entering={FadeInDown.delay(100).duration(500)}>
                  <GlassCard className="mb-6">
                    <View className="items-center">
                      <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Event Photo
                      </Text>
                      
                      {selectedImage ? (
                        <View className="items-center">
                          <Image
                            source={{ uri: selectedImage.uri }}
                            className="w-full h-48 rounded-xl mb-4"
                            resizeMode="cover"
                          />
                          <GlassButton
                            onPress={pickImage}
                            variant="outline"
                            icon={Camera}
                          >
                            Change Photo
                          </GlassButton>
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={pickImage}
                          className={`w-full h-48 rounded-xl items-center justify-center border-2 border-dashed mb-2 ${
                            isDark ? 'bg-white/5 border-white/20' : 'bg-gray-50 border-gray-300'
                          }`}
                        >
                          <Camera size={48} color={isDark ? '#9CA3AF' : '#6B7280'} />
                          <Text className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Add Event Photo
                          </Text>
                        </TouchableOpacity>
                      )}
                      <Text className={`text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Optional: Add a banner photo for your event
                      </Text>
                    </View>
                  </GlassCard>
                </Animated.View>

                {/* Basic Information */}
                <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                  <GlassCard className="mb-6">
                    <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Basic Information
                    </Text>
                    
                    <GlassInput
                      label="Event Title"
                      placeholder="Enter event title"
                      value={values.title}
                      onChangeText={handleChange('title')}
                      onBlur={handleBlur('title')}
                      error={touched.title && errors.title}
                    />

                    <GlassInput
                      label="Description"
                      placeholder="Describe your event..."
                      value={values.description}
                      onChangeText={handleChange('description')}
                      onBlur={handleBlur('description')}
                      error={touched.description && errors.description}
                      multiline
                      numberOfLines={4}
                    />

                    {renderSelectField('Category', 'category', eventCategories, values, setFieldValue, errors, touched)}
                  </GlassCard>
                </Animated.View>

                {/* Date & Location */}
                <Animated.View entering={FadeInDown.delay(300).duration(500)}>
                  <GlassCard className="mb-6">
                    <View className="flex-row items-center mb-4">
                      <Calendar size={20} color={isDark ? '#fff' : '#000'} className="mr-2" />
                      <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Date & Location
                      </Text>
                    </View>
                    
                    <GlassInput
                      label="Event Date & Time"
                      placeholder="YYYY-MM-DD HH:MM (e.g., 2025-12-31 14:00)"
                      value={values.event_date}
                      onChangeText={handleChange('event_date')}
                      onBlur={handleBlur('event_date')}
                      error={touched.event_date && errors.event_date}
                    />

                    <GlassInput
                      label="Location"
                      placeholder="Enter event location"
                      value={values.location}
                      onChangeText={handleChange('location')}
                      onBlur={handleBlur('location')}
                      error={touched.location && errors.location}
                      icon={MapPin}
                    />
                  </GlassCard>
                </Animated.View>

                {/* Capacity & Pricing */}
                <Animated.View entering={FadeInDown.delay(400).duration(500)}>
                  <GlassCard className="mb-6">
                    <View className="flex-row items-center mb-4">
                      <Users size={20} color={isDark ? '#fff' : '#000'} className="mr-2" />
                      <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Capacity & Pricing
                      </Text>
                    </View>
                    
                    <GlassInput
                      label="Maximum Participants"
                      placeholder="e.g., 50"
                      value={values.max_participants}
                      onChangeText={handleChange('max_participants')}
                      onBlur={handleBlur('max_participants')}
                      error={touched.max_participants && errors.max_participants}
                      keyboardType="numeric"
                    />

                    <GlassInput
                      label="Price (MXN)"
                      placeholder="0 for free events"
                      value={values.price}
                      onChangeText={handleChange('price')}
                      onBlur={handleBlur('price')}
                      error={touched.price && errors.price}
                      keyboardType="numeric"
                      icon={DollarSign}
                    />
                  </GlassCard>
                </Animated.View>

                {/* Contact Information */}
                <Animated.View entering={FadeInDown.delay(500).duration(500)}>
                  <GlassCard className="mb-6">
                    <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Contact Information
                    </Text>
                    
                    <GlassInput
                      label="Contact Email"
                      placeholder="your@email.com"
                      value={values.contact_email}
                      onChangeText={handleChange('contact_email')}
                      onBlur={handleBlur('contact_email')}
                      error={touched.contact_email && errors.contact_email}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />

                    <GlassInput
                      label="Contact Phone"
                      placeholder="+52 123 456 7890"
                      value={values.contact_phone}
                      onChangeText={handleChange('contact_phone')}
                      onBlur={handleBlur('contact_phone')}
                      error={touched.contact_phone && errors.contact_phone}
                      keyboardType="phone-pad"
                    />
                  </GlassCard>
                </Animated.View>

                {/* Requirements & Settings */}
                <Animated.View entering={FadeInDown.delay(600).duration(500)}>
                  <GlassCard className="mb-6">
                    <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Requirements & Settings
                    </Text>
                    
                    <GlassInput
                      label="Special Requirements (Optional)"
                      placeholder="Any special requirements for participants..."
                      value={values.special_requirements}
                      onChangeText={handleChange('special_requirements')}
                      onBlur={handleBlur('special_requirements')}
                      error={touched.special_requirements && errors.special_requirements}
                      multiline
                      numberOfLines={3}
                    />

                    {renderRadioGroup('Vaccination Required', 'vaccination_required', values, setFieldValue)}
                    {renderRadioGroup('Requires Approval', 'requires_approval', values, setFieldValue)}
                  </GlassCard>
                </Animated.View>

                {/* Submit Button */}
                <Animated.View entering={FadeInDown.delay(700).duration(500)}>
                  <GlassButton
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    className="mb-4"
                  >
                    {isSubmitting ? (
                      <View className="flex-row items-center justify-center">
                        <ActivityIndicator color="#fff" size="small" className="mr-2" />
                        <Text className="text-white font-bold">Creating Event...</Text>
                      </View>
                    ) : (
                      'Create Event'
                    )}
                  </GlassButton>
                </Animated.View>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default CreateEventScreen;