import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


import HomeScreen from './src/screens/HomeScreen';
import ListScreen from './src/screens/ListScreen';


const Stack = createStackNavigator();


function MyStack() {
  return (
    <Stack.Navigator headerBackTitle="戻る">
      <Stack.Screen name="CHECK OUT" headerBackTitle="戻る" component={HomeScreen} options={{ headerStyle: { backgroundColor: '#fffbf6' }, headerTintColor: '#575757' }} />
      <Stack.Screen
        name="LIST"
        headerBackTitle="戻る"
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
