import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import your screens
import HomeScreen from '../screens/HomeScreen.jsx';
import MyDogsScreen from '../screens/MyDogsScreen.jsx';
import DiscoverScreen from '../screens/DiscoverScreen.jsx';
import EventsScreen from '../screens/EventsScreen.jsx';
import ProfileScreen from '../screens/ProfileScreen.jsx';
import CreateDogScreen from '../screens/CreateDogScreen.jsx';
import CreateEventScreen from '../screens/CreateEventScreen.jsx';
import RegisterEventsScreen from '../screens/RegisterEventsScreen.jsx';
import MatchesScreen from '../screens/MatchesScreen.jsx';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Create a stack navigator for MyDogs tab
function MyDogsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyDogsList" component={MyDogsScreen} />
      <Stack.Screen name="AddDog" component={CreateDogScreen} />
    </Stack.Navigator>
  );
}

// Create a stack navigator for Discover tab
function DiscoverStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DiscoverMain" component={DiscoverScreen} />
      <Stack.Screen name="Matches" component={MatchesScreen} />
    </Stack.Navigator>
  );
}

// Create a stack navigator for Events tab
function EventsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EventsList" component={EventsScreen} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
      <Stack.Screen name="RegisterEvent" component={RegisterEventsScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          borderTopWidth: 1,
          paddingBottom: insets.bottom + 5,
          paddingTop: 5,
          height: 60 + insets.bottom,
        },
        tabBarActiveTintColor: '#4F8EF7',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('../assets/icons/home.png')}
              style={{ width: size, height: size, tintColor: color }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="MyDogs"
        component={MyDogsStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('../assets/icons/paw.png')}
              style={{ width: size, height: size, tintColor: color }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('../assets/icons/heart.png')}
              style={{ width: size, height: size, tintColor: color }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Events"
        component={EventsStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('../assets/icons/calendar.png')}
              style={{ width: size, height: size, tintColor: color }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('../assets/icons/user.png')}
              style={{ width: size, height: size, tintColor: color }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}