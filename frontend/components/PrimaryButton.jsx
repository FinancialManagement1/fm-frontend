import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { theme } from "../constants/theme";

export default function PrimaryButton({ title, onPress }) {
  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: theme.accent,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 8,
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  text: {
    color: "#1A0D00",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});