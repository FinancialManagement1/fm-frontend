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
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
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
    color: '#212529',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#6C757D',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
  incomeAmount: {
    color: '#28A745',
  },
  expenseAmount: {
    color: '#DC3545',
  },
});

export default TransactionCard;
