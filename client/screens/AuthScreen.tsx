import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView,
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
import { TakasLogo } from "@/components/TakasLogo";
import googleLogo from "../assets/images/google-logo.png";
import appleLogo from "../assets/images/apple-logo.png";

WebBrowser.maybeCompleteAuthSession();

type AuthMode = "login" | "register" | "verify" | "profile" | "forgotPassword";
type LoginTab = "phone" | "email";
type ForgotTab = "email" | "phone";

const CODE_LENGTH = 6;
const RESEND_TIMER = 60;

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { login, loginWithApple, loginWithGoogle, sendCode, verifyAndLogin } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loginTab, setLoginTab] = useState<LoginTab>("phone");
  const [forgotTab, setForgotTab] = useState<ForgotTab>("email");
  
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [fullName, setFullName] = useState("");
  
  const [verifiedUser, setVerifiedUser] = useState<any>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(RESEND_TIMER);
  const [codeDigits, setCodeDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mode === "verify" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, timer]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCodeDigitChange = (text: string, index: number) => {
    const digit = text.replace(/\D/g, "").slice(-1);
    const newDigits = [...codeDigits];
    newDigits[index] = digit;
    setCodeDigits(newDigits);
    setVerificationCode(newDigits.join(""));

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

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
      Alert.alert("Hata", "Lutfen gecerli bir telefon numarasi girin");
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await sendCode(`+90${cleanedPhone}`);
      setMode("verify");
      setTimer(RESEND_TIMER);
      setCodeDigits(Array(CODE_LENGTH).fill(""));
      setVerificationCode("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Hata", error.message || "Kod gonderilirken bir hata olustu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (timer > 0) return;
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const cleanedPhone = phone.replace(/\D/g, "");
      await sendCode(`+90${cleanedPhone}`);
      setTimer(RESEND_TIMER);
      setCodeDigits(Array(CODE_LENGTH).fill(""));
      setVerificationCode("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Hata", error.message || "Kod gonderilirken bir hata olustu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      Alert.alert("Hata", "Lutfen 6 haneli dogrulama kodunu girin");
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const cleanedPhone = phone.replace(/\D/g, "");
      const phoneWithCode = `+90${cleanedPhone}`;
      
      const { getApiUrl } = await import("@/lib/query-client");
      const response = await fetch(new URL("/api/auth/verify-code", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneWithCode, code: verificationCode }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Dogrulama hatasi");
      }

      const { user: returnedUser, isNewUser } = await response.json();
      setVerifiedUser(returnedUser);

      if (isNewUser) {
        setMode("profile");
      } else {
        await login(phoneWithCode);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Hata", error.message || "Kod dogrulanirken bir hata olustu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert("Hata", "Lutfen adinizi ve soyadinizi girin");
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const cleanedPhone = phone.replace(/\D/g, "");
      if (verifiedUser) {
        const { getApiUrl } = await import("@/lib/query-client");
        await fetch(new URL(`/api/users/${verifiedUser.id}`, getApiUrl()).toString(), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: fullName.trim() }),
        });
      }
      await login(`+90${cleanedPhone}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Hata", error.message || "Kayit tamamlanirken bir hata olustu");
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

      setIsLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      try {
        await sendCode(`+90${cleanedPhone}`);
        setMode("verify");
        setTimer(RESEND_TIMER);
        setCodeDigits(Array(CODE_LENGTH).fill(""));
        setVerificationCode("");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error: any) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Hata", error.message || "Kod gönderilirken bir hata oluştu");
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!email || !password) {
        Alert.alert("Hata", "Lütfen e-posta ve şifrenizi girin");
        return;
      }

      setIsLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      try {
        await login(email);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Hata", "Giriş yapılırken bir hata oluştu");
      } finally {
        setIsLoading(false);
      }
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
      
      const fullNameStr = credential.fullName 
        ? `${credential.fullName.givenName || ""} ${credential.fullName.familyName || ""}`.trim()
        : undefined;
      
      await loginWithApple(credential.user, credential.email || undefined, fullNameStr || undefined, credential.identityToken || undefined);
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
      
      const googleClientId = Platform.select({
        ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "",
        android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "",
        default: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "",
      });

      const request = new AuthSession.AuthRequest({
        clientId: googleClientId,
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

  const handleForgotPassword = async () => {
    if (forgotTab === "email") {
      if (!email) {
        Alert.alert("Hata", "Lütfen e-posta adresinizi girin");
        return;
      }
      Alert.alert("Bilgi", "E-posta ile şifre sıfırlama yakında aktif olacaktır. Lütfen telefon numaranızı kullanın.");
      return;
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
      const cleanedPhone = phone.replace(/\D/g, "");
      await sendCode(`+90${cleanedPhone}`);
      setMode("verify");
      setTimer(RESEND_TIMER);
      setCodeDigits(Array(CODE_LENGTH).fill(""));
      setVerificationCode("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Hata", error.message || "Kod gönderilirken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const isForgotValid = forgotTab === "email" 
    ? email.length > 0 
    : phone.replace(/\D/g, "").length === 10;

  const isLoginValid = loginTab === "phone"
    ? phone.replace(/\D/g, "").length === 10
    : email.length > 0 && password.length > 0;

  const isRegisterValid = phone.replace(/\D/g, "").length === 10;

  if (mode === "verify") {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.keyboardView}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.logoContainer}>
              <TakasLogo size={80} color="#000000" />
            </View>

            <ThemedText style={styles.title}>Doğrulama Kodunu Giriniz</ThemedText>
            <ThemedText style={styles.subtitle}>
              +90 {phone} numarasına gönderilen 6 haneli doğrulama kodunu giriniz.
            </ThemedText>

            <View style={styles.formContainer}>
              <View style={styles.timerRow}>
                <Feather name="clock" size={18} color="#6B7280" />
                <ThemedText style={styles.timerText}>{formatTimer(timer)}</ThemedText>
              </View>

              <View style={styles.codeBoxContainer}>
                {Array(CODE_LENGTH).fill(0).map((_, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => { inputRefs.current[index] = ref; }}
                    style={styles.codeBox}
                    value={codeDigits[index]}
                    onChangeText={(text) => handleCodeDigitChange(text, index)}
                    onKeyPress={({ nativeEvent }) => handleCodeKeyPress(nativeEvent.key, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                  />
                ))}
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
                  <ThemedText style={styles.submitButtonText}>Kodu Onayla</ThemedText>
                )}
              </Pressable>

              <Pressable 
                style={[styles.resendButton, timer > 0 && styles.resendButtonDisabled]} 
                onPress={handleResendCode}
                disabled={timer > 0}
              >
                <ThemedText style={[styles.resendButtonText, timer > 0 && styles.resendButtonTextDisabled]}>
                  Yeni Kod Gönder
                </ThemedText>
              </Pressable>

              <ThemedText style={styles.orText}>veya</ThemedText>

              <Pressable style={styles.switchContainer} onPress={resetToLogin}>
                <ThemedText style={styles.switchText}>Giriş Yapın</ThemedText>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }

  if (mode === "profile") {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.keyboardView}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.logoContainer}>
              <TakasLogo size={80} color="#000000" />
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
        </View>
      </View>
    );
  }

  if (mode === "forgotPassword") {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.keyboardView}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.logoContainer}>
              <TakasLogo size={80} color="#000000" />
            </View>

            <ThemedText style={styles.title}>Şifremi Unuttum</ThemedText>
            <ThemedText style={styles.subtitle}>
              Lütfen sistemde kayıtlı olan e-postanızı yada telefonunuzu giriniz ardından size gönderilecek olan doğrulama kodunu giriniz.
            </ThemedText>

            <View style={styles.formContainer}>
              <View style={styles.tabContainer}>
                <Pressable
                  style={[styles.tab, forgotTab === "email" && styles.tabActive]}
                  onPress={() => setForgotTab("email")}
                >
                  <ThemedText style={[styles.tabText, forgotTab === "email" && styles.tabTextActive]}>
                    E-posta
                  </ThemedText>
                </Pressable>
                <Pressable
                  style={[styles.tab, forgotTab === "phone" && styles.tabActive]}
                  onPress={() => setForgotTab("phone")}
                >
                  <ThemedText style={[styles.tabText, forgotTab === "phone" && styles.tabTextActive]}>
                    Telefon
                  </ThemedText>
                </Pressable>
              </View>

              {forgotTab === "email" ? (
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
                    />
                  </View>
                  <ThemedText style={styles.hintText}>
                    Lütfen aktif kullandığınız mailinizi giriniz. Doğrulama kodu gelecektir.
                  </ThemedText>
                </>
              ) : (
                <>
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
                    Lütfen aktif kullandığınız numaranızı giriniz. Doğrulama kodu gelecektir.
                  </ThemedText>
                </>
              )}

              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  !isForgotValid && styles.submitButtonDisabled,
                  pressed && isForgotValid && styles.submitButtonPressed,
                ]}
                onPress={handleForgotPassword}
                disabled={!isForgotValid || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText style={styles.submitButtonText}>Doğrulama Kodu Gönder</ThemedText>
                )}
              </Pressable>

              <Pressable style={styles.backLinkContainer} onPress={resetToLogin}>
                <ThemedText style={styles.backLinkText}>Geri Dön</ThemedText>
              </Pressable>

              <ThemedText style={styles.orText}>veya</ThemedText>

              <Pressable style={styles.switchContainer} onPress={resetToLogin}>
                <ThemedText style={styles.switchText}>Giriş Yapın</ThemedText>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }


  if (mode === "register") {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.keyboardView}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.logoContainer}>
              <TakasLogo size={80} color="#000000" />
            </View>

            <View style={styles.tabContainer}>
              <View style={[styles.tab, styles.tabActive]}>
                <ThemedText style={[styles.tabText, styles.tabTextActive]}>
                  Kayıt Ol
                </ThemedText>
              </View>
            </View>

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

              <View style={styles.optionsRow}>
                <View />
                <View />
              </View>

              <View style={styles.socialContainer}>
                <Pressable style={styles.socialButton} onPress={() => handleGoogleLogin()}>
                  <Image source={googleLogo} style={styles.socialLogo} resizeMode="contain" />
                </Pressable>
                <Pressable style={styles.socialButton} onPress={() => handleAppleLogin()}>
                  <Image source={appleLogo} style={styles.socialLogo} resizeMode="contain" />
                </Pressable>
              </View>

              <ThemedText style={styles.orText}>veya</ThemedText>

              <Pressable style={styles.switchContainer} onPress={resetToLogin}>
                <ThemedText style={styles.switchText}>Zaten hesabınız var mı? Giriş Yapın</ThemedText>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
            <TakasLogo size={80} color="#000000" />
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
              <Pressable onPress={() => setMode("forgotPassword")}>
                <ThemedText style={styles.forgotPasswordText}>Şifremi unuttum</ThemedText>
              </Pressable>
            </View>

            <View style={styles.socialContainer}>
              <Pressable style={styles.socialButton} onPress={() => handleGoogleLogin()}>
                <Image source={googleLogo} style={styles.socialLogo} resizeMode="contain" />
              </Pressable>
              <Pressable style={styles.socialButton} onPress={() => handleAppleLogin()}>
                <Image source={appleLogo} style={styles.socialLogo} resizeMode="contain" />
              </Pressable>
            </View>

            <ThemedText style={styles.orText}>veya</ThemedText>

            <Pressable style={styles.switchContainer} onPress={resetToRegister}>
              <ThemedText style={styles.switchText}>Hesabınız yok mu? Kayıt Olun</ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </View>
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
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 60,
    paddingBottom: 30,
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
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  timerText: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
  },
  codeBoxContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  codeBox: {
    width: 48,
    height: 56,
    backgroundColor: "#F9FAFB",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    color: "#000000",
  },
  resendButton: {
    alignItems: "center",
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
  },
  resendButtonTextDisabled: {
    color: "#9CA3AF",
  },
  backLinkContainer: {
    alignItems: "center",
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  backLinkText: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "500",
  },
});
