import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import TransactionForm from "../../components/TransactionForm";
import { useTransactions } from "../../hooks/useTransactions";

export default function EditTransactionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params?.id;
  const {
    transactions,
    loading: transactionsLoading,
    fetchTransactions,
    editTransaction,
    removeTransaction,
  } = useTransactions();

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Fetch transactions on mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    if (transactionsLoading) return; // Wait for transactions to load

    // Try to find transaction with flexible ID matching (string or number)
    const foundTransaction = transactions.find(
      (t) => t.id === id || t.id === Number(id) || String(t.id) === String(id),
    );

    if (foundTransaction) {
      setTransaction(foundTransaction);
      setNotFound(false);
    } else if (!transactionsLoading && transactions.length > 0) {
      setNotFound(true);
      Alert.alert("Error", "Transaction not found", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  }, [transactions, id, transactionsLoading, router]);

  const handleSubmit = async (transactionData) => {
    await editTransaction(id, transactionData);
    Alert.alert("Success", "Transaction updated successfully!", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  const handleDelete = async () => {
    try {
      await removeTransaction(id);
      Alert.alert("Success", "Transaction deleted successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to delete transaction");
    }
  };

  if (!transaction && !notFound) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading transaction...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Transaction</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Form */}
          <TransactionForm
            initialData={transaction}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
            isEditing={true}
            submitButtonText="Save Changes"
            deleteButtonText="Delete Transaction"
            showDeleteButton={true}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 20,
    color: "#ffffff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#9ca3af",
  },
});
