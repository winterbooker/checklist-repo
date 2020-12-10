import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Dimensions, Modal, LayoutAnimation } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import * as SQLite from 'expo-sqlite';


const db = SQLite.openDatabase('db');
const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;


export default function TaskItems({ navigation }) {
  const [items, setItems] = useState(null);
  const [textModal, setTextModal] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [listName, setListName] = useState('');


  LayoutAnimation.easeInEaseOut();


  useEffect(() => {
    db.transaction((tx) => {
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
    db.transaction((tx) => {
      tx.executeSql('delete from items where id = ?;', [id]);
    });
    db.transaction((tx) => {
      tx.executeSql('delete from list where listId = ?;', [id]);
    });
    db.transaction((tx) => {
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


  const addModal = (textModal, modalIndex) => {
    if (textModal === null || textModal === '') {
      return false;
    }

    db.transaction((tx) => {
      tx.executeSql('update items set value = ? where id = ?', [textModal, modalIndex]);
      tx.executeSql(
        'select * from items;',
        null,
        (_, { rows: { _array } }) => setItems(_array),
      );
      tx.executeSql('select * from items', [], (_, { rows }) =>
        console.log(JSON.stringify(rows)));
    },
    null);
  };


  return (
    <View style={styles.sectionContainer}>
      {items.map(({ id, value, schedule }) => (
        <View key={id}>
          <Swipeable renderRightActions={() => rightSwipe(id)}>
            <TouchableOpacity
              style={styles.item}
              onPress={() => navigation.navigate('サブタスク', { id, itemId: id, schedule })}
              onLongPress={() => {
                setModalIndex(id);
                setModalVisible(true);
                setListName(value);
              }}
            >
              <Text style={styles.swipeTitle}>{value}</Text>
            </TouchableOpacity>
          </Swipeable>
        </View>
      ))}
      <Modal animationType="fade" transparent={true} visible={modalVisible} style={styles.modal}>
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
    </View>
  );
}


const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: '#fff',
    flex: 1,
  },
  item: {
    height: 65,
    backgroundColor: '#fff',
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    justifyContent: 'center',
    paddingLeft: 20,
    paddingTop: 10,
    paddingRight: 20,
    paddingBottom: 10,
  },
  swipeTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#141414',
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
