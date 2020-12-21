import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, LayoutAnimation, Modal, KeyboardAvoidingView } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import * as SQLite from 'expo-sqlite';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'


const db = SQLite.openDatabase('db');
const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;


export default function SubtaskItems({ itemId }) {
  const [items, setItems] = useState(null);
  const [modalIndex, setModalIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [listName, setListName] = useState('');
  const [textModal, setTextModal] = useState('');
  const [itemsList, setItemsList] = useState(null);
  const [text, setText] = useState('');
  const [forceUpdate, forceUpdateId] = useForceUpdate();


  LayoutAnimation.easeInEaseOut();


  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        'select * from list where listId = ?;',
        [itemId],
        (_, { rows: { _array } }) => setItems(_array),
      );
    });
  }, []);


  const add = (text) => {
    if (text === null || text === '') {
      return false;
    }
    db.transaction((tx) => {
      tx.executeSql('insert into list (done, value, listId) values (0, ?, ?)', [text, itemId]);
      tx.executeSql('select * from list where listId = ?;', [itemId],
        (_, { rows: { _array } }) => setItems(_array));
    },
    null,
    forceUpdate);
  };


  if (items === null || items.length === 0) {
    return (
      <TextInput
        style={styles.textInput}
        selectionColor="black"
        theme={{ colors: { text: 'black', primary: '#fff' }, roundness: 0 }}
        placeholderTextColor="#8d8d8f"
        placeholder="サブタスクを追加"
        value={text}
        onChangeText={(text) => setText(text)}
        onSubmitEditing={() => {
          add(text);
          setText(null);
        }}
        left={<TextInput.Icon icon="plus" color="#8d8d8f" />}
      />
    );
  }


  const handleDelete = (id, listId) => {
    db.transaction((tx) => {
      tx.executeSql('delete from list where id = ?;', [id]);
    });
    db.transaction((tx) => {
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
    db.transaction((tx) => {
      tx.executeSql('update list set done = case when done = 1 then 0 when done = 0 then 1 else 0 end where id = ?;', [id]);
      tx.executeSql(
        'select * from list where listId = ?;',
        [itemId],
        (_, { rows: { _array } }) => setItems(_array),
      );
    },
    null);
  };


  const addModal = (textModal, modalIndex) => {
    if (textModal === null || textModal === '') {
      return false;
    }

    db.transaction((tx) => {
      tx.executeSql('update list set value = ? where id = ?', [textModal, modalIndex]);
      tx.executeSql(
        'select * from list where listId = ?;',
        [itemId],
        (_, { rows: { _array } }) => setItems(_array),
      );
      tx.executeSql('select * from list where listId = ?', [itemId], (_, { rows }) =>
        console.log(JSON.stringify(rows)));
    });
  };


  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding" keyboardVerticalOffset={100}>
      {items.map(({ id, done, value, listId }) => (
        <View key={id}>
          <Swipeable renderRightActions={() => rightSwipe(id, listId)}>
            <TouchableOpacity
              style={{
                backgroundColor: done ? '#f4f7f8' : '#fff',
                borderColor: '#ddd',
                borderBottomWidth: 1,
                height: 50,
                paddingLeft: 20,
                paddingRight: 20,
                justifyContent: 'center',
              }}
              onPress={() => check(id)}
              onLongPress={() => {
                setModalIndex(id);
                setModalVisible(true);
                setListName(value);
              }}
            >
              <Text
                style={{
                  color: done ? '#929598' : '#000',
                  textDecorationLine: done ? 'line-through' : 'none',
                  textDecorationStyle: done ? 'solid' : 'solid',
                }}
                numberOfLines={2}
              >
                {value}
              </Text>
            </TouchableOpacity>
          </Swipeable>
        </View>
      ))}
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TextInput
              style={styles.textInputModal}
              selectionColor="#000"
              theme={{ colors: { text: '#000', primary: '#ddd' } }}
              placeholderTextColor="#B8B8B8"
              placeholder={listName}
              value={textModal}
              onChangeText={(textModal) => setTextModal(textModal)}
              onSubmitEditing={() => {
                addModal(textModal, modalIndex);
                setTextModal(null);
                setModalVisible(!modalVisible);
              }}
            />
            <Button style={styles.modalButton} mode="contained" color="#B8B8B8" onPress={() => setModalVisible(!modalVisible)}>閉じる</Button>
          </View>
        </View>
      </Modal>
      <TextInput
        style={styles.textInput}
        selectionColor="black"
        theme={{ colors: { text: 'black', primary: '#fff' }, roundness: 0 }}
        placeholderTextColor="#8d8d8f"
        placeholder="サブタスクを追加"
        value={text}
        onChangeText={(text) => setText(text)}
        onSubmitEditing={() => {
          add(text);
          setText(null);
        }}
        left={<TextInput.Icon icon="plus" color="#8d8d8f" />}
      />
    </KeyboardAvoidingView>
  );
}


const useForceUpdate = () => {
  const [value, setValue] = useState(0);
  return [() => setValue(value + 1), value];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f2f2f7',
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
  centeredView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    height: 200,
    width: 350,
    borderRadius: 5,
    backgroundColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  textInputModal: {
    width: 250,
  },
  modalButton: {
    marginTop: 30,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 0,
    marginTop: 20,
    marginBottom: 50,
  },
});
