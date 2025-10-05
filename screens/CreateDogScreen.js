import React, { useState, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import GlobalStyles from '../styles/GlobalStyles';
import { AuthContext } from '../auth/AuthContext';
import { apiFetch } from '../api/client';

export default function CreateDogScreen({ navigation }) {
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const pickImage = async () => {
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
          // Don't fail the entire operation if photo upload fails
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
    <View style={{ marginBottom: 16 }}>
      <Text style={[GlobalStyles.label, { marginBottom: 8 }]}>{label}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              {
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 8,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: '#E5E7EB'
              },
              formData[field] === option.value && {
                backgroundColor: '#4F8EF7',
                borderColor: '#4F8EF7'
              }
            ]}
            onPress={() => handleInputChange(field, option.value)}
          >
            <Text style={[
              { color: '#6B7280' },
              formData[field] === option.value && { color: '#FFFFFF' }
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderBooleanField = (label, field) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={[GlobalStyles.label, { marginBottom: 8 }]}>{label}</Text>
      <View style={{ flexDirection: 'row' }}>
        {[
          { value: true, label: 'Yes' },
          { value: false, label: 'No' },
          { value: null, label: 'Not sure' }
        ].map((option) => (
          <TouchableOpacity
            key={option.label}
            style={[
              {
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 8,
                borderWidth: 1,
                borderColor: '#E5E7EB'
              },
              formData[field] === option.value && {
                backgroundColor: '#4F8EF7',
                borderColor: '#4F8EF7'
              }
            ]}
            onPress={() => handleInputChange(field, option.value)}
          >
            <Text style={[
              { color: '#6B7280' },
              formData[field] === option.value && { color: '#FFFFFF' }
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView 
        contentContainerStyle={{ padding: 20 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginRight: 15 }}
          >
            <Text style={[GlobalStyles.link, { fontSize: 18 }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={GlobalStyles.title}>Add New Dog</Text>
        </View>

        {/* Photo Upload */}
        <View style={GlobalStyles.card}>
          <Text style={[GlobalStyles.label, { fontSize: 18, marginBottom: 15 }]}>
            Dog Photo
          </Text>
          
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            {selectedImage ? (
              <View style={{ alignItems: 'center' }}>
                <Image
                  source={{ uri: selectedImage.uri }}
                  style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 10 }}
                />
                <TouchableOpacity
                  style={[GlobalStyles.button, { backgroundColor: '#6B7280', paddingHorizontal: 20 }]}
                  onPress={pickImage}
                >
                  <Text style={GlobalStyles.buttonText}>Change Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: '#E5E7EB',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: '#D1D5DB',
                  borderStyle: 'dashed'
                }}
                onPress={pickImage}
              >
                <Text style={{ color: '#6B7280', fontSize: 24, marginBottom: 5 }}>📷</Text>
                <Text style={{ color: '#6B7280', fontSize: 12, textAlign: 'center' }}>
                  Add Photo
                </Text>
              </TouchableOpacity>
            )}
            <Text style={[GlobalStyles.label, { fontSize: 12, textAlign: 'center', marginTop: 10, color: '#6B7280' }]}>
              Optional: Add a photo of your dog
            </Text>
          </View>
        </View>

        {/* Basic Information */}
        <View style={GlobalStyles.card}>
          <Text style={[GlobalStyles.label, { fontSize: 18, marginBottom: 15 }]}>
            Basic Information
          </Text>
          
          <TextInput
            style={GlobalStyles.input}
            placeholder="Dog's name *"
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
          />
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TextInput
              style={[GlobalStyles.input, { width: '48%' }]}
              placeholder="Age (years)"
              value={formData.age}
              onChangeText={(value) => handleInputChange('age', value)}
              keyboardType="numeric"
            />
            <TextInput
              style={[GlobalStyles.input, { width: '48%' }]}
              placeholder="Months"
              value={formData.age_months}
              onChangeText={(value) => handleInputChange('age_months', value)}
              keyboardType="numeric"
            />
          </View>

          <TextInput
            style={GlobalStyles.input}
            placeholder="Breed"
            value={formData.breed}
            onChangeText={(value) => handleInputChange('breed', value)}
          />

          <TextInput
            style={GlobalStyles.input}
            placeholder="Color"
            value={formData.color}
            onChangeText={(value) => handleInputChange('color', value)}
          />

          <TextInput
            style={GlobalStyles.input}
            placeholder="Weight (kg)"
            value={formData.weight}
            onChangeText={(value) => handleInputChange('weight', value)}
            keyboardType="numeric"
          />

          {renderSelectField('Gender *', 'gender', [
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' }
          ])}

          {renderSelectField('Size *', 'size', [
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' },
            { value: 'extra_large', label: 'Extra Large' }
          ])}

          {renderSelectField('Energy Level', 'energy_level', [
            { value: 'low', label: 'Low' },
            { value: 'moderate', label: 'Moderate' },
            { value: 'high', label: 'High' },
            { value: 'very_high', label: 'Very High' }
          ])}
        </View>

        {/* Behavior */}
        <View style={GlobalStyles.card}>
          <Text style={[GlobalStyles.label, { fontSize: 18, marginBottom: 15 }]}>
            Behavior & Compatibility
          </Text>
          
          {renderBooleanField('Good with kids?', 'good_with_kids')}
          {renderBooleanField('Good with other dogs?', 'good_with_dogs')}
          {renderBooleanField('Good with cats?', 'good_with_cats')}
        </View>

        {/* Health */}
        <View style={GlobalStyles.card}>
          <Text style={[GlobalStyles.label, { fontSize: 18, marginBottom: 15 }]}>
            Health Information
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <TouchableOpacity
              style={[
                {
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor: '#E5E7EB'
                },
                formData.is_vaccinated && {
                  backgroundColor: '#4F8EF7',
                  borderColor: '#4F8EF7'
                }
              ]}
              onPress={() => handleInputChange('is_vaccinated', !formData.is_vaccinated)}
            >
              <Text style={[
                { color: '#6B7280' },
                formData.is_vaccinated && { color: '#FFFFFF' }
              ]}>
                Vaccinated
              </Text>
            </TouchableOpacity>
          </View>

          {renderBooleanField('Neutered/Spayed?', 'is_neutered')}
        </View>

        {/* Additional Info */}
        <View style={GlobalStyles.card}>
          <Text style={[GlobalStyles.label, { fontSize: 18, marginBottom: 15 }]}>
            Additional Information
          </Text>
          
          <TextInput
            style={[GlobalStyles.input, { height: 80, textAlignVertical: 'top' }]}
            placeholder="Tell us about your dog's personality, likes, dislikes..."
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            multiline
            numberOfLines={3}
          />

          <TextInput
            style={GlobalStyles.input}
            placeholder="Location (City, State)"
            value={formData.location}
            onChangeText={(value) => handleInputChange('location', value)}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[GlobalStyles.button, { marginVertical: 20 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={GlobalStyles.buttonText}>
            {loading ? 'Creating Profile...' : 'Create Dog Profile'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}