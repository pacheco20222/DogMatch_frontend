import React from 'react';
import { View, Text, Button } from 'react-native';
import GlobalStyles from '../styles/GlobalStyles';

export default function MainScreen({ navigation }) {
  return (
    <View style={GlobalStyles.container}>
      <Text style={GlobalStyles.title}>Welcome to DogMatch!</Text>
      <Text style={GlobalStyles.label}>
        Connect with other dog owners and find the perfect playmate for your furry friend.
      </Text>
      
      <Button
        title="Login"
        onPress={() => navigation.navigate('Login')}
      />
      <Button
        title="Create Account"
        onPress={() => navigation.navigate('Register')}
      />
    </View>
  );
}