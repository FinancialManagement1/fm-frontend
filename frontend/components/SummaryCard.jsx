import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SummaryCard = ({ title, amount, type = 'neutral' }) => {
  const getAmountStyle = () => {
    switch (type) {
      case 'expense':
        return styles.expenseAmount;
      case 'income':
        return styles.incomeAmount;
      default:
        return styles.neutralAmount;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.amount, getAmountStyle()]}>${amount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  expenseAmount: {
    color: '#EF4444',
  },
  incomeAmount: {
    color: '#10B981',
  },
  neutralAmount: {
    color: '#111827',
  },
});

export default SummaryCard;
