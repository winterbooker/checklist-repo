import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Dimensions, Modal } from 'react-native';
import { TextInput, List, Button } from 'react-native-paper';
import * as SQLite from 'expo-sqlite';
import { Calendar } from 'react-native-calendars';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';


import SubtaskItems from '../components/SubtaskItems';


const db = SQLite.openDatabase('db');
const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;


export default function ListScreen({ route }) {
  const { id, itemId, schedule } = route.params;
  const [items, setItems] = useState(null);
  const [text, setText] = useState('');
  const [forceUpdate, forceUpdateId] = useForceUpdate();
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isRepeatVisible, setRepeatVisible] = useState(false);
  const [repeat, setRepeat] = useState(null);


  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        'create table if not exists list (id integer primary key not null, done int, value text, listId integer);',
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


  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleConfirm = (date) => {
    console.log('A date has been picked: ', date);
    hideDatePicker();
  };


  return (
    <View style={styles.container}>
      <ScrollView>
        <SubtaskItems key={forceUpdateId} itemId={itemId} />
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
        <List.Accordion style={styles.settings} title="設定">
          <View style={styles.settingsItems}>
            <Button onPress={() => setCalendarVisible(true)}>日付</Button>
            <Modal animationType="fade" transparent={true} visible={isCalendarVisible} style={styles.modal}>
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <Calendar />
                  <Button style={styles.modalButton} mode="contained" color="#B8B8B8" onPress={() => setCalendarVisible(!isCalendarVisible)}>閉じる</Button>
                </View>
              </View>
            </Modal>

            <Button onPress={() => showDatePicker()}>時間</Button>
            <DateTimePickerModal
              cancelTextIOS="キャンセル"
              confirmTextIOS="設定する"
              headerTextIOS="時間を指定"
              isVisible={isDatePickerVisible}
              mode="time"
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
            />

            <Button onPress={() => setRepeatVisible(true)}>繰り返し</Button>
            <Modal animationType="fade" transparent={true} visible={isRepeatVisible} style={styles.modal}>
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <Picker
                    selectedValue={repeat}
                    style={{ height: 200, width: 100, marginLeft: 130 }}
                    onValueChange={(itemValue) => setRepeat(itemValue)}
                  >
                    <Picker.Item label="日毎" value="date" />
                    <Picker.Item label="週毎" value="week" />
                    <Picker.Item label="月毎" value="months" />
                    <Picker.Item label="年毎" value="year" />
                  </Picker>
                  <Button style={styles.modalButton} mode="contained" color="#B8B8B8" onPress={() => setRepeatVisible(!isRepeatVisible)}>閉じる</Button>
                </View>
              </View>
            </Modal>
          </View>
        </List.Accordion>
      </ScrollView>
    </View>
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
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 0,
    marginTop: 20,
  },
  settings: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: windowWidth / 2.5,
  },
  settingsItems: {
    marginTop: 20,
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
