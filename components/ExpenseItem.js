// components/ExpenseItem.js
import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function ExpenseItem({ expense, onDelete }) {
  return (
    <View style={styles.item}>
      <View>
        <Text style={styles.text}>
          {expense.category}: ${expense.amount}
        </Text>
        <Text style={styles.date}>{expense.date}</Text>
      </View>
      <Button title="❌" onPress={() => onDelete(expense.id)} />
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    marginVertical: 5,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
  },
  text: { fontSize: 16, fontWeight: "bold" },
  date: { fontSize: 12, color: "gray" },
});
