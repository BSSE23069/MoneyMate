// screens/ProfileScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem("userProfile");
        if (storedProfile) {
          const { name, phone, profilePic } = JSON.parse(storedProfile);
          setName(name);
          setPhone(phone);
          setProfilePic(profilePic);
          setSaved(true);
        }
      } catch (e) {
        console.log("Error loading profile:", e);
      }
    };
    loadProfile();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfilePic(result.assets[0].uri);
    }
  };

  const saveProfile = async () => {
  const profile = { name, phone, profilePic };
  await AsyncStorage.setItem("userProfile", JSON.stringify(profile));

  // Check if coins were already rewarded
  const rewarded = await AsyncStorage.getItem("profileRewarded");
  if (!rewarded) {
    // First time profile saved → give 20 coins
    const currentCoins = parseInt((await AsyncStorage.getItem("coins")) || "0");
    const newCoins = currentCoins + 20;
    await AsyncStorage.setItem("coins", newCoins.toString());

    // Mark as rewarded
    await AsyncStorage.setItem("profileRewarded", "true");
  }

  setSaved(true);
};


  return (
    <View style={styles.container}>
      {/* Profile Image */}
      <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
        <Image
          source={
            profilePic
              ? { uri: profilePic }
              : require("../assets/default.png") // ✅ FIXED
          }
          style={styles.avatar}
        />
        <Text style={styles.changeText}>
          {profilePic ? "Change Photo" : "Add Photo"}
        </Text>
      </TouchableOpacity>

      {!saved ? (
        <>
          <TextInput
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <TextInput
            placeholder="Enter phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={styles.input}
          />
          <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
            <Text style={styles.btnText}>Save Profile</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.textName}>{name}</Text>
          <Text style={styles.textPhone}>{phone}</Text>
          <TouchableOpacity
            style={styles.changeBtn}
            onPress={() => setSaved(false)}
          >
            <Text style={styles.btnText}>Edit Profile</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 50,
    backgroundColor: "#f4f6f9",
  },
  avatarWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#2e86de",
  },
  changeText: {
    marginTop: 8,
    fontSize: 14,
    color: "#2e86de",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    marginVertical: 8,
    borderRadius: 10,
    width: "85%",
    backgroundColor: "#fff",
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: "#2e86de",
    padding: 14,
    borderRadius: 10,
    marginTop: 15,
    width: "85%",
    alignItems: "center",
  },
  changeBtn: {
    backgroundColor: "#27ae60",
    padding: 14,
    borderRadius: 10,
    marginTop: 15,
    width: "85%",
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  textName: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
    color: "#2c3e50",
  },
  textPhone: {
    fontSize: 16,
    color: "#7f8c8d",
    marginTop: 5,
  },
});
