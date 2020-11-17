import React, { useState, useEffect } from 'react';
import { ScrollView, FlatList, SafeAreaView, StyleSheet, View, Image, Animated, Text, TouchableOpacity, TouchableHighlight, Dimensions } from 'react-native';
import { List, TextInput, Button, Appbar } from 'react-native-paper';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('db');


const Items = ({ done: doneHeading, onPressItem }) => {
  const [items, setItems] = useState(null);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'select * from items where done = ?;',
        [doneHeading ? 1 : 0],
        (_, { rows: { _array } }) => setItems(_array),
      );
    });
  }, []);

  const heading = doneHeading ? 'Completed' : 'Todo';

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
      <Text style={styles.sectionHeading}>{heading}</Text>
      {items.map(({ id, done, value }) => (
        <View key={id}>
          <Swipeable style={styles.swipeItem} key={id} renderRightActions={() => rightSwipe(id)}>
            <TouchableOpacity
              key={id}
              onPress={() => onPressItem && onPressItem(id)}
              style={{
                backgroundColor: done ? '#f4f7f8' : '#fff',
                borderColor: '#ddd',
                borderBottomWidth: 1,
                height: 50,
                paddingLeft: 20,
                justifyContent: 'center',
              }}
            >
              <Text style={{
                color: done ? '#929598' : '#000',
                textDecorationLine: done ? 'line-through' : 'none',
                textDecorationStyle: done ? 'solid' : 'solid'
              }}
              >
                {value}
              </Text>
            </TouchableOpacity>
          </Swipeable>
        </View>
      ))}
    </ScrollView>
  );
};

export default function ListScreen() {
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


  return (
    <View style={styles.container}>
      <ScrollView style={styles.listArea}>
        <View style={styles.todoItems}>
          <Items
            key={`forceupdate-todo-${forceUpdateId}`}
            done={false}
            onPressItem={id =>
              db.transaction(
                tx => {
                  tx.executeSql('update items set done = 1 where id = ?;', [id]);
                },
                null,
                forceUpdate
              )
            }
          />
        </View>
        <Items
          done
          key={`forceupdate-done-${forceUpdateId}`}
          onPressItem={id =>
            db.transaction(
              tx => {
                tx.executeSql('update items set done = 0 where id = ?;', [id]);
              },
              null,
              forceUpdate
            )
          }
        />
        <TextInput
          style={styles.textInput}
          selectionColor="black"
          theme={{ colors: { text: 'black', primary: '#fff' }, roundness: 0 }}
          placeholderTextColor="#8d8d8f"
          placeholder="項目を追加"
          value={text}
          onChangeText={text => setText(text)}
          onSubmitEditing={() => {
            add(text);
            setText(null);
          }}
          left={<TextInput.Icon icon="plus" color="#8d8d8f" />}
        />
      </ScrollView>
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
  sectionHeading: {
    marginTop: 20,
    marginLeft: 20,
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 0,
    marginTop: 20,
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
