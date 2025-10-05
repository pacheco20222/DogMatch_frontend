import React, { useContext, useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import GlobalStyles from '../styles/GlobalStyles';
import { AuthContext } from '../auth/AuthContext';
import { apiFetch } from '../api/client';

export default function MyDogsScreen({ navigation }) {
  const { user, accessToken } = useContext(AuthContext);
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyDogs = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiFetch('/api/dogs/my-dogs', { token: accessToken });
      setDogs(data.dogs || []);
    } catch (e) {
      setError(e.message || 'Failed to load dogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDogs();
  }, []);

  // Refresh when screen comes into focus (e.g., when returning from CreateDogScreen)
  useFocusEffect(
    React.useCallback(() => {
      fetchMyDogs();
    }, [])
  );

  const handleDeleteDog = (dogId, dogName) => {
    Alert.alert(
      'Delete Dog',
      `Are you sure you want to delete ${dogName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiFetch(`/api/dogs/${dogId}`, {
                method: 'DELETE',
                token: accessToken
              });
              fetchMyDogs(); // Refresh the list
              Alert.alert('Success', 'Dog deleted successfully');
            } catch (e) {
              Alert.alert('Error', e.message || 'Failed to delete dog');
            }
          }
        }
      ]
    );
  };

  const renderDogCard = (dog) => (
    <View key={dog.id} style={[GlobalStyles.card, { marginVertical: 10 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Dog Photo */}
        <View style={{ marginRight: 15 }}>
          {dog.primary_photo_url ? (
            <Image
              source={{ uri: `https://dogmatch-backend.onrender.com${dog.primary_photo_url}` }}
              style={{ width: 80, height: 80, borderRadius: 40 }}
              onError={() => {
                console.log('Image failed to load:', dog.primary_photo_url);
              }}
            />
          ) : (
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#E5E7EB',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{ color: '#9CA3AF', fontSize: 24 }}>🐕</Text>
            </View>
          )}
        </View>

        {/* Dog Info */}
        <View style={{ flex: 1 }}>
          <Text style={[GlobalStyles.title, { fontSize: 20, marginBottom: 5 }]}>
            {dog.name}
          </Text>
          <Text style={GlobalStyles.label}>
            {dog.breed} • {dog.age_string}
          </Text>
          <Text style={GlobalStyles.label}>
            {dog.size} • {dog.gender}
          </Text>
          {dog.description && (
            <Text style={[GlobalStyles.label, { fontSize: 12, marginTop: 5 }]} numberOfLines={2}>
              {dog.description}
            </Text>
          )}
        </View>

        {/* Actions */}
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity
            style={[GlobalStyles.button, { marginVertical: 2, paddingHorizontal: 12, paddingVertical: 6 }]}
            onPress={() => {
              // TODO: Navigate to edit dog screen
              Alert.alert('Coming Soon', 'Edit dog functionality will be added soon!');
            }}
          >
            <Text style={[GlobalStyles.buttonText, { fontSize: 12 }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[GlobalStyles.button, { marginVertical: 2, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#E63946' }]}
            onPress={() => handleDeleteDog(dog.id, dog.name)}
          >
            <Text style={[GlobalStyles.buttonText, { fontSize: 12 }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView 
        contentContainerStyle={{ padding: 20 }}
      >
        <Text style={GlobalStyles.title}>My Dogs</Text>
        <Text style={GlobalStyles.label}>
          Manage your dog profiles
        </Text>

        {loading ? (
          <View style={[GlobalStyles.card, { marginVertical: 20, alignItems: 'center', padding: 40 }]}>
            <Text style={GlobalStyles.label}>Loading your dogs...</Text>
          </View>
        ) : error ? (
          <View style={[GlobalStyles.card, { marginVertical: 20, alignItems: 'center', padding: 40 }]}>
            <Text style={GlobalStyles.errorText}>{error}</Text>
            <TouchableOpacity
              style={[GlobalStyles.button, { marginTop: 15 }]}
              onPress={fetchMyDogs}
            >
              <Text style={GlobalStyles.buttonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : dogs.length === 0 ? (
          <View style={[GlobalStyles.card, { marginVertical: 20, alignItems: 'center', padding: 40 }]}>
            <Text style={GlobalStyles.label}>No dogs added yet</Text>
            <Text style={[GlobalStyles.label, { textAlign: 'center', marginTop: 10 }]}>
              Add your first dog to start connecting with other dog owners!
            </Text>
            <TouchableOpacity
              style={[GlobalStyles.button, { marginTop: 20 }]}
              onPress={() => navigation.navigate('AddDog')}
            >
              <Text style={GlobalStyles.buttonText}>Add Your First Dog</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 20 }}>
              <Text style={[GlobalStyles.label, { fontSize: 16 }]}>
                {dogs.length} dog{dogs.length !== 1 ? 's' : ''}
              </Text>
              <TouchableOpacity
                style={[GlobalStyles.button, { paddingHorizontal: 20, paddingVertical: 10 }]}
                onPress={() => navigation.navigate('AddDog')}
              >
                <Text style={GlobalStyles.buttonText}>Add Dog</Text>
              </TouchableOpacity>
            </View>
            {dogs.map(renderDogCard)}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}