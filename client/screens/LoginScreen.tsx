import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/contexts/AuthContext";
import { BrandColors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import appIcon from "../assets/images/icon.png";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    const cleanedPhone = phone.replace(/\D/g, "");
    if (cleanedPhone.length !== 10) {
      Alert.alert("Hata", "Lütfen geçerli bir telefon numarası girin");
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await login(`+90${cleanedPhone}`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Hata", "Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = phone.replace(/\D/g, "").length === 10;

  return (
    <LinearGradient
      colors={[BrandColors.primaryOrange, BrandColors.deepNavy]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={[styles.content, { paddingTop: insets.top + Spacing.xl }]}>
        <View style={styles.logoContainer}>
          <Image
            source={appIcon}
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText style={styles.title}>TakasApp</ThemedText>
          <ThemedText style={styles.subtitle}>
            Araç takasında yeni dönem
          </ThemedText>
        </View>

        <View style={styles.formContainer}>
          <ThemedText style={styles.label}>Telefon Numarası</ThemedText>
          <View style={styles.phoneInputContainer}>
            <View style={styles.countryCode}>
              <ThemedText style={styles.countryCodeText}>+90</ThemedText>
            </View>
            <TextInput
              style={styles.phoneInput}
              value={phone}
              onChangeText={handlePhoneChange}
              placeholder="5XX XXX XX XX"
              placeholderTextColor="rgba(255,255,255,0.5)"
              keyboardType="phone-pad"
              maxLength={13}
              autoFocus
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              !isValid && styles.buttonDisabled,
              pressed && isValid && styles.buttonPressed,
            ]}
            onPress={handleLogin}
            disabled={!isValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.buttonText}>Giriş Yap</ThemedText>
            )}
          </Pressable>

          <ThemedText style={styles.disclaimer}>
            Devam ederek kullanım koşullarını ve gizlilik politikasını kabul etmiş olursunuz.
          </ThemedText>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: "space-between",
    paddingBottom: Spacing.xl,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: Spacing["3xl"],
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: "#FFFFFF",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: "rgba(255,255,255,0.8)",
  },
  formContainer: {
    marginBottom: Spacing["3xl"],
  },
  label: {
    ...Typography.small,
    color: "#FFFFFF",
    marginBottom: Spacing.sm,
  },
  phoneInputContainer: {
    flexDirection: "row",
    marginBottom: Spacing.lg,
  },
  countryCode: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: Spacing.md,
    justifyContent: "center",
    borderTopLeftRadius: BorderRadius.sm,
    borderBottomLeftRadius: BorderRadius.sm,
  },
  countryCodeText: {
    ...Typography.body,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  phoneInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopRightRadius: BorderRadius.sm,
    borderBottomRightRadius: BorderRadius.sm,
    color: "#FFFFFF",
    fontSize: 18,
    letterSpacing: 1,
  },
  button: {
    backgroundColor: "#FFFFFF",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  buttonText: {
    ...Typography.button,
    color: BrandColors.deepNavy,
  },
  disclaimer: {
    ...Typography.caption,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
  },
});
