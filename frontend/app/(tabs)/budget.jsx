import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { theme } from "../../constants/theme";
import { useBudget } from "../../hooks/useBudget";
import { useCurrency } from "../../hooks/useCurrency";

export default function BudgetScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [budgetLimit, setBudgetLimit] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState(getCurrentPeriod());
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const {
    budget,
    loading,
    error,
    fetchBudget,
    saveBudget,
    hasBudget,
    progressPercentage,
    remaining,
    spent,
    limit,
  } = useBudget();

  const { currencySymbol } = useCurrency();

  useEffect(() => {
    fetchBudget(selectedPeriod);
  }, [selectedPeriod]);

  useEffect(() => {
    if (budget?.limit > 0) {
      setBudgetLimit(String(budget.limit));
    }
  }, [budget]);

  const handleSave = async () => {
    const limit = parseFloat(budgetLimit);
    if (isNaN(limit) || limit <= 0) {
      Alert.alert("Error", "Please enter a valid budget limit");
      return;
    }

    const result = await saveBudget(selectedPeriod, limit);
    if (result) {
      setIsEditing(false);
      Alert.alert("Success", "Budget saved");
    } else if (error) {
      Alert.alert("Error", error);
    }
  };

  function getCurrentPeriod() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }

  const formatCurrency = (amount) => `${currencySymbol}${amount?.toFixed(2) || "0.00"}`;

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const years = [2024, 2025, 2026, 2027, 2028];

  const handleMonthSelect = (year, monthIndex) => {
    const period = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
    setSelectedPeriod(period);
    setShowMonthPicker(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* ── Header with Back Button ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>

        <Text style={styles.title}>Budget</Text>

        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Ionicons
            name={isEditing ? "close" : "create-outline"}
            size={22}
            color={theme.accent}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {loading && (
          <ActivityIndicator color={theme.accent} style={{ margin: 40 }} />
        )}

        {/* Budget Info Card */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => setShowMonthPicker(true)}
          >
            <Ionicons name="calendar-outline" size={18} color={theme.muted} />
            <Text style={styles.period}>{selectedPeriod}</Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={theme.muted}
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>

          <View style={styles.statRow}>
            <Text style={styles.label}>Budget Limit</Text>
            <Text style={styles.value}>{formatCurrency(limit)}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.label}>Spent</Text>
            <Text style={[styles.value, { color: theme.expense }]}>
              {formatCurrency(spent)}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.label}>Remaining</Text>
            <Text
              style={[
                styles.value,
                { color: remaining < 0 ? theme.error : theme.income },
              ]}
            >
              {formatCurrency(remaining)}
            </Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(progressPercentage || 0, 100)}%`,
                    backgroundColor:
                      progressPercentage > 100 ? theme.error : theme.accent,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(progressPercentage || 0)}% used
            </Text>
          </View>
        </View>

        {/* Edit Form */}
        {isEditing && (
          <View style={styles.card}>
            <Text style={styles.editTitle}>Set Monthly Budget</Text>
            <View style={styles.inputRow}>
              <Text style={styles.euro}>{currencySymbol}</Text>
              <TextInput
                style={styles.input}
                value={budgetLimit}
                onChangeText={setBudgetLimit}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={theme.muted}
              />
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* No Budget State */}
        {!hasBudget && !isEditing && !loading && (
          <View style={styles.center}>
            <Ionicons name="wallet-outline" size={50} color={theme.muted} />
            <Text style={styles.noBudgetText}>No budget set</Text>
            <TouchableOpacity
              style={styles.setBtn}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.setText}>Set Budget</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Month/Year Picker Modal */}
      <Modal
        visible={showMonthPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Month</Text>
              <TouchableOpacity onPress={() => setShowMonthPicker(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={years}
              keyExtractor={(item) => String(item)}
              renderItem={({ item: year }) => (
                <View style={styles.yearSection}>
                  <Text style={styles.yearText}>{year}</Text>
                  <View style={styles.monthsGrid}>
                    {months.map((month, index) => (
                      <TouchableOpacity
                        key={month}
                        style={[
                          styles.monthButton,
                          selectedPeriod ===
                            `${year}-${String(index + 1).padStart(2, "0")}` &&
                            styles.monthButtonActive,
                        ]}
                        onPress={() => handleMonthSelect(year, index)}
                      >
                        <Text
                          style={[
                            styles.monthText,
                            selectedPeriod ===
                              `${year}-${String(index + 1).padStart(2, "0")}` &&
                              styles.monthTextActive,
                          ]}
                        >
                          {month.slice(0, 3)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.text,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: theme.card,
    borderRadius: 16,
    margin: 16,
    padding: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  period: {
    fontSize: 14,
    color: theme.muted,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    color: theme.muted,
  },
  value: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.text,
  },
  progressContainer: {
    marginTop: 20,
  },
  progressBg: {
    height: 8,
    backgroundColor: theme.border,
    borderRadius: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: theme.muted,
    marginTop: 8,
    textAlign: "center",
  },
  editTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.bg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  euro: {
    fontSize: 20,
    color: theme.accent,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 20,
    color: theme.text,
  },
  saveBtn: {
    backgroundColor: theme.accent,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0D0D0D",
  },
  center: {
    alignItems: "center",
    padding: 40,
  },
  noBudgetText: {
    fontSize: 16,
    color: theme.muted,
    marginTop: 12,
  },
  setBtn: {
    backgroundColor: theme.accent,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 20,
  },
  setText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0D0D0D",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.text,
  },
  yearSection: {
    marginBottom: 20,
  },
  yearText: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.accent,
    marginBottom: 12,
  },
  monthsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  monthButton: {
    width: "22%",
    paddingVertical: 12,
    backgroundColor: theme.bg,
    borderRadius: 8,
    alignItems: "center",
  },
  monthButtonActive: {
    backgroundColor: theme.accent,
  },
  monthText: {
    fontSize: 14,
    color: theme.text,
    fontWeight: "500",
  },
  monthTextActive: {
    color: "#0D0D0D",
  },
});