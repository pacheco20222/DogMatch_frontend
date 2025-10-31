import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import MainScreen from '../screens/MainScreen.jsx';
import LoginScreen from '../screens/LoginScreen.jsx';
import RegisterScreen from '../screens/RegisterScreen.jsx';
import AppNavigator from './AppNavigator';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  // AuthInitializer guarantees that initialization finished before the
  // navigator renders. Avoid hiding the navigator based on the general
  // `loading` flag here, since that flag represents many auth ops (login,
  // register, refresh) and could cause a blank screen during normal flows.
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // User is logged in - show main app with bottom tabs
        <Stack.Screen name="App" component={AppNavigator} />
      ) : (
        // User is not logged in - show welcome and auth screens
        <>
          <Stack.Screen name="Main" component={MainScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}