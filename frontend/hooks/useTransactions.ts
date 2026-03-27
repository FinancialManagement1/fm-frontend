// ── Abir's logic layer ──
// Owns: state, CRUD operations, computed summaries, filter and search logic.
// Rule: No UI rendering code here. The screen calls this hook; this hook must
// not build any UI.

import { useState, useMemo } from "react";
import type {
  Transaction,
  TransactionPayload,
  TransactionSummary,
  FilterType,
} from "../types/transaction";

// Seed data — Abir will replace this with real API / service calls.
const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    name: "Tuition",
    amount: -500,
    date: "Mar 5",
    icon: "book-outline",
    iconBg: "#3B82F6",
    type: "expense",
  },
  {
    id: "2",
    name: "Loans",
    amount: -500,
    date: "Mar 4",
    icon: "card-outline",
    iconBg: "#EF4444",
    type: "expense",
  },
  {
    id: "3",
    name: "Income",
    amount: 5000,
    date: "Mar 4",
    icon: "trending-up-outline",
    iconBg: "#10B981",
    type: "income",
  },
  {
    id: "4",
    name: "Groceries",
    amount: -2700,
    date: "Mar 3",
    icon: "cart-outline",
    iconBg: "#8B5CF6",
    type: "expense",
  },
];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function useTransactions() {
  // ── State ──
  const [transactions, setTransactions] = useState<Transaction[]>(SEED_TRANSACTIONS);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  // ── Computed ──
  const summary: TransactionSummary = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const totalExpenses = Math.abs(
      transactions
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0)
    );
    return { totalIncome, totalExpenses, balance: totalIncome - totalExpenses };
  }, [transactions]);

  const filtered = useMemo(
    () =>
      transactions.filter((t) => {
        const matchesFilter = filter === "all" || t.type === filter;
        const matchesSearch = t.name
          .toLowerCase()
          .includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
      }),
    [transactions, filter, search]
  );

  // ── CRUD ──
  const addTransaction = (payload: TransactionPayload): void => {
    const now = new Date();
    const dateStr = `${MONTHS[now.getMonth()]} ${now.getDate()}`;
    setTransactions((prev) => [
      {
        id: Date.now().toString(),
        name: payload.name,
        amount: payload.type === "income" ? payload.amount : -payload.amount,
        date: dateStr,
        icon: payload.icon,
        iconBg: payload.iconBg,
        type: payload.type,
      },
      ...prev,
    ]);
  };

  const updateTransaction = (id: string, payload: TransactionPayload): void => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              name: payload.name,
              amount:
                payload.type === "income" ? payload.amount : -payload.amount,
              type: payload.type,
              icon: payload.icon,
              iconBg: payload.iconBg,
            }
          : t
      )
    );
  };

  const deleteTransaction = (id: string): void => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const getTransactionById = (id: string): Transaction | undefined =>
    transactions.find((t) => t.id === id);

  return {
    filtered,
    summary,
    filter,
    setFilter,
    search,
    setSearch,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionById,
  };
}
