import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView 
} from 'react-native';

const CalendarScreen = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.dayCell} />
      );
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const hasTransaction = [5, 11, 12, 13, 14, 15].includes(day); // Mock transaction days
      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            hasTransaction && styles.hasTransactionDay
          ]}
        >
          <Text style={[
            styles.dayText,
            hasTransaction && styles.transactionDayText
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }
    
    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Month Navigation */}
        <View style={styles.monthNavigation}>
          <TouchableOpacity onPress={() => navigateMonth('prev')}>
            <Text style={styles.navButton}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthYear}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
          <TouchableOpacity onPress={() => navigateMonth('next')}>
            <Text style={styles.navButton}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarContainer}>
          {/* Day Headers */}
          <View style={styles.dayHeaders}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <Text key={day} style={styles.dayHeaderText}>{day}</Text>
            ))}
          </View>
          
          {/* Calendar Days */}
          <View style={styles.calendarGrid}>
            {renderCalendarDays()}
          </View>
        </View>

        {/* Transaction Summary for Selected Month */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>March 2026 Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Transactions:</Text>
            <Text style={styles.summaryValue}>6</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Spent:</Text>
            <Text style={[styles.summaryValue, styles.expenseText]}>$4,350</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Income:</Text>
            <Text style={[styles.summaryValue, styles.incomeText]}>$3,000</Text>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Legend</Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.transactionDot]} />
            <Text style={styles.legendText}>Has transactions</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  navButton: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F46E5',
    paddingHorizontal: 16,
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  hasTransactionDay: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  dayText: {
    fontSize: 14,
    color: '#374151',
  },
  transactionDayText: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  expenseText: {
    color: '#EF4444',
  },
  incomeText: {
    color: '#10B981',
  },
  legendContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  transactionDot: {
    backgroundColor: '#4F46E5',
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default CalendarScreen;
