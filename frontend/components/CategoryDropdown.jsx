import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

// Simple category dropdown button - uses data from Abir's hook
const CategoryDropdown = ({ 
  selectedCategory, 
  onPress, 
  placeholder = 'Select Category',
  type = 'expense'
}) => {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {selectedCategory ? (
          <>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>
                {selectedCategory.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.selectedText}>{selectedCategory}</Text>
          </>
        ) : (
          <Text style={styles.placeholder}>{placeholder}</Text>
        )}
      </View>
      <Text style={styles.arrow}>▼</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fbbf24',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  placeholder: {
    color: '#9ca3af',
    fontSize: 16,
  },
  arrow: {
    color: '#9ca3af',
    fontSize: 12,
  },
});

export default CategoryDropdown;
