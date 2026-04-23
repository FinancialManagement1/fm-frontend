// PieChartSimple.jsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, G, Text as SvgText } from "react-native-svg";
import { theme } from "../constants/theme";
import { useCurrency } from "../hooks/useCurrency";

export function PieChart({ data }) {
  const { currencySymbol } = useCurrency();

  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return null;

  const sortedData = [...data].sort((a, b) => b.value - a.value);

  const size = 180;
  const radius = size / 2;
  const centerX = radius;
  const centerY = radius;

  let currentAngle = 0;
  const sliceElements = [];
  const labelElements = [];

  sortedData.forEach((item, index) => {
    const percentageValue = item.value / total;
    const angle = percentageValue * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    const midAngle = startAngle + angle / 2;

    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    sliceElements.push(
      <Path
        key={`slice-${index}`}
        d={pathData}
        fill={item.color}
        stroke="#fff"
        strokeWidth={2}
      />
    );

    const labelRadius = radius * 0.65;
    const midRad = (midAngle - 90) * (Math.PI / 180);
    const labelX = centerX + labelRadius * Math.cos(midRad);
    const labelY = centerY + labelRadius * Math.sin(midRad);

    const percentText = `${(percentageValue * 100).toFixed(0)}%`;

    labelElements.push(
      <SvgText
        key={`label-${index}`}
        x={labelX}
        y={labelY}
        fill="#fff"
        fontSize={12}
        fontWeight="bold"
        textAnchor="middle"
        alignmentBaseline="middle"
      >
        {percentText}
      </SvgText>
    );

    currentAngle = endAngle;
  });

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Svg width={size} height={size}>
          <G>
            {sliceElements}
            {labelElements}
          </G>
        </Svg>
      </View>

      <View style={styles.legendContainer}>
        {sortedData.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(0);
          return (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendName}>{item.name}</Text>
              <Text style={styles.legendValue}>{currencySymbol}{item.value.toFixed(2)}</Text>
              <Text style={styles.legendPercent}>{percentage}%</Text>
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
    padding: 20,
  },
  chartContainer: {
    width: 180,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  legendContainer: {
    marginTop: 24,
    width: "100%",
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendName: {
    fontSize: 14,
    color: theme.text,
    fontWeight: "500",
    flex: 1,
  },
  legendValue: {
    fontSize: 14,
    color: theme.text,
    fontWeight: "600",
    width: 90,
    textAlign: "right",
  },
  legendPercent: {
    fontSize: 14,
    color: theme.muted,
    width: 40,
    textAlign: "right",
  },
});