import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useCurrency } from '../hooks/useCurrency';

const SummaryCard = ({ title, amount, type = 'neutral' }) => {
  const { currencySymbol } = useCurrency();

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
      <Text style={[styles.amount, getAmountStyle()]}>{currencySymbol}{amount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  title: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 4,
    fontWeight: '500',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  expenseAmount: {
    color: '#DC3545',
  },
  incomeAmount: {
    color: '#28A745',
  },
  neutralAmount: {
    color: '#212529',
  },
});

export default SummaryCard;
