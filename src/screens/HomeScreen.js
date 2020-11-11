import * as React from 'react';
import { FlatList, SafeAreaView, StyleSheet, View, Image, Animated, Text, TouchableOpacity } from 'react-native';
import { List, TextInput, Button } from 'react-native-paper';
import { SwipeListView } from 'react-native-swipe-list-view';

const listData = [
  {
    id: '1',
    title: '抗酸化物質とは、抗酸化剤とも呼ばれ、生体内、食品、日用品、工業原料において酸素が関与する有害な反応を減弱もしくは除去する物質の総称である。',
    icon: 'calendar',
  },
  {
    id: '2',
    title: 'Webサイトのコンテンツ管理システム(CMS)の種類の一つで、簡便な記法を用いて文書の整形や装飾が可能なもの。',
    icon: '',
  },
  {
    id: '3',
    title: 'Truncate Title text such that the total number of lines does not exceed this number.',
    icon: 'clock',
  },
  {
    id: '4',
    title: 'テスト',
    icon: '',
  },
  {
    id: '5',
    title: 'テスト',
    icon: '',
  },
  {
    id: '6',
    title: 'テスト',
    icon: '',
  },
  {
    id: '7',
    title: 'テスト',
    icon: '',
  },
  {
    id: '8',
    title: 'テスト',
    icon: '',
  },
];

const rowSwipeAnimatedValues = {};
Array(20)
  .fill('')
  .forEach((_, i) => {
    rowSwipeAnimatedValues[`${i}`] = new Animated.Value(0);
  });

const Items = ({ title, icon }) => (
  <List.Item
    style={styles.listItem}
    title={title}
    titleNumberOfLines={2}
    left={(props) => <List.Icon {...props} icon={icon} />}
  />
);

export default function HomeScreen() {
  const [text, setText] = React.useState('');

  const renderItem = ({ item }) => (
    <Items style={styles.rowFront} title={item.title} icon={item.icon} />
  );

  const renderHiddenItem = (data, rowMap) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnLeft]}
        onPress={() => closeRow(rowMap, data.item.key)}
      >
        <Image source={require('../../images/edit.png')} style={styles.edit} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnRight]}
        onPress={() => deleteRow(rowMap, data.item.key)}
      >
        <Image source={require('../../images/trash.png')} style={styles.trash} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.textInput}
        selectionColor="#fff"
        theme={{ colors: { text: '#fff' }, roundness: 0 }}
        placeholderTextColor="#fff"
        placeholder="タスクを追加"
        value={text}
        onChangeText={text => setText(text)}
        left={<TextInput.Icon icon="plus-circle" color="#fff" />}
      />
      <SwipeListView
        data={listData}
        renderItem={renderItem}
        renderHiddenItem={renderHiddenItem}
        rightOpenValue={-150}
        previewRowKey={'0'}
        previewOpenValue={-40}
        previewOpenDelay={3000}
        // onRowDidOpen={onRowDidOpen}
        // onSwipeValueChange={onSwipeValueChange}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  listItem: {
    borderBottomWidth: 1,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  textInput: {
    backgroundColor: '#434343',
    borderRadius: 0,
  },
  rowFront: {
    alignItems: 'center',
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#DDD',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingLeft: 15,
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,
  },
  backRightBtnLeft: {
    backgroundColor: '#3F88C5',
    right: 75,
  },
  backRightBtnRight: {
    backgroundColor: '#FF312E',
    right: 0,
  },
  edit: {
    height: 25,
    width: 25,
  },
  trash: {
    height: 25,
    width: 25,
  },
});
