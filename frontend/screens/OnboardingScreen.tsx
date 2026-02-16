import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

interface OnboardingValues {
  age: number;
  currentWeight: number;
  targetWeight: number;
  cuisine: string;
}

interface OnboardingScreenProps {
  handleOnboardingSubmit: (values: OnboardingValues) => void;
}

const CUISINE_OPTIONS = ["Filipino", "Italian", "Japanese", "Korean"];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1f2937",
  },
  subtitle: {
    color: "#4b5563",
    marginBottom: 32,
  },
  fieldGroup: {
    marginBottom: 24,
  },
  label: {
    color: "#374151",
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#1f2937",
    backgroundColor: "#f9fafb",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#f9fafb",
    overflow: "hidden",
  },
  submitButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default function OnboardingScreen({
  handleOnboardingSubmit,
}: OnboardingScreenProps) {
  // Get existing onboarding data from Redux
  const storedAge = useSelector((state: any) => state.pantry.userAge);
  const storedCuisine = useSelector((state: any) => state.pantry.cuisine);
  const storedCurrentWeight = useSelector(
    (state: any) => state.pantry.currentWeight,
  );
  const storedTargetWeight = useSelector(
    (state: any) => state.pantry.targetWeight,
  );

  const [age, setAge] = useState(storedAge ? storedAge.toString() : "");
  const [currentWeight, setCurrentWeight] = useState(
    storedCurrentWeight ? storedCurrentWeight.toString() : "",
  );
  const [targetWeight, setTargetWeight] = useState(
    storedTargetWeight ? storedTargetWeight.toString() : "",
  );
  const [cuisine, setCuisine] = useState(storedCuisine || CUISINE_OPTIONS[0]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with stored values on component mount
  useEffect(() => {
    if (storedAge) {
      setAge(storedAge.toString());
    }
    if (storedCurrentWeight) {
      setCurrentWeight(storedCurrentWeight.toString());
    }
    if (storedTargetWeight) {
      setTargetWeight(storedTargetWeight.toString());
    }
    if (storedCuisine) {
      setCuisine(storedCuisine);
    }
  }, [storedAge, storedCurrentWeight, storedTargetWeight, storedCuisine]);

  const validateInputs = (): boolean => {
    const ageNum = parseFloat(age);
    const currentWeightNum = parseFloat(currentWeight);
    const targetWeightNum = parseFloat(targetWeight);

    if (!age || !currentWeight || !targetWeight) {
      Alert.alert("Validation Error", "Please fill in all fields");
      return false;
    }

    if (isNaN(ageNum) || isNaN(currentWeightNum) || isNaN(targetWeightNum)) {
      Alert.alert("Validation Error", "Please enter valid numbers");
      return false;
    }

    if (ageNum <= 0 || currentWeightNum <= 0 || targetWeightNum <= 0) {
      Alert.alert(
        "Validation Error",
        "Age and weight values must be positive numbers",
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);

    try {
      const values: OnboardingValues = {
        age: parseFloat(age),
        currentWeight: parseFloat(currentWeight),
        targetWeight: parseFloat(targetWeight),
        cuisine,
      };

      await handleOnboardingSubmit(values);
    } catch (error) {
      Alert.alert("Error", "Failed to submit onboarding data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>
          {`Let's customize your meal planning experience`}
        </Text>

        {/* Age Input */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your age"
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
            editable={!isLoading}
          />
        </View>

        {/* Current Weight Input */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Current Weight (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your current weight"
            keyboardType="decimal-pad"
            value={currentWeight}
            onChangeText={setCurrentWeight}
            editable={!isLoading}
          />
        </View>

        {/* Target Weight Input */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Target Weight (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your target weight"
            keyboardType="decimal-pad"
            value={targetWeight}
            onChangeText={setTargetWeight}
            editable={!isLoading}
          />
        </View>

        {/* Cuisine Dropdown */}
        <View style={[styles.fieldGroup, { marginBottom: 32 }]}>
          <Text style={styles.label}>Default Cuisine</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={cuisine}
              onValueChange={(itemValue) => setCuisine(itemValue)}
              enabled={!isLoading}
            >
              {CUISINE_OPTIONS.map((option) => (
                <Picker.Item key={option} label={option} value={option} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Next Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Next</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
