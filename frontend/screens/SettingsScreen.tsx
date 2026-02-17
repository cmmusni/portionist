import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { apiUrl, getApiBaseUrl } from "../services/config";
import { getOverride, setOverride } from "../services/runtimeConfig";

const SettingsScreen: React.FC = () => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const cur = getOverride();
    setUrl(cur || getApiBaseUrl());
  }, []);

  const handleSave = async () => {
    try {
      if (!url) {
        await setOverride(null);
        Alert.alert("Saved", "Cleared override; using default API base URL");
        return;
      }
      await setOverride(url);
      Alert.alert("Saved", `API base URL set to ${url}`);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save override");
    }
  };

  const handleTest = async () => {
    try {
      const healthUrl = apiUrl("/health");
      const res = await fetch(healthUrl);
      if (!res.ok) throw new Error(String(res.status));
      const json = await res.json();
      Alert.alert("Success", `Reachable: ${JSON.stringify(json)}`);
    } catch (err: any) {
      console.error("Health check failed", err);
      Alert.alert("Failed", String(err));
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <LinearGradient
        colors={["#06b6d4", "#0891b2"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerIcon}>⚙️</Text>
        <Text style={styles.headerTitle}>API Settings</Text>
        <Text style={styles.headerSubtitle}>
          Configure your development environment
        </Text>
      </LinearGradient>

      {/* Settings Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>🌐 API Base URL</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Server Address</Text>
          <TextInput
            style={styles.input}
            value={url || ""}
            onChangeText={(t) => setUrl(t)}
            placeholder="http://192.168.x.y:3000"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.buttonWrapper}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#2563eb", "#1d4ed8"]}
              style={styles.button}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonIcon}>💾</Text>
              <Text style={styles.buttonText}>Save</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonWrapper}
            onPress={handleTest}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#10b981", "#059669"]}
              style={styles.button}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonIcon}>✅</Text>
              <Text style={styles.buttonText}>Test</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📡 Current Endpoint</Text>
          <Text style={styles.infoValue}>{getApiBaseUrl()}</Text>
        </View>
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Tips</Text>
          <Text style={styles.tipText}>
            • Use localhost:3000 for web development
          </Text>
          <Text style={styles.tipText}>
            • Use your machine's IP for mobile testing
          </Text>
          <Text style={styles.tipText}>
            • Test connection before saving changes
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingTop: 48,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 24,
    shadowColor: "#06b6d4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
  },
  card: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  cardHeader: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: "#e2e8f0",
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    backgroundColor: "#f8fafc",
    color: "#0f172a",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  buttonWrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    gap: 8,
  },
  buttonIcon: {
    fontSize: 18,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
  infoCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: "#f0f9ff",
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#0ea5e9",
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 14,
    color: "#0f172a",
    fontFamily: "monospace",
  },
  tipsContainer: {
    backgroundColor: "#fef3c7",
    padding: 16,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#92400e",
    marginBottom: 12,
  },
  tipText: {
    fontSize: 13,
    color: "#92400e",
    lineHeight: 20,
    marginBottom: 6,
  },
});

export default SettingsScreen;
