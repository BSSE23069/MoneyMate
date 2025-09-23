// screens/PdfScreen.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function PdfScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Generate PDF Report</Text>
      <Text style={styles.text}>
        Here you’ll be able to generate and export your expenses as a PDF.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  text: { fontSize: 16, color: "gray" },
});
