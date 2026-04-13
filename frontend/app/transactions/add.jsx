import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTransactions } from '../../hooks/useTransactions';
import TransactionForm from '../../components/TransactionForm';

export default function AddTransactionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const type = params?.type || 'expense';
  const { addTransaction } = useTransactions();

<<<<<<< HEAD
  const handleSubmit = async (transactionData) => {
    await addTransaction(transactionData);
    Alert.alert(
      'Success',
      `${transactionData.type === 'income' ? 'Income' : 'Expense'} added successfully!`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
=======
  const isIncome = type === 'income';

  
  const categories = isIncome 
    ? [
        { name: 'Salary', icon: '💰', color: '#22c55e' },
        { name: 'Freelance', icon: '💻', color: '#3b82f6' },
        { name: 'Business', icon: '💼', color: '#f59e0b' },
        { name: 'Investment', icon: '📈', color: '#8b5cf6' },
        { name: 'Gift', icon: '🎁', color: '#ec4899' },
        { name: 'Other', icon: '💵', color: '#6b7280' }
      ]
    : [
        { name: 'Food', icon: '🍽️', color: '#22c55e' },
        { name: 'Transport', icon: '🚌', color: '#3b82f6' },
        { name: 'Shopping', icon: '🛍️', color: '#f59e0b' },
        { name: 'Bills', icon: '💡', color: '#ef4444' },
        { name: 'Entertainment', icon: '🎬', color: '#8b5cf6' },
        { name: 'Health', icon: '❤️', color: '#f43f5e' },
        { name: 'Education', icon: '📚', color: '#06b6d4' },
        { name: 'Other', icon: '📝', color: '#6b7280' }
      ];

  const handleSave = async () => {
    // Validation
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    if (!date) {
      Alert.alert('Error', 'Please select a date');
      return;
    }

    setLoading(true);
    try {
      const transactionData = {
        type: isIncome ? 'income' : 'expense',
        amount: parseFloat(amount),
        currency: 'EUR',
        category,
        description: description || undefined,
        date
      };
      
      
      await addTransaction(transactionData);
      
      Alert.alert('Success', `${isIncome ? 'Income' : 'Expense'} added successfully!`, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add transaction. Please try again.');
    } finally {
      setLoading(false);
    }
>>>>>>> dev
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              Add {type === 'income' ? 'Income' : 'Expense'}
            </Text>
            <View style={styles.placeholder} />
          </View>

          {/* Form */}
          <TransactionForm
            initialData={{ type }}
            onSubmit={handleSubmit}
            submitButtonText="Add Transaction"
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
});
