import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Dimensions, LayoutAnimation } from 'react-native';
import { TextInput, RadioButton, List } from 'react-native-paper';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import * as SQLite from 'expo-sqlite';
import * as Notifications from 'expo-notifications';


const db = SQLite.openDatabase('db');
const windowWidth = Dimensions.get('window').width;


const Items = ({ itemId }) => {
  const [items, setItems] = useState(null);

  LayoutAnimation.easeInEaseOut();

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'select * from list where listId = ?;',
        [itemId],
        (_, { rows: { _array } }) => setItems(_array),
      );
    });
  }, []);


  if (items === null || items.length === 0) {
    return null;
  }

  const handleDelete = (id, listId) => {
    db.transaction(tx => {
      tx.executeSql('delete from list where id = ?;', [id]);
    });
    db.transaction(tx => {
      tx.executeSql(
        'select * from list where listId = ?;',
        [listId],
        (_, { rows: { _array } }) => setItems(_array),
      );
    });
  };


  const rightSwipe = (id, listId) => (
    <TouchableOpacity style={styles.deleteBox} onPress={() => handleDelete(id, listId)}>
      <Text style={styles.deleteText}>削除</Text>
    </TouchableOpacity>
  );


  const check = (id) => {
    db.transaction(
      tx => {
        tx.executeSql('update list set done = case when done = 1 then 0 when done = 0 then 1 else 0 end where id = ?;', [id]);
        tx.executeSql(
          'select * from list where listId = ?;',
          [itemId],
          (_, { rows: { _array } }) => setItems(_array),
        );
      },
      null,
    );
  };


  return (
    <ScrollView style={styles.sectionContainer}>
      {items.map(({ id, done, value, listId }) => (
        <View key={id}>
          <Swipeable style={styles.swipeItem} renderRightActions={() => rightSwipe(id, listId)}>
            <TouchableOpacity
              onPress={() => check(id)}
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
  const { id, itemId, schedule } = route.params;
  const [text, setText] = useState('');
  const [forceUpdate, forceUpdateId] = useForceUpdate();
  const [checked, setChecked] = useState(schedule);
  const [items, setItems] = useState(null);


  useEffect(() => {
    requestPermissionsAsync();

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
    if (text === null || text === '') {
      return false;
    }

    db.transaction(tx => {
      tx.executeSql('insert into list (done, value, listId) values (0, ?, ?)', [text, itemId]);
      tx.executeSql('select * from list where listId = ?;', [itemId],
        (_, { rows: { _array } }) => setItems(_array),
      );
    },
    null,
    forceUpdate,
    );
  };


  const firstButton = () => {
    setChecked(null);

    db.transaction(tx => {
      tx.executeSql('update items set schedule = null where id = ?', [id]);
      tx.executeSql('select * from items where id = ?', [id], (_, { rows }) =>
        console.log(JSON.stringify(rows))
      );
    },
    null,
    forceUpdate,
    );
  }

  const secondButton = () => {
    setChecked('calendar');
    db.transaction(tx => {
      tx.executeSql('update items set schedule = "calendar" where id = ?', [id]);
      tx.executeSql('select * from items where id = ?', [id], (_, { rows }) =>
        console.log(JSON.stringify(rows))
      );
    },
    null,
    forceUpdate,
    );
  }

  const thirdButton = () => {
    setChecked('clock');
    db.transaction(tx => {
      tx.executeSql('update items set schedule = "clock" where id = ?', [id]);
      tx.executeSql('select * from items where id = ?', [id], (_, { rows }) =>
        console.log(JSON.stringify(rows))
      );
    },
    null,
    forceUpdate,
    );
  };


  return (
    <View style={styles.container}>
      <ScrollView style={styles.listArea}>
        <View style={styles.todoItems}>
          <Items key={forceUpdateId} itemId={itemId} />
        </View>
        <TextInput
          style={styles.textInput}
          selectionColor="black"
          theme={{ colors: { text: 'black', primary: '#fff' }, roundness: 0 }}
          placeholderTextColor="#8d8d8f"
          placeholder="サブタスクを追加"
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
            <View style={styles.radioButton}>
              <RadioButton.Android value="設定なし" status={checked === null ? 'checked' : 'unchecked'} onPress={() => firstButton()} />
              <Text>設定なし</Text>
            </View>
            <View style={styles.radioButton}>
              <RadioButton.Android value="スケジュールを指定（1度のみ）" status={checked === 'calendar' ? 'checked' : 'unchecked'} onPress={() => secondButton()} />
              <Text>スケジュールを指定（1度のみ）</Text>
            </View>
            <View style={styles.radioButton}>
              <RadioButton.Android value="スケジュールを指定（繰り返し）" status={checked === 'clock' ? 'checked' : 'unchecked'} onPress={() => thirdButton()} />
              <Text>スケジュールを指定（繰り返し）</Text>
            </View>
          </View>
        </List.Accordion>
      </ScrollView>
    </View>
  );
}

const requestPermissionsAsync = async () => {
  const { granted } = await Notifications.getPermissionsAsync();
  if (granted) { return; }

  await Notifications.requestPermissionsAsync();
};

const scheduleNotificationAsync = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'checklist',
      body: 'test',
    },
    trigger: {
      hour: 7,
      minute: 0,
      repeats: true,
    },
  });
};

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
