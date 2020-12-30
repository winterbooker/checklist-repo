import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import * as SQLite from 'expo-sqlite';
import * as Notifications from 'expo-notifications';

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
      tx.executeSql('select * from items;', [],
        (_, { rows }) => console.log(JSON.stringify(rows)));
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
        <View style={styles.test}>
          <Button onPress={() => getall()}>全データ取得</Button>
          <Button onPress={() => cancel()}>全データ削除</Button>
          <Button onPress={() => log()}>ログ取得</Button>
        </View>
      </ScrollView>
      <SafeAreaView />
    </View>
  );
}

// 通知設定を全件取得する
const getall = async () => {
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  const identifier = notifications;
  console.log(identifier);
};

// 通知設定を全件削除する
const cancel = async () => {
  Notifications.cancelAllScheduledNotificationsAsync();
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  const identifier = notifications;
  console.log(identifier);
};


const log = () => {
  db.transaction((tx) => {
    tx.executeSql('select * from items;', [],
      (_, { rows }) => console.log(JSON.stringify(rows)));
  });
};


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
  test: {
    marginTop: 100,
  },
});
