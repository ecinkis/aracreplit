import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, Typography, BrandColors } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";

const CITIES = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep", "Şanlıurfa", "Kocaeli", "Mersin", "Diyarbakır", "Hatay", "Manisa", "Kayseri"];

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [city, setCity] = useState(user?.city || "");

  const updateMutation = useMutation({
    mutationFn: async (data: { name?: string; city?: string }) => {
      return apiRequest(`/api/users/${user?.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      updateUser(data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Hata", "Profil güncellenirken bir hata oluştu.");
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Uyarı", "Lütfen adınızı girin.");
      return;
    }
    updateMutation.mutate({ name: name.trim(), city });
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <View style={{ height: Spacing.xl }} />
        
        <View style={styles.field}>
          <ThemedText style={styles.label}>Ad Soyad</ThemedText>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.backgroundSecondary, color: theme.text },
            ]}
            value={name}
            onChangeText={setName}
            placeholder="Adınızı girin"
            placeholderTextColor={theme.textSecondary}
          />
        </View>

        <View style={styles.field}>
          <ThemedText style={styles.label}>Şehir</ThemedText>
          <View style={styles.citiesContainer}>
            {CITIES.map((cityOption) => (
              <Pressable
                key={cityOption}
                style={[
                  styles.cityChip,
                  { backgroundColor: theme.backgroundSecondary },
                  city === cityOption && styles.cityChipSelected,
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setCity(cityOption);
                }}
              >
                <ThemedText
                  style={[
                    styles.cityChipText,
                    city === cityOption && styles.cityChipTextSelected,
                  ]}
                >
                  {cityOption}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
          ]}
          onPress={handleSave}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.saveButtonText}>Kaydet</ThemedText>
          )}
        </Pressable>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
  },
  field: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.small,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  input: {
    height: 48,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  citiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  cityChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  cityChipSelected: {
    backgroundColor: BrandColors.primaryBlue,
  },
  cityChipText: {
    ...Typography.small,
  },
  cityChipTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#000000",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  saveButtonText: {
    ...Typography.button,
    color: "#FFFFFF",
  },
});
