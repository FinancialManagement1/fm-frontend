import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { API_BASE_URL } from "../../constants/api";
import { theme } from "../../constants/theme";

const MOCK_DATA = {
  userName: "User",
  currency: "EUR",
  period: "2026-03",
  summary: {
    totalBalance: 0,
    income: 0,
    expenses: 0,
  },
  monthlyBudget: {
    spent: 0,
    limit: 5000,
    remaining: 5000,
    progressPercentage: 0,
  },
};

function CircularProgress({ percentage }) {
  const size = 80;
  const strokeWidth = 7;
  const safePercent = Math.min(Math.max(percentage, 0), 100);

  return (
    <View style={{
      width: size,
      height: size,
      alignItems: "center",
      justifyContent: "center",
    }}>
      <View style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderColor: "#2A2A2A",
        position: "absolute",
      }} />
      <View style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderColor: "transparent",
        borderTopColor: theme.income,
        borderRightColor: safePercent > 25 ? theme.income : "transparent",
        borderBottomColor: safePercent > 50 ? theme.income : "transparent",
        borderLeftColor: safePercent > 75 ? theme.income : "transparent",
        position: "absolute",
        transform: [{ rotate: "-90deg" }],
      }} />
      <Text style={{
        color: theme.text,
        fontSize: 13,
        fontWeight: "700",
      }}>
        {safePercent}%
      </Text>
    </View>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [data, setData] = useState(MOCK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/dashboard/summary`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const currencySymbol = data.currency === "EUR" ? "€" : "$";

  if (loading) {
    return (
      <View style={[styles.root, {
        alignItems: "center",
        justifyContent: "center",
      }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 16 },
        ]}
      >

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {data.userName}</Text>
            <Text style={styles.subGreeting}>
              Here's your financial overview
            </Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color={theme.text}
            />
          </TouchableOpacity>
        </View>

        {/* ── Total Balance Card ── */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceLeft}>
            <View style={styles.balanceIconBox}>
              <Ionicons name="wallet" size={20} color="#1A0D00" />
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.balanceLabel} numberOfLines={1}>
                Total Balance
              </Text>
              <Text style={styles.balanceAmount} numberOfLines={1}>
                {currencySymbol}
                {data.summary.totalBalance.toFixed(2)}
              </Text>
            </View>
          </View>
          <CircularProgress
            percentage={data.monthlyBudget.progressPercentage}
          />
        </View>

        {/* ── Income & Expenses Row ── */}
        <View style={styles.row}>

          {/* Income Card */}
          <View style={[styles.statCard, { borderColor: "#1A3D2B" }]}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Income</Text>
              <View style={[styles.statIconBtn, {
                backgroundColor: "rgba(45,212,160,0.15)",
              }]}>
                <Ionicons name="arrow-up" size={16} color={theme.income} />
              </View>
            </View>
            <Text style={[styles.statAmount, { color: theme.income }]}>
              {currencySymbol}
              {data.summary.income.toFixed(2)}
            </Text>
            <View style={[styles.statBar, { backgroundColor: theme.income }]} />
          </View>

          {/* Expenses Card */}
          <View style={[styles.statCard, { borderColor: "#3D1A1A" }]}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Expenses</Text>
              <View style={[styles.statIconBtn, {
                backgroundColor: "rgba(255,107,107,0.15)",
              }]}>
                <Ionicons name="arrow-down" size={16} color={theme.expense} />
              </View>
            </View>
            <Text style={[styles.statAmount, { color: theme.expense }]}>
              {currencySymbol}
              {data.summary.expenses.toFixed(2)}
            </Text>
            <View style={[styles.statBar, { backgroundColor: theme.expense }]} />
          </View>

        </View>

        {/* ── Monthly Budget ── */}
        <View style={styles.budgetCard}>
          <Text style={styles.budgetTitle}>Monthly Budget</Text>
          <View style={styles.budgetRow}>
            <Text style={styles.budgetAmount}>
              {currencySymbol}{data.monthlyBudget.spent.toFixed(2)} /{" "}
              {currencySymbol}{data.monthlyBudget.limit.toFixed(2)}
            </Text>
            <View style={styles.budgetPercentBadge}>
              <Text style={styles.budgetPercent}>
                {data.monthlyBudget.progressPercentage}%
              </Text>
            </View>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, {
              width: `${Math.min(data.monthlyBudget.progressPercentage, 100)}%`,
              backgroundColor:
                data.monthlyBudget.progressPercentage > 80
                  ? theme.expense
                  : theme.accent,
            }]} />
          </View>
          <Text style={styles.budgetRemaining}>
            Remaining:{" "}
            <Text style={{ color: theme.income, fontWeight: "700" }}>
              {currencySymbol}
              {data.monthlyBudget.remaining.toFixed(2)}
            </Text>
          </Text>
        </View>

        {/* ── Add Income / Expense Buttons ── */}
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#0D2B1A" }]}
            activeOpacity={0.8}
            onPress={() => router.push('/transactions/add?type=income')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="arrow-up" size={20} color="#fff" />
            </View>
            <Text style={styles.actionText}>Add{"\n"}Income</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#2B0D0D" }]}
            activeOpacity={0.8}
            onPress={() => router.push('/transactions/add?type=expense')}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="arrow-down" size={20} color="#fff" />
            </View>
            <Text style={styles.actionText}>Add{"\n"}Expense</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  greeting: {
    color: theme.text,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subGreeting: {
    color: theme.muted,
    fontSize: 13,
    marginTop: 4,
  },
  notifBtn: {
    width: 42,
    height: 42,
    backgroundColor: theme.card,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.border,
  },
  balanceCard: {
    backgroundColor: "#0D2020",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1A3D3D",
  },
  balanceLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  balanceIconBox: {
    width: 44,
    height: 44,
    backgroundColor: theme.accent,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  balanceLabel: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  balanceAmount: {
    color: theme.text,
    fontSize: 22,
    fontWeight: "800",
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  statLabel: {
    color: theme.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  statIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statAmount: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
  },
  statBar: {
    height: 4,
    borderRadius: 2,
    width: "100%",
  },
  budgetCard: {
    backgroundColor: theme.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  budgetTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  budgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  budgetAmount: {
    color: theme.muted,
    fontSize: 13,
  },
  budgetPercentBadge: {
    backgroundColor: "#2A2A2A",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  budgetPercent: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "700",
  },
  progressBg: {
    height: 8,
    backgroundColor: theme.border,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  budgetRemaining: {
    color: theme.muted,
    fontSize: 13,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },
});