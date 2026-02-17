import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { apiUrl } from "../services/config";
import { facebookLogin, initializeFacebook } from "../services/facebookAuth";

interface SignUpScreenProps {
  handleSignUp: (user: {
    userId: string;
    email: string;
    fullName: string;
    token: string;
  }) => void;
  onNavigateToSignIn: () => void;
}

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
    maxWidth: 440,
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
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 8,
    color: "#0c4a6e",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#64748b",
    fontSize: 15,
    textAlign: "center",
    marginTop: 4,
  },
  alertError: {
    backgroundColor: "#fef2f2",
    borderLeftWidth: 4,
    borderLeftColor: "#dc2626",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  alertErrorText: {
    color: "#991b1b",
    fontSize: 14,
    fontWeight: "500",
  },
  facebookButton: {
    backgroundColor: "#1877f2",
    borderRadius: 10,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#1877f2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  facebookButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    color: "#334155",
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#1e293b",
    backgroundColor: "#ffffff",
    fontSize: 15,
    transition: "border-color 0.2s",
  },
  inputFocused: {
    borderColor: "#3b82f6",
  },
  inputError: {
    borderColor: "#f87171",
  },
  submitButton: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    paddingVertical: 16,
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
  submitButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  signInLink: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  signInLinkText: {
    color: "#64748b",
    fontSize: 14,
  },
  signInLinkButton: {
    marginLeft: 4,
  },
  signInLinkButtonText: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 14,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 13,
    marginTop: 6,
    fontWeight: "500",
  },
});

export default function SignUpScreen({
  handleSignUp,
  onNavigateToSignIn,
}: SignUpScreenProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  React.useEffect(() => {
    initializeFacebook();
  }, []);

  const validateInputs = (): boolean => {
    const newErrors: {
      fullName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSignUp = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);
    setAuthError("");
    try {
      const response = await fetch(apiUrl("/auth/signup"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, fullName }),
      });

      if (!response.ok) {
        const error = await response.json();
        setAuthError(
          error.error || "Failed to create account. Please try again.",
        );
        return;
      }

      const data = await response.json();
      handleSignUp(data.data);
    } catch (error) {
      setAuthError(
        "Network error. Please check your connection and try again.",
      );
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookSignUp = async () => {
    setIsLoading(true);
    setAuthError("");
    try {
      const user = await facebookLogin();
      if (user) {
        handleSignUp(user);
      }
    } catch (error) {
      setAuthError("Failed to sign up with Facebook. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
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
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Join Portionist to start meal planning
              </Text>
            </View>

            {authError ? (
              <View style={styles.alertError}>
                <Text style={styles.alertErrorText}>{authError}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.facebookButton}
              onPress={handleFacebookSignUp}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.facebookButtonText}>
                  Sign Up with Facebook
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === "fullName" && styles.inputFocused,
                  errors.fullName && styles.inputError,
                ]}
                placeholder="John Doe"
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  setAuthError("");
                }}
                onFocus={() => setFocusedField("fullName")}
                onBlur={() => setFocusedField(null)}
                placeholderTextColor="#94a3b8"
                editable={!isLoading}
              />
              {errors.fullName && (
                <Text style={styles.errorText}>{errors.fullName}</Text>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === "email" && styles.inputFocused,
                  errors.email && styles.inputError,
                ]}
                placeholder="you@example.com"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setAuthError("");
                }}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#94a3b8"
                editable={!isLoading}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === "password" && styles.inputFocused,
                  errors.password && styles.inputError,
                ]}
                placeholder="••••••••"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setAuthError("");
                }}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                secureTextEntry
                placeholderTextColor="#94a3b8"
                editable={!isLoading}
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === "confirmPassword" && styles.inputFocused,
                  errors.confirmPassword && styles.inputError,
                ]}
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setAuthError("");
                }}
                onFocus={() => setFocusedField("confirmPassword")}
                onBlur={() => setFocusedField(null)}
                secureTextEntry
                placeholderTextColor="#94a3b8"
                editable={!isLoading}
              />
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                isLoading && styles.submitButtonDisabled,
              ]}
              onPress={handleEmailSignUp}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <View style={styles.signInLink}>
              <Text style={styles.signInLinkText}>
                Already have an account?
              </Text>
              <TouchableOpacity
                style={styles.signInLinkButton}
                onPress={onNavigateToSignIn}
                disabled={isLoading}
              >
                <Text style={styles.signInLinkButtonText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
