import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Use Abir's hook - UI only, no direct storage access
  const { logout, isAuthenticated } = useAuth();

  // ── Runs every time this tab is opened ──
  useFocusEffect(
    useCallback(() => {
      checkLogin();
    }, [isAuthenticated])
  );

  const checkLogin = async () => {
    const hasToken = await isAuthenticated();
    setIsLoggedIn(hasToken);
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          // Call Abir's hook - UI does not touch storage directly
          const success = await logout();
          if (success) {
            setIsLoggedIn(false);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.scroll,
        {
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 20,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Text style={styles.title}>Profile</Text>

      {isLoggedIn ? (
        // ── Logged In View ──
        <View style={styles.content}>

          {/* Avatar */}
          <View style={styles.avatarBox}>
            <Ionicons name="person" size={40} color={theme.accent} />
          </View>
          <Text style={styles.userName}>Welcome back!</Text>
          <Text style={styles.userSub}>You are logged in</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Menu Items */}
          {[
            { icon: "person-outline", label: "Edit Profile" },
            { icon: "notifications-outline", label: "Notifications" },
            { icon: "shield-checkmark-outline", label: "Privacy & Security" },
            { icon: "help-circle-outline", label: "Help & Support" },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconBox}>
                <Ionicons name={item.icon} size={20} color={theme.accent} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.muted} />
            </TouchableOpacity>
          ))}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Logout Button */}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  title: {
    color: theme.text,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 24,
  },
  content: {
    alignItems: "center",
    width: "100%",
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
    marginBottom: 16,
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
    marginBottom: 24,
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
    marginVertical: 24,
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
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    backgroundColor: "rgba(245,166,35,0.1)",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  menuLabel: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
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
  },
  logoutText: {
    color: theme.expense,
    fontSize: 16,
    fontWeight: "700",
  },
});