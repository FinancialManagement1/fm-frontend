import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../constants/theme";

export default function GoalsScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.text}>Goals Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "700",
  },
});