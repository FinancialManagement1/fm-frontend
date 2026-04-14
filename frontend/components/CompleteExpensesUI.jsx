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
  Modal,
  Animated,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';

const getCategoryIcon = (name) => {
  const icons = {
    Tuition: '📚',
    Rent: '🏠',
    Books: '📖',
    Food: '🍔',
    Transport: '🚌',
    Entertainment: '🎬',
    Loans: '💳',
    Health: '❤️',
    Personal: '👤',
    Salary: '💼',
    Allowance: '🤝',
    Scholarship: '🎓',
    Internship: '🏪',
    Freelance: '💻',
    Gift: '🎁',
    'Pocket Money': '💵',
    Property: '🏢',
    Dividends: '📈',
    Other: '💰'
  };
  return icons[name] || '📦';
};

const { width, height } = Dimensions.get('window');

const getCategoryColor = (type) => {
  return type === 'expense' ? '#ef4444' : '#10b981';
};

export default function CompleteExpensesUI() {
  const { transactions, loading, error, fetchTransactions, addTransaction, editTransaction, removeTransaction } = useTransactions();
  
  // Use dedicated useCategories hook for category data
  const {
    incomeCategories,
    expenseCategories,
    loading: categoriesLoading,
    fetchAllCategories
  } = useCategories();

  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Fetch transactions and categories on component mount
  useEffect(() => {
    fetchTransactions();
    fetchAllCategories();
  }, [fetchTransactions, fetchAllCategories]);

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
  const [showAddExpenseForm, setShowAddExpenseForm] = useState(false);
  const [showAddIncomeForm, setShowAddIncomeForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  
  // Form states
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Animation values
  const [modalAnim] = useState(new Animated.Value(height));
  const [overlayAnim] = useState(new Animated.Value(0));

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = activeFilter === 'all' || 
      (activeFilter === 'income' && transaction.type === 'income') ||
      (activeFilter === 'expenses' && transaction.type === 'expense') ||
      (activeFilter === 'thisMonth' && new Date(transaction.date).getMonth() === new Date().getMonth());
    
    const matchesSearch = (transaction.description || transaction.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const animateModalIn = () => {
    Animated.parallel([
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateModalOut = (callback) => {
    Animated.parallel([
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(modalAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(callback);
  };

  const openModal = (type, transaction = null) => {
    if (transaction) {
      setEditingTransaction(transaction);
      setAmount(Math.abs(transaction.amount).toString());
      setCategory(transaction.category);
      setDescription(transaction.description || transaction.category);
      setDate(transaction.date);
    } else {
      setEditingTransaction(null);
      setAmount('');
      setCategory('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    }

    if (type === 'expense') {
      setShowAddExpenseForm(true);
    } else {
      setShowAddIncomeForm(true);
    }
    animateModalIn();
  };

  const closeModal = (type) => {
    animateModalOut(() => {
      if (type === 'expense') {
        setShowAddExpenseForm(false);
      } else {
        setShowAddIncomeForm(false);
      }
    });
  };

  const handleSubmit = (type) => {
    if (!amount || !category) return;

    // API-compliant payload (no id, no icon)
    const transactionData = {
      description: description || category,
      amount: parseFloat(amount),
      type: type,
      category: category,
      date: date,
    };

    if (editingTransaction) {
      editTransaction(editingTransaction.id, transactionData);
    } else {
      addTransaction(transactionData);
    }

    closeModal(type);
  };

  const handleDelete = (id) => {
    removeTransaction(id);
  };

  const renderTransactionItem = ({ item, index }) => {
    return (
      <Animated.View
        style={[
          styles.transactionItem,
          {
            opacity: 1,
            transform: [{ translateY: 0 }]
          }
        ]}
      >
        <View style={styles.transactionLeft}>
          <View style={[styles.transactionIcon, { backgroundColor: getCategoryColor(item.type) }]}>
            <Text style={styles.transactionIconText}>{getCategoryIcon(item.category)}</Text>
          </View>
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionTitle}>{item.description || item.category}</Text>
            <Text style={styles.transactionDate}>{item.date}</Text>
          </View>
        </View>
        
        <View style={styles.transactionRight}>
          <Text style={[
            styles.transactionAmount,
            item.type === 'income' ? styles.incomeAmount : styles.expenseAmount
          ]}>
            {item.type === 'income' ? '+' : '-'}€{Math.abs(item.amount).toFixed(2)}
          </Text>
          <View style={styles.transactionActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openModal(item.type, item)}
            >
              <Text style={styles.actionButtonText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDelete(item.id)}
            >
              <Text style={styles.actionButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📉</Text>
      <Text style={styles.emptyStateTitle}>No transactions found</Text>
      <Text style={styles.emptyStateSubtitle}>Try adjusting your filters</Text>
    </View>
  );

  const renderModal = (type, categories) => {
    const isExpense = type === 'expense';
    const modalVisible = isExpense ? showAddExpenseForm : showAddIncomeForm;
    const categoryList = categories && categories.length > 0 ? categories : [];

    return (
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => closeModal(type)}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: overlayAnim }]}>
          <Animated.View
            style={[styles.modalContent, { transform: [{ translateY: modalAnim }] }]}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={[
                styles.modalIcon,
                { backgroundColor: isExpense ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)' }
              ]}>
                <Text style={[
                  styles.modalIconText,
                  { color: isExpense ? '#f87171' : '#4ade80' }
                ]}>
                  {isExpense ? '↓' : '↑'}
                </Text>
              </View>
              <Text style={styles.modalTitle}>
                {editingTransaction ? `Edit ${type}` : `Add ${type}`}
              </Text>
            </View>

            {/* Form */}
            <ScrollView style={styles.modalForm}>
              {/* Amount Input */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Amount (€)</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>€</Text>
                  <TextInput
                    style={styles.input}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    placeholderTextColor="#6b7280"
                  />
                </View>
              </View>

              {/* Category Grid */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Category</Text>
                {categoriesLoading ? (
                  <Text style={{ color: '#9ca3af' }}>Loading categories...</Text>
                ) : categoryList.length === 0 ? (
                  <Text style={{ color: '#9ca3af' }}>No categories available</Text>
                ) : (
                  <View style={styles.categoryGrid}>
                    {categoryList.map((cat) => (
                      <TouchableOpacity
                        key={cat.name}
                        style={[
                          styles.categoryButton,
                          category === cat.name && styles.categoryButtonSelected
                        ]}
                        onPress={() => setCategory(cat.name)}
                      >
                        <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(type) }]}>
                          <Text style={styles.categoryIconText}>{getCategoryIcon(cat.name)}</Text>
                        </View>
                        <Text style={[
                          styles.categoryButtonText,
                          category === cat.name && styles.categoryButtonTextSelected
                        ]}>
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Description Input */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={description}
                  onChangeText={setDescription}
                  placeholder={isExpense ? "What did you buy?" : "Income source"}
                  placeholderTextColor="#6b7280"
                />
              </View>

              {/* Date Input */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Date</Text>
                <TextInput
                  style={styles.input}
                  value={date}
                  onChangeText={setDate}
                  placeholder="Select date"
                  placeholderTextColor="#6b7280"
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => closeModal(type)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    { backgroundColor: isExpense ? '#fbbf24' : '#4ade80' }
                  ]}
                  onPress={() => handleSubmit(type)}
                >
                  <Text style={[
                    styles.submitButtonText,
                    { color: isExpense ? '#000000' : '#ffffff' }
                  ]}>
                    {editingTransaction ? `Update ${type}` : `Add ${type}`}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Transactions</Text>
            <Text style={styles.headerSubtitle}>Track your income and expenses</Text>
          </View>
          
          {/* View Toggle */}
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                viewMode === 'list' && styles.toggleButtonActive
              ]}
              onPress={() => setViewMode('list')}
            >
              <Text style={[
                styles.toggleButtonText,
                viewMode === 'list' && styles.toggleButtonTextActive
              ]}>
                📋
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                viewMode === 'calendar' && styles.toggleButtonActive
              ]}
              onPress={() => setViewMode('calendar')}
            >
              <Text style={[
                styles.toggleButtonText,
                viewMode === 'calendar' && styles.toggleButtonTextActive
              ]}>
                📅
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          {/* Total Expenses */}
          <View style={[styles.summaryCard, styles.expenseCard]}>
            <View style={styles.summaryIconContainer}>
              <View style={styles.summaryIcon}>
                <Text style={styles.summaryIconText}>↓</Text>
              </View>
            </View>
            <Text style={styles.expenseAmount}>€{summary.totalExpenses.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Expenses</Text>
          </View>

          {/* Total Income */}
          <View style={[styles.summaryCard, styles.incomeCard]}>
            <View style={styles.summaryIconContainer}>
              <View style={styles.summaryIcon}>
                <Text style={styles.summaryIconText}>↑</Text>
              </View>
            </View>
            <Text style={styles.incomeAmount}>€{summary.totalIncome.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Income</Text>
          </View>

          {/* Balance */}
          <View style={[styles.summaryCard, styles.balanceCard]}>
            <View style={styles.summaryIconContainer}>
              <View style={styles.summaryIcon}>
                <Text style={styles.summaryIconText}>💰</Text>
              </View>
            </View>
            <Text style={styles.balanceAmount}>€{Math.abs(summary.balance).toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Balance</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#6b7280"
          />
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {[
            { id: 'all', label: 'All' },
            { id: 'income', label: 'Income' },
            { id: 'expenses', label: 'Expenses' },
            { id: 'thisMonth', label: 'This Month' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterTab,
                activeFilter === filter.id && styles.filterTabActive
              ]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <Text style={[
                styles.filterText,
                activeFilter === filter.id && styles.filterTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transaction List */}
        <View style={styles.transactionsContainer}>
          {filteredTransactions.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={filteredTransactions}
              renderItem={renderTransactionItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.incomeFab}
          onPress={() => openModal('income')}
        >
          <Text style={styles.incomeFabText}>↑</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.expenseFab}
          onPress={() => openModal('expense')}
        >
          <Text style={styles.expenseFabText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      {renderModal('expense', expenseCategories)}
      {renderModal('income', incomeCategories)}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#18181b',
    padding: 4,
    borderRadius: 12,
    gap: 4,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#fbbf24',
  },
  toggleButtonText: {
    fontSize: 20,
    color: '#9ca3af',
  },
  toggleButtonTextActive: {
    color: '#000000',
  },

  // Summary Cards
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  expenseCard: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  incomeCard: {
    borderColor: 'rgba(16, 185, 129, 0.3)',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  balanceCard: {
    borderColor: 'rgba(251, 191, 36, 0.3)',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
  },
  summaryIconContainer: {
    marginBottom: 4,
  },
  summaryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(156, 163, 175, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryIconText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f87171',
    marginBottom: 2,
  },
  incomeAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ade80',
    marginBottom: 2,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fbbf24',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },

  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 36,
    fontSize: 20,
    color: '#6b7280',
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 16,
    paddingHorizontal: 48,
    paddingVertical: 12,
    fontSize: 16,
    color: '#ffffff',
  },

  // Filter Tabs
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#fbbf24',
    borderColor: '#fbbf24',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
  },
  filterTextActive: {
    color: '#000000',
  },

  // Transaction List
  transactionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Space for FAB
  },
  transactionItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(39, 39, 42, 0.5)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionIconText: {
    fontSize: 20,
    color: '#ffffff',
  },
  transactionDetails: {
    flex: 1,
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
  transactionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  incomeAmount: {
    color: '#4ade80',
  },
  expenseAmount: {
    color: '#f87171',
  },
  transactionActions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    padding: 6,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
    opacity: 0.5,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },

  // Floating Action Buttons
  fabContainer: {
    position: 'absolute',
    bottom: 96, // 24 + 72 for bottom navigation
    right: 20,
    gap: 12,
  },
  incomeFab: {
    width: 56,
    height: 56,
    backgroundColor: '#4ade80',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  incomeFabText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  expenseFab: {
    width: 56,
    height: 56,
    backgroundColor: '#fbbf24',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  expenseFabText: {
    fontSize: 24,
    color: '#000000',
    fontWeight: 'bold',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#18181b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 80, // Safe area for bottom nav
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  modalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalIconText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalForm: {
    padding: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    fontSize: 20,
    color: '#6b7280',
    zIndex: 1,
  },
  input: {
    flex: 1,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#ffffff',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#27272a',
    backgroundColor: '#000000',
    gap: 8,
  },
  categoryButtonSelected: {
    borderColor: '#fbbf24',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
  },
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIconText: {
    fontSize: 12,
    color: '#ffffff',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
  },
  categoryButtonTextSelected: {
    color: '#ffffff',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#27272a',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
