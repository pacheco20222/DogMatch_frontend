import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Dog, Heart, MessageCircle, Calendar, User } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

// Import your screens
import HomeScreen from '../screens/HomeScreen.jsx';
import MyDogsScreen from '../screens/MyDogsScreen.jsx';
import DiscoverScreen from '../screens/DiscoverScreen.jsx';
import EventsScreen from '../screens/EventsScreen.jsx';
import ProfileScreen from '../screens/ProfileScreen.jsx';
import CreateDogScreen from '../screens/CreateDogScreen.jsx';
import CreateEventScreen from '../screens/CreateEventScreen.jsx';
import RegisterEventScreen from '../screens/RegisterEventScreen.jsx';
import MatchesScreen from '../screens/MatchesScreen.jsx';
import ChatsScreen from '../screens/ChatsScreen.jsx';
import ChatConversationScreen from '../screens/ChatConversationScreen.jsx';
import PendingSwipesScreen from '../screens/PendingSwipesScreen.jsx';
import SettingsScreen from '../screens/SettingsScreen.jsx';

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
      <Stack.Screen name="PendingSwipes" component={PendingSwipesScreen} />
    </Stack.Navigator>
  );
}

// Create a stack navigator for Events tab
function EventsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EventsList" component={EventsScreen} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
      <Stack.Screen name="RegisterEvent" component={RegisterEventScreen} />
    </Stack.Navigator>
  );
}

// Create a stack navigator for Chats tab
function ChatsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="ChatsList" 
        component={ChatsScreen}
        options={{ tabBarStyle: { display: 'flex' } }}
      />
      <Stack.Screen 
        name="ChatConversation" 
        component={ChatConversationScreen}
        options={{ tabBarStyle: { display: 'none' } }}
      />
    </Stack.Navigator>
  );
}

// Create a stack navigator for Profile tab
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 12,
          height: insets.bottom > 0 ? 75 + insets.bottom : 75,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint={isDark ? 'dark' : 'light'}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              overflow: 'hidden',
              backgroundColor: isDark ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.7)',
              borderTopWidth: 1,
              borderTopColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            }}
          />
        ),
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: isDark ? '#9CA3AF' : '#6B7280',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? (isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)') : 'transparent',
              padding: 8,
              borderRadius: 12,
            }}>
              <Home size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="MyDogs"
        component={MyDogsStack}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? (isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)') : 'transparent',
              padding: 8,
              borderRadius: 12,
            }}>
              <Dog size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverStack}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? (isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)') : 'transparent',
              padding: 8,
              borderRadius: 12,
            }}>
              <Heart size={24} color={color} fill={focused ? color : 'none'} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatsStack}
        options={({ route }) => {
          // Use getFocusedRouteNameFromRoute to properly detect nested screen
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'ChatsList';
          
          return {
            tabBarStyle: routeName === 'ChatConversation' 
              ? { display: 'none' } 
              : {
                  backgroundColor: 'transparent',
                  borderTopWidth: 0,
                  paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
                  paddingTop: 12,
                  height: insets.bottom > 0 ? 75 + insets.bottom : 75,
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  elevation: 0,
                },
            tabBarIcon: ({ color, focused }) => (
              <View style={{
                backgroundColor: focused ? (isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)') : 'transparent',
                padding: 8,
                borderRadius: 12,
              }}>
                <MessageCircle size={24} color={color} />
              </View>
            ),
          };
        }}
      />
      <Tab.Screen
        name="Events"
        component={EventsStack}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? (isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)') : 'transparent',
              padding: 8,
              borderRadius: 12,
            }}>
              <Calendar size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: focused ? (isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)') : 'transparent',
              padding: 8,
              borderRadius: 12,
            }}>
              <User size={24} color={color} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}