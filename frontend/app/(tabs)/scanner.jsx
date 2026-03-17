import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../constants/theme";

export default function ScannerScreen() {
  return (
    <View style={styles.root}>
      <Text style={styles.text}>AI Scanner Screen</Text>
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