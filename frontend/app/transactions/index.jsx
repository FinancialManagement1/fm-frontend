import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  FlatList,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTransactions } from '../../hooks/useTransactions';

const TransactionsScreen = () => {
  const router = useRouter();
  const { transactions, loading, error, fetchTransactions, addTransaction, editTransaction, removeTransaction } = useTransactions();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Calculate summary from transactions
  const summary = useMemo(() => {
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      totalExpenses: expenses,
      totalIncome: income,
      balance: income - expenses
    };
  }, [transactions]);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === 'all' || transaction.type === filter;
    const matchesSearch = transaction.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          transaction.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Category icons mapping
  const getCategoryIcon = (category, type) => {
    const icons = {
      'Salary': '💰', 'Freelance': '💻', 'Business': '💼', 'Investment': '📈', 'Gift': '🎁',
      'Food': '🍽️', 'Transport': '🚌', 'Shopping': '🛍️', 'Bills': '💡', 
      'Entertainment': '🎬', 'Health': '❤️', 'Education': '📚', 'Rent': '🏠',
      'Books': '📖', 'Loans': '💳', 'Tuition': '🎓'
    };
    return icons[category] || (type === 'income' ? '💰' : '💳');
  };

  const handleDeleteTransaction = (id, description) => {
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete "${description || 'this transaction'}"?`,
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
              Alert.alert('Error', 'Failed to delete transaction. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderTransactionItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.transactionItem}
      onPress={() => router.push(`/transactions/edit?id=${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.transactionLeft}>
        <View style={[styles.transactionIconBox, { backgroundColor: item.type === 'income' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)' }]}>
          <Text style={styles.transactionIcon}>{getCategoryIcon(item.category, item.type)}</Text>
        </View>
        <View>
          <Text style={styles.transactionTitle}>{item.description || item.category}</Text>
          <Text style={styles.transactionDate}>{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[
          styles.transactionAmount,
          item.type === 'income' ? styles.incomeAmount : styles.expenseAmount
        ]}>
          {item.type === 'income' ? '+' : '-'}{item.currency || '€'}{Math.abs(item.amount).toFixed(2)}
        </Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={(e) => {
            e.stopPropagation();
            router.push(`/transactions/edit?id=${item.id}`);
          }}
        >
          <Text style={styles.editButtonText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            handleDeleteTransaction(item.id, item.description || item.category);
          }}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCardRed}>
            <View style={[styles.summaryIcon, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
              <Text style={{ fontSize: 20 }}>↓</Text>
            </View>
            <Text style={styles.expenseAmount}>€{summary.totalExpenses.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Expenses</Text>
          </View>
          <View style={styles.summaryCardGreen}>
            <View style={[styles.summaryIcon, { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}>
              <Text style={{ fontSize: 20 }}>↑</Text>
            </View>
            <Text style={styles.incomeAmount}>€{summary.totalIncome.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Income</Text>
          </View>
          <View style={styles.summaryCardYellow}>
            <View style={[styles.summaryIcon, { backgroundColor: 'rgba(251, 191, 36, 0.2)' }]}>
              <Text style={{ fontSize: 20 }}>€</Text>
            </View>
            <Text style={styles.balanceAmount}>€{summary.balance.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Balance</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'income' && styles.activeFilterTab]}
            onPress={() => setFilter('income')}
          >
            <Text style={[styles.filterText, filter === 'income' && styles.activeFilterText]}>
              Income
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'expense' && styles.activeFilterTab]}
            onPress={() => setFilter('expense')}
          >
            <Text style={[styles.filterText, filter === 'expense' && styles.activeFilterText]}>
              Expenses
            </Text>
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    gap: 12,
  },
  summaryCardRed: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  summaryCardGreen: {
    flex: 1,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  summaryCardYellow: {
    flex: 1,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
    fontWeight: '500',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  incomeAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FBBF24',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    fontSize: 16,
    color: '#ffffff',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  filterTab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
  },
  activeFilterTab: {
    backgroundColor: '#fbbf24',
    borderColor: '#fbbf24',
  },
  filterText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#000000',
    fontWeight: '600',
  },
  transactionsList: {
    paddingHorizontal: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#333333',
  },
  transactionIcon: {
    fontSize: 24,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  editButtonText: {
    fontSize: 18,
  },
  deleteButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    marginLeft: 8,
  },
  deleteButtonText: {
    fontSize: 18,
  },
});

export default TransactionsScreen;
