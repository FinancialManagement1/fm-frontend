import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  FlatList 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTransactions } from '../../hooks/useTransactions';

export default function ExpensesScreen() {
  const {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    editTransaction,
    removeTransaction,
  } = useTransactions();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const router = useRouter();

  // Fetch transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Calculate summary from transactions
  const summary = useMemo(() => {
    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    console.log('Expenses:', expenses, 'Income:', income);
    return {
      totalExpenses: expenses,
      totalIncome: income,
      balance: income - expenses,
    };
  }, [transactions]);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === 'all' || transaction.type === filter;
    const matchesSearch = transaction.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          transaction.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await removeTransaction(id);
              Alert.alert('Success', 'Transaction deleted successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete transaction.');
            }
          }
        }
      ]
    );
  };

  const renderTransactionItem = ({ item }) => {
    // Use a simple color based on transaction type instead of hardcoded categories
    const getCategoryColor = () => {
      return item.type === 'income' ? '#22c55e' : '#ef4444';
    };

    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() => router.push(`/transactions/edit?id=${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.transactionLeft}>
          <Text
            style={[
              styles.transactionIcon,
              { backgroundColor: getCategoryColor() },
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
        <Text style={[
          styles.transactionAmount,
          item.type === 'income' ? styles.incomeAmount : styles.expenseAmount
        ]}>
          {item.type === 'income' ? '+' : '-'}{item.currency || '€'}{Math.abs(item.amount).toFixed(2)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, styles.expenseCard]}>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={styles.expenseAmount}>€{summary.totalExpenses}</Text>
          </View>
          <View style={[styles.summaryCard, styles.incomeCard]}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={styles.incomeAmount}>€{summary.totalIncome}</Text>
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
              €{Math.abs(summary.balance)}
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

        {/* Transactions List */}
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          style={styles.transactionsList}
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
    paddingTop: 48,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 4,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: "#18181b",
    padding: 4,
    borderRadius: 12,
    gap: 2,
  },
  toggleSquare: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleSquareActive: {
    backgroundColor: "#fbbf24",
  },
  toggleIcon: {
    fontSize: 16,
    color: "#9ca3af",
  },
  toggleIconActive: {
    color: "#000000",
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
    position: "relative",
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
  menuButton: {
    width: 48,
    height: 48,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  menuButtonText: {
    fontSize: 20,
    color: "#9ca3af",
    fontWeight: "bold",
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
    color: '#ffffff',
    fontWeight: 'bold',
  },
  transactionsList: {
    marginBottom: 112, // Safe area bottom for navigation
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
  calendarButtonContainer: {
    marginBottom: 20,
  },
  calendarButton: {
    backgroundColor: "#fbbf24",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  calendarButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
});
