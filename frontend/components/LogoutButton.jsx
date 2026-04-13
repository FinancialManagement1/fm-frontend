import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';

// LogoutButton Component - UI Only
// This component will use Abir's useAuth hook when available
// For now, it calls handleLogout prop which comes from the hook

const LogoutButton = ({ 
  onPress, // This will be handleLogout from Abir's useAuth hook
  style,
  textStyle,
}) => {
  const router = useRouter();

  const handleLogoutPress = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            // Call the hook function - no logic here, just UI
            if (onPress) {
              await onPress();
              // After successful logout, navigate to login
              // This navigation is UI responsibility
              router.replace('/login');
            }
          }
        }
      ]
    );
  };

  return (
    <TouchableOpacity 
      style={[styles.button, style]}
      onPress={handleLogoutPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, textStyle]}>Logout</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LogoutButton;
