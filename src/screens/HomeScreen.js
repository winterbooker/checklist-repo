import * as React from 'react';
import { FlatList, SafeAreaView, StyleSheet, View } from 'react-native';
import { List, TextInput } from 'react-native-paper';

const DATA = [
  {
    id: '1',
    title: 'First Item',
  },
  {
    id: '2',
    title: 'Second Item',
  },
  {
    id: '3',
    title: 'Third Item',
  },
];

const Item = ({ title }) => (
  <List.Section>
    <List.Item
      style={styles.listItem}
      title={title}
      left={props => <List.Icon {...props} icon="calendar" />}
    />
  </List.Section>
);

export default function HomeScreen() {
  const [text, setText] = React.useState('');

  const renderItem = ({ item }) => (
    <Item title={item.title} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        placeholder="write task"
        value={text}
        onChangeText={text => setText(text)}
      />
      <FlatList data={DATA} renderItem={renderItem} keyExtractor={item => item.id} />
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
  },
});
