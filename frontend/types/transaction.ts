export type Transaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  currency: string;
  category: string;
  description?: string;
  date: string;
  createdAt?: string;
};

export type CreateTransactionInput = {
  type: "income" | "expense";
  amount: number;
  currency?: string;
  category: string;
  description?: string;
  date: string;
};

export type UpdateTransactionInput = {
  type: "income" | "expense";
  amount: number;
  currency?: string;
  category: string;
  description?: string;
  date: string;
};

export type TransactionListResponse = {
  items: Transaction[];
  total: number;
};