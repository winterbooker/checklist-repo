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


export default function App() {
  return (
    <NavigationContainer>
      <PaperProvider>
        <MyStack />
      </PaperProvider>
    </NavigationContainer>
  );
}
