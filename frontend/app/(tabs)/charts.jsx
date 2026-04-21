// Charts Tab - Shows Reports UI (Financial Overview)

import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../constants/theme";
import { useReports } from "../../hooks/useReports";
import { PieChart } from "../../components/PieChartSimple";

const { width } = Dimensions.get("window");

export default function ChartsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedPeriod, setSelectedPeriod] = useState(getCurrentPeriod());

  const {
    summary,
    loading,
    error,
    fetchAllReports,
    income,
    expenses,
    balance,
  } = useReports();

  useEffect(() => {
    fetchAllReports(selectedPeriod);
  }, [selectedPeriod]);

  function getCurrentPeriod() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }

  const pieData = [
    { name: "Income", value: income || 0, color: theme.income },
    { name: "Expenses", value: expenses || 0, color: theme.expense },
    { name: "Savings", value: balance > 0 ? balance : 0, color: theme.accent },
  ].filter((item) => item.value > 0);

  const formatCurrency = (amount) => `€${amount?.toFixed(2) || "0.00"}`;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Financial Overview</Text>
        <View style={styles.periodButton}>
          <Ionicons name="calendar-outline" size={18} color={theme.text} />
          <Text style={styles.periodText}>{selectedPeriod}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.accent} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={40} color={theme.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && !error && summary && (
          <>
            <View style={styles.summaryContainer}>
              <View style={[styles.summaryCard, { backgroundColor: theme.income + "20" }]}>
                <Ionicons name="arrow-up" size={24} color={theme.income} />
                <Text style={styles.summaryLabel}>Income</Text>
                <Text style={[styles.summaryValue, { color: theme.income }]}>
                  {formatCurrency(income)}
                </Text>
              </View>

              <View style={[styles.summaryCard, { backgroundColor: theme.expense + "20" }]}>
                <Ionicons name="arrow-down" size={24} color={theme.expense} />
                <Text style={styles.summaryLabel}>Expenses</Text>
                <Text style={[styles.summaryValue, { color: theme.expense }]}>
                  {formatCurrency(expenses)}
                </Text>
              </View>

              <View style={[styles.summaryCard, { backgroundColor: theme.accent + "20" }]}>
                <Ionicons name="wallet" size={24} color={theme.accent} />
                <Text style={styles.summaryLabel}>Balance</Text>
                <Text style={[styles.summaryValue, { color: theme.accent }]}>
                  {formatCurrency(balance)}
                </Text>
              </View>
            </View>

            {pieData.length > 0 && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Spending Distribution</Text>
                <PieChart data={pieData} />
              </View>
            )}
          </>
        )}

        {!loading && !error && !summary && (
          <View style={styles.noDataContainer}>
            <Ionicons name="bar-chart-outline" size={60} color={theme.muted} />
            <Text style={styles.noDataText}>No data available</Text>
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
    fontSize: 24,
    fontWeight: "700",
    color: theme.text,
  },
  periodButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  periodText: {
    fontSize: 14,
    color: theme.text,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    padding: 60,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: theme.muted,
  },
  errorContainer: {
    padding: 60,
    alignItems: "center",
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: theme.error,
    textAlign: "center",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    color: theme.muted,
    marginTop: 8,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  chartCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    margin: 16,
    padding: 20,
    alignItems: "center",
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 20,
  },
  noDataContainer: {
    padding: 60,
    alignItems: "center",
  },
  noDataText: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.text,
    marginTop: 16,
  },
});