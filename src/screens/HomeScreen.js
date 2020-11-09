import * as React from 'react';
import { FlatList, SafeAreaView, StyleSheet, View } from 'react-native';
import { List, TextInput, Button } from 'react-native-paper';

const DATA = [
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

const Items = ({ title, icon }) => (
  <List.Item
    style={styles.listItem}
    title={title}
    titleNumberOfLines={2}
    left={props => <List.Icon {...props} icon={icon} />}
  />
);

export default function HomeScreen() {
  const [text, setText] = React.useState('');

  const renderItem = ({ item }) => (
    <Items title={item.title} icon={item.icon} />
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
      <FlatList data={DATA} renderItem={renderItem} keyExtractor={item => item.id} />
      <View style={styles.buttons}>
        <Button style={styles.button} icon="pencil" mode="contained" color="#434343" contentStyle={{ height: 80, flexDirection: 'column' }} theme={{ roundness: 0 }}>
          編集／戻る
        </Button>
        <Button style={styles.button} icon="check" mode="contained" color="#434343" contentStyle={{ height: 80, flexDirection: 'column' }} theme={{ roundness: 0 }}>
          実行／決定
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  listItem: {
    borderBottomWidth: 1,
    paddingTop: 20,
    paddingBottom: 20,
  },
  textInput: {
    backgroundColor: '#434343',
    borderRadius: 0,
  },
  buttons: {
    flexDirection: 'row',
  },
  button: {
    flex: 1,
  },
});
