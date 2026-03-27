import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../constants/theme";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
      >

        {/* Wallet Icon */}
        <View style={styles.logoBox}>
          <Ionicons name="wallet" size={38} color="#1A0D00" />
        </View>

        {/* App Name */}
        <Text style={styles.appName}>MoneyTracker</Text>

        {/* Tagline */}
        <Text style={styles.tagline}>Track. Save. Thrive.</Text>

        {/* Form */}
        <View style={styles.form}>

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <View style={[
            styles.inputRow,
            emailFocused && styles.inputFocused,
          ]}>
            <Ionicons
              name="mail-outline"
              size={18}
              color={emailFocused ? theme.accent : theme.muted}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={theme.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={[
            styles.inputRow,
            passFocused && styles.inputFocused,
          ]}>
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color={passFocused ? theme.accent : theme.muted}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor={theme.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              onFocus={() => setPassFocused(true)}
              onBlur={() => setPassFocused(false)}
            />
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.btn}
            activeOpacity={0.85}
            onPress={() => router.push("/transactions")}
          >
            <Text style={styles.btnText}>Login</Text>
          </TouchableOpacity>

          {/* Switch to Signup */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text style={styles.switchLink}>Sign up</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.bg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  logoBox: {
    width: 80,
    height: 80,
    backgroundColor: theme.accent,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  },
  appName: {
    fontSize: 32,
    fontWeight: "800",
    color: theme.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: theme.muted,
    marginBottom: 44,
    letterSpacing: 1.2,
  },
  form: { width: "100%" },
  label: {
    color: "#AAAAAA",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.input,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.border,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 20,
  },
  inputFocused: {
    borderColor: theme.accent,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: theme.text,
    fontSize: 15,
  },
  btn: {
    backgroundColor: theme.accent,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 4,
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  btnText: {
    color: "#1A0D00",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  switchText: {
    color: theme.muted,
    fontSize: 14,
  },
  switchLink: {
    color: theme.accent,
    fontWeight: "700",
    fontSize: 14,
  },
});