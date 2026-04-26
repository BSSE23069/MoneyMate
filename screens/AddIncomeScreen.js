// screens/AddIncomeScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

let DateTimePicker;
if (Platform.OS !== "web") {
  DateTimePicker = require("@react-native-community/datetimepicker").default;
}

export default function AddIncomeScreen() {
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [incomes, setIncomes] = useState([]);

  useEffect(() => {
    loadIncomes();
  }, []);

  const loadIncomes = async () => {
    try {
      const stored = await AsyncStorage.getItem("incomes");
      if (stored) setIncomes(JSON.parse(stored));
    } catch (error) {
      console.log("Error loading incomes:", error);
    }
  };

  const saveIncome = async () => {
    if (!source || !amount) return;

    const newIncome = {
      id: Date.now().toString(),
      source,
      amount: parseFloat(amount),
      // --- IMPORTANT CHANGE HERE ---
      date: date.toISOString().split("T")[0], // Save date as YYYY-MM-DD
    };

    const updated = [...incomes, newIncome];
    setIncomes(updated);

    try {
      await AsyncStorage.setItem("incomes", JSON.stringify(updated));

      // also update balance - this can be removed if you consistently calculate from stored lists
      // For this project, it's safer to calculate balance on the fly from lists.
      // const currentBalance = await AsyncStorage.getItem("balance");
      // const newBalance =
      //   (currentBalance ? parseFloat(currentBalance) : 0) +
      //   parseFloat(amount);
      // await AsyncStorage.setItem("balance", newBalance.toString());

      // reset form
      setSource("");
      setAmount("");
      setDate(new Date()); // Reset date picker to today
    } catch (error) {
      console.log("Error saving income:", error);
    }
  };

  const renderIncome = ({ item }) => (
    <View style={styles.incomeItem}>
      <Text style={styles.incomeSource}>{item.source}</Text>
      <Text style={styles.incomeAmount}>+${item.amount.toFixed(2)}</Text>
      {/* Display date consistently */}
      <Text style={styles.incomeDate}>{new Date(item.date).toLocaleDateString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Income</Text>

      <TextInput
        style={styles.input}
        placeholder="Income Source"
        value={source}
        onChangeText={setSource}
      />

      <TextInput
        style={styles.input}
        placeholder="Amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      {Platform.OS !== "web" && (
        <>
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>Select Date: {date.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}
        </>
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={saveIncome}>
        <Text style={styles.saveText}>Save Income</Text>
      </TouchableOpacity>

      <Text style={styles.listTitle}>My Incomes</Text>
      <FlatList
        data={incomes.slice().reverse()} // Show newest first
        keyExtractor={(item) => item.id}
        renderItem={renderIncome}
        ListEmptyComponent={<Text style={styles.empty}>No incomes yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, color: "#2e86de" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  dateBtn: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f1f2f6",
    marginBottom: 15,
  },
  dateText: { fontSize: 16, color: "#333" },
  saveBtn: {
    backgroundColor: "#2e86de",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  listTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  incomeItem: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  incomeSource: { fontSize: 16, fontWeight: "bold", color: "#2e86de", flex: 1 },
  incomeAmount: { fontSize: 16, color: "green", fontWeight: 'bold', marginLeft: 10 },
  incomeDate: { fontSize: 14, color: "gray", marginLeft: 10 },
  empty: { textAlign: "center", color: "gray", marginTop: 20 },
});