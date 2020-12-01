import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ScrollView, Image, Dimensions, Animated } from 'react-native';
import { TextInput, Modal, Portal, Button, Provider } from 'react-native-paper';
import { KeyboardAwareView } from 'react-native-keyboard-aware-view';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import * as SQLite from 'expo-sqlite';

import Header from '../components/Appbar';



const db = SQLite.openDatabase('db');
const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;


const Items = ({ navigation }) => {
  const [items, setItems] = useState(null);
  const [text, setText] = useState('');
  const [textModal, setTextModal] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [listName, setListName] = useState('');


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
      tx.executeSql('delete from list where listId = ?;', [id]);
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


  const renderSwitch = (value, schedule) => {
    switch (schedule) {
      case null:
        return (
          <View style={styles.swipeItems}>
            <Image style={styles.swipeItemIcon} source={require('../../images/none.png')} />
            <Text style={styles.swipeTitle}>{value}</Text>
          </View>
        );
      case 'calendar':
        return (
          <View style={styles.swipeItems}>
            <Image style={styles.swipeItemIcon} source={require('../../images/calendar.png')} />
            <Text style={styles.swipeTitle}>{value}</Text>
          </View>
        );
      case 'clock':
        return (
          <View style={styles.swipeItems}>
            <Image style={styles.swipeItemIcon} source={require('../../images/loop.png')} />
            <Text style={styles.swipeTitle} numberOfLines={2}>{value}</Text>
          </View>
        );
      default:
        return (
          <View style={styles.swipeItems}>
            <Text style={styles.swipeTitle}>{value}</Text>
          </View>
        );
    }
  };


  const add = (text) => {
    if (text === null || text === '') {
      return false;
    }

    db.transaction(tx => {
      tx.executeSql('insert into items (done, value) values (0, ?)', [text]);
      tx.executeSql(
        'select * from items;',
        null,
        (_, { rows: { _array } }) => setItems(_array),
      );
      tx.executeSql('select * from items', [], (_, { rows }) =>
        console.log(JSON.stringify(rows)));
    },
    null,
    );
  };


  const addModal = (textModal, modalIndex) => {
    if (textModal === null || textModal === '') {
      return false;
    }

    db.transaction(tx => {
      tx.executeSql('update items set value = ? where id = ?', [textModal, modalIndex]);
      tx.executeSql(
        'select * from items;',
        null,
        (_, { rows: { _array } }) => setItems(_array),
      );
      tx.executeSql('select * from items', [], (_, { rows }) =>
        console.log(JSON.stringify(rows)));
    },
    null,
    );
  };


  return (
    <View style={styles.sectionContainer}>
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
              {renderSwitch(value, schedule)}
            </TouchableOpacity>
          </Swipeable>
        </View>
      ))}
      <Modal animationType="slide" transparent={true} visible={modalVisible} style={styles.modal} onDismiss={() => { setModalVisible(!modalVisible); }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TextInput
              style={styles.textInputModal}
              selectionColor="#000"
              theme={{ roundness: 0 }}
              placeholderTextColor="#B8B8B8"
              placeholder={listName}
              value={textModal}
              onChangeText={textModal => setTextModal(textModal)}
              onSubmitEditing={() => {
                addModal(textModal, modalIndex);
                setTextModal(null);
                setModalVisible(!modalVisible);
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};



export default function HomeScreen({ navigation, id }) {
  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'create table if not exists items (id integer primary key not null, done int, value text, schedule text);',
      );
      // tx.executeSql(
      // 'drop table items;',
      // );
    });
  }, []);



  return (
    <View style={styles.container}>
      <View style={styles.contents}>
        <ScrollView style={styles.itemcontainer}>
          <Items
            key={id}
            navigation={navigation}
          />
        </ScrollView>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  contents: {
    flex: 1,
  },
  itemcontainer: {
    height: windowHeight,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    height: windowHeight * 0.9,
  },
  textInput: {
    backgroundColor: '#434343',
    borderRadius: 0,
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
  swipeItems: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 30,
  },
  swipeItemIcon: {
    marginRight: 15,
    width: 15,
    height: 15,
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
    alignItems: 'center',
  },
  modalView: {
    borderRadius: 20,
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
    height: windowHeight * 0.2,
    width: windowWidth * 0.8,
  },
  textInputModal: {
    width: 200,
  },
  openButton: {
    backgroundColor: '#F194FF',
    borderRadius: 20,
    padding: 20,
    elevation: 2,
    marginTop: 20,
  },
  textStyle: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
