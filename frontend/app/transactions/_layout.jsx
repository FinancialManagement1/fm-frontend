import { Stack } from 'expo-router';

export default function TransactionsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Transactions',
          headerStyle: {
            backgroundColor: '#4F46E5',
          },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="calendar" 
        options={{ 
          title: 'Calendar',
          headerStyle: {
            backgroundColor: '#4F46E5',
          },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="add" 
        options={{ 
          title: 'Add Transaction',
          headerStyle: {
            backgroundColor: '#4F46E5',
          },
          headerTintColor: '#fff',
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="edit" 
        options={{ 
          title: 'Edit Transaction',
          headerStyle: {
            backgroundColor: '#4F46E5',
          },
          headerTintColor: '#fff',
          presentation: 'modal',
        }} 
      />
    </Stack>
  );
}
