// screens/ReportScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function ReportScreen({ navigation }) {
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [stats, setStats] = useState({
    totalExp: 0,
    totalInc: 0,
    byCategory: {},
  });

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadData);
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    try {
      const storedExp = await AsyncStorage.getItem("expenses");
      const storedInc = await AsyncStorage.getItem("incomes");
      
      const expList = storedExp ? JSON.parse(storedExp) : [];
      const incList = storedInc ? JSON.parse(storedInc) : [];

      calculateStats(expList, incList);
    } catch (e) {
      console.log("Error loading reports:", e);
    }
  };

  const calculateStats = (expList, incList) => {
    const totalExp = expList.reduce((sum, item) => sum + item.amount, 0);
    const totalInc = incList.reduce((sum, item) => sum + item.amount, 0);

    const byCategory = expList.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {});

    setExpenses(expList);
    setIncome(incList);
    setStats({ totalExp, totalInc, byCategory });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>📊 Financial Report</Text>

      {/* Overview Cards */}
      <View style={styles.row}>
        <View style={[styles.card, { backgroundColor: "#ebf5fb" }]}>
          <Text style={styles.cardLabel}>Expenses</Text>
          <Text style={[styles.cardAmount, { color: "#e74c3c" }]}>
            ${stats.totalExp.toFixed(2)}
          </Text>
        </View>
        <View style={[styles.card, { backgroundColor: "#eafaf1" }]}>
          <Text style={styles.cardLabel}>Income</Text>
          <Text style={[styles.cardAmount, { color: "#27ae60" }]}>
            ${stats.totalInc.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Progress Bar (Spending vs Income) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Budget Usage</Text>
        <View style={styles.progressBarBg}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${Math.min((stats.totalExp / stats.totalInc) * 100 || 0, 100)}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          You have spent {((stats.totalExp / stats.totalInc) * 100 || 0).toFixed(1)}% of your income.
        </Text>
      </View>

      {/* Group Spending Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spending by Category</Text>
        {Object.keys(stats.byCategory).length > 0 ? (
          Object.keys(stats.byCategory).map((cat) => (
            <View key={cat} style={styles.categoryRow}>
              <View style={styles.catInfo}>
                <Ionicons name="pie-chart-outline" size={20} color="#2e86de" />
                <Text style={styles.catName}>{cat}</Text>
              </View>
              <Text style={styles.catAmount}>${stats.byCategory[cat].toFixed(2)}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No data available for this period.</Text>
        )}
      </View>

      {/* Group Manager Placeholder Tip */}
      <View style={styles.tipBox}>
        <Ionicons name="people" size={24} color="#2e86de" />
        <Text style={styles.tipText}>
          <Text style={{fontWeight: 'bold'}}>Group Tip:</Text> Use the PDF export to share this report with your group members for easy settlement!
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: { fontSize: 26, fontWeight: "bold", color: "#2c3e50", marginBottom: 20 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 25 },
  card: {
    width: "48%",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  cardLabel: { fontSize: 14, color: "#7f8c8d", fontWeight: "600" },
  cardAmount: { fontSize: 20, fontWeight: "bold", marginTop: 5 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#34495e", marginBottom: 15 },
  progressBarBg: {
    height: 12,
    backgroundColor: "#ecf0f1",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#2e86de",
  },
  progressText: { marginTop: 8, color: "#95a5a6", fontSize: 13 },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f2f6",
  },
  catInfo: { flexDirection: "row", alignItems: "center" },
  catName: { fontSize: 16, color: "#2c3e50", marginLeft: 10 },
  catAmount: { fontSize: 16, fontWeight: "bold", color: "#2c3e50" },
  emptyText: { textAlign: "center", color: "#bdc3c7", marginTop: 10 },
  tipBox: {
    backgroundColor: "#f0f7ff",
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  tipText: { flex: 1, marginLeft: 10, color: "#2e86de", fontSize: 14 },
});