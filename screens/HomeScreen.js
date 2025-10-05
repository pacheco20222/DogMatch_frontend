import React, { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlobalStyles from '../styles/GlobalStyles';
import { AuthContext } from '../auth/AuthContext';

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView 
        contentContainerStyle={{ padding: 20 }}
      >
        <Text style={GlobalStyles.title}>Welcome back!</Text>
        <Text style={GlobalStyles.label}>
          Hello, {user?.first_name || user?.username || 'User'}!
        </Text>
        
        {/* Quick Stats */}
        <View style={[GlobalStyles.card, { marginVertical: 20 }]}>
          <Text style={[GlobalStyles.label, { fontSize: 18, marginBottom: 15 }]}>
            Your Activity
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={[GlobalStyles.title, { fontSize: 24, color: '#4F8EF7' }]}>0</Text>
              <Text style={GlobalStyles.label}>Matches</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[GlobalStyles.title, { fontSize: 24, color: '#4F8EF7' }]}>0</Text>
              <Text style={GlobalStyles.label}>Dogs</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[GlobalStyles.title, { fontSize: 24, color: '#4F8EF7' }]}>0</Text>
              <Text style={GlobalStyles.label}>Events</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={GlobalStyles.card}>
          <Text style={[GlobalStyles.label, { fontSize: 18, marginBottom: 15 }]}>
            Quick Actions
          </Text>
          <TouchableOpacity
            style={[GlobalStyles.button, { marginVertical: 8 }]}
            onPress={() => navigation.navigate('MyDogs')}
          >
            <Text style={GlobalStyles.buttonText}>Add New Dog</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[GlobalStyles.button, { marginVertical: 8 }]}
            onPress={() => navigation.navigate('Discover')}
          >
            <Text style={GlobalStyles.buttonText}>Start Swiping</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[GlobalStyles.button, { marginVertical: 8 }]}
            onPress={() => navigation.navigate('Events')}
          >
            <Text style={GlobalStyles.buttonText}>Browse Events</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}