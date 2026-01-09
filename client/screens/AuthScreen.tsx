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
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import appIcon from "../assets/images/icon.png";
import googleLogo from "../assets/images/google-logo.png";
import appleLogo from "../assets/images/apple-logo.png";

type AuthMode = "login" | "register" | "verify" | "profile";
type LoginTab = "phone" | "email";

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loginTab, setLoginTab] = useState<LoginTab>("phone");
  
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [fullName, setFullName] = useState("");
  
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

  const handleSendCode = async () => {
    const cleanedPhone = phone.replace(/\D/g, "");
    if (cleanedPhone.length !== 10) {
      Alert.alert("Hata", "Lütfen geçerli bir telefon numarası girin");
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMode("verify");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Hata", "Kod gönderilirken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      Alert.alert("Hata", "Lütfen 6 haneli doğrulama kodunu girin");
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (mode === "verify") {
        setMode("profile");
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Hata", "Kod doğrulanırken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert("Hata", "Lütfen adınızı ve soyadınızı girin");
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await login(`+90${phone.replace(/\D/g, "")}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Hata", "Kayıt tamamlanırken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (loginTab === "phone") {
      const cleanedPhone = phone.replace(/\D/g, "");
      if (cleanedPhone.length !== 10) {
        Alert.alert("Hata", "Lütfen geçerli bir telefon numarası girin");
        return;
      }
    } else {
      if (!email || !password) {
        Alert.alert("Hata", "Lütfen e-posta ve şifrenizi girin");
        return;
      }
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const identifier = loginTab === "phone" 
        ? `+90${phone.replace(/\D/g, "")}` 
        : email;
      await login(identifier);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Hata", "Giriş yapılırken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: "google" | "apple") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Bilgi", `${provider === "google" ? "Google" : "Apple"} ile giriş yakında eklenecek`);
  };

  const resetToLogin = () => {
    setMode("login");
    setPhone("");
    setVerificationCode("");
    setFullName("");
  };

  const resetToRegister = () => {
    setMode("register");
    setPhone("");
    setEmail("");
    setPassword("");
  };

  const isLoginValid = loginTab === "phone"
    ? phone.replace(/\D/g, "").length === 10
    : email.length > 0 && password.length > 0;

  const isRegisterValid = phone.replace(/\D/g, "").length === 10;

  if (mode === "verify") {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.logoContainer}>
              <Image source={appIcon} style={styles.logo} resizeMode="contain" />
            </View>

            <ThemedText style={styles.title}>Doğrulama Kodu</ThemedText>
            <ThemedText style={styles.subtitle}>
              +90 {phone} numarasına gönderilen 6 haneli kodu girin
            </ThemedText>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, styles.codeInput]}
                  value={verificationCode}
                  onChangeText={(text) => setVerificationCode(text.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  maxLength={6}
                  textAlign="center"
                />
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  verificationCode.length !== 6 && styles.submitButtonDisabled,
                  pressed && verificationCode.length === 6 && styles.submitButtonPressed,
                ]}
                onPress={handleVerifyCode}
                disabled={verificationCode.length !== 6 || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText style={styles.submitButtonText}>Doğrula</ThemedText>
                )}
              </Pressable>

              <Pressable style={styles.resendContainer}>
                <ThemedText style={styles.resendText}>Kod gelmedi mi? </ThemedText>
                <ThemedText style={styles.resendLink}>Tekrar Gönder</ThemedText>
              </Pressable>

              <Pressable style={styles.backContainer} onPress={resetToRegister}>
                <Feather name="arrow-left" size={16} color="#9CA3AF" />
                <ThemedText style={styles.backText}>Numarayı Değiştir</ThemedText>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  if (mode === "profile") {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.logoContainer}>
              <Image source={appIcon} style={styles.logo} resizeMode="contain" />
            </View>

            <ThemedText style={styles.title}>Profilinizi Tamamlayın</ThemedText>
            <ThemedText style={styles.subtitle}>
              Araç takaslarında güvenilir bir profil oluşturun
            </ThemedText>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Feather name="user" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Adınız Soyadınız"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Feather name="mail" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="E-posta (isteğe bağlı)"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <ThemedText style={styles.hintText}>
                E-posta eklerseniz şifre ile de giriş yapabilirsiniz
              </ThemedText>

              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  !fullName.trim() && styles.submitButtonDisabled,
                  pressed && fullName.trim() && styles.submitButtonPressed,
                ]}
                onPress={handleCompleteProfile}
                disabled={!fullName.trim() || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText style={styles.submitButtonText}>Tamamla</ThemedText>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  if (mode === "register") {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.logoContainer}>
              <Image source={appIcon} style={styles.logo} resizeMode="contain" />
            </View>

            <ThemedText style={styles.title}>Kayıt Ol</ThemedText>
            <ThemedText style={styles.subtitle}>
              Telefon numaranızla güvenli bir hesap oluşturun
            </ThemedText>

            <View style={styles.formContainer}>
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

              <ThemedText style={styles.hintText}>
                Size SMS ile doğrulama kodu göndereceğiz
              </ThemedText>

              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  !isRegisterValid && styles.submitButtonDisabled,
                  pressed && isRegisterValid && styles.submitButtonPressed,
                ]}
                onPress={handleSendCode}
                disabled={!isRegisterValid || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText style={styles.submitButtonText}>Kod Gönder</ThemedText>
                )}
              </Pressable>

              <View style={styles.socialContainer}>
                <Pressable style={styles.socialButton} onPress={() => handleSocialLogin("google")}>
                  <Image source={googleLogo} style={styles.socialLogo} resizeMode="contain" />
                </Pressable>
                <Pressable style={styles.socialButton} onPress={() => handleSocialLogin("apple")}>
                  <Image source={appleLogo} style={styles.socialLogo} resizeMode="contain" />
                </Pressable>
              </View>

              <ThemedText style={styles.orText}>veya</ThemedText>

              <Pressable style={styles.switchContainer} onPress={resetToLogin}>
                <ThemedText style={styles.switchText}>Zaten hesabınız var mı? Giriş Yapın</ThemedText>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
            <Image source={appIcon} style={styles.logo} resizeMode="contain" />
          </View>

          <View style={styles.tabContainer}>
            <Pressable
              style={[styles.tab, loginTab === "phone" && styles.tabActive]}
              onPress={() => setLoginTab("phone")}
            >
              <ThemedText style={[styles.tabText, loginTab === "phone" && styles.tabTextActive]}>
                Telefon
              </ThemedText>
            </Pressable>
            <Pressable
              style={[styles.tab, loginTab === "email" && styles.tabActive]}
              onPress={() => setLoginTab("email")}
            >
              <ThemedText style={[styles.tabText, loginTab === "email" && styles.tabTextActive]}>
                E-posta
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.formContainer}>
            {loginTab === "phone" ? (
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
            ) : (
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
            )}

            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                !isLoginValid && styles.submitButtonDisabled,
                pressed && isLoginValid && styles.submitButtonPressed,
              ]}
              onPress={handleLogin}
              disabled={!isLoginValid || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.submitButtonText}>Giriş Yap</ThemedText>
              )}
            </Pressable>

            <View style={styles.optionsRow}>
              <Pressable style={styles.rememberMeContainer} onPress={() => setRememberMe(!rememberMe)}>
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
              <Pressable style={styles.socialButton} onPress={() => handleSocialLogin("google")}>
                <Image source={googleLogo} style={styles.socialLogo} resizeMode="contain" />
              </Pressable>
              <Pressable style={styles.socialButton} onPress={() => handleSocialLogin("apple")}>
                <Image source={appleLogo} style={styles.socialLogo} resizeMode="contain" />
              </Pressable>
            </View>

            <ThemedText style={styles.orText}>veya</ThemedText>

            <Pressable style={styles.switchContainer} onPress={resetToRegister}>
              <ThemedText style={styles.switchText}>Hesabınız yok mu? Kayıt Olun</ThemedText>
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
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: Spacing.xl,
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
  codeInput: {
    fontSize: 24,
    letterSpacing: 8,
    fontWeight: "600",
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
  hintText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: Spacing.lg,
    marginTop: -Spacing.xs,
  },
  submitButton: {
    backgroundColor: "#000000",
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginTop: Spacing.sm,
    height: 48,
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#000000",
    opacity: 0.6,
  },
  submitButtonPressed: {
    backgroundColor: "#222222",
  },
  submitButtonText: {
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
    marginTop: Spacing.lg,
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
  switchContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  switchText: {
    fontSize: 14,
    color: "#000000",
    fontWeight: "500",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.xl,
  },
  resendText: {
    fontSize: 14,
    color: "#6B7280",
  },
  resendLink: {
    fontSize: 14,
    color: "#000000",
    fontWeight: "600",
  },
  backContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
    gap: Spacing.xs,
  },
  backText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
});
