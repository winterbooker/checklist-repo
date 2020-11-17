import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Animated, TouchableOpacity, Text, ScrollView } from 'react-native';
import { TextInput, Appbar } from 'react-native-paper';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import * as SQLite from 'expo-sqlite';

import Header from '../components/Appbar';

const db = SQLite.openDatabase('db');


const Items = ({ navigation }) => {
  const [items, setItems] = useState(null);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'select * from items;',
        null,
        (_, { rows: { _array } }) => setItems(_array),
      );
    });
  }, []);

  if (items === null || items.length === 0) {
    return null;
  }

  const handleDelete = (id) => {
    db.transaction(tx => {
      tx.executeSql('delete from items where id = ?;', [id]);
    });
    db.transaction(tx => {
      tx.executeSql(
        'select * from items;',
        null,
        (_, { rows: { _array } }) => setItems(_array),
      );
    });
  };


  const rightSwipe = (id) => (
    <TouchableOpacity style={styles.deleteBox} onPress={() => handleDelete(id)}>
      <Text style={styles.deleteText}>削除</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.sectionContainer}>
      {items.map(({ id, value }) => (
        <Swipeable style={styles.swipeItem} key={id} renderRightActions={() => rightSwipe(id)}>
          <TouchableOpacity
            style={styles.item}
            key={id}
            onPress={() => navigation.navigate('List')}
          >
            <Text>{value}</Text>
          </TouchableOpacity>
        </Swipeable>
      ))}
    </ScrollView>
  );
};



export default function HomeScreen({ navigation }) {
  const [text, setText] = useState('');
  const [forceUpdate, forceUpdateId] = useForceUpdate();

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'create table if not exists items (id integer primary key not null, done int, value text);',
      );
    });
  }, []);

  const add = (text) => {
    if (text === null || text === '') {
      return false;
    }

    db.transaction(tx => {
      tx.executeSql('insert into items (done, value) values (0, ?)', [text]);
      tx.executeSql('select * from items', [], (_, { rows }) =>
        console.log(JSON.stringify(rows)));
    },
    null,
    forceUpdate,
    );
  };


  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.contents}>
        <TextInput
          style={styles.textInput}
          selectionColor="#fff"
          theme={{ colors: { text: '#fff', primary: '#fff' }, roundness: 0 }}
          placeholderTextColor="#ddd"
          placeholder="タスクを追加"
          value={text}
          onChangeText={text => setText(text)}
          onSubmitEditing={() => {
            add(text);
            setText(null);
          }}
          left={<TextInput.Icon icon="plus" color="#fff" />}
        />
        <ScrollView>
          <Items
            key={`forceupdate-todo-${forceUpdateId}`}
            navigation={navigation}
          />
        </ScrollView>
      </View>
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
    backgroundColor: '#f2f2f7',
  },
  contents: {
    flex: 1,
  },
  sectionContainer: {
    backgroundColor: '#fff',
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
  item: {
    height: 50,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    justifyContent: 'center',
    paddingLeft: 20,
  },
  rightSwipeItem: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 20,
  },
  deleteBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'red',
    width: 100,
  },
  deleteText: {
    color: '#fff',
  },
});
