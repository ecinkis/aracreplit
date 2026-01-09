import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function QuickCreateListingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [km, setKm] = useState("");

  const handleSubmit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Feather name="zap" size={32} color="#000000" />
          </View>
          <ThemedText style={styles.title}>Hizli Ilan Olustur</ThemedText>
          <ThemedText style={styles.subtitle}>
            Sadece temel bilgileri girin, hizlica ilan olusturun
          </ThemedText>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Marka</ThemedText>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={brand}
                onChangeText={setBrand}
                placeholder="Orn: BMW, Mercedes, Audi"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Model</ThemedText>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={model}
                onChangeText={setModel}
                placeholder="Orn: 320i, C180, A4"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <ThemedText style={styles.label}>Yil</ThemedText>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={year}
                  onChangeText={setYear}
                  placeholder="2024"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <ThemedText style={styles.label}>Kilometre</ThemedText>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={km}
                  onChangeText={setKm}
                  placeholder="50.000"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </View>

          <View style={styles.photoSection}>
            <ThemedText style={styles.label}>Fotograf Ekle</ThemedText>
            <Pressable style={styles.photoButton}>
              <Feather name="camera" size={24} color="#000000" />
              <ThemedText style={styles.photoButtonText}>
                Fotograf Sec veya Cek
              </ThemedText>
            </Pressable>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            pressed && styles.submitButtonPressed,
          ]}
          onPress={handleSubmit}
        >
          <ThemedText style={styles.submitButtonText}>Ilani Olustur</ThemedText>
          <Feather name="arrow-right" size={20} color="#FFFFFF" />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000000",
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  form: {
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  input: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 16,
    color: "#000000",
  },
  row: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  photoSection: {
    marginTop: Spacing.sm,
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: "#F9FAFB",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    paddingVertical: Spacing.xl,
  },
  photoButtonText: {
    fontSize: 15,
    color: "#000000",
    fontWeight: "500",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: "#000000",
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
  },
  submitButtonPressed: {
    opacity: 0.8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
