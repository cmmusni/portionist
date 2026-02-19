import { BrandColors } from "@/constants/theme";
import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
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
    backgroundColor: "#f0f9ff",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 40,
  },
  content: {
    paddingHorizontal: 24,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressFill: {
    height: "100%",
    backgroundColor: BrandColors.primary,
    borderRadius: 4,
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },
  stepDotActive: {
    backgroundColor: BrandColors.primary,
  },
  stepDotCompleted: {
    backgroundColor: BrandColors.success,
  },
  stepNumber: {
    color: "#94a3b8",
    fontWeight: "700",
    fontSize: 14,
  },
  stepNumberActive: {
    color: "#ffffff",
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 8,
  },
  stepLineCompleted: {
    backgroundColor: "#10b981",
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  stepTitle: {
    fontSize: 14,
    color: BrandColors.primary,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
    color: "#0c4a6e",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#64748b",
    fontSize: 15,
    textAlign: "center",
    marginTop: 4,
  },
  questionContainer: {
    marginBottom: 32,
  },
  label: {
    color: "#334155",
    fontWeight: "600",
    marginBottom: 12,
    fontSize: 16,
  },
  input: {
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: "#1e293b",
    backgroundColor: "#ffffff",
    fontSize: 16,
  },
  inputFocused: {
    borderColor: "#3b82f6",
  },
  inputError: {
    borderColor: "#f87171",
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 13,
    marginTop: 8,
    fontWeight: "500",
  },
  hint: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 8,
    fontStyle: "italic",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    backgroundColor: "#f1f5f9",
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  backButtonText: {
    color: "#475569",
    fontWeight: "700",
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: BrandColors.primary,
    shadowColor: BrandColors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
  nextButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
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

  const [currentStep, setCurrentStep] = useState(0);
  const [age, setAge] = useState(storedAge ? storedAge.toString() : "");
  const [currentWeight, setCurrentWeight] = useState(
    storedCurrentWeight ? storedCurrentWeight.toString() : "",
  );
  const [targetWeight, setTargetWeight] = useState(
    storedTargetWeight ? storedTargetWeight.toString() : "",
  );
  const [cuisine, setCuisine] = useState(storedCuisine || CUISINE_OPTIONS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(false);
  const [errors, setErrors] = useState<{
    age?: string;
    currentWeight?: string;
    targetWeight?: string;
  }>({});

  const fadeAnim = useState(new Animated.Value(1))[0];

  const totalSteps = 4;

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

  // Animate step transition
  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep]);

  const validateCurrentStep = (): boolean => {
    const newErrors: {
      age?: string;
      currentWeight?: string;
      targetWeight?: string;
    } = {};

    switch (currentStep) {
      case 0: // Age
        if (!age.trim()) {
          newErrors.age = "Please enter your age";
        } else {
          const ageNum = parseFloat(age);
          if (isNaN(ageNum) || ageNum <= 0) {
            newErrors.age = "Please enter a valid age";
          } else if (ageNum < 13 || ageNum > 120) {
            newErrors.age = "Age must be between 13 and 120";
          }
        }
        break;
      case 1: // Current Weight
        if (!currentWeight.trim()) {
          newErrors.currentWeight = "Please enter your current weight";
        } else {
          const weightNum = parseFloat(currentWeight);
          if (isNaN(weightNum) || weightNum <= 0) {
            newErrors.currentWeight = "Please enter a valid weight";
          } else if (weightNum < 20 || weightNum > 300) {
            newErrors.currentWeight = "Weight must be between 20 and 300 kg";
          }
        }
        break;
      case 2: // Target Weight
        if (!targetWeight.trim()) {
          newErrors.targetWeight = "Please enter your target weight";
        } else {
          const weightNum = parseFloat(targetWeight);
          if (isNaN(weightNum) || weightNum <= 0) {
            newErrors.targetWeight = "Please enter a valid weight";
          } else if (weightNum < 20 || weightNum > 300) {
            newErrors.targetWeight = "Weight must be between 20 and 300 kg";
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      setErrors({});
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
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
      setErrors({ age: "Failed to submit. Please try again." });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => {
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentStep + 1) / totalSteps) * 100}%` },
            ]}
          />
        </View>
        <View style={styles.stepIndicator}>
          {[0, 1, 2, 3].map((step, index) => (
            <React.Fragment key={step}>
              <View
                style={[
                  styles.stepDot,
                  currentStep === step && styles.stepDotActive,
                  currentStep > step && styles.stepDotCompleted,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    (currentStep === step || currentStep > step) &&
                      styles.stepNumberActive,
                  ]}
                >
                  {step + 1}
                </Text>
              </View>
              {index < 3 && (
                <View
                  style={[
                    styles.stepLine,
                    currentStep > step && styles.stepLineCompleted,
                  ]}
                />
              )}
            </React.Fragment>
          ))}
        </View>
      </View>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.header}>
              <Text style={styles.stepTitle}>Step 1 of 4</Text>
              <Text style={styles.title}>How old are you?</Text>
              <Text style={styles.subtitle}>
                This helps us personalize your meal plans
              </Text>
            </View>
            <View style={styles.questionContainer}>
              <Text style={styles.label}>Your Age</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField && styles.inputFocused,
                  errors.age && styles.inputError,
                ]}
                placeholder="e.g., 25"
                keyboardType="numeric"
                value={age}
                onChangeText={(text) => {
                  setAge(text);
                  setErrors({});
                }}
                onFocus={() => setFocusedField(true)}
                onBlur={() => setFocusedField(false)}
                editable={!isLoading}
                autoFocus
              />
              {errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
              {!errors.age && (
                <Text style={styles.hint}>Enter your age in years</Text>
              )}
            </View>
          </Animated.View>
        );

      case 1:
        return (
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.header}>
              <Text style={styles.stepTitle}>Step 2 of 4</Text>
              <Text style={styles.title}>What's your current weight?</Text>
              <Text style={styles.subtitle}>
                We'll use this to calculate your nutritional needs
              </Text>
            </View>
            <View style={styles.questionContainer}>
              <Text style={styles.label}>Current Weight (kg)</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField && styles.inputFocused,
                  errors.currentWeight && styles.inputError,
                ]}
                placeholder="e.g., 70"
                keyboardType="decimal-pad"
                value={currentWeight}
                onChangeText={(text) => {
                  setCurrentWeight(text);
                  setErrors({});
                }}
                onFocus={() => setFocusedField(true)}
                onBlur={() => setFocusedField(false)}
                editable={!isLoading}
                autoFocus
              />
              {errors.currentWeight && (
                <Text style={styles.errorText}>{errors.currentWeight}</Text>
              )}
              {!errors.currentWeight && (
                <Text style={styles.hint}>Enter your weight in kilograms</Text>
              )}
            </View>
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.header}>
              <Text style={styles.stepTitle}>Step 3 of 4</Text>
              <Text style={styles.title}>What's your target weight?</Text>
              <Text style={styles.subtitle}>
                We'll help you plan meals to reach your goal
              </Text>
            </View>
            <View style={styles.questionContainer}>
              <Text style={styles.label}>Target Weight (kg)</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField && styles.inputFocused,
                  errors.targetWeight && styles.inputError,
                ]}
                placeholder="e.g., 65"
                keyboardType="decimal-pad"
                value={targetWeight}
                onChangeText={(text) => {
                  setTargetWeight(text);
                  setErrors({});
                }}
                onFocus={() => setFocusedField(true)}
                onBlur={() => setFocusedField(false)}
                editable={!isLoading}
                autoFocus
              />
              {errors.targetWeight && (
                <Text style={styles.errorText}>{errors.targetWeight}</Text>
              )}
              {!errors.targetWeight && (
                <Text style={styles.hint}>
                  Enter your desired weight in kilograms
                </Text>
              )}
            </View>
          </Animated.View>
        );

      case 3:
        return (
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.header}>
              <Text style={styles.stepTitle}>Step 4 of 4</Text>
              <Text style={styles.title}>What's your favorite cuisine?</Text>
              <Text style={styles.subtitle}>
                We'll prioritize recipes from this cuisine
              </Text>
            </View>
            <View style={styles.questionContainer}>
              <Text style={styles.label}>Preferred Cuisine</Text>
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
              <Text style={styles.hint}>
                Don't worry, you can always change this later
              </Text>
            </View>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.card}>
            {renderStepIndicator()}
            {renderStep()}

            <View style={styles.buttonContainer}>
              {currentStep > 0 && (
                <TouchableOpacity
                  style={[styles.button, styles.backButton]}
                  onPress={handleBack}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.nextButton,
                  isLoading && styles.nextButtonDisabled,
                  currentStep === 0 && { flex: 1 },
                ]}
                onPress={handleNext}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.nextButtonText}>
                    {currentStep === totalSteps - 1 ? "Complete" : "Next"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
