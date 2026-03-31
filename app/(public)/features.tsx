import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function FeaturesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Features</Text>
      <Text style={styles.subtitle}>
        Discover what Ascencio Tax can do for you
      </Text>

      {/* TODO: Implement features list */}

      <Link href="/" style={styles.link}>
        <Text style={styles.linkText}>← Back to Home</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  link: {
    marginTop: 20,
  },
  linkText: {
    color: "#007AFF",
    fontSize: 16,
  },
});
