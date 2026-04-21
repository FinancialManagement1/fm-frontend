import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants/theme";

function TabIcon({ name, label, focused }) {
  return (
    <View style={styles.tabIcon}>
      <Ionicons
        name={name}
        size={22}
        color={focused ? theme.accent : theme.muted}
      />
      <Text
        style={[
          styles.tabLabel,
          { color: focused ? theme.accent : theme.muted },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? "home" : "home-outline"}
              label="Home"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? "wallet" : "wallet-outline"}
              label="Expenses"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.scanBtn}>
              <Ionicons name="scan" size={26} color="#1A0D00" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="charts"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? "bar-chart" : "bar-chart-outline"}
              label="Analytics"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? "trophy" : "trophy-outline"}
              label="Goals"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={focused ? "person" : "person-outline"}
              label="Profile"
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#161616",
    borderTopColor: "#2A2A2A",
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 4,
    paddingTop: 4,
  },
  tabIcon: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: "600",
    marginTop: 2,
  },
  scanBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: theme.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
});