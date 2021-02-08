import React, { useEffect } from 'react';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Notifications from 'expo-notifications';


import HomeScreen from './src/screens/HomeScreen';
import ListScreen from './src/screens/ListScreen';


const theme = {
  ...DefaultTheme,
  roundness: 0,
  mode: 'exact',
  colors: {
    ...DefaultTheme.colors,
    text: '#000',
    primary: '#ddd',
    placeholder: '#B8B8B8',
  },
};


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});


const Stack = createStackNavigator();


function MyStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CHECK OUT"
        component={HomeScreen}
        options={{ headerStyle: { backgroundColor: '#fffbf6' }, headerTintColor: '#575757' }}
      />
      <Stack.Screen
        name="LIST"
        component={ListScreen}
        options={({ route }) => ({ title: route.params.name, headerStyle: { backgroundColor: '#fffbf6' }, headerTintColor: '#575757', headerBackTitle: '戻る' })}
      />
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
  useEffect(() => {
    requestPermissionsAsync();
  });
  return (
    <NavigationContainer>
      <PaperProvider theme={theme}>
        <MyStack />
      </PaperProvider>
    </NavigationContainer>
  );
}
