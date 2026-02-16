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
      <Text style={styles.label}>API Base URL</Text>
      <TextInput
        style={styles.input}
        value={url || ""}
        onChangeText={(t) => setUrl(t)}
        placeholder="http://192.168.x.y:3000"
        autoCapitalize="none"
        keyboardType="url"
      />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.testButton]}
        onPress={handleTest}
      >
        <Text style={styles.buttonText}>Test /health</Text>
      </TouchableOpacity>
      <View style={{ height: 20 }} />
      <Text style={styles.note}>Current effective base: {getApiBaseUrl()}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16 },
  label: { fontSize: 14, color: "#374151", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  testButton: { backgroundColor: "#10b981" },
  buttonText: { color: "#fff", fontWeight: "600" },
  note: { color: "#6b7280", marginTop: 8 },
});

export default SettingsScreen;
