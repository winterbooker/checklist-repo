import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { TextInput, RadioButton, List } from 'react-native-paper';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('db');
const windowWidth = Dimensions.get('window').width;


const Items = ({ done: doneHeading, onPressItem, itemId }) => {
  const [items, setItems] = useState(null);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'select * from list where done = ? and listId = ?;',
        [doneHeading ? 1 : 0, itemId],
        (_, { rows: { _array } }) => setItems(_array),
      );
    });
  }, []);

  // const heading = doneHeading ? 'Completed' : 'Todo';

  if (items === null || items.length === 0) {
    return null;
  }

  const handleDelete = (id) => {
    db.transaction(tx => {
      tx.executeSql('delete from list where id = ?;', [id]);
    });
    db.transaction(tx => {
      tx.executeSql(
        'select * from list;',
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

export default function ListScreen({ route }) {
  const [text, setText] = useState('');
  const [expanded, setExpanded] = useState(true);
  const [value, setValue] = React.useState('first');
  const [forceUpdate, forceUpdateId] = useForceUpdate();

  const { itemId } = route.params;

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'create table if not exists list (id integer primary key not null, done int, value text, listId integer);'
      );
      // tx.executeSql(
      // 'drop table list;',
      // );
    });
  }, []);

  const add = (text) => {
    if (text === null || text === "") {
      return false;
    }

    db.transaction(tx => {
      tx.executeSql('insert into list (done, value, listId) values (0, ?, ?)', [text, itemId]);
      tx.executeSql('select * from list where listId = ?', [itemId], (_, { rows }) =>
        console.log(JSON.stringify(rows))
      );
    },
    null,
    forceUpdate
    );
  }

  const handlePressOpen = () => setExpanded(!expanded);



  return (
    <View style={styles.container}>
      <ScrollView style={styles.listArea}>
        <View style={styles.todoItems}>
          <Items
            key={`forceupdate-todo-${forceUpdateId}`}
            done={false}
            itemId={itemId}
            onPressItem={id =>
              db.transaction(
                tx => {
                  tx.executeSql('update list set done = 1 where id = ?;', [id]);
                },
                null,
                forceUpdate,
              )}
          />
        </View>
        <Items
          done
          key={`forceupdate-done-${forceUpdateId}`}
          itemId={itemId}
          onPressItem={id =>
            db.transaction(
              tx => {
                tx.executeSql('update list set done = 0 where id = ?;', [id]);
              },
              null,
              forceUpdate,
            )}
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
        <List.Accordion style={styles.settings} title="設定">
          <View style={styles.schedule}>
            <Text style={styles.radioButtonTitle}>スケジュール設定</Text>
            <RadioButton.Group onValueChange={newValue => setValue(newValue)} value={value}>
              <View style={styles.radioButton}>
                <RadioButton.Android value="設定なし" />
                <Text>設定なし</Text>
              </View>
              <View style={styles.radioButton}>
                <RadioButton.Android value="スケジュールを指定（1度のみ）" />
                <Text>スケジュールを指定（1度のみ）</Text>
              </View>
              <View style={styles.radioButton}>
                <RadioButton.Android value="スケジュールを指定（繰り返し）" />
                <Text>スケジュールを指定（繰り返し）</Text>
              </View>
            </RadioButton.Group>
          </View>
        </List.Accordion>
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
  settings: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: windowWidth / 2.5,
  },
  schedule: {
    margin: 20,
  },
  radioButtonTitle: {
    fontWeight: 'bold',
    marginBottom: 20,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
});
