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
    View
} from "react-native";
import { apiUrl } from "../services/config";
import { facebookLogin, initializeFacebook } from "../services/facebookAuth";

interface SignInScreenProps {
  handleSignIn: (user: {
    userId: string;
    email: string;
    fullName: string;
    token: string;
  }) => void;
  onNavigateToSignUp: () => void;
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
  signUpLink: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  signUpLinkText: {
    color: "#64748b",
    fontSize: 14,
  },
  signUpLinkButton: {
    marginLeft: 4,
  },
  signUpLinkButtonText: {
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

export default function SignInScreen({
  handleSignIn,
  onNavigateToSignUp,
}: SignInScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [focusedField, setFocusedField] = useState<string | null>(null);

  React.useEffect(() => {
    initializeFacebook();
  }, []);

  const validateInputs = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSignIn = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);
    setAuthError("");
    try {
      const response = await fetch(apiUrl("/auth/signin"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        setAuthError(error.error || "Invalid email or password. Please try again.");
        return;
      }

      const data = await response.json();
      handleSignIn(data.data);
    } catch (error) {
      setAuthError("Network error. Please check your connection and try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setIsLoading(true);
    setAuthError("");
    try {
      const user = await facebookLogin();
      if (user) {
        handleSignIn(user);
      }
    } catch (error) {
      setAuthError("Failed to sign in with Facebook. Please try again.");
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
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Sign in to your Portionist account
              </Text>
            </View>

            {authError ? (
              <View style={styles.alertError}>
                <Text style={styles.alertErrorText}>{authError}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.facebookButton}
              onPress={handleFacebookSignIn}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.facebookButtonText}>
                  Sign In with Facebook
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
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

            <TouchableOpacity
              style={[
                styles.submitButton,
                isLoading && styles.submitButtonDisabled,
              ]}
              onPress={handleEmailSignIn}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.signUpLink}>
              <Text style={styles.signUpLinkText}>Don't have an account?</Text>
              <TouchableOpacity
                style={styles.signUpLinkButton}
                onPress={onNavigateToSignUp}
                disabled={isLoading}
              >
                <Text style={styles.signUpLinkButtonText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
