import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { ThemeProvider } from './theme/ThemeContext';
import AuthNavigator from './navigation/AuthNavigator';
import AuthInitializer from './components/AuthInitializer';
import LoadingScreen from './components/ui/LoadingScreen';

export default function App() {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <ThemeProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
              <AuthInitializer>
                <NavigationContainer>
                  <AuthNavigator />
                </NavigationContainer>
              </AuthInitializer>
            </SafeAreaProvider>
          </GestureHandlerRootView>
        </ThemeProvider>
      </PersistGate>
    </ReduxProvider>
  );
}