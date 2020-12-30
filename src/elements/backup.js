const [checked, setChecked] = useState(schedule);

const firstButton = () => {
  setChecked(null);

  db.transaction(tx => {
    tx.executeSql('update items set schedule = null where id = ?', [id]);
    tx.executeSql('select * from items where id = ?', [id], (_, { rows }) =>
      console.log(JSON.stringify(rows))
    );
  },
  null,
  forceUpdate,
  );
}

const secondButton = () => {
  setChecked('calendar');
  db.transaction(tx => {
    tx.executeSql('update items set schedule = "calendar" where id = ?', [id]);
    tx.executeSql('select * from items where id = ?', [id], (_, { rows }) =>
      console.log(JSON.stringify(rows))
    );
  },
  null,
  forceUpdate,
  );
}

const thirdButton = () => {
  setChecked('clock');
  db.transaction(tx => {
    tx.executeSql('update items set schedule = "clock" where id = ?', [id]);
    tx.executeSql('select * from items where id = ?', [id], (_, { rows }) =>
      console.log(JSON.stringify(rows))
    );
  },
  null,
  forceUpdate,
  );
};

<View style={styles.schedule}>
  <Text style={styles.radioButtonTitle}>スケジュール設定</Text>
  <View style={styles.radioButton}>
    <RadioButton.Android value="設定なし" status={checked === null ? 'checked' : 'unchecked'} onPress={() => firstButton()} />
    <Text>設定なし</Text>
  </View>
  <View style={styles.radioButton}>
    <RadioButton.Android value="スケジュールを指定（1度のみ）" status={checked === 'calendar' ? 'checked' : 'unchecked'} onPress={() => secondButton()} />
    <Text>スケジュールを指定（1度のみ）</Text>
  </View>
  <View style={styles.radioButton}>
    <RadioButton.Android value="スケジュールを指定（繰り返し）" status={checked === 'clock' ? 'checked' : 'unchecked'} onPress={() => thirdButton()} />
    <Text>スケジュールを指定（繰り返し）</Text>
  </View>
</View>

schedule: {
  margin: 20,
},
radioButtonTitle: {
  fontWeight: 'bold',
  marginBottom: 20,
},
radioButton: {
  flexDirection: 'row',
  alignItems: 'center',
  marginLeft: 10,
},




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
        <View>
          <View style={styles.swipeItems}>
            <Image style={styles.swipeItemIcon} source={require('../../images/calendar.png')} />
            <Text style={styles.swipeTitle}>{value}</Text>
          </View>
        </View>
      );
    case 'clock':
      return (
        <View>
          <View style={styles.swipeItems}>
            <Image style={styles.swipeItemIcon} source={require('../../images/loop.png')} />
            <Text style={styles.swipeTitle} numberOfLines={2}>{value}</Text>
          </View>
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



const cancel = () => {
  db.transaction((tx) => {
    tx.executeSql('select notificationId from items where id = ?;', [modalIndex],
      (_, { rows: { _array } }) => Notifications.cancelScheduledNotificationAsync(_array[0].notificationId));
  });
};


const getLastId = async () => {
  db.transaction((tx) => {
    tx.executeSql('select hour, minute from items where id = ?;', [modalIndex],
      (_, { rows: { _array } }) => Notifications.scheduleNotificationAsync({
        content: {
          body: String(textModal),
        },
        trigger: {
          hour: Number(_array[0].hour),
          minute: Number(_array[0].minute),
          repeats: true,
        },
      }));
  });
  const notifications = await Notifications.getAllScheduledNotificationsAsync();
  const identifier = notifications.slice(-1)[0].identifier;
  db.transaction((tx) => {
    tx.executeSql('update items set notificationId = ? where id = ?', [identifier, modalIndex]);
    tx.executeSql('select * from items', [], (_, { rows }) =>
      console.log('getID' + JSON.stringify(rows)));
  });
};

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
