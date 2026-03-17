import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import { theme } from "../../constants/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    const token = await AsyncStorage.getItem("token");
    setIsLoggedIn(!!token);
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("token");
          setIsLoggedIn(false);
        },
      },
    ]);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 16 }]}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      {isLoggedIn ? (
        // ── Logged In View ──
        <View style={styles.content}>
          <View style={styles.avatarBox}>
            <Ionicons name="person" size={40} color={theme.accent} />
          </View>
          <Text style={styles.userName}>Welcome back!</Text>
          <Text style={styles.userSub}>You are logged in</Text>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color={theme.expense} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // ── Not Logged In View ──
        <View style={styles.content}>

          {/* Icon */}
          <View style={styles.avatarBox}>
            <Ionicons name="person-outline" size={40} color={theme.muted} />
          </View>

          <Text style={styles.userName}>You're not logged in</Text>
          <Text style={styles.userSub}>
            Login or create an account to{"\n"}track your finances
          </Text>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push("/login")}
            activeOpacity={0.85}
          >
            <Ionicons name="log-in-outline" size={20} color="#1A0D00" />
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={styles.signupBtn}
            onPress={() => router.push("/signup")}
            activeOpacity={0.85}
          >
            <Ionicons name="person-add-outline" size={20} color={theme.accent} />
            <Text style={styles.signupBtnText}>Create Account</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Benefits */}
          {[
            { icon: "shield-checkmark-outline", text: "Secure & private" },
            { icon: "trending-up-outline", text: "Track income & expenses" },
            { icon: "trophy-outline", text: "Set financial goals" },
            { icon: "scan-outline", text: "AI receipt scanning" },
          ].map((item) => (
            <View key={item.text} style={styles.benefitRow}>
              <Ionicons
                name={item.icon}
                size={18}
                color={theme.accent}
                style={{ marginRight: 12 }}
              />
              <Text style={styles.benefitText}>{item.text}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    color: theme.text,
    fontSize: 24,
    fontWeight: "800",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 20,
  },
  avatarBox: {
    width: 90,
    height: 90,
    backgroundColor: theme.card,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 20,
  },
  userName: {
    color: theme.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  userSub: {
    color: theme.muted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.accent,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: "100%",
    justifyContent: "center",
    gap: 10,
    marginBottom: 12,
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  loginBtnText: {
    color: "#1A0D00",
    fontSize: 16,
    fontWeight: "800",
  },
  signupBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: "100%",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1.5,
    borderColor: theme.accent,
  },
  signupBtnText: {
    color: theme.accent,
    fontSize: 16,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    width: "100%",
    marginVertical: 28,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
  },
  benefitText: {
    color: theme.muted,
    fontSize: 14,
    fontWeight: "500",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,107,107,0.1)",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: "100%",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.3)",
    marginTop: 16,
  },
  logoutText: {
    color: theme.expense,
    fontSize: 16,
    fontWeight: "700",
  },
});