import React, { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlobalStyles from '../styles/GlobalStyles';
import { AuthContext } from '../auth/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();
    // AuthNavigator will automatically switch to MainScreen
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView 
        contentContainerStyle={{ padding: 20 }}
      >
        <Text style={GlobalStyles.title}>Profile</Text>
        
        {/* User Info */}
        <View style={[GlobalStyles.card, { marginVertical: 20 }]}>
          <Text style={[GlobalStyles.label, { fontSize: 18, marginBottom: 15 }]}>
            Account Information
          </Text>
          <Text style={GlobalStyles.label}>Name: {user?.first_name} {user?.last_name}</Text>
          <Text style={GlobalStyles.label}>Email: {user?.email}</Text>
          <Text style={GlobalStyles.label}>Username: {user?.username}</Text>
          <Text style={GlobalStyles.label}>User Type: {user?.user_type}</Text>
        </View>

        {/* Quick Actions */}
        <View style={GlobalStyles.card}>
          <Text style={[GlobalStyles.label, { fontSize: 18, marginBottom: 15 }]}>
            Settings
          </Text>
          <TouchableOpacity
            style={[GlobalStyles.button, { marginVertical: 8 }]}
            onPress={() => {
              // TODO: Navigate to Edit Profile screen
              alert('Edit Profile screen coming soon!');
            }}
          >
            <Text style={GlobalStyles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[GlobalStyles.button, { marginVertical: 8 }]}
            onPress={() => {
              // TODO: Navigate to My Matches screen
              alert('My Matches screen coming soon!');
            }}
          >
            <Text style={GlobalStyles.buttonText}>My Matches</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[GlobalStyles.button, { marginVertical: 8, backgroundColor: '#E63946' }]}
            onPress={handleLogout}
          >
            <Text style={GlobalStyles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}