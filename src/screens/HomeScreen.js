import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView } from 'react-native';
import { TextInput } from 'react-native-paper';
import * as SQLite from 'expo-sqlite';


import TaskItems from '../components/TaskItems';


const db = SQLite.openDatabase('db');


export default function HomeScreen({ navigation }) {
  const [items, setItems] = useState(null);
  const [text, setText] = useState('');
  const [forceUpdate, forceUpdateId] = useForceUpdate();


  const add = (text) => {
    if (text === null || text === '') {
      return false;
    }
    db.transaction((tx) => {
      tx.executeSql('insert into items (value) values (?);', [text]);
      tx.executeSql('select * from items;', [],
        (_, { rows: { _array } }) => setItems(_array));
    },
    null,
    forceUpdate);
  };


  return (
    <View style={styles.container}>
      <ScrollView>
        <TextInput
          style={styles.textInput}
          selectionColor="#fff"
          theme={{ colors: { text: '#fff', primary: '#fff' }, roundness: 0 }}
          placeholderTextColor="#ddd"
          placeholder="アイテムを追加"
          value={text}
          onChangeText={(text) => setText(text)}
          onSubmitEditing={() => {
            add(text);
            setText(null);
          }}
          left={<TextInput.Icon icon="plus" color="#ddd" />}
        />
        <TaskItems key={forceUpdateId} navigation={navigation} />
      </ScrollView>
      <SafeAreaView />
    </View>
  );
}


const useForceUpdate = () => {
  const [value, setValue] = useState(0);
  return [() => setValue(value + 1), value];
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F6',
  },
  textInput: {
    backgroundColor: '#434343',
    borderRadius: 0,
  },
});
