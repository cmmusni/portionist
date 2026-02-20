import { BrandColors } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
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
import { facebookLogin } from "../services/facebookAuth";
import { googleLogin, initializeGoogle } from "../services/googleAuth";

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
  },
  gradient: {
    flex: 1,
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
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 24,
    borderRadius: 20,
  },
  card: {
    backgroundColor: BrandColors.white,
    borderRadius: 20,
    padding: 32,
    shadowColor: BrandColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: BrandColors.gray100,
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 8,
    color: BrandColors.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: BrandColors.textSecondary,
    fontSize: 15,
    textAlign: "center",
    marginTop: 4,
  },
  alertError: {
    backgroundColor: BrandColors.dangerVeryLight,
    borderLeftWidth: 4,
    borderLeftColor: BrandColors.danger,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  alertErrorText: {
    color: BrandColors.dangerDark,
    fontSize: 14,
    fontWeight: "500",
  },
  googleButton: {
    backgroundColor: BrandColors.white,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: BrandColors.gray300,
    shadowColor: BrandColors.gray400,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  googleButtonText: {
    color: BrandColors.dangerLight,
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 12,
  },
  googleIcon: {
    fontSize: 20,
  },
  // Hidden Facebook button (kept for future use)
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
    backgroundColor: BrandColors.gray200,
  },
  dividerText: {
    marginHorizontal: 16,
    color: BrandColors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    color: BrandColors.textPrimary,
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    borderWidth: 2,
    borderColor: BrandColors.gray200,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: BrandColors.textPrimary,
    backgroundColor: BrandColors.white,
    fontSize: 15,
  },
  inputFocused: {
    borderColor: BrandColors.primary,
    backgroundColor: BrandColors.primaryBackground,
  },
  inputError: {
    borderColor: BrandColors.danger,
  },
  submitButton: {
    backgroundColor: BrandColors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: BrandColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: BrandColors.gray400,
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
    color: BrandColors.textSecondary,
    fontSize: 14,
  },
  signInLinkButton: {
    marginLeft: 4,
  },
  signInLinkButtonText: {
    color: BrandColors.primary,
    fontWeight: "700",
    fontSize: 14,
  },
  errorText: {
    color: BrandColors.danger,
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
    initializeGoogle();
    // initializeFacebook(); // Hidden for now
  }, []);

  // Set document title for web
  useEffect(() => {
    if (Platform.OS === "web") {
      document.title = "Portionist";
    }
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

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setAuthError("");
    try {
      const user = await googleLogin();
      if (user) {
        handleSignUp(user);
      }
    } catch (error) {
      setAuthError("Failed to sign up with Google. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Hidden Facebook sign-up (kept for future use)
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
    <LinearGradient
      colors={[
        BrandColors.primaryBackground,
        BrandColors.secondaryBackground,
        BrandColors.white,
      ]}
      style={styles.container}
    >
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
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
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
                style={styles.googleButton}
                onPress={handleGoogleSignUp}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color={BrandColors.primary} />
                ) : (
                  <>
                    <Text style={styles.googleIcon}>✉️</Text>
                    <Text style={styles.googleButtonText}>
                      Sign Up with Gmail
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Facebook Sign-Up - Hidden for now */}
              {false && (
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
              )}

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
    </LinearGradient>
  );
}
