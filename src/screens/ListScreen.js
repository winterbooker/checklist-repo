import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Dimensions, SafeAreaView, KeyboardAvoidingView } from 'react-native';
import * as SQLite from 'expo-sqlite';


import SubtaskItems from '../components/SubtaskItems';


const db = SQLite.openDatabase('db');


export default function ListScreen({ route }) {
  const { id, itemId } = route.params;
  const [items, setItems] = useState(null);
  const [text, setText] = useState('');
  const [forceUpdate, forceUpdateId] = useForceUpdate();


  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        'create table if not exists list (id integer primary key not null, done int, value text, listId int);',
      );
      // tx.executeSql(
      //  'drop table list;',
      // );
    });
  }, []);


  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding" keyboardVerticalOffset={100}>
      <ScrollView style={styles.scrollview}>
        <SubtaskItems key={forceUpdateId} itemId={itemId} />
      </ScrollView>
      <SafeAreaView />
    </KeyboardAvoidingView>
  );
}


const useForceUpdate = () => {
  const [value, setValue] = useState(0);
  return [() => setValue(value + 1), value];
};

/*
<View style={styles.test}>
  <Button onPress={() => getLastId()}>最後のIDデータ取得</Button>
  <Button onPress={() => getall()}>全データ取得</Button>
  <Button onPress={() => cancel()}>全データ削除</Button>
</View>
*/

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f2f2f7',
  },
});
