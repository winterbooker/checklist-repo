import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Notifications from 'expo-notifications';

import HomeScreen from './src/screens/HomeScreen';
import ListScreen from './src/screens/ListScreen';


/*
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});
*/

const Stack = createStackNavigator();


function MyStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="タスク" component={HomeScreen} options={{ headerStyle: { backgroundColor: '#fffbf6' }, headerTintColor: '#575757' }} />
      <Stack.Screen name="サブタスク" component={ListScreen} options={{ headerStyle: { backgroundColor: '#fffbf6' }, headerTintColor: '#575757' }} />
    </Stack.Navigator>
  );
}

const requestPermissionsAsync = async () => {
  const { granted } = await Notifications.getPermissionsAsync();
  if (granted) {
    return;
  }

  await Notifications.requestPermissionsAsync();
};

export default function App() {
  React.useEffect(() => {
    requestPermissionsAsync();
  });

  return (
    <NavigationContainer>
      <PaperProvider>
        <MyStack />
      </PaperProvider>
    </NavigationContainer>
  );
}
