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
    color: BrandColors.gray500,
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
  signUpLink: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  signUpLinkText: {
    color: BrandColors.textSecondary,
    fontSize: 14,
  },
  signUpLinkButton: {
    marginLeft: 4,
  },
  signUpLinkButtonText: {
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
        setAuthError(
          error.error || "Invalid email or password. Please try again.",
        );
        return;
      }

      const data = await response.json();
      handleSignIn(data.data);
    } catch (error) {
      setAuthError(
        "Network error. Please check your connection and try again.",
      );
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setAuthError("");
    try {
      const user = await googleLogin();
      if (user) {
        handleSignIn(user);
      }
    } catch (error) {
      setAuthError("Failed to sign in with Google. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Hidden Facebook sign-in (kept for future use)
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
    <LinearGradient
      colors={[
        BrandColors.white,
        BrandColors.secondaryBackground,
        BrandColors.primaryBackground,
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
                <Text style={styles.title}>Welcome</Text>
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
                style={styles.googleButton}
                onPress={handleGoogleSignIn}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color={BrandColors.primary} />
                ) : (
                  <>
                    <Image
                      source={require("../../assets/images/gmail-logo.png")}
                      style={{ width: 24, height: 16 }}
                    />
                    <Text style={styles.googleButtonText}>Gmail</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Facebook Sign-In - Hidden for now */}
              {false && (
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
              )}

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
                <Text style={styles.signUpLinkText}>
                  Don't have an account?
                </Text>
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
    </LinearGradient>
  );
}
