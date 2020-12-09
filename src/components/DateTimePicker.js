import React, { useState } from "react";
import { Button, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const TimePicker = () => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(true);

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    console.log("A date has been picked: ", date);
    hideDatePicker();
  };

  return (
    <View>
      <DateTimePickerModal
        cancelTextIOS="キャンセル"
        confirmTextIOS="設定する"
        headerTextIOS="スケジュールを指定"
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </View>
  );
};

export default TimePicker;
