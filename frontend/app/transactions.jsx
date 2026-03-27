// ── Pooja's visual layer ──
// Rule: This file owns only UI rendering. No CRUD logic, no transaction state
// management, no computed summaries. All data and operations come from the hook.

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../constants/theme";
import { useTransactions } from "../hooks/useTransactions";
import { CATEGORIES } from "../constants/categories";

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();

  // ── Logic layer — Abir's hook ──
  const {
    filtered,
    summary,
    filter,
    setFilter,
    search,
    setSearch,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();

  // ── UI-only state (Pooja owns these) ──
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formFocused, setFormFocused] = useState(null);
  const [form, setForm] = useState({
    name: "",
    amount: "",
    type: "expense",
    category: CATEGORIES[0],
  });

  // ── UI helpers ──
  const resetForm = () => {
    setForm({ name: "", amount: "", type: "expense", category: CATEGORIES[0] });
    setEditingId(null);
  };

  const openAdd = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEdit = (txn) => {
    setEditingId(txn.id);
    const cat = CATEGORIES.find((c) => c.icon === txn.icon) || CATEGORIES[0];
    setForm({
      name: txn.name,
      amount: String(Math.abs(txn.amount)),
      type: txn.type,
      category: cat,
    });
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTransaction(id),
        },
      ]
    );
  };

  const handleSave = () => {
    const { name, amount, type, category } = form;
    if (!name.trim() || !amount.trim()) return;
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;

    const payload = {
      name: name.trim(),
      amount: numericAmount,
      type,
      icon: category.icon,
      iconBg: category.bg,
    };

    if (editingId) {
      updateTransaction(editingId, payload);
    } else {
      addTransaction(payload);
    }

    setModalVisible(false);
    resetForm();
  };

  // Pure display helper — formats an amount number for rendering
  const formatAmount = (amount) => {
    const abs = Math.abs(amount).toFixed(2);
    return amount >= 0 ? `+€${abs}` : `-€${abs}`;
  };

  // ── Transaction Row ──
  const renderTransaction = ({ item }) => (
    <View style={styles.txnCard}>
      <View style={[styles.txnIconCircle, { backgroundColor: item.iconBg }]}>
        <Ionicons name={item.icon} size={20} color="#FFFFFF" />
      </View>
      <View style={styles.txnInfo}>
        <Text style={styles.txnName}>{item.name}</Text>
        <Text style={styles.txnDate}>{item.date}</Text>
      </View>
      <Text
        style={[
          styles.txnAmount,
          item.type === "income" ? styles.amountIncome : styles.amountExpense,
        ]}
      >
        {formatAmount(item.amount)}
      </Text>
      <TouchableOpacity
        style={styles.txnAction}
        onPress={() => openEdit(item)}
        activeOpacity={0.7}
      >
        <Ionicons name="pencil-outline" size={18} color={theme.muted} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.txnAction}
        onPress={() => handleDelete(item.id)}
        activeOpacity={0.7}
      >
        <Ionicons name="trash-outline" size={18} color={theme.muted} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Transactions</Text>
          <Text style={styles.headerSubtitle}>
            Track your income{"\n"}and expenses
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.viewBtn, styles.viewBtnActive]}>
            <Ionicons name="list" size={20} color="#1A0D00" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.viewBtn}>
            <Ionicons name="calendar-outline" size={20} color={theme.muted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Summary Cards ── */}
      <View style={styles.cardsRow}>
        <View style={[styles.summaryCard, styles.cardExpense]}>
          <View style={styles.cardIconWrap}>
            <Ionicons name="arrow-down" size={18} color={theme.expense} />
          </View>
          <Text style={[styles.cardAmount, { color: theme.expense }]}>
            €{summary.totalExpenses.toFixed(2)}
          </Text>
          <Text style={styles.cardLabel}>Expenses</Text>
        </View>

        <View style={[styles.summaryCard, styles.cardIncome]}>
          <View style={[styles.cardIconWrap, styles.cardIconIncome]}>
            <Ionicons name="arrow-up" size={18} color={theme.income} />
          </View>
          <Text style={[styles.cardAmount, { color: theme.income }]}>
            €{summary.totalIncome.toFixed(2)}
          </Text>
          <Text style={styles.cardLabel}>Income</Text>
        </View>

        <View style={[styles.summaryCard, styles.cardBalance]}>
          <View style={[styles.cardIconWrap, styles.cardIconBalance]}>
            <Ionicons name="wallet-outline" size={18} color={theme.accent} />
          </View>
          <Text style={[styles.cardAmount, { color: theme.accent }]}>
            €{summary.balance.toFixed(2)}
          </Text>
          <Text style={styles.cardLabel}>Balance</Text>
        </View>
      </View>

      {/* ── Search ── */}
      <View style={styles.searchBar}>
        <Ionicons
          name="search-outline"
          size={18}
          color={theme.muted}
          style={{ marginRight: 10 }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          placeholderTextColor={theme.muted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")} activeOpacity={0.7}>
            <Ionicons name="close-circle" size={18} color={theme.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Filter Tabs ── */}
      <View style={styles.filterRow}>
        {[
          { key: "all", label: "All" },
          { key: "income", label: "Income" },
          { key: "expense", label: "Expenses" },
        ].map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterTab,
              filter === f.key && styles.filterTabActive,
            ]}
            onPress={() => setFilter(f.key)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === f.key && styles.filterTabTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Transaction List ── */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={theme.muted} />
            <Text style={styles.emptyText}>No transactions found</Text>
          </View>
        }
      />

      {/* ── FAB ── */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 24 }]}
        onPress={openAdd}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#1A0D00" />
      </TouchableOpacity>

      {/* ── Add / Edit Modal ── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalWrapper}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color={theme.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {editingId ? "Edit Transaction" : "Add Transaction"}
              </Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Type Toggle */}
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  form.type === "expense" && styles.typeBtnExpense,
                ]}
                onPress={() => setForm({ ...form, type: "expense" })}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="arrow-down"
                  size={16}
                  color={form.type === "expense" ? "#FFF" : theme.muted}
                />
                <Text
                  style={[
                    styles.typeBtnText,
                    form.type === "expense" && styles.typeBtnTextActive,
                  ]}
                >
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  form.type === "income" && styles.typeBtnIncome,
                ]}
                onPress={() => setForm({ ...form, type: "income" })}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="arrow-up"
                  size={16}
                  color={form.type === "income" ? "#FFF" : theme.muted}
                />
                <Text
                  style={[
                    styles.typeBtnText,
                    form.type === "income" && styles.typeBtnTextActive,
                  ]}
                >
                  Income
                </Text>
              </TouchableOpacity>
            </View>

            {/* Name */}
            <Text style={styles.formLabel}>Transaction Name</Text>
            <View
              style={[
                styles.formInputRow,
                formFocused === "name" && styles.formInputFocused,
              ]}
            >
              <Ionicons
                name="pencil-outline"
                size={18}
                color={formFocused === "name" ? theme.accent : theme.muted}
                style={{ marginRight: 10 }}
              />
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Grocery Shopping"
                placeholderTextColor={theme.muted}
                value={form.name}
                onChangeText={(v) => setForm({ ...form, name: v })}
                onFocus={() => setFormFocused("name")}
                onBlur={() => setFormFocused(null)}
              />
            </View>

            {/* Amount */}
            <Text style={styles.formLabel}>Amount (€)</Text>
            <View
              style={[
                styles.formInputRow,
                formFocused === "amount" && styles.formInputFocused,
              ]}
            >
              <Ionicons
                name="cash-outline"
                size={18}
                color={formFocused === "amount" ? theme.accent : theme.muted}
                style={{ marginRight: 10 }}
              />
              <TextInput
                style={styles.formInput}
                placeholder="0.00"
                placeholderTextColor={theme.muted}
                value={form.amount}
                onChangeText={(v) => setForm({ ...form, amount: v })}
                keyboardType="decimal-pad"
                onFocus={() => setFormFocused("amount")}
                onBlur={() => setFormFocused(null)}
              />
            </View>

            {/* Category */}
            <Text style={styles.formLabel}>Category</Text>
            <TouchableOpacity
              style={[
                styles.formInputRow,
                categoryPickerVisible && styles.formInputFocused,
              ]}
              onPress={() => setCategoryPickerVisible(true)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.catPreviewCircle,
                  { backgroundColor: form.category.bg },
                ]}
              >
                <Ionicons name={form.category.icon} size={16} color="#FFF" />
              </View>
              <Text style={styles.catPreviewText}>{form.category.label}</Text>
              <Ionicons name="chevron-down" size={16} color={theme.muted} />
            </TouchableOpacity>

            {/* Save Button */}
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Text style={styles.saveBtnText}>
                {editingId ? "Save Changes" : "Add Transaction"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* ── Category Picker Sub-Modal ── */}
        <Modal
          visible={categoryPickerVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setCategoryPickerVisible(false)}
        >
          <View style={styles.catModalWrapper}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setCategoryPickerVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={22} color={theme.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Select Category</Text>
              <View style={{ width: 40 }} />
            </View>
            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item.icon}
              numColumns={2}
              contentContainerStyle={styles.catGrid}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.catItem,
                    form.category.icon === item.icon && styles.catItemSelected,
                  ]}
                  onPress={() => {
                    setForm({ ...form, category: item });
                    setCategoryPickerVisible(false);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.catCircle, { backgroundColor: item.bg }]}>
                    <Ionicons name={item.icon} size={24} color="#FFF" />
                  </View>
                  <Text style={styles.catLabel}>{item.label}</Text>
                  {form.category.icon === item.icon && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={theme.accent}
                      style={styles.catCheck}
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </Modal>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.bg,
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: theme.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: theme.muted,
    marginTop: 4,
    lineHeight: 18,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  viewBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.card,
    alignItems: "center",
    justifyContent: "center",
  },
  viewBtnActive: {
    backgroundColor: theme.accent,
  },

  // ── Summary Cards ──
  cardsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: "flex-start",
  },
  cardExpense: {
    backgroundColor: "#2D1212",
  },
  cardIncome: {
    backgroundColor: "#0D2D1A",
  },
  cardBalance: {
    backgroundColor: "#2D2200",
  },
  cardIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(255,107,107,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  cardIconIncome: {
    backgroundColor: "rgba(45,212,160,0.2)",
  },
  cardIconBalance: {
    backgroundColor: "rgba(245,166,35,0.2)",
  },
  cardAmount: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 11,
    color: theme.muted,
    fontWeight: "500",
  },

  // ── Search ──
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.border,
    paddingHorizontal: 16,
    height: 52,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: theme.text,
    fontSize: 14,
  },

  // ── Filter Tabs ──
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: theme.card,
    borderWidth: 1.5,
    borderColor: theme.border,
  },
  filterTabActive: {
    backgroundColor: theme.accent,
    borderColor: theme.accent,
  },
  filterTabText: {
    color: theme.muted,
    fontSize: 14,
    fontWeight: "600",
  },
  filterTabTextActive: {
    color: "#1A0D00",
  },

  // ── Transaction List ──
  listContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  txnCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: theme.border,
  },
  txnIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  txnInfo: {
    flex: 1,
  },
  txnName: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "700",
  },
  txnDate: {
    color: theme.muted,
    fontSize: 12,
    marginTop: 2,
  },
  txnAmount: {
    fontSize: 14,
    fontWeight: "700",
    marginRight: 4,
  },
  amountIncome: {
    color: theme.income,
  },
  amountExpense: {
    color: theme.expense,
  },
  txnAction: {
    padding: 6,
  },

  // ── Empty State ──
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    color: theme.muted,
    fontSize: 15,
  },

  // ── FAB ──
  fab: {
    position: "absolute",
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },

  // ── Add/Edit Modal ──
  modalWrapper: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  modalCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.card,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "800",
  },

  // ── Type Toggle ──
  typeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  typeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: theme.card,
    borderWidth: 1.5,
    borderColor: theme.border,
  },
  typeBtnExpense: {
    backgroundColor: "#3D1212",
    borderColor: theme.expense,
  },
  typeBtnIncome: {
    backgroundColor: "#0D3D1A",
    borderColor: theme.income,
  },
  typeBtnText: {
    color: theme.muted,
    fontSize: 14,
    fontWeight: "700",
  },
  typeBtnTextActive: {
    color: "#FFF",
  },

  // ── Form Fields ──
  formLabel: {
    color: "#AAAAAA",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  formInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.input,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.border,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 20,
  },
  formInputFocused: {
    borderColor: theme.accent,
  },
  formInput: {
    flex: 1,
    color: theme.text,
    fontSize: 15,
  },

  // ── Category Selector ──
  catPreviewCircle: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  catPreviewText: {
    flex: 1,
    color: theme.text,
    fontSize: 15,
  },

  // ── Save Button ──
  saveBtn: {
    backgroundColor: theme.accent,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 8,
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  saveBtnText: {
    color: "#1A0D00",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  // ── Category Picker Modal ──
  catModalWrapper: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  catGrid: {
    paddingBottom: 40,
    gap: 12,
  },
  catItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.card,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 6,
    borderWidth: 1.5,
    borderColor: theme.border,
  },
  catItemSelected: {
    borderColor: theme.accent,
    backgroundColor: "#2A1F00",
  },
  catCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  catLabel: {
    flex: 1,
    color: theme.text,
    fontSize: 14,
    fontWeight: "600",
  },
  catCheck: {
    marginLeft: 4,
  },
});
