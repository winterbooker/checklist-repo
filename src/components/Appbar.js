import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar, Button, Dialog, Portal } from 'react-native-paper';


export default function Header() {
  const [themeColor, setThemeColor] = useState('#f8f8f8');
  const [visible, setVisible] = useState(false);

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const changeColor = () => {
    setThemeColor('#f8f8f8');
  };

  const changeColor2 = () => {
    setThemeColor('red');
  };

  const changeColor3 = () => {
    setThemeColor('blue');
  };


  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: themeColor, top: 0, left: 0, right: 0 }}>
        <Appbar.Content style={styles.appbarTitle} title="CheckList" />
        <Appbar.Action icon="dots-horizontal" onPress={showDialog} />
        <Portal>
          <Dialog visible={visible} onDismiss={hideDialog}>
            <Dialog.Title>テーマカラー変更</Dialog.Title>
            <Dialog.Actions>
              <View>
                <Button style={{ backgroundColor: 'grey' }} mode="contained" onPress={changeColor}>白</Button>
                <Button style={{ backgroundColor: 'red' }} mode="contained" onPress={changeColor2}>赤</Button>
                <Button style={{ backgroundColor: 'blue' }} mode="contained" onPress={changeColor3}>青</Button>
              </View>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </Appbar.Header>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f2f2f7',
  },
  appbarTitle: {
    alignItems: 'center',
  },
});
