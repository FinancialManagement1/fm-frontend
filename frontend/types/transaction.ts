// ── Transaction Type Definitions ──
// Single source of truth. Do not redefine these shapes in any other file.

export type TransactionType = "income" | "expense";

export type FilterType = "all" | TransactionType;

export interface Category {
  icon: string;
  bg: string;
  label: string;
}

export interface Transaction {
  id: string;
  name: string;
  /** Positive for income, negative for expense */
  amount: number;
  date: string;
  icon: string;
  iconBg: string;
  type: TransactionType;
}

export interface TransactionPayload {
  name: string;
  /** Always a positive number; the hook applies the sign based on type */
  amount: number;
  type: TransactionType;
  icon: string;
  iconBg: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}
