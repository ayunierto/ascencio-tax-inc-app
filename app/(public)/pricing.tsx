import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function PricingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pricing Plans</Text>
      <Text style={styles.description}>
        Choose the plan that fits your needs.
      </Text>

      {/* TODO: Add pricing cards */}

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
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  link: {
    marginTop: 20,
  },
  linkText: {
    color: "#007AFF",
    fontSize: 16,
  },
});
