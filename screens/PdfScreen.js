import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, Alert,TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PdfScreen() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Load user profile for statement header
    const loadProfile = async () => {
      const storedProfile = await AsyncStorage.getItem("userProfile");
      if (storedProfile) setProfile(JSON.parse(storedProfile));
    };
    loadProfile();
  }, []);

  // Helper to normalize date to YYYY-MM-DD string
  const normalizeDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const generatePDF = async () => {
    try {
      // Get stored transactions
      const expensesData = JSON.parse(await AsyncStorage.getItem("expenses")) || [];
      const incomesData = JSON.parse(await AsyncStorage.getItem("incomes")) || [];

      // Normalize start and end dates for comparison
      const normalizedStartDate = normalizeDate(startDate);
      const normalizedEndDate = normalizeDate(endDate);

      // Filter by date range (inclusive)
      const filteredExpenses = expensesData.filter(
        (e) => e.date >= normalizedStartDate && e.date <= normalizedEndDate
      );
      const filteredIncomes = incomesData.filter(
        (i) => i.date >= normalizedStartDate && i.date <= normalizedEndDate
      );

      // Totals
      const totalExpenses = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
      const totalIncomes = filteredIncomes.reduce((sum, i) => sum + parseFloat(i.amount), 0);
      const balance = totalIncomes - totalExpenses;

      // Bank-style PDF HTML
      const htmls = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
              h1 { text-align: center; color: #2e86de; margin-bottom: 25px; }
              h2 { margin-top: 30px; color: #555; border-bottom: 1px solid #eee; padding-bottom: 8px; font-size: 18px;}
              p { margin-bottom: 5px; font-size: 14px;}
              table { width: 100%; border-collapse: collapse; margin-top: 15px; }
              th, td { border: 1px solid #e0e0e0; padding: 10px; text-align: left; font-size: 13px; }
              th { background: #f0f0f0; font-weight: bold; }
              .total-row td { font-weight: bold; background: #eaf3fe; }
              .income { color: #28a745; }
              .expense { color: #dc3545; }
              .balance-section { margin-top: 40px; text-align: center; background: #e9ecef; padding: 20px; border-radius: 8px;}
              .final-balance { font-size: 24px; font-weight: bold; color: #007bff; margin-top: 10px;}
            </style>
          </head>
          <body>
            <h1>MoneyMate Financial Statement</h1>
            <p><b>Account Holder:</b> ${profile?.name || "N/A"}</p>
            <p><b>Phone:</b> ${profile?.phone || "-"}</p>
            <p><b>Statement Period:</b> ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}</p>

            <h2>Income Transactions</h2>
            <table>
              <thead>
                <tr><th>Date</th><th>Description</th><th>Amount</th></tr>
              </thead>
              <tbody>
              ${filteredIncomes.length > 0 ? 
                filteredIncomes.map(
                (i) => `
                  <tr>
                    <td>${new Date(i.date).toLocaleDateString()}</td>
                    <td>${i.source || "Income"}</td>
                    <td class="income">+$${i.amount.toFixed(2)}</td>
                  </tr>
                `
              ).join("") : '<tr><td colspan="3" style="text-align: center;">No income transactions in this period.</td></tr>'}
              </tbody>
              <tfoot>
                <tr class="total-row"><td colspan="2">Total Income</td><td class="income">+$${totalIncomes.toFixed(2)}</td></tr>
              </tfoot>
            </table>

            <h2>Expense Transactions</h2>
            <table>
              <thead>
                <tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th></tr>
              </thead>
              <tbody>
              ${filteredExpenses.length > 0 ? 
                filteredExpenses.map(
                (e) => `
                  <tr>
                    <td>${new Date(e.date).toLocaleDateString()}</td>
                    <td>${e.title || "Expense"}</td>
                    <td>${e.category || "N/A"}</td>
                    <td class="expense">-$${e.amount.toFixed(2)}</td>
                  </tr>
                `
              ).join("") : '<tr><td colspan="4" style="text-align: center;">No expense transactions in this period.</td></tr>'}
              </tbody>
              <tfoot>
                <tr class="total-row"><td colspan="3">Total Expenses</td><td class="expense">-$${totalExpenses.toFixed(2)}</td></tr>
              </tfoot>
            </table>

            <div class="balance-section">
              <p>Overall Balance for the period:</p>
              <p class="final-balance" style="color: ${balance >= 0 ? '#28a745' : '#dc3545'};">$${balance.toFixed(2)}</p>
            </div>
          </body>
        </html>
      `;

      // Generate PDF
      const { uri } = await Print.printToFileAsync({ html: htmls });
      console.log("✅ PDF created at:", uri);

      // Share PDF
      if (uri) {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      } else {
        Alert.alert("Error", "Could not create PDF file.");
      }
      
    } catch (err) {
      console.log("❌ Error generating PDF:", err);
      Alert.alert("Error", "Failed to generate PDF. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Generate Bank-Style Statement</Text>

      <View style={styles.datePickerContainer}>
        <Button title={`Start Date: ${startDate.toLocaleDateString()}`} onPress={() => setShowStart(true)} />
        {showStart && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={(e, date) => {
              setShowStart(false);
              if (date) setStartDate(date);
            }}
          />
        )}
      </View>

      <View style={styles.datePickerContainer}>
        <Button title={`End Date: ${endDate.toLocaleDateString()}`} onPress={() => setShowEnd(true)} />
        {showEnd && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={(e, date) => {
              setShowEnd(false);
              if (date) setEndDate(date);
            }}
          />
        )}
      </View>

      <TouchableOpacity style={styles.generateBtn} onPress={generatePDF}>
        <Text style={styles.generateBtnText}>Generate & Share PDF</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, backgroundColor: '#f9f9f9' },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 30, color: '#333' },
  datePickerContainer: {
    marginVertical: 10,
    width: '80%',
  },
  generateBtn: {
    backgroundColor: "#2e86de",
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
    width: '80%',
    alignItems: 'center',
  },
  generateBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});