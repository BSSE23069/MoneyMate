// screens/AddExpenseScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AddExpenseScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // yyyy-mm-dd

  const saveExpense = async () => {
    if (!title || !amount) {
      Alert.alert("⚠️ Missing Info", "Please enter title and amount");
      return;
    }

    const newExpense = {
      id: Date.now().toString(),
      title,
      amount: parseFloat(amount),
      category,
      date,
    };

    try {
      const existing = await AsyncStorage.getItem("expenses");
      const expenses = existing ? JSON.parse(existing) : [];
      expenses.push(newExpense);
      await AsyncStorage.setItem("expenses", JSON.stringify(expenses));

      Alert.alert("✅ Success", "Expense added!");
      setTitle("");
      setAmount("");
      setCategory("Food");
      setDate(new Date().toISOString().split("T")[0]);

      navigation.navigate("Home");
    } catch (e) {
      console.log("❌ Save error", e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>➕ Add Expense</Text>

      <TextInput
        style={styles.input}
        placeholder="Expense Title"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      {/* Category Selection */}
      <Text style={styles.label}>Select Category</Text>
      <View style={styles.categoryRow}>
        {["Food", "Travel", "Bills", "Other"].map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryBtn,
              category === cat && styles.categoryBtnActive,
            ]}
            onPress={() => setCategory(cat)}
          >
            <Text
              style={[
                styles.categoryText,
                category === cat && styles.categoryTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Date Input (works on web + mobile) */}
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
      />

      <TouchableOpacity style={styles.saveBtn} onPress={saveExpense}>
        <Text style={styles.saveText}>Save Expense</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    fontSize: 16,
  },
  label: { fontSize: 14, fontWeight: "bold", marginTop: 10 },
  categoryRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 10 },
  categoryBtn: {
    flex: 1,
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  categoryBtnActive: { backgroundColor: "#2e86de", borderColor: "#2e86de" },
  categoryText: { fontSize: 14, color: "#333" },
  categoryTextActive: { color: "#fff", fontWeight: "bold" },
  saveBtn: {
    backgroundColor: "#2e86de",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
