import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTransactions } from '../../hooks/useTransactions';
import { useCategories } from '../../hooks/useCategories';

export default function AddTransactionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const type = params?.type || 'expense'; // Default to expense if no type provided
  const { addTransaction } = useTransactions();
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const isIncome = type === 'income';

  // Use Abir's hook - no hardcoded categories
  const { incomeCategories, expenseCategories, fetchAllCategories } = useCategories();

  // Fetch categories on mount
  useEffect(() => {
    fetchAllCategories();
  }, []);

  // Get categories based on type - use item.name from API
  const categories = isIncome ? incomeCategories : expenseCategories;

  const handleSave = async () => {
    // Validation
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (!category) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    if (!date) {
      Alert.alert('Error', 'Please select a date');
      return;
    }

    setLoading(true);
    try {
      // API-compliant payload
      const transactionData = {
        description: description || category,
        amount: parseFloat(amount),
        type: isIncome ? 'income' : 'expense',
        category: category,
        date: date,
      };
      
      
      await addTransaction(transactionData);
      
      Alert.alert('Success', `${isIncome ? 'Income' : 'Expense'} added successfully!`, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add {isIncome ? 'Income' : 'Expense'}</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Amount Input */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Amount</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>€</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          {/* Category Selection */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.name}
                  style={[
                    styles.categoryCard,
                    category === cat.name && { 
                      backgroundColor: `${cat.color}20`,
                      borderColor: cat.color 
                    }
                  ]}
                  onPress={() => setCategory(cat.name)}
                >
                  <View style={[styles.categoryIconBox, { backgroundColor: `${cat.color}30` }]}>
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  </View>
                  <Text style={[
                    styles.categoryCardText,
                    category === cat.name && { color: cat.color, fontWeight: '600' }
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date Input */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Date</Text>
            <TouchableOpacity 
              style={styles.dateInputContainer}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateInputText}>
                {date ? new Date(date).toLocaleDateString('en-GB', { 
                  day: '2-digit', 
                  month: 'short', 
                  year: 'numeric' 
                }) : 'Select Date'}
              </Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
          </View>

          {/* Description Input */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Add a note (optional)"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : `Save ${isIncome ? 'Income' : 'Expense'}`}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity 
                onPress={() => {
                  const year = selectedDate.getFullYear();
                  const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                  const day = String(selectedDate.getDate()).padStart(2, '0');
                  setDate(`${year}-${month}-${day}`);
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.modalDoneButton}>Done</Text>
              </TouchableOpacity>
            </View>

            {/* Calendar */}
            <View style={styles.calendarContainer}>
              {/* Month Navigation */}
              <View style={styles.monthNav}>
                <TouchableOpacity 
                  onPress={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setSelectedDate(newDate);
                  }}
                >
                  <Text style={styles.navArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.monthText}>
                  {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
                <TouchableOpacity 
                  onPress={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setSelectedDate(newDate);
                  }}
                >
                  <Text style={styles.navArrow}>→</Text>
                </TouchableOpacity>
              </View>

              {/* Day Headers */}
              <View style={styles.dayHeaders}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                  <Text key={index} style={styles.dayHeader}>{day}</Text>
                ))}
              </View>

              {/* Calendar Grid */}
              <View style={styles.calendarGrid}>
                {(() => {
                  const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
                  const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();
                  const days = [];
                  
                  // Empty cells
                  for (let i = 0; i < firstDay; i++) {
                    days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
                  }
                  
                  // Day cells
                  for (let day = 1; day <= daysInMonth; day++) {
                    const isSelected = day === selectedDate.getDate();
                    days.push(
                      <TouchableOpacity
                        key={day}
                        style={[styles.calendarDay, isSelected && styles.selectedDay]}
                        onPress={() => {
                          const newDate = new Date(selectedDate);
                          newDate.setDate(day);
                          setSelectedDate(newDate);
                        }}
                      >
                        <Text style={[styles.calendarDayText, isSelected && styles.selectedDayText]}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    );
                  }
                  return days;
                })()}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  backButtonText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  inputSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 16,
    paddingHorizontal: 24,
  },
  currencySymbol: {
    fontSize: 28,
    color: '#fbbf24',
    fontWeight: 'bold',
    marginRight: 12,
  },
  amountInput: {
    flex: 1,
    fontSize: 28,
    color: '#ffffff',
    fontWeight: 'bold',
    paddingVertical: 20,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  categoryIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryCardText: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
    fontWeight: '500',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  dateInputText: {
    fontSize: 16,
    color: '#ffffff',
  },
  calendarIcon: {
    fontSize: 20,
  },
  descriptionInput: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 20,
    fontSize: 16,
    color: '#ffffff',
    height: 100,
    textAlignVertical: 'top',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalCloseButton: {
    fontSize: 20,
    color: '#9ca3af',
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalDoneButton: {
    fontSize: 16,
    color: '#fbbf24',
    fontWeight: '600',
    padding: 8,
  },
  calendarContainer: {
    backgroundColor: '#000000',
    borderRadius: 16,
    padding: 16,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navArrow: {
    fontSize: 24,
    color: '#ffffff',
    padding: 8,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  dayHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  dayHeader: {
    fontSize: 14,
    color: '#9ca3af',
    width: 40,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  calendarDay: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  calendarDayText: {
    fontSize: 16,
    color: '#ffffff',
  },
  selectedDay: {
    backgroundColor: '#fbbf24',
    borderRadius: 20,
  },
  selectedDayText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#fbbf24',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonDisabled: {
    backgroundColor: '#374151',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
});
