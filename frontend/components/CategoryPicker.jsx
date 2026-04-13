import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';

// Category Grid Picker - Matches Figma Design
// Props:
// - visible: boolean to show/hide modal
// - onClose: function to close modal
// - onSelect: function(categoryName) called when category selected
// - categories: array of {name, type} from Abir's hook - NO hardcoded values
// - selectedValue: currently selected category name
// - type: 'income' or 'expense'
// - loading: boolean to show loading state

const CategoryPicker = ({ 
  visible, 
  onClose, 
  onSelect, 
  categories = [], // From Abir's useCategories hook - NO hardcoded values
  selectedValue,
  type = 'expense',
  loading = false,
}) => {
  // Simple icon fallback - no hardcoded category mappings
  const getCategoryIcon = (categoryName) => {
    // Use first letter as icon - no hardcoded mappings
    return categoryName?.charAt(0)?.toUpperCase() || '?';
  };

  // Get background color based on category type
  const getCategoryColor = (categoryType) => {
    if (categoryType === 'income') {
      return 'rgba(34, 197, 94, 0.2)'; // Green
    }
    return 'rgba(239, 68, 68, 0.2)'; // Red for expense
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        { backgroundColor: getCategoryColor(item.type) },
        selectedValue === item.name && styles.selectedCard
      ]}
      onPress={() => {
        onSelect(item.name); // Always use item.name - never use index
        onClose();
      }}
      activeOpacity={0.7}
    >
      <View style={styles.iconWrapper}>
        <Text style={styles.icon}>{getCategoryIcon(item.name)}</Text>
      </View>
      <Text 
        style={[
          styles.categoryName,
          selectedValue === item.name && styles.selectedName
        ]}
        numberOfLines={1}
      >
        {item.name} {/* Always display item.name */}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No categories available</Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#fbbf24" />
      <Text style={styles.loadingText}>Loading categories...</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Select Category</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        {loading ? (
          renderLoadingState()
        ) : (
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.name}
            numColumns={3}
            contentContainerStyle={styles.grid}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#18181b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  grid: {
    padding: 16,
    paddingBottom: 32,
  },
  categoryCard: {
    flex: 1,
    aspectRatio: 1,
    margin: 8,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 100,
    maxWidth: 120,
  },
  selectedCard: {
    borderColor: '#fbbf24',
    borderWidth: 2,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
  },
  selectedName: {
    color: '#fbbf24',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#9ca3af',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '500',
  },
});

