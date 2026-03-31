import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/components/ui/theme";

interface FooterLinkProps {
  text: string;
  onPress?: () => void;
}

export function FooterLink({ text, onPress }: FooterLinkProps) {
  return (
    <TouchableOpacity style={styles.footerLinkItem} onPress={onPress}>
      <Ionicons name="arrow-forward" size={14} color={theme.primary} />
      <Text style={styles.footerLinkText}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  footerLinkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  footerLinkText: {
    fontSize: 13,
    color: "#b8bfd4",
    fontWeight: "500",
  },
});
