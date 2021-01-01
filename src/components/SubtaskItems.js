import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, LayoutAnimation, Modal, KeyboardAvoidingView, Alert } from 'react-native';
import { TextInput, Button, Switch } from 'react-native-paper';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import * as SQLite from 'expo-sqlite';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as Notifications from 'expo-notifications';


const db = SQLite.openDatabase('db');


export default function SubtaskItems({ id, itemId }) {
  const [items, setItems] = useState(null);
  const [modalIndex, setModalIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [listName, setListName] = useState('');
  const [textModal, setTextModal] = useState('');
  const [text, setText] = useState('');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [value, setValue] = useState(null);
  const [timeHour, setTimeHour] = useState(null);
  const [timeMinute, setTimeMinute] = useState(null);
  const [timeIsEnabled, setTimeIsEnabled] = useState(false);
  const [notificationId, setNotificationId] = useState(null);


  LayoutAnimation.easeInEaseOut();


  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql('create table if not exists list (id integer primary key not null, done int, value text, listId int);');
      tx.executeSql('select * from list where listId = ?;', [itemId],
        (_, { rows: { _array } }) => setItems(_array));
      tx.executeSql('select value from items where id = ?;', [id],
        (_, { rows: { _array } }) => setValue(_array[0].value));
      tx.executeSql('select hour from items where id = ?;', [id],
        (_, { rows: { _array } }) => setTimeHour(_array[0].hour));
      tx.executeSql('select minute from items where id = ?;', [id],
        (_, { rows: { _array } }) => setTimeMinute(_array[0].minute));
      tx.executeSql('select timeSwitch from items where id = ?;', [id],
        (_, { rows: { _array } }) => setTimeIsEnabled(_array[0].timeSwitch === 1)); // 「rows._array[0].timeSwitch」が1ならtrueを返す
      tx.executeSql('select notificationId from items where id = ?;', [id],
        (_, { rows: { _array } }) => setNotificationId(_array[0].notificationId));
    });
  }, []);


  const add = (text) => {
    if (text === null || text === '') {
      return false;
    }
    db.transaction((tx) => {
      tx.executeSql('insert into list (done, value, listId) values (0, ?, ?)', [text, itemId]);
      tx.executeSql('select * from list where listId = ?', [itemId],
        (_, { rows: { _array } }) => setItems(_array));
    });
  };


  const showDatePicker = () => {
    setDatePickerVisible(true);
  };
  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };
  const handleConfirm = (date) => {
    // DateTimePickerModalのdateから「時」と「分」を適正な形で変数に代入する
    const hour = Number(JSON.stringify(date).split('T')[1].slice(0, 2)) + 9;
    const minute = Number(JSON.stringify(date).split('T')[1].slice(3, 5));

    // hourが24以上になると0から保存されるように分岐
    if (hour > 23) {
      db.transaction((tx) => {
        tx.executeSql('update items set hour = ? where id = ?', [hour - 24, id]);
        tx.executeSql('update items set minute = ? where id = ?', [minute, id]);
        tx.executeSql('update items set timeSwitch = 1 where id = ?', [id]);
      }, [], setTimeHour(hour - 24));

      Notifications.scheduleNotificationAsync({
        content: {
          body: String(value),
          sound: 'default',
        },
        trigger: {
          hour: Number(hour - 24),
          minute: Number(minute),
          repeats: true,
        },
      });
    } else {
      db.transaction((tx) => {
        tx.executeSql('update items set hour = ? where id = ?', [hour, id]);
        tx.executeSql('update items set minute = ? where id = ?', [minute, id]);
        tx.executeSql('update items set timeSwitch = 1 where id = ?', [id]);
      }, [], setTimeHour(hour)); // setTimeHourは通知の時間を表示させるため

      Notifications.scheduleNotificationAsync({
        content: {
          body: String(value),
          sound: 'default',
        },
        trigger: {
          hour: Number(hour),
          minute: Number(minute),
          repeats: true,
        },
      });
    }
    Notifications.cancelScheduledNotificationAsync(notificationId);
    getLastId(); // scheduleNotificationAsyncで登録したidentifierをsqliteに保存することでアイテムごとに通知を特定できるようにする
    setTimeMinute(minute); // setTimeMinuteは通知の時間を表示させるため
    setTimeIsEnabled(true); // スイッチをオンにする
    hideDatePicker();
  };



  const switchValue = () => {
    if (!(timeHour === null)) {
      db.transaction((tx) => {
        tx.executeSql('update items set timeSwitch = case when timeSwitch = 0 then 1 when timeSwitch = 1 then 0 else 0 end where id = ?', [id]);
      }, [], setTimeIsEnabled(!timeIsEnabled)); // setTimeIsEnabledで表示をリアルタイムで変えれる

      // スイッチをオンにする
      if (timeIsEnabled === false) {
        Notifications.scheduleNotificationAsync({
          content: {
            body: String(value),
            sound: 'default',
          },
          trigger: {
            hour: Number(timeHour),
            minute: Number(timeMinute),
            repeats: true,
          },
        });
        Notifications.cancelScheduledNotificationAsync(notificationId);
        getLastId();
      } else { // スイッチをオフにする
        Notifications.cancelScheduledNotificationAsync(notificationId); // sqliteに保存しているIDを使い通知をキャンセルする
      }
    } else { // 時間を一度も設定していないとアラートが出る
      Alert.alert('時間を設定してください');
    }
  };



  const getLastId = async () => {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    const identifier = notifications.slice(-1)[0].identifier;
    db.transaction((tx) => {
      tx.executeSql('update items set notificationId = ? where id = ?', [identifier, id]);
    }, [], setNotificationId(identifier));
  };



  if (items === null || items.length === 0) {
    return (
      <>
        <TextInput
          style={styles.textInput}
          selectionColor="#000"
          theme={{ colors: { text: '#000', primary: '#fff' }, roundness: 0 }}
          placeholderTextColor="#8d8d8f"
          placeholder="項目を追加"
          value={text}
          onChangeText={(text) => setText(text)}
          onSubmitEditing={() => {
            add(text);
            setText(null);
          }}
          left={<TextInput.Icon icon="plus" color="#8d8d8f" />}
        />
        <View style={styles.timeContainer}>
          <Button style={styles.timeTitle} color="#218380" onPress={showDatePicker}>通知設定</Button>
          {!(timeHour === null) && (
            <Text style={styles.timeSetting}>
              {timeHour}:{( '00' + timeMinute ).slice(-2)}
            </Text>
          ) }
          <Switch style={styles.timeSwitch} color="#218380" onValueChange={switchValue} value={timeIsEnabled} />
          <DateTimePickerModal
            date={new Date()}
            cancelTextIOS="閉じる"
            confirmTextIOS="設定する"
            headerTextIOS="時間を設定"
            isVisible={isDatePickerVisible}
            mode="time"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
          />
        </View>
      </>
    );
  }


  const handleDelete = (id, listId) => {
    db.transaction((tx) => {
      tx.executeSql('delete from list where id = ?;', [id]);
      tx.executeSql('select * from list where listId = ?;', [listId],
        (_, { rows: { _array } }) => setItems(_array));
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
      tx.executeSql('select * from list where listId = ?;', [itemId],
        (_, { rows: { _array } }) => setItems(_array));
    });
  };


  const addModal = (textModal, modalIndex) => {
    if (textModal === null || textModal === '') {
      return false;
    }
    db.transaction((tx) => {
      tx.executeSql('update list set value = ? where id = ?', [textModal, modalIndex]);
      tx.executeSql('select * from list where listId = ?;', [itemId],
        (_, { rows: { _array } }) => setItems(_array));
    });
  };


  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding" keyboardVerticalOffset={100}>
      {items.map(({ id, done, value, listId }) => (
        <View key={id}>
          <Swipeable renderRightActions={() => rightSwipe(id, listId)}>
            <TouchableOpacity
              style={{
                backgroundColor: done ? '#F4F6F6' : '#fff',
                borderColor: '#ddd',
                borderBottomWidth: 1,
                height: 50,
                paddingLeft: 20,
                paddingRight: 20,
                justifyContent: 'center',
              }}
              activeOpacity={1}
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
              theme={{ colors: { text: '#000', primary: '#ddd' }, roundness: 0 }}
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
            <Button style={styles.modalButton} mode="contained" color="#ddd" onPress={() => setModalVisible(!modalVisible)}>閉じる</Button>
          </View>
        </View>
      </Modal>
      <TextInput
        style={styles.textInput}
        selectionColor="#000"
        theme={{ colors: { text: '#000', primary: '#fff' }, roundness: 0 }}
        placeholderTextColor="#8d8d8f"
        placeholder="項目を追加"
        value={text}
        onChangeText={(text) => setText(text)}
        onSubmitEditing={() => {
          add(text);
          setText(null);
        }}
        left={<TextInput.Icon icon="plus" color="#8d8d8f" />}
      />
      <View style={styles.timeContainer}>
        <Button style={styles.timeTitle} color="#218380" onPress={showDatePicker}>通知設定</Button>
        {!(timeHour === null) && (
          <Text style={styles.timeSetting}>
            {timeHour}:{( '00' + timeMinute ).slice(-2)}
          </Text>
        ) }
        <Switch style={styles.timeSwitch} color="#218380" onValueChange={switchValue} value={timeIsEnabled} />
        <DateTimePickerModal
          date={new Date()}
          cancelTextIOS="閉じる"
          confirmTextIOS="設定する"
          headerTextIOS="時間を設定"
          isVisible={isDatePickerVisible}
          mode="time"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />
      </View>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F6',
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
    height: 280,
    width: 300,
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
    marginBottom: 50,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  timeTitle: {
    marginLeft: 10,
  },
  timeSetting: {
    marginLeft: 'auto',
    marginRight: 85,
    color: '#8d8d8f',
  },
  timeSwitch: {
    position: 'absolute',
    right: 0,
    marginRight: 20,
  },
});
