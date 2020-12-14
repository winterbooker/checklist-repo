import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Dimensions, Modal, Switch, Text } from 'react-native';
import { TextInput, List, Button } from 'react-native-paper';
import * as SQLite from 'expo-sqlite';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';
import * as Notifications from 'expo-notifications';


import SubtaskItems from '../components/SubtaskItems';


LocaleConfig.locales['jp'] = {
  monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  dayNames: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
  dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
};
LocaleConfig.defaultLocale = 'jp';

const db = SQLite.openDatabase('db');
const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;


export default function ListScreen({ route }) {
  const { id, itemId } = route.params;
  const [items, setItems] = useState(null);
  const [text, setText] = useState('');
  const [forceUpdate, forceUpdateId] = useForceUpdate();
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isRepeatVisible, setRepeatVisible] = useState(false);
  const [repeat, setRepeat] = useState(null);
  const [dateIsEnabled, setDateIsEnabled] = useState(false);
  const [timeIsEnabled, setTimeIsEnabled] = useState(false);
  const [repeatIsEnabled, setRepeatIsEnabled] = useState(false);


  useEffect(() => {
    /*
    db.transaction((tx) => {
      tx.executeSql('select hour from items where id = ?', [id], (_, { rows }) =>
        console.log(rows._array[0]['hour']));
      tx.executeSql('select minute from items where id = ?', [id], (_, { rows }) =>
        console.log(rows._array[0]['minute']));
    });
    */

    db.transaction((tx) => {
      tx.executeSql(
        'create table if not exists list (id integer primary key not null, done int, value text, listId integer);',
      );
      tx.executeSql(
        'select timeSwitch from items where id = ?;',
        [id],
        (_, { rows }) => setTimeIsEnabled(rows._array[0]['timeSwitch'] === 1 ? true : false),
      );
      // tx.executeSql(
      //  'drop table list;',
      // );
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
    const hour = Number(JSON.stringify(date).split('T')[1].slice(0, 2)) + 9;
    const minute = Number(JSON.stringify(date).split('T')[1].slice(3, 5));
    if (hour > 23) {
      db.transaction((tx) => {
        tx.executeSql('update items set hour = ? where id = ?', [hour - 24, id]);
        tx.executeSql('update items set minute = ? where id = ?', [minute, id]);
        tx.executeSql('update items set timeSwitch = 1 where id = ?', [id]);
        tx.executeSql('select * from items', [], (_, { rows }) =>
          console.log(JSON.stringify(rows)));
      });
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'test',
        },
        trigger: {
          hour: hour,
          minute: minute,
        },
      });
    } else {
      db.transaction((tx) => {
        tx.executeSql('update items set hour = ? where id = ?', [hour, id]);
        tx.executeSql('update items set minute = ? where id = ?', [minute, id]);
        tx.executeSql('update items set timeSwitch = 1 where id = ?', [id]);
        tx.executeSql('select * from items', [], (_, { rows }) =>
          console.log(JSON.stringify(rows)));
      });
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'test',
        },
        trigger: {
          hour: hour,
          minute: minute,
        },
      });
    }
    hideDatePicker();
  };


  const switchValue = () => {
    db.transaction((tx) => {
      tx.executeSql('update items set timeSwitch = case when timeSwitch = 0 then 1 when timeSwitch = 1 then 0 else 0 end where id = ?', [id]);
      tx.executeSql('select * from items', [], (_, { rows }) =>
        console.log(JSON.stringify(rows)));
    },
    null,
    setTimeIsEnabled(!timeIsEnabled));
  };

/*
  const renderTimeSwitch = () => {
    switch (timeIsEnabled) {
      case 0:
        return (
          <Switch style={styles.timeSwitch} onValueChange={switchValue} value={false} />
        );
      case 1:
        return (
          <Switch style={styles.timeSwitch} onValueChange={switchValue} value={true} />
        );
      default:
        return (
          <Switch style={styles.timeSwitch} onValueChange={switchValue} value={false} />
        );
    }
  };
  */


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
            <View style={styles.dateContainer}>
              <Button style={styles.timeTitle} onPress={() => setCalendarVisible(true)}>日付</Button>
              <Switch style={styles.timeSwitch} onValueChange={switchValue} value={dateIsEnabled} />
              <Modal animationType="fade" transparent={true} visible={isCalendarVisible} style={styles.modal}>
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <Calendar
                      style={{
                        height: 350,
                        width: 300,
                      }}
                      onDayPress={(day) => { console.log(day['day']); }}
                    />
                    <Button style={styles.modalButton} mode="contained" color="#B8B8B8" onPress={() => setCalendarVisible(!isCalendarVisible)}>閉じる</Button>
                  </View>
                </View>
              </Modal>
            </View>

            <View style={styles.timeContainer}>
              <Button style={styles.timeTitle} onPress={showDatePicker}>時間</Button>
              <Switch style={styles.timeSwitch} onValueChange={switchValue} value={timeIsEnabled} />
              <DateTimePickerModal
                date={new Date()}
                cancelTextIOS="閉じる"
                confirmTextIOS="設定する"
                headerTextIOS="時間を指定"
                isVisible={isDatePickerVisible}
                mode="time"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
              />
            </View>

            <View style={styles.repeatContainer}>
              <Button style={styles.timeTitle} onPress={() => setRepeatVisible(true)}>繰り返し</Button>
              <Switch style={styles.timeSwitch} onValueChange={switchValue} value={repeatIsEnabled} />
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
                    <Button
                      style={styles.modalButton}
                      mode="contained"
                      color="#B8B8B8"
                      onPress={() => setRepeatVisible(!isRepeatVisible)}
                      theme={{ fontSize: 18 }}
                    >
                      閉じる
                    </Button>
                  </View>
                </View>
              </Modal>
            </View>
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
    marginTop: 20,
  },
  centeredView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    height: windowHeight * 0.6,
    width: windowWidth * 0.95,
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
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  timeTitle: {
    marginLeft: 10,
  },
  timeSwitch: {
    position: 'absolute',
    right: 0,
    marginRight: 20,
  },
  repeatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});
