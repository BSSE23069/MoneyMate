// App.js
import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Text,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Screens
import HomeScreen from "./screens/HomeScreen";
import AddExpenseScreen from "./screens/AddExpenseScreen";
import AddIncomeScreen from "./screens/AddIncomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import PdfScreen from "./screens/PdfScreen";
import ReportScreen from "./screens/ReportScreen"; // Ensure this import exists

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function Tabs({ navigation }) {
  const [profilePic, setProfilePic] = useState(null);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    const loadProfileAndBalance = async () => {
      try {
        const savedPic = await AsyncStorage.getItem("profilePic");
        if (savedPic) setProfilePic(savedPic);

        const storedCoins = await AsyncStorage.getItem("coins");
        if (storedCoins) setCoins(parseInt(storedCoins));
      } catch (err) {
        console.log("Error loading profile/balance:", err);
      }
    };

    const unsubscribe = navigation.addListener("focus", loadProfileAndBalance);
    loadProfileAndBalance();

    return unsubscribe;
  }, [navigation]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitle: "",
        headerTitleAlign: "center",
        headerRight: () => (
          <View style={styles.headerRight}>
            <View style={styles.balanceContainer}>
              <FontAwesome5 name="coins" size={20} color="#f1c40f" />
              <Text style={styles.balanceText}>{coins} Coins</Text>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
              <Image
                source={
                  profilePic
                    ? { uri: profilePic }
                    : require("./assets/default.png")
                }
                style={styles.profilePic}
              />
            </TouchableOpacity>
          </View>
        ),
        headerLeft: () => (
          <View style={styles.headerLeft}>
            <Text style={styles.appTitle}>💰 MoneyMate</Text>
          </View>
        ),
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Home") iconName = "home";
          else if (route.name === "Add Expense") iconName = "remove-circle";
          else if (route.name === "Add Income") iconName = "add-circle";
          else if (route.name === "Reports") iconName = "bar-chart";
          else if (route.name === "PDF") iconName = "document-text";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#2e86de",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { paddingBottom: 5, height: 60 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Add Expense" component={AddExpenseScreen} />
      <Tab.Screen name="Add Income" component={AddIncomeScreen} />
      <Tab.Screen name="Reports" component={ReportScreen} />
      <Tab.Screen name="PDF" component={PdfScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  // Logic for ads is removed from here
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Tabs"
          component={Tabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            headerTitle: "My Profile",
            headerBackTitleVisible: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
    backgroundColor: "#ecf0f1",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  balanceText: {
    marginLeft: 5,
    fontWeight: "bold",
    color: "#27ae60",
    fontSize: 14,
  },
  profilePic: {
    width: 38,
    height: 38,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  headerLeft: {
    marginLeft: 15,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2e86de",
  },
});