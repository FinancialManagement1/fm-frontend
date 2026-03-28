// Transaction hook - This will be implemented by Abir
import { useState } from 'react';
import { Transaction, TransactionSummary } from '../types/transaction';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<TransactionSummary>({
    totalExpenses: 0,
    totalIncome: 0,
    balance: 0
  });

  // Mock data for now - will be replaced by Abir's implementation
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      title: 'Tuition',
      amount: -2500,
      date: '2026-03-15',
      category: 'Education',
      type: 'expense',
      icon: '🎓'
    },
    {
      id: '2',
      title: 'Loans',
      amount: -500,
      date: '2026-03-14',
      category: 'Finance',
      type: 'expense',
      icon: '💰'
    },
    {
      id: '3',
      title: 'Income',
      amount: 3000,
      date: '2026-03-13',
      category: 'Salary',
      type: 'income',
      icon: '💵'
    },
    {
      id: '4',
      title: 'Books',
      amount: -150,
      date: '2026-03-12',
      category: 'Education',
      type: 'expense',
      icon: '📚'
    },
    {
      id: '5',
      title: 'Rent',
      amount: -1200,
      date: '2026-03-11',
      category: 'Housing',
      type: 'expense',
      icon: '🏠'
    }
  ];

  return {
    transactions: mockTransactions,
    loading,
    summary: {
      totalExpenses: 4350,
      totalIncome: 3000,
      balance: -1350
    }
  };
};
