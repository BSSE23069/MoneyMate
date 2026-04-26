// screens/HomeScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const categoryStyles = {
  Food: { color: "#e74c3c", icon: "fast-food" },
  Travel: { color: "#3498db", icon: "car-outline" },
  Bills: { color: "#f1c40f", icon: "receipt" },
  Other: { color: "#9b59b6", icon: "apps" },
};

export default function HomeScreen({ navigation }) {
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0); // Changed to totalExpenses
  const [totalIncome, setTotalIncome] = useState(0); // Added for total income

  const loadTransactions = async () => { // Renamed for clarity
    try {
      const storedExpenses = await AsyncStorage.getItem("expenses");
      const expenseList = storedExpenses ? JSON.parse(storedExpenses) : [];
      setExpenses(expenseList);
      setTotalExpenses(expenseList.reduce((sum, e) => sum + e.amount, 0));

      const storedIncomes = await AsyncStorage.getItem("incomes");
      const incomeList = storedIncomes ? JSON.parse(storedIncomes) : [];
      setTotalIncome(incomeList.reduce((sum, i) => sum + i.amount, 0)); // Calculate total income
    } catch (e) {
      console.log("❌ Load error", e);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadTransactions); // Call loadTransactions
    return unsubscribe;
  }, [navigation]);

  const renderExpense = ({ item }) => {
    const cat = categoryStyles[item.category] || categoryStyles.Other;
    return (
      <View style={[styles.card, { borderLeftColor: cat.color }]}>
        <Ionicons name={cat.icon} size={28} color={cat.color} style={styles.icon} />
        <View style={styles.info}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.date}>{item.date}</Text>
        </View>
        <Text style={[styles.amount, { color: cat.color }]}>${item.amount.toFixed(2)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryText}>💰 Total Spent:</Text>
          <Text style={styles.summaryAmount}>${totalExpenses.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryText}>📈 Total Income:</Text>
          <Text style={styles.summaryAmount}>${totalIncome.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryText}>📊 Net Balance:</Text>
          <Text style={[styles.summaryAmount, { color: (totalIncome - totalExpenses) >= 0 ? '#d4edda' : '#f8d7da' }]}>
            ${(totalIncome - totalExpenses).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Expenses List */}
      {expenses.length === 0 ? (
        <Text style={styles.empty}>No expenses yet. Add one!</Text>
      ) : (
        <FlatList
          data={expenses.slice().reverse()} // Use slice to avoid reversing original array
          keyExtractor={(item) => item.id}
          renderItem={renderExpense}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate("Add Expense")}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 10 },
  summary: {
    backgroundColor: "#2e86de",
    margin: 10,
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    flexDirection: "column", // Changed to column for better stacking of items
    justifyContent: "space-around",
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    paddingVertical: 5,
  },
  summaryText: { color: "#fff", fontSize: 16 },
  summaryAmount: { color: "#fff", fontSize: 24, fontWeight: "bold" }, // Reduced font size for better fit

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 5,
    borderRadius: 12,
    borderLeftWidth: 6,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  icon: { marginRight: 12 },
  info: { flex: 1 },
  title: { fontSize: 16, fontWeight: "bold", color: "#333" },
  date: { fontSize: 12, color: "#888" },
  amount: { fontSize: 16, fontWeight: "bold" },

  empty: { textAlign: "center", marginTop: 50, fontSize: 16, color: "#888" },

  addBtn: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#2e86de",
    borderRadius: 50,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});