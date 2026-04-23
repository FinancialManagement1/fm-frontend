import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCurrency } from "../../hooks/useCurrency";
import { useTransactions } from "../../hooks/useTransactions";

export default function ExpensesScreen() {
  const {
    transactions,
    loading,
    fetchTransactions,
  } = useTransactions();

  const { type } = useLocalSearchParams();
  const [filter, setFilter] = useState(type || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { currencySymbol } = useCurrency();

  useFocusEffect(
    useCallback(() => {
      if (type) setFilter(type);
      const now = new Date();
      const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      fetchTransactions({ period });
    }, [])
  );

  const summary = useMemo(() => {
    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      totalExpenses: expenses,
      totalIncome: income,
      balance: income - expenses,
    };
  }, [transactions]);

  const filteredTransactions = transactions
    .filter((transaction) => {
      const matchesFilter = filter === "all" || transaction.type === filter;
      const matchesSearch =
        transaction.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const renderTransactionItem = ({ item }) => {
    const getCategoryColor = (category) => {
      const colors = {
        Education: "#3b82f6",
        Finance: "#8b5cf6",
        Salary: "#06b6d4",
        Housing: "#a855f7",
        Books: "#6366f1",
        Tuition: "#3b82f6",
        Loans: "#ef4444",
        Rent: "#8b5cf6",
        Food: "#10b981",
        Transport: "#06b6d4",
        Entertainment: "#ec4899",
        Health: "#f43f5e",
        Personal: "#8b5cf6",
        Other: "#6b7280",
      };
      return colors[category] || "#6b7280";
    };

    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() => router.push(`/transactions/edit?id=${item.id}`)}
      >
        <View style={styles.transactionLeft}>
          <Text
            style={[
              styles.transactionIcon,
              { backgroundColor: getCategoryColor(item.category) },
            ]}
          >
            {item.category.charAt(0)}
          </Text>
          <View>
            <Text style={styles.transactionTitle}>
              {item.description || item.category}
            </Text>
            <Text style={styles.transactionDate}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.transactionAmount,
            item.type === "income" ? styles.incomeAmount : styles.expenseAmount,
          ]}
        >
          {item.type === "income" ? "+" : "-"}
          {currencySymbol}
          {Math.abs(item.amount).toFixed(2)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>

        {/* ── Back Button + Title ── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {filter === "income"
              ? "Income Transactions"
              : filter === "expense"
              ? "Expense Transactions"
              : "All Transactions"}
          </Text>
          <View style={{ width: 42 }} />
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, styles.expenseCard]}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={styles.expenseAmount}>
              {currencySymbol}{summary.totalExpenses.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.summaryCard, styles.incomeCard]}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={styles.incomeAmount}>
              {currencySymbol}{summary.totalIncome.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.summaryCard, styles.balanceCard]}>
            <Text style={styles.summaryLabel}>Balance</Text>
            <Text
              style={[
                styles.balanceAmount,
                summary.balance >= 0
                  ? styles.incomeAmount
                  : styles.expenseAmount,
              ]}
            >
              {currencySymbol}{Math.abs(summary.balance).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === "all"
                ? styles.activeFilterTab
                : styles.inactiveFilterTab,
            ]}
            onPress={() => setFilter("all")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "all"
                  ? styles.activeFilterText
                  : styles.inactiveFilterText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === "income"
                ? styles.activeFilterTab
                : styles.inactiveFilterTab,
            ]}
            onPress={() => setFilter("income")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "income"
                  ? styles.activeFilterText
                  : styles.inactiveFilterText,
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === "expense"
                ? styles.activeFilterTab
                : styles.inactiveFilterTab,
            ]}
            onPress={() => setFilter("expense")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "expense"
                  ? styles.activeFilterText
                  : styles.inactiveFilterText,
              ]}
            >
              Expenses
            </Text>
          </TouchableOpacity>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navButtonsContainer}>
          <View style={styles.placeholderLeft} />
          <TouchableOpacity
            style={styles.calendarNavButton}
            onPress={() => router.push("/transactions/calendar")}
          >
            <Text style={styles.calendarNavButtonText}>📅</Text>
          </TouchableOpacity>
        </View>

        {/* Loading */}
        {loading && (
          <View style={{ alignItems: "center", paddingVertical: 20 }}>
            <Text style={{ color: "#9ca3af" }}>Loading...</Text>
          </View>
        )}

        {/* Transactions List */}
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          style={styles.transactionsList}
          ListEmptyComponent={
            !loading ? (
              <View style={{ alignItems: "center", paddingTop: 40 }}>
                <Text style={{ color: "#9ca3af", fontSize: 16 }}>
                  No {filter === "all" ? "" : filter} transactions found
                </Text>
              </View>
            ) : null
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  backBtn: {
    width: 42,
    height: 42,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  expenseCard: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  incomeCard: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  balanceCard: {
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    borderColor: "rgba(251, 191, 36, 0.3)",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 4,
    fontWeight: "500",
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#f87171",
  },
  incomeAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4ade80",
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fbbf24",
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 16,
    paddingHorizontal: 48,
    paddingVertical: 12,
    fontSize: 16,
    color: "#ffffff",
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  activeFilterTab: {
    backgroundColor: "#fbbf24",
  },
  inactiveFilterTab: {
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
  },
  activeFilterText: {
    color: "#000000",
  },
  inactiveFilterText: {
    color: "#9ca3af",
  },
  navButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  placeholderLeft: {
    width: 48,
  },
  calendarNavButton: {
    width: 48,
    height: 48,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  calendarNavButtonText: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "bold",
  },
  transactionsList: {
    marginBottom: 112,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(24, 24, 27, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(39, 39, 42, 0.5)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    textAlign: "center",
    lineHeight: 44,
    fontSize: 20,
    marginRight: 12,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: "#9ca3af",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
});