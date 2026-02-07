import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import * as AppleAuthentication from "expo-apple-authentication";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";

WebBrowser.maybeCompleteAuthSession();
const appIcon = require("../assets/images/icon.png");
const googleLogo = require("../assets/images/google-logo.png");
const appleLogo = require("../assets/images/apple-logo.png");

type AuthTab = "email" | "phone";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, loginWithApple, loginWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState<AuthTab>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    if (cleaned.length <= 8) return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
  };

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length <= 10) {
      setPhone(formatPhone(cleaned));
    }
  };

  const handleLogin = async () => {
    if (activeTab === "email") {
      if (!email || !password) {
        Alert.alert("Hata", "Lütfen e-posta ve şifrenizi girin");
        return;
      }
    } else {
      const cleanedPhone = phone.replace(/\D/g, "");
      if (cleanedPhone.length !== 10) {
        Alert.alert("Hata", "Lütfen geçerli bir telefon numarası girin");
        return;
      }
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const identifier = activeTab === "email" ? email : `+90${phone.replace(/\D/g, "")}`;
      await login(identifier);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Hata", "Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);
    
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
      const fullName = credential.fullName 
        ? `${credential.fullName.givenName || ""} ${credential.fullName.familyName || ""}`.trim()
        : undefined;
      
      await loginWithApple(credential.user, credential.email || undefined, fullName || undefined, credential.identityToken || undefined);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      if (error.code === "ERR_REQUEST_CANCELED") {
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Hata", "Apple ile giriş yapılırken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (Platform.OS === "web") {
      Alert.alert("Bilgi", "Google ile giriş mobil uygulamada kullanılabilir. Lütfen Expo Go ile deneyin.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: "takasapp",
        path: "auth",
      });
      
      const discovery = {
        authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenEndpoint: "https://oauth2.googleapis.com/token",
      };
      
      const request = new AuthSession.AuthRequest({
        clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "",
        scopes: ["openid", "profile", "email"],
        redirectUri,
        responseType: AuthSession.ResponseType.Token,
      });
      
      const result = await request.promptAsync(discovery);
      
      if (result.type === "success" && result.authentication?.accessToken) {
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${result.authentication.accessToken}` },
          }
        );
        const userInfo = await userInfoResponse.json();
        
        await loginWithGoogle(userInfo.sub, userInfo.email, userInfo.name, userInfo.picture, result.authentication.accessToken);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Google login error:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Hata", "Google ile giriş yapılırken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = activeTab === "email" 
    ? email.length > 0 && password.length > 0 
    : phone.replace(/\D/g, "").length === 10;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image
              source={appIcon}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.tabContainer}>
            <Pressable
              style={[styles.tab, activeTab === "email" && styles.tabActive]}
              onPress={() => setActiveTab("email")}
            >
              <ThemedText style={[styles.tabText, activeTab === "email" && styles.tabTextActive]}>
                E-posta
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === "phone" && styles.tabActive]}
              onPress={() => setActiveTab("phone")}
            >
              <ThemedText style={[styles.tabText, activeTab === "phone" && styles.tabTextActive]}>
                Telefon
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.formContainer}>
            {activeTab === "email" ? (
              <>
                <View style={styles.inputContainer}>
                  <Feather name="mail" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="E-posta adresinizi yazınız"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <Feather name="lock" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Şifrenizi giriniz"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#9CA3AF" />
                  </Pressable>
                </View>
              </>
            ) : (
              <View style={styles.inputContainer}>
                <View style={styles.countryCode}>
                  <ThemedText style={styles.countryCodeText}>+90</ThemedText>
                </View>
                <TextInput
                  style={[styles.input, styles.phoneInput]}
                  value={phone}
                  onChangeText={handlePhoneChange}
                  placeholder="5XX XXX XX XX"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  maxLength={13}
                />
              </View>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.loginButton,
                !isValid && styles.loginButtonDisabled,
                pressed && isValid && styles.loginButtonPressed,
              ]}
              onPress={handleLogin}
              disabled={!isValid || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.loginButtonText}>Giriş Yap</ThemedText>
              )}
            </Pressable>

            <View style={styles.optionsRow}>
              <Pressable 
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe ? <Feather name="check" size={14} color="#FFFFFF" /> : null}
                </View>
                <ThemedText style={styles.rememberMeText}>Beni hatırla</ThemedText>
              </Pressable>
              <Pressable>
                <ThemedText style={styles.forgotPasswordText}>Şifremi unuttum</ThemedText>
              </Pressable>
            </View>

            <View style={styles.socialContainer}>
              <Pressable 
                style={styles.socialButton}
                onPress={handleGoogleLogin}
              >
                <Image source={googleLogo} style={styles.socialLogo} resizeMode="contain" />
              </Pressable>
              <Pressable 
                style={styles.socialButton}
                onPress={handleAppleLogin}
              >
                <Image source={appleLogo} style={styles.socialLogo} resizeMode="contain" />
              </Pressable>
            </View>

            <ThemedText style={styles.orText}>veya</ThemedText>

            <Pressable style={styles.registerContainer}>
              <ThemedText style={styles.registerText}>Hemen Kayıt Ol</ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 80,
    height: 80,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: Spacing.xl,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: "#E5E7EB",
  },
  tabActive: {
    borderBottomColor: "#000000",
  },
  tabText: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
  },
  tabTextActive: {
    color: "#000000",
    fontWeight: "600",
  },
  formContainer: {},
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    height: 56,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
  },
  eyeIcon: {
    padding: Spacing.xs,
  },
  countryCode: {
    paddingRight: Spacing.sm,
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    marginRight: Spacing.sm,
  },
  countryCodeText: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
  },
  phoneInput: {
    flex: 1,
  },
  loginButton: {
    backgroundColor: "#000000",
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginTop: Spacing.sm,
    height: 48,
    justifyContent: "center",
  },
  loginButtonDisabled: {
    backgroundColor: "#000000",
    opacity: 0.6,
  },
  loginButtonPressed: {
    backgroundColor: "#222222",
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    marginRight: Spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#000000",
    borderColor: "#000000",
  },
  rememberMeText: {
    fontSize: 14,
    color: "#374151",
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.md,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  socialLogo: {
    width: 28,
    height: 28,
  },
  orText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginVertical: Spacing.lg,
  },
  registerContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  registerText: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
  },
});
