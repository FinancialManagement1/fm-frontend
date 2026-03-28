// Transaction types - This will be updated by Abir
export interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
  icon?: string;
}

export interface TransactionSummary {
  totalExpenses: number;
  totalIncome: number;
  balance: number;
}
