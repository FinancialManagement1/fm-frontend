// Charts Tab - Shows Reports UI (Financial Overview)

import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../constants/theme";
import { useTransactions } from "../../hooks/useTransactions";
import { PieChart } from "../../components/PieChartSimple";
import { LineChart } from "../../components/LineChart";
import { useBudget } from "../../hooks/useBudget";
import { useReports } from "../../hooks/useReports";
import { useCurrency } from "../../hooks/useCurrency";

const { width } = Dimensions.get("window");

export default function ChartsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedPeriod, setSelectedPeriod] = useState(getCurrentPeriod());
  const { currencySymbol } = useCurrency();

  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
    fetchTransactions,
  } = useTransactions();

  const {
    budget,
    loading: budgetLoading,
    fetchBudget,
  } = useBudget();

  const {
    summary,
    trends,
    loading: reportsLoading,
    fetchSummary,
    fetchTrends,
  } = useReports();

  const [showMonthPicker, setShowMonthPicker] = useState(false);

  useEffect(() => {
    console.log("📅 Selected Period:", selectedPeriod);
    fetchBudget(selectedPeriod);
    fetchSummary(selectedPeriod);
    fetchTrends(selectedPeriod);
  }, [selectedPeriod]);

  useEffect(() => {
    console.log("💰 Budget Data:", JSON.stringify(budget));
    console.log("💰 Budget Limit:", budget?.limit);
  }, [budget]);

  useEffect(() => {
    console.log("📈 Summary Data:", JSON.stringify(summary));
    console.log("📈 API Income:", summary?.income, "API Expenses:", summary?.expenses);
  }, [summary]);

  useEffect(() => {
    console.log("📊 Calculated categoryData:", JSON.stringify(categoryData));
    console.log("📊 Category Count:", categoryData?.length || 0);
  }, [categoryData]);

  useEffect(() => {
    const [year, month] = selectedPeriod.split("-");
    const startDate = `${year}-${month}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${month}-${lastDay}`;
    console.log("🔄 Fetching transactions for:", startDate, "to", endDate);
    fetchTransactions({ startDate, endDate });
  }, [selectedPeriod]);

  useEffect(() => {
    console.log("📊 Transactions count:", transactions?.length || 0);
    console.log("📊 Transactions data:", JSON.stringify(transactions?.slice(0, 3)));
    const expenseTx = transactions?.filter(t => t.type === 'expense') || [];
    console.log("📊 Expense transactions:", expenseTx.length);
    expenseTx.slice(0, 3).forEach(t => {
      console.log("  -", t.category, currencySymbol + t.amount);
    });
  }, [transactions]);

  function getCurrentPeriod() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }

  const filteredTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    
    const [year, month] = selectedPeriod.split("-");
    const filtered = transactions.filter(t => {
      if (!t.date) return false;
      const txDate = new Date(t.date);
      return txDate.getFullYear() === parseInt(year) && txDate.getMonth() + 1 === parseInt(month);
    });
    
    console.log("🔍 Filtered transactions:", filtered.length, "of", transactions.length, "for", selectedPeriod);
    return filtered;
  }, [transactions, selectedPeriod]);

  const { income, expenses, balance, categoryData } = useMemo(() => {
    console.log("🔄 useMemo running with", filteredTransactions?.length || 0, "filtered transactions");
    
    if (!filteredTransactions || filteredTransactions.length === 0) {
      console.log("⚠️ No filtered transactions, returning empty");
      return { income: 0, expenses: 0, balance: 0, categoryData: [] };
    }

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryMap = {};

    filteredTransactions.forEach((transaction) => {
      const amount = Math.abs(transaction.amount || 0);
      
      if (transaction.type === "income") {
        totalIncome += amount;
      } else if (transaction.type === "expense") {
        totalExpenses += amount;
        const category = transaction.category || "Uncategorized";
        if (!categoryMap[category]) {
          categoryMap[category] = 0;
        }
        categoryMap[category] += amount;
      }
    });

    console.log("📊 Category map:", JSON.stringify(categoryMap));

    const colors = [
      "#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3", "#AA96DA",
      "#FCBAD3", "#A8D8EA", "#F7DC6F", "#BB8FCE", "#85C1E2",
    ];

    const catData = Object.entries(categoryMap)
      .map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length],
        percentage: totalExpenses > 0 ? Math.round((value / totalExpenses) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);

    console.log("📊 Final catData:", JSON.stringify(catData));

    return {
      income: totalIncome,
      expenses: totalExpenses,
      balance: totalIncome - totalExpenses,
      categoryData: catData,
    };
  }, [filteredTransactions]);

  const apiIncome = summary?.income ?? 0;
  const apiExpenses = summary?.expenses ?? 0;
  const apiBalance = summary?.balance ?? 0;
  
  const pieData = [
    { name: "Income", value: apiIncome, color: theme.income },
    { name: "Expenses", value: apiExpenses, color: theme.expense },
    { name: "Balance", value: apiBalance > 0 ? apiBalance : 0, color: theme.accent },
  ].filter((item) => item.value > 0);

  const formatCurrency = (amount) => {
    const value = amount || 0;
    if (value >= 1000) {
      return `${currencySymbol}${value.toFixed(0)}`;
    }
    return `${currencySymbol}${value.toFixed(2)}`;
  };

  const loading = transactionsLoading || budgetLoading || reportsLoading;
  const error = transactionsError;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const years = [2024, 2025, 2026];

  const handleMonthSelect = (year, monthIndex) => {
    const period = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
    setSelectedPeriod(period);
    setShowMonthPicker(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Financial Overview</Text>
        <TouchableOpacity
          style={styles.periodButton}
          onPress={() => setShowMonthPicker(true)}
        >
          <Ionicons name="calendar-outline" size={18} color={theme.text} />
          <Text style={styles.periodText}>{selectedPeriod}</Text>
          <Ionicons name="chevron-down" size={14} color={theme.muted} />
        </TouchableOpacity>
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

        {!loading && !error && transactions && transactions.length > 0 && (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.summaryContainer}
            >
              <View style={[styles.summaryCard, { backgroundColor: theme.income + "20" }]}>
                <Ionicons name="arrow-up" size={24} color={theme.income} />
                <Text style={styles.summaryLabel}>Income</Text>
                <Text style={[styles.summaryValue, { color: theme.income }]}>
                  {formatCurrency(apiIncome)}
                </Text>
              </View>

              <View style={[styles.summaryCard, { backgroundColor: theme.expense + "20" }]}>
                <Ionicons name="arrow-down" size={24} color={theme.expense} />
                <Text style={styles.summaryLabel}>Expenses</Text>
                <Text style={[styles.summaryValue, { color: theme.expense }]}>
                  {formatCurrency(apiExpenses)}
                </Text>
              </View>

              <View style={[styles.summaryCard, { backgroundColor: theme.accent + "20" }]}>
                <Ionicons name="wallet" size={24} color={theme.accent} />
                <Text style={styles.summaryLabel}>Balance</Text>
                <Text style={[styles.summaryValue, { color: theme.accent }]}>
                  {formatCurrency(apiBalance)}
                </Text>
              </View>
            </ScrollView>

            {pieData.length > 0 && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Spending Distribution</Text>
                <PieChart data={pieData} />
              </View>
            )}

            {categoryData?.length > 0 && (
              <View style={styles.categoryCard}>
                <Text style={styles.categoryTitle}>Category Breakdown</Text>
                {categoryData.map((item, index) => {
                  const colors = [
                    "#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3", "#AA96DA",
                    "#FCBAD3", "#A8D8EA", "#F7DC6F", "#BB8FCE", "#85C1E2",
                  ];
                  const color = item.color || colors[index % colors.length];
                  const amount = item.value ?? 0;
                  const percentage = item.percentage ??
                    (expenses > 0 ? Math.round((amount / expenses) * 100) : 0);
                  return (
                    <View key={index} style={styles.categoryRow}>
                      <View style={styles.categoryLeft}>
                        <View style={[styles.categoryDot, { backgroundColor: color }]} />
                        <Text style={styles.categoryName}>{item.name || item.category || 'Unknown'}</Text>
                      </View>
                      <View style={styles.categoryRight}>
                        <View style={styles.progressBarContainer}>
                          <View
                            style={[
                              styles.progressBar,
                              { width: `${percentage}%`, backgroundColor: color },
                            ]}
                          />
                        </View>
                        <Text style={styles.categoryPercent}>{percentage}%</Text>
                        <Text style={styles.categoryAmount}>{formatCurrency(amount)}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Budget vs Actual</Text>
              <LineChart
                trends={trends}
                budgetLimit={budget?.limit ?? 0}
              />
            </View>
          </>
        )}

        {!loading && !error && (!transactions || transactions.length === 0) && (
          <View style={styles.noDataContainer}>
            <Ionicons name="bar-chart-outline" size={60} color={theme.muted} />
            <Text style={styles.noDataText}>No transactions for this period</Text>
          </View>
        )}
      </ScrollView>

      {/* Month Picker Modal */}
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
                          selectedPeriod === `${year}-${String(index + 1).padStart(2, "0")}` &&
                            styles.monthButtonActive,
                        ]}
                        onPress={() => handleMonthSelect(year, index)}
                      >
                        <Text
                          style={[
                            styles.monthText,
                            selectedPeriod === `${year}-${String(index + 1).padStart(2, "0")}` &&
                              styles.monthTextActive,
                          ]}
                        >
                          {month}
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
    paddingHorizontal: 8,
    marginBottom: 20,
    gap: 6,
  },
  summaryCard: {
    width: 120,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    color: theme.muted,
    marginTop: 4,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  chartCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    margin: 16,
    padding: 16,
    alignItems: "center",
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 20,
  },
  categoryCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    margin: 16,
    padding: 20,
    marginTop: 0,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    width: 120,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    color: theme.text,
    fontWeight: "500",
  },
  categoryRight: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: theme.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
  categoryPercent: {
    fontSize: 12,
    color: theme.muted,
    width: 35,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.text,
    width: 70,
    textAlign: "right",
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