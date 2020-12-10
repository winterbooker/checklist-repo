import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Dimensions, LayoutAnimation, Modal } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import * as SQLite from 'expo-sqlite';


const db = SQLite.openDatabase('db');
const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;


export default function SubtaskItems({ itemId }) {
  const [items, setItems] = useState(null);
  const [modalIndex, setModalIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [listName, setListName] = useState('');
  const [textModal, setTextModal] = useState('');


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


  if (items === null || items.length === 0) {
    return null;
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
    <ScrollView>
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
              theme={{ roundness: 0 }}
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
    </ScrollView>
  );
}


const styles = StyleSheet.create({
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
    height: windowHeight * 0.3,
    width: windowWidth * 0.8,
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
});
