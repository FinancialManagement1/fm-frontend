import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TransactionCard = ({ transaction }) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <Text style={styles.icon}>{transaction.icon}</Text>
        <View>
          <Text style={styles.title}>{transaction.title}</Text>
          <Text style={styles.date}>{transaction.date}</Text>
        </View>
      </View>
      <Text style={[
        styles.amount,
        transaction.type === 'income' ? styles.incomeAmount : styles.expenseAmount
      ]}>
        {transaction.type === 'income' ? '+' : ''}${Math.abs(transaction.amount)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#6B7280',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  incomeAmount: {
    color: '#10B981',
  },
  expenseAmount: {
    color: '#EF4444',
  },
});

export default TransactionCard;
