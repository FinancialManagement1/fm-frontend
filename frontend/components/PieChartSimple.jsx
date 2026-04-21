import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../constants/theme";

export function PieChart({ data }) {
  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return null;

  const sortedData = [...data].sort((a, b) => b.value - a.value);

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        {sortedData.map((item, index) => {
          const size = 150 - index * 30;
          
          return (
            <View
              key={index}
              style={[
                styles.ring,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  borderColor: item.color,
                  borderWidth: 20,
                  zIndex: sortedData.length - index,
                },
              ]}
            />
          );
        })}
        
        <View style={styles.centerContent}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>€{total.toFixed(0)}</Text>
        </View>
      </View>

      <View style={styles.legendContainer}>
        {sortedData.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          return (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <View style={styles.legendTextContainer}>
                <Text style={styles.legendName}>{item.name}</Text>
                <Text style={styles.legendValue}>
                  €{item.value.toFixed(0)} ({percentage}%)
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  chartContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  ring: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  centerContent: {
    backgroundColor: theme.card,
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  totalLabel: {
    fontSize: 10,
    color: theme.muted,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.text,
  },
  legendContainer: {
    marginTop: 20,
    gap: 12,
    width: "100%",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  legendTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
  },
  legendName: {
    fontSize: 14,
    color: theme.text,
    fontWeight: "500",
  },
  legendValue: {
    fontSize: 14,
    color: theme.muted,
  },
});
