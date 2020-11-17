import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './src/screens/HomeScreen';
import ListScreen from './src/screens/ListScreen';

const Stack = createStackNavigator();

function MyStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ gestureEnabled: false, headerShown: false }} />
      <Stack.Screen name="List" component={ListScreen} options={{ headerStyle: { backgroundColor: '#fffbf6' }, headerTintColor: '#575757' }} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <PaperProvider>
        <MyStack />
      </PaperProvider>
    </NavigationContainer>
  );
}
