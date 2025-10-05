import React, { useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlobalStyles from '../styles/GlobalStyles';
import { AuthContext } from '../auth/AuthContext';

export default function DiscoverScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView 
        contentContainerStyle={{ padding: 20 }}
      >
        <Text style={GlobalStyles.title}>Discover</Text>
        <Text style={GlobalStyles.label}>
          Find the perfect playmate for your dog
        </Text>
        
        {/* Placeholder for swipe cards */}
        <View style={[GlobalStyles.card, { marginVertical: 20, height: 400, justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={GlobalStyles.label}>Swipe cards coming soon!</Text>
          <Text style={[GlobalStyles.label, { textAlign: 'center', marginTop: 10 }]}>
            This is where you'll swipe through dog profiles
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}