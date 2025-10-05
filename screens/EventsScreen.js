import React, { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlobalStyles from '../styles/GlobalStyles';
import { AuthContext } from '../auth/AuthContext';

export default function EventsScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView 
        contentContainerStyle={{ padding: 20 }}
      >
        <Text style={GlobalStyles.title}>Events</Text>
        <Text style={GlobalStyles.label}>
          Join community events and meetups
        </Text>
        
        {/* Placeholder for events list */}
        <View style={[GlobalStyles.card, { marginVertical: 20 }]}>
          <Text style={GlobalStyles.label}>No events available</Text>
          <TouchableOpacity
            style={[GlobalStyles.button, { marginTop: 15 }]}
            onPress={() => {
              // TODO: Navigate to Create Event screen (for shelters/admins)
              alert('Create Event screen coming soon!');
            }}
          >
            <Text style={GlobalStyles.buttonText}>Create Event</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}