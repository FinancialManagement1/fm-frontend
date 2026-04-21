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
  const [selectedPeriod, setSelectedPeriod] = useState(getCurrentPeriod());

  const {
    budget,
    loading,
    error,
    fetchBudget,
    saveBudget,
    hasBudget,
    isOverBudget,
    progressPercentage,
    remaining,
    spent,
    limit,
  } = useBudget();

  // Fetch budget on mount
  useEffect(() => {
    fetchBudget(selectedPeriod);
  }, [selectedPeriod]);

  // Update local state when budget changes
  useEffect(() => {
    if (budget && budget.limit > 0) {
      setBudgetLimit(String(budget.limit));
    }
  }, [budget]);

  function getCurrentPeriod() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }

  const handleSave = async () => {
    const limit = parseFloat(budgetLimit);
    if (isNaN(limit) || limit <= 0) {
      Alert.alert("Error", "Please enter a valid budget limit");
      return;
    }

    const result = await saveBudget(selectedPeriod, limit);
    if (result) {
      setIsEditing(false);
      Alert.alert("Success", "Budget saved successfully");
    } else if (error) {
      Alert.alert("Error", error);
    }
  };

  const getProgressColor = () => {
    if (isOverBudget) return theme.error;
    if (progressPercentage > 80) return "#f59e0b";
    return theme.income;
  };

  const formatCurrency = (amount) => {
    return `€${amount.toFixed(2)}`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Budget</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Ionicons
            name={isEditing ? "close" : "create-outline"}
            size={22}
            color={theme.accent}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.accent} />
          </View>
        )}

        {/* Budget Card */}
        <View style={styles.budgetCard}>
          <View style={styles.budgetHeader}>
            <View style={styles.periodSelector}>
              <Ionicons name="calendar-outline" size={18} color={theme.muted} />
              <Text style={styles.periodText}>{selectedPeriod}</Text>
            </View>
            {hasBudget && !isEditing && (
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: isOverBudget ? theme.error + "20" : theme.income + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: isOverBudget ? theme.error : theme.income },
                  ]}
                >
                  {isOverBudget ? "Over Budget" : "On Track"}
                </Text>
              </View>
            )}
          </View>

          {/* Progress Circle */}
          <View style={styles.progressContainer}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressPercentage}>{Math.round(progressPercentage)}%</Text>
              <Text style={styles.progressLabel}>Used</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Spent</Text>
              <Text style={styles.statValue}>{formatCurrency(spent)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Remaining</Text>
              <Text
                style={[
                  styles.statValue,
                  { color: isOverBudget ? theme.error : theme.income },
                ]}
              >
                {formatCurrency(remaining)}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Limit</Text>
              <Text style={styles.statValue}>{formatCurrency(limit)}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${Math.min(progressPercentage, 100)}%`, backgroundColor: getProgressColor() },
              ]}
            />
          </View>
        </View>

        {/* Edit Form */}
        {isEditing && (
          <View style={styles.editCard}>
            <Text style={styles.editTitle}>Set Budget Limit</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>€</Text>
              <TextInput
                style={styles.input}
                value={budgetLimit}
                onChangeText={setBudgetLimit}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={theme.muted}
              />
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Budget</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* No Budget State */}
        {!hasBudget && !isEditing && !loading && (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={60} color={theme.muted} />
            <Text style={styles.emptyTitle}>No Budget Set</Text>
            <Text style={styles.emptySubtitle}>
              Set a monthly budget to track your spending
            </Text>
            <TouchableOpacity
              style={styles.setBudgetButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.setBudgetButtonText}>Set Budget</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tips */}
        {hasBudget && !isEditing && (
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Tips</Text>
            {isOverBudget ? (
              <Text style={styles.tipText}>
                You're over budget! Consider reducing non-essential spending.
              </Text>
            ) : progressPercentage > 80 ? (
              <Text style={styles.tipText}>
                You're at {Math.round(progressPercentage)}% of your budget. Watch your spending!
              </Text>
            ) : (
              <Text style={styles.tipText}>
                Great job! You're well within your budget.
              </Text>
            )}
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.text,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.card,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  budgetCard: {
    backgroundColor: theme.card,
    borderRadius: 20,
    margin: 20,
    padding: 20,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  periodSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  periodText: {
    fontSize: 14,
    color: theme.muted,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  progressContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  progressCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    borderColor: theme.accent + "30",
    alignItems: "center",
    justifyContent: "center",
  },
  progressPercentage: {
    fontSize: 36,
    fontWeight: "700",
    color: theme.text,
  },
  progressLabel: {
    fontSize: 14,
    color: theme.muted,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: theme.muted,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.border,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: theme.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  editCard: {
    backgroundColor: theme.card,
    borderRadius: 20,
    margin: 20,
    padding: 20,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.bg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.accent,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: "600",
    color: theme.text,
  },
  saveButton: {
    backgroundColor: theme.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0D0D0D",
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.muted,
    marginTop: 8,
    textAlign: "center",
  },
  setBudgetButton: {
    backgroundColor: theme.accent,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginTop: 20,
  },
  setBudgetButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0D0D0D",
  },
  tipsCard: {
    backgroundColor: theme.accent + "10",
    borderRadius: 16,
    margin: 20,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.accent,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: theme.muted,
    lineHeight: 20,
  },
});
