import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerUser } from "../services/authService";


// ── Country List ──
const COUNTRIES = [
  { code: "AF", name: "Afghanistan", flag: "🇦🇫" },
  { code: "AL", name: "Albania", flag: "🇦🇱" },
  { code: "DZ", name: "Algeria", flag: "🇩🇿" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "HR", name: "Croatia", flag: "🇭🇷" },
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "GR", name: "Greece", flag: "🇬🇷" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰" },
  { code: "HU", name: "Hungary", flag: "🇭🇺" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "IR", name: "Iran", flag: "🇮🇷" },
  { code: "IQ", name: "Iraq", flag: "🇮🇶" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "IL", name: "Israel", flag: "🇮🇱" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "JO", name: "Jordan", flag: "🇯🇴" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼" },
  { code: "LB", name: "Lebanon", flag: "🇱🇧" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "MA", name: "Morocco", flag: "🇲🇦" },
  { code: "NP", name: "Nepal", flag: "🇳🇵" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "QA", name: "Qatar", flag: "🇶🇦" },
  { code: "RO", name: "Romania", flag: "🇷🇴" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "TW", name: "Taiwan", flag: "🇹🇼" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
];

// ── Currency List ──
const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
  { code: "THB", name: "Thai Baht", symbol: "฿" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
];

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [focused, setFocused] = useState(null);
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [currencyPickerVisible, setCurrencyPickerVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [countrySearch, setCountrySearch] = useState("");
  const [currencySearch, setCurrencySearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredCountries = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()),
  );

  const filteredCurrencies = CURRENCIES.filter(
    (c) =>
      c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(currencySearch.toLowerCase()),
  );

  const handleSignup = async () => {
    setError("");

    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      country: selectedCountry?.name || "",
      preferredCurrency: selectedCurrency?.code || "",
    };

    if (
      !payload.name ||
      !payload.email ||
      !payload.password ||
      !payload.country ||
      !payload.preferredCurrency
    ) {
      setError("Please fill in all fields, including country and currency.");
      return;
    }

    try {
      setLoading(true);

      const response = await registerUser(payload);

      await AsyncStorage.setItem("currency", selectedCurrency?.code || "EUR");
      await AsyncStorage.setItem("currencySymbol", selectedCurrency?.symbol || "€");

      Alert.alert(
        "Success",
        response.message || "User successfully registered",
      );

      router.push("/login");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Accent Bar */}
        <View style={styles.accentBar} />

        {/* App Name */}
        <Text style={styles.appName}>MoneyTracker</Text>

        {/* Full Name */}
        <Text style={styles.label}>Full Name</Text>
        <View
          style={[styles.inputRow, focused === "name" && styles.inputFocused]}
        >
          <Ionicons
            name="person-outline"
            size={18}
            color={focused === "name" ? theme.accent : theme.muted}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor={theme.muted}
            value={form.name}
            onChangeText={(v) => setForm({ ...form, name: v })}
            autoCapitalize="words"
            onFocus={() => setFocused("name")}
            onBlur={() => setFocused(null)}
          />
        </View>

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <View
          style={[styles.inputRow, focused === "email" && styles.inputFocused]}
        >
          <Ionicons
            name="mail-outline"
            size={18}
            color={focused === "email" ? theme.accent : theme.muted}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={theme.muted}
            value={form.email}
            onChangeText={(v) => setForm({ ...form, email: v })}
            keyboardType="email-address"
            autoCapitalize="none"
            onFocus={() => setFocused("email")}
            onBlur={() => setFocused(null)}
          />
        </View>

        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <View
          style={[
            styles.inputRow,
            focused === "password" && styles.inputFocused,
          ]}
        >
          <Ionicons
            name="lock-closed-outline"
            size={18}
            color={focused === "password" ? theme.accent : theme.muted}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor={theme.muted}
            value={form.password}
            onChangeText={(v) => setForm({ ...form, password: v })}
            secureTextEntry
            onFocus={() => setFocused("password")}
            onBlur={() => setFocused(null)}
          />
        </View>

        {/* Country Picker */}
        <Text style={styles.label}>Country</Text>
        <TouchableOpacity
          style={[styles.inputRow, countryPickerVisible && styles.inputFocused]}
          onPress={() => setCountryPickerVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons
            name="globe-outline"
            size={18}
            color={countryPickerVisible ? theme.accent : theme.muted}
            style={styles.inputIcon}
          />
          {selectedCountry ? (
            <View style={styles.pickerValueRow}>
              <Text style={styles.flagText}>{selectedCountry.flag}</Text>
              <Text style={styles.pickerValueText}>{selectedCountry.name}</Text>
            </View>
          ) : (
            <Text style={styles.placeholderText}>Select your country</Text>
          )}
          <Ionicons name="chevron-down" size={16} color={theme.muted} />
        </TouchableOpacity>

        {/* Currency Picker */}
        <Text style={styles.label}>Preferred Currency</Text>
        <TouchableOpacity
          style={[
            styles.inputRow,
            currencyPickerVisible && styles.inputFocused,
          ]}
          onPress={() => setCurrencyPickerVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons
            name="logo-usd"
            size={18}
            color={currencyPickerVisible ? theme.accent : theme.muted}
            style={styles.inputIcon}
          />
          {selectedCurrency ? (
            <View style={styles.pickerValueRow}>
              <Text style={styles.currencySymbolText}>
                {selectedCurrency.symbol}
              </Text>
              <Text style={styles.pickerValueText}>
                {selectedCurrency.code} — {selectedCurrency.name}
              </Text>
            </View>
          ) : (
            <Text style={styles.placeholderText}>Select currency</Text>
          )}
          <Ionicons name="chevron-down" size={16} color={theme.muted} />
        </TouchableOpacity>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Sign Up Button */}
        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          activeOpacity={0.85}
          onPress={handleSignup}
          disabled={loading}
        >
          <Text style={styles.btnText}>
            {loading ? "Signing up..." : "Sign up"}
          </Text>
        </TouchableOpacity>

        {/* Switch to Login */}
        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.switchLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Country Modal ── */}
      <Modal
        visible={countryPickerVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setCountryPickerVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalHeader, { paddingTop: insets.top + 16 }]}>
            <TouchableOpacity
              onPress={() => {
                setCountryPickerVisible(false);
                setCountrySearch("");
              }}
              style={styles.modalCloseBtn}
            >
              <Ionicons name="close" size={22} color={theme.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Country</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.searchRow}>
            <Ionicons
              name="search-outline"
              size={18}
              color={theme.muted}
              style={{ marginRight: 10 }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search country..."
              placeholderTextColor={theme.muted}
              value={countrySearch}
              onChangeText={setCountrySearch}
              autoCapitalize="none"
            />
          </View>

          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.code}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.listItem,
                  selectedCountry?.code === item.code &&
                    styles.listItemSelected,
                ]}
                onPress={() => {
                  setSelectedCountry(item);
                  setCountryPickerVisible(false);
                  setCountrySearch("");
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.flagCircle,
                    selectedCountry?.code === item.code &&
                      styles.flagCircleSelected,
                  ]}
                >
                  <Text style={styles.flagEmoji}>{item.flag}</Text>
                </View>
                <Text style={styles.listItemName}>{item.name}</Text>
                {selectedCountry?.code === item.code && (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={theme.accent}
                  />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      {/* ── Currency Modal ── */}
      <Modal
        visible={currencyPickerVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setCurrencyPickerVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalHeader, { paddingTop: insets.top + 16 }]}>
            <TouchableOpacity
              onPress={() => {
                setCurrencyPickerVisible(false);
                setCurrencySearch("");
              }}
              style={styles.modalCloseBtn}
            >
              <Ionicons name="close" size={22} color={theme.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Currency</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.searchRow}>
            <Ionicons
              name="search-outline"
              size={18}
              color={theme.muted}
              style={{ marginRight: 10 }}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search currency..."
              placeholderTextColor={theme.muted}
              value={currencySearch}
              onChangeText={setCurrencySearch}
              autoCapitalize="none"
            />
          </View>

          <FlatList
            data={filteredCurrencies}
            keyExtractor={(item) => item.code}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.listItem,
                  selectedCurrency?.code === item.code &&
                    styles.listItemSelected,
                ]}
                onPress={() => {
                  setSelectedCurrency(item);
                  setCurrencyPickerVisible(false);
                  setCurrencySearch("");
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.symbolCircle,
                    selectedCurrency?.code === item.code &&
                      styles.symbolCircleSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.symbolText,
                      selectedCurrency?.code === item.code &&
                        styles.symbolTextSelected,
                    ]}
                  >
                    {item.symbol}
                  </Text>
                </View>
                <View style={styles.currencyInfo}>
                  <Text style={styles.listItemName}>{item.name}</Text>
                  <Text style={styles.currencyCode}>{item.code}</Text>
                </View>
                {selectedCurrency?.code === item.code && (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={theme.accent}
                  />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 28,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: theme.card,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.border,
  },
  headerTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "700",
  },
  accentBar: {
    width: 48,
    height: 5,
    backgroundColor: theme.accent,
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    color: theme.text,
    textAlign: "center",
    marginBottom: 32,
    letterSpacing: -0.5,
  },
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
    marginBottom: 18,
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
  pickerValueRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  flagText: {
    fontSize: 22,
    marginRight: 10,
  },
  currencySymbolText: {
    color: theme.accent,
    fontSize: 16,
    fontWeight: "700",
    marginRight: 10,
    width: 24,
  },
  pickerValueText: {
    color: theme.text,
    fontSize: 15,
    flex: 1,
  },
  placeholderText: {
    color: theme.muted,
    fontSize: 15,
    flex: 1,
  },
  btn: {
    backgroundColor: theme.accent,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 8,
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
  errorText: {
    color: theme.error,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 10,
  },
  btnDisabled: {
    opacity: 0.7,
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

  // ── Modal Styles ──
  modalContainer: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  modalCloseBtn: {
    width: 40,
    height: 40,
    backgroundColor: theme.card,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.border,
  },
  modalTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "700",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.input,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.border,
    paddingHorizontal: 16,
    height: 50,
    margin: 16,
  },
  searchInput: {
    flex: 1,
    color: theme.text,
    fontSize: 15,
  },
  separator: {
    height: 1,
    backgroundColor: theme.border,
    marginHorizontal: 20,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  listItemSelected: {
    backgroundColor: "rgba(245,166,35,0.08)",
  },
  listItemName: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  flagCircle: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  flagCircleSelected: {
    backgroundColor: "rgba(245,166,35,0.15)",
    borderColor: theme.accent,
  },
  flagEmoji: {
    fontSize: 24,
  },
  symbolCircle: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  symbolCircleSelected: {
    backgroundColor: "rgba(245,166,35,0.15)",
    borderColor: theme.accent,
  },
  symbolText: {
    color: theme.muted,
    fontSize: 16,
    fontWeight: "700",
  },
  symbolTextSelected: {
    color: theme.accent,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
});
