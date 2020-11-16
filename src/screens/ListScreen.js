import React, { useState, useEffect } from 'react';
import { ScrollView, FlatList, SafeAreaView, StyleSheet, View, Image, Animated, Text, TouchableOpacity, TouchableHighlight, Dimensions } from 'react-native';
import { List, TextInput, Button, Appbar } from 'react-native-paper';
import { SwipeListView } from 'react-native-swipe-list-view';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('db');

/*
const listData = [
  {
    id: '1',
    title: '抗酸化物質とは、抗酸化剤とも呼ばれ、生体内、食品、日用品、工業原料において酸素が関与する有害な反応を減弱もしくは除去する物質の総称である。',
    icon: 'calendar',
  },
  {
    id: '2',
    title: 'Webサイトのコンテンツ管理システム(CMS)の種類の一つで、簡便な記法を用いて文書の整形や装飾が可能なもの。',
    icon: '',
  },
  {
    id: '3',
    title: 'Truncate Title text such that the total number of lines does not exceed this number.',
    icon: 'clock',
  },
  {
    id: '4',
    title: 'テスト',
    icon: '',
  },
  {
    id: '5',
    title: 'テスト',
    icon: '',
  },
  {
    id: '6',
    title: 'テスト',
    icon: '',
  },
  {
    id: '7',
    title: 'テスト',
    icon: '',
  },
  {
    id: '8',
    title: 'テスト',
    icon: '',
  },
];
*/

const Items = ({ done: doneHeading, onPressItem }) => {
  const [items, setItems] = useState(null);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'select * from items where done = ?;',
        [doneHeading ? 1 : 0],
        (_, { rows: { _array } }) => setItems(_array),
      );
      // tx.executeSql(
      // 'drop table users;',
      // );
    });
  }, []);

  const heading = doneHeading ? 'Completed' : 'Todo';

  if (items === null || items.length === 0) {
    return null;
  }

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionHeading}>{heading}</Text>
      {items.map(({ id, done, value }) => (
        <TouchableOpacity
          key={id}
          onPress={() => onPressItem && onPressItem(id)}
          style={{
            backgroundColor: done ? "#1c9963" : "#fff",
            borderColor: "#000",
            borderWidth: 1,
            padding: 8,
          }}
        >
          <Text style={{ color: done ? "#fff" : "#000" }}>{value}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default function HomeScreen() {
  const [text, setText] = useState('');
  const [forceUpdate, forceUpdateId] = useForceUpdate()

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'create table if not exists items (id integer primary key not null, done int, value text);'
      );
    });
  }, []);

  const add = (text) => {
    if (text === null || text === "") {
      return false;
    }

    db.transaction(tx => {
      tx.executeSql('insert into items (done, value) values (0, ?)', [text]);
      tx.executeSql('select * from items', [], (_, { rows }) =>
        console.log(JSON.stringify(rows))
      );
    },
    null,
    forceUpdate
    );
  }

  const deleteRow = (rowMap, rowKey) => {
    const newData = [...listData];
    const prevIndex = listData.findIndex(item => item.key === rowKey);
    newData.splice(prevIndex, 1);
    setListData(newData);
  };

  const renderItem = data => (
    <List.Item
      style={styles.rowFront}
      title={data.item.text}
      underlayColor="#AAA"
    />
  );

  const renderHiddenItem = (data, rowMap) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnLeft]}
        onPress={() => closeRow(rowMap, data.item.key)}
      >
        <Image source={require('../../images/edit.png')} style={styles.edit} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnRight]}
        onPress={() => deleteRow(rowMap, data.item.key)}
      >
        <Image source={require('../../images/trash.png')} style={styles.trash} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content style={styles.appbarTitle} title="CheckList" />
        <Appbar.Action icon="dots-horizontal" />
      </Appbar.Header>
      <TextInput
        style={styles.textInput}
        selectionColor="#fff"
        theme={{ colors: { text: '#fff', primary: '#fff' }, roundness: 0 }}
        placeholderTextColor="#fff"
        placeholder="タスクを追加"
        value={text}
        onChangeText={text => setText(text)}
        onSubmitEditing={() => {
          add(text);
          setText(null);
        }}
        left={<TextInput.Icon icon="plus-circle" color="#fff" />}
      />
      <ScrollView style={styles.listArea}>
        <Items
          key={`forceupdate-todo-${forceUpdateId}`}
          done={false}
          onPressItem={id =>
            db.transaction(
              tx => {
                tx.executeSql('update items set done = 1 where id = ?;', [
                  id
                ]);
              },
              null,
              forceUpdate
            )
          }
        />
        <Items
          done
          key={`forceupdate-done-${forceUpdateId}`}
          onPressItem={id =>
            db.transaction(
              tx => {
                tx.executeSql('delete from items where id = ?;', [id]);
              },
              null,
              forceUpdate
            )
          }
        />
      </ScrollView>
      <Appbar style={styles.appbarbottom}>
        <Appbar.Action style={styles.appbarbottomIcon} size={30} icon="home" onPress={() => console.log('Pressed archive')} />
        <Appbar.Action style={styles.appbarbottomIcon} size={26} icon="magnify" onPress={() => console.log('Pressed archive')} />
      </Appbar>
    </View>
  );
}

function useForceUpdate() {
  const [value, setValue] = useState(0);
  return [() => setValue(value + 1), value];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f2f2f7',
  },
  appbar: {
    backgroundColor: '#f8f8f8',
  },
  appbarTitle: {
    alignItems: 'center',
  },
  appbarbottom: {
    backgroundColor: '#f8f8f8',
    left: 0,
    right: 0,
    bottom: 0,
    height: 85,
    justifyContent: 'center',
  },
  appbarbottomIcon: {
    margin: 25,
    bottom: 15,
  },
  textInput: {
    backgroundColor: '#434343',
    borderRadius: 0,
  },
  rowFront: {
    alignItems: 'center',
    backgroundColor: '#CCC',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    height: 50,
    paddingLeft: 40,
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#DDD',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,
  },
  backRightBtnLeft: {
    backgroundColor: '#adadad',
    right: 75,
  },
  backRightBtnRight: {
    backgroundColor: '#FF312E',
    right: 0,
  },
  edit: {
    height: 25,
    width: 25,
  },
  trash: {
    height: 25,
    width: 25,
  },
});
