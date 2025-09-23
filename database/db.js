// database/db.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "expenses";

export const saveExpenses = async (expenses) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (e) {
    console.log("❌ Error saving:", e);
  }
};

export const loadExpenses = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.log("❌ Error loading:", e);
    return [];
  }
};
