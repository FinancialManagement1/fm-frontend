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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../constants/theme";
import { useBudget } from "../../hooks/useBudget";

export default function BudgetScreen() {
  const insets = useSafeAreaInsets();
  const [isEditing, setIsEditing] = useState(false);
  const [budgetLimit, setBudgetLimit] = useState("");

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

  // Fetch on mount - defaults to current month
  useEffect(() => {
    fetchBudget();
  }, []);

  // Update input when budget loads
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

    const result = await saveBudget(null, limit); // null = current month
    if (result) {
      setIsEditing(false);
      Alert.alert("Success", "Budget saved");
    } else if (error) {
      Alert.alert("Error", error);
    }
  };

  const formatCurrency = (amount) => `€${amount?.toFixed(2) || "0.00"}`;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
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
        {loading && <ActivityIndicator color={theme.accent} style={{ margin: 40 }} />}

        {/* Budget Info Card */}
        <View style={styles.card}>
          {/* Period */}
          <View style={styles.row}>
            <Ionicons name="calendar-outline" size={18} color={theme.muted} />
            <Text style={styles.period}>{budget?.period || new Date().toISOString().slice(0, 7)}</Text>
          </View>

          {/* Limit */}
          <View style={styles.statRow}>
            <Text style={styles.label}>Budget Limit</Text>
            <Text style={styles.value}>{formatCurrency(limit)}</Text>
          </View>

          {/* Spent */}
          <View style={styles.statRow}>
            <Text style={styles.label}>Spent</Text>
            <Text style={[styles.value, { color: theme.expense }]}>{formatCurrency(spent)}</Text>
          </View>

          {/* Remaining */}
          <View style={styles.statRow}>
            <Text style={styles.label}>Remaining</Text>
            <Text style={[styles.value, { color: remaining < 0 ? theme.error : theme.income }]}>
              {formatCurrency(remaining)}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(progressPercentage || 0, 100)}%`,
                    backgroundColor: progressPercentage > 100 ? theme.error : theme.accent,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{Math.round(progressPercentage || 0)}% used</Text>
          </View>
        </View>

        {/* Edit Form */}
        {isEditing && (
          <View style={styles.card}>
            <Text style={styles.editTitle}>Set Monthly Budget</Text>
            <View style={styles.inputRow}>
              <Text style={styles.euro}>€</Text>
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
            <TouchableOpacity style={styles.setBtn} onPress={() => setIsEditing(true)}>
              <Text style={styles.setText}>Set Budget</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    padding: 20,
  },
  title: {
    fontSize: 28,
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
});
