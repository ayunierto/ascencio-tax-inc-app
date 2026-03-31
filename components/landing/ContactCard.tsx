import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/components/ui/theme";

interface ContactCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  text: string;
  secondaryText?: string;
  fullWidth?: boolean;
}

export function ContactCard({
  icon,
  label,
  text,
  secondaryText,
  fullWidth = false,
}: ContactCardProps) {
  return (
    <View style={[styles.contactCard, fullWidth && styles.contactCardFull]}>
      <View style={styles.contactIconWrapper}>
        <Ionicons name={icon} size={20} color={theme.primary} />
      </View>
      <View style={styles.contactCardContent}>
        <Text style={styles.contactCardLabel}>{label}</Text>
        <Text style={styles.contactCardText}>{text}</Text>
        {secondaryText && (
          <Text style={styles.contactCardText}>{secondaryText}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contactCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    width: "48%",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  contactCardFull: {
    width: "100%",
  },
  contactIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(59, 89, 152, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  contactCardContent: {
    flex: 1,
  },
  contactCardLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#8b93a7",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  contactCardText: {
    fontSize: 13,
    color: "#e8eaf0",
    lineHeight: 18,
    fontWeight: "500",
  },
});
