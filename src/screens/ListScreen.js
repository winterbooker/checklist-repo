import React from 'react';
import { ScrollView, StyleSheet, SafeAreaView, KeyboardAvoidingView } from 'react-native';


import SubtaskItems from '../components/SubtaskItems';


export default function ListScreen({ route }) {
  const { itemId } = route.params;

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding" keyboardVerticalOffset={100}>
      <ScrollView style={styles.scrollview}>
        <SubtaskItems itemId={itemId} />
      </ScrollView>
      <SafeAreaView />
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F6',
  },
});
