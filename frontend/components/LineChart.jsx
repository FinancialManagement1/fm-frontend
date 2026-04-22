// LineChart.jsx - Budget vs Actual Expenses over time
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Line, Text as SvgText, Circle, G } from "react-native-svg";
import { theme } from "../constants/theme";

export function LineChart({ trends, budgetLimit }) {
  // Debug logging
  console.log("📊 LineChart - budgetLimit:", budgetLimit, "type:", typeof budgetLimit);
  
  // Support both old format (transactions) and new API format (trends)
  const trendItems = trends?.items || trends;
  
  if (!trendItems || trendItems.length === 0) return null;

  const daysInMonth = trendItems.length;
  const width = 320;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Parse cumulative data from API response
  const cumulativeActual = trendItems.map((item, index) => ({
    day: index + 1,
    value: item.cumulativeAmount || 0
  }));

  // Calculate budget line (linear from 0 to budget limit)
  const budgetLine = [];
  for (let day = 1; day <= daysInMonth; day++) {
    budgetLine.push({
      day,
      value: (budgetLimit / daysInMonth) * day
    });
  }

  // Get final cumulative amount for max value calculation
  const finalAmount = cumulativeActual[cumulativeActual.length - 1]?.value || 0;
  
  // Find max value for Y scale
  const maxValue = Math.max(
    budgetLimit,
    finalAmount,
    ...cumulativeActual.map(d => d.value)
  ) * 1.1; // Add 10% padding

  // Scale functions
  const scaleX = (day) => padding.left + ((day - 1) / Math.max(daysInMonth - 1, 1)) * chartWidth;
  const scaleY = (value) => padding.top + chartHeight - ((value || 0) / Math.max(maxValue, 1)) * chartHeight;

  // Create path for actual expenses line
  const actualPath = cumulativeActual
    .map((point, index) => {
      const x = scaleX(point.day);
      const y = scaleY(point.value);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Create path for budget line
  const budgetPath = budgetLine
    .map((point, index) => {
      const x = scaleX(point.day);
      const y = scaleY(point.value);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Y-axis labels
  const yLabels = [0, maxValue * 0.25, maxValue * 0.5, maxValue * 0.75, maxValue];
  
  console.log("📈 LineChart Debug - budgetLimit:", budgetLimit, "maxValue:", maxValue, "yLabels:", yLabels);

  // X-axis labels (every 5 days)
  const xLabels = [1, 5, 10, 15, 20, 25, 30];

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        {/* Grid lines */}
        {yLabels.map((value, index) => (
          <Line
            key={`grid-${index}`}
            x1={padding.left}
            y1={scaleY(value)}
            x2={width - padding.right}
            y2={scaleY(value)}
            stroke={theme.border}
            strokeWidth={1}
            strokeDasharray="4,4"
          />
        ))}

        {/* Y-axis */}
        <Line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke={theme.muted}
          strokeWidth={1}
        />

        {/* X-axis */}
        <Line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke={theme.muted}
          strokeWidth={1}
        />

        {/* Y-axis labels */}
        {yLabels.map((value, index) => {
          // Format: show as €200 (under 1000) or €2k (1000+)
          const label = value >= 1000 
            ? `€${(value / 1000).toFixed(0)}k` 
            : `€${Math.round(value)}`;
          return (
            <SvgText
              key={`y-label-${index}`}
              x={padding.left - 10}
              y={scaleY(value) + 4}
              fill={theme.muted}
              fontSize={10}
              textAnchor="end"
            >
              {label}
            </SvgText>
          );
        })}

        {/* X-axis labels */}
        {xLabels.map((day) => (
          <SvgText
            key={`x-label-${day}`}
            x={scaleX(day)}
            y={height - padding.bottom + 15}
            fill={theme.muted}
            fontSize={10}
            textAnchor="middle"
          >
            {day}
          </SvgText>
        ))}

        {/* Budget line */}
        <Path
          d={budgetPath}
          fill="none"
          stroke={theme.accent}
          strokeWidth={2}
          strokeDasharray="5,5"
        />

        {/* Actual expenses line */}
        <Path
          d={actualPath}
          fill="none"
          stroke={theme.expense}
          strokeWidth={2}
        />

        {/* Data points for actual */}
        {cumulativeActual
          .filter((_, i) => i % 5 === 0 || i === cumulativeActual.length - 1)
          .map((point, index) => (
            <Circle
              key={`point-${index}`}
              cx={scaleX(point.day)}
              cy={scaleY(point.value)}
              r={4}
              fill={theme.expense}
            />
          ))}

        {/* Legend */}
        <G x={padding.left} y={10}>
          {/* Budget legend */}
          <Line
            x1={0}
            y1={0}
            x2={20}
            y2={0}
            stroke={theme.accent}
            strokeWidth={2}
            strokeDasharray="5,5"
          />
          <SvgText x={25} y={4} fill={theme.text} fontSize={12}>
            Budget
          </SvgText>

          {/* Actual legend */}
          <Line
            x1={70}
            y1={0}
            x2={90}
            y2={0}
            stroke={theme.expense}
            strokeWidth={2}
          />
          <SvgText x={95} y={4} fill={theme.text} fontSize={12}>
            Actual
          </SvgText>
        </G>
      </Svg>

      <Text style={styles.xAxisLabel}>Days of Month</Text>
      <Text style={styles.budgetLabel}>Budget Limit: €{budgetLimit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  xAxisLabel: {
    fontSize: 12,
    color: theme.muted,
    marginTop: 5,
  },
  budgetLabel: {
    fontSize: 12,
    color: theme.accent,
    marginTop: 8,
    fontWeight: "600",
  },
});
