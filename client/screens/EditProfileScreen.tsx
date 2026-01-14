import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  FlatList,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, Typography, BrandColors } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";

const defaultAvatarImage = require("../assets/images/default-avatar.png");

const CITIES = [
  "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep", 
  "Şanlıurfa", "Kocaeli", "Mersin", "Diyarbakır", "Hatay", "Manisa", "Kayseri",
  "Samsun", "Balıkesir", "Kahramanmaraş", "Van", "Aydın", "Denizli", "Sakarya",
  "Tekirdağ", "Muğla", "Eskişehir", "Mardin", "Trabzon", "Malatya", "Erzurum",
  "Ordu", "Afyonkarahisar", "Sivas", "Tokat", "Çorum", "Aksaray", "Elazığ",
  "Kütahya", "Kırıkkale", "Osmaniye", "Düzce", "Zonguldak", "Edirne", "Çanakkale",
  "Isparta", "Bolu", "Rize", "Giresun", "Nevşehir", "Uşak", "Niğde", "Adıyaman",
  "Ağrı", "Amasya", "Ardahan", "Artvin", "Bartın", "Batman", "Bayburt", "Bilecik",
  "Bingöl", "Bitlis", "Burdur", "Çankırı", "Erzincan", "Gümüşhane", "Hakkari",
  "Iğdır", "Karaman", "Kars", "Kastamonu", "Kırklareli", "Kırşehir", "Kilis",
  "Muş", "Siirt", "Sinop", "Şırnak", "Tunceli", "Yalova", "Yozgat"
].sort((a, b) => a.localeCompare(b, 'tr'));

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [city, setCity] = useState(user?.city || "");
  const [email, setEmail] = useState((user as any)?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatarUri, setAvatarUri] = useState<string | null>((user as any)?.avatarUrl || null);
  const [showCityPicker, setShowCityPicker] = useState(false);

  const hasEmail = !!(user as any)?.email;
  const hasPhone = !!user?.phone;

  const updateMutation = useMutation({
    mutationFn: async (data: { name?: string; city?: string; email?: string; phone?: string; avatarUrl?: string }) => {
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

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert("İzin Gerekli", "Fotoğraf seçmek için galeri izni gereklidir.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Uyarı", "Lütfen adınızı girin.");
      return;
    }

    const updateData: any = { 
      name: name.trim(), 
      city,
    };

    if (!hasEmail && email.trim()) {
      updateData.email = email.trim();
    }

    if (!hasPhone && phone.trim()) {
      updateData.phone = phone.trim();
    }

    if (avatarUri && avatarUri !== (user as any)?.avatarUrl) {
      updateData.avatarUrl = avatarUri;
    }

    updateMutation.mutate(updateData);
  };

  const handleSelectCity = (selectedCity: string) => {
    Haptics.selectionAsync();
    setCity(selectedCity);
    setShowCityPicker(false);
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <View style={{ height: Spacing.xl * 2 }} />
        
        <View style={styles.avatarSection}>
          <Pressable onPress={handlePickImage} style={styles.avatarContainer}>
            <Image
              source={avatarUri ? { uri: avatarUri } : defaultAvatarImage}
              style={styles.avatar}
            />
            <View style={styles.avatarEditBadge}>
              <Feather name="camera" size={16} color="#FFFFFF" />
            </View>
          </Pressable>
          <ThemedText style={styles.avatarHint}>Profil fotoğrafını değiştir</ThemedText>
        </View>
        
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
          <Pressable
            style={[
              styles.dropdownButton,
              { backgroundColor: theme.backgroundSecondary },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowCityPicker(true);
            }}
          >
            <ThemedText style={[styles.dropdownText, !city && { color: theme.textSecondary }]}>
              {city || "Şehir seçin"}
            </ThemedText>
            <Feather name="chevron-down" size={20} color={theme.textSecondary} />
          </Pressable>
        </View>

        {!hasEmail && (
          <View style={styles.field}>
            <ThemedText style={styles.label}>E-posta</ThemedText>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.backgroundSecondary, color: theme.text },
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder="E-posta adresinizi girin"
              placeholderTextColor={theme.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        )}

        <View style={styles.field}>
          <ThemedText style={styles.label}>Telefon</ThemedText>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.backgroundSecondary, color: hasPhone ? "#9CA3AF" : theme.text },
            ]}
            value={phone}
            onChangeText={hasPhone ? undefined : setPhone}
            placeholder="Telefon numaranızı girin"
            placeholderTextColor={theme.textSecondary}
            keyboardType="phone-pad"
            editable={!hasPhone}
          />
          {hasPhone && (
            <ThemedText style={styles.fieldHint}>Telefon numarası değiştirilemez</ThemedText>
          )}
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

      <Modal
        visible={showCityPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCityPicker(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: Platform.OS === 'ios' ? 20 : 0 }]}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Şehir Seçin</ThemedText>
            <Pressable
              onPress={() => setShowCityPicker(false)}
              style={styles.modalCloseButton}
            >
              <Feather name="x" size={24} color="#000000" />
            </Pressable>
          </View>
          <FlatList
            data={CITIES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.cityItem,
                  city === item && styles.cityItemSelected,
                  pressed && { backgroundColor: "#F3F4F6" },
                ]}
                onPress={() => handleSelectCity(item)}
              >
                <ThemedText style={[
                  styles.cityItemText,
                  city === item && styles.cityItemTextSelected,
                ]}>
                  {item}
                </ThemedText>
                {city === item && (
                  <Feather name="check" size={20} color={BrandColors.primaryBlue} />
                )}
              </Pressable>
            )}
            contentContainerStyle={styles.cityList}
          />
        </View>
      </Modal>
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
  avatarSection: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F3F4F6",
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  avatarHint: {
    ...Typography.small,
    color: "#6B7280",
    marginTop: Spacing.sm,
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
  fieldHint: {
    ...Typography.small,
    color: "#9CA3AF",
    marginTop: Spacing.xs,
  },
  dropdownButton: {
    height: 48,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownText: {
    fontSize: 16,
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
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalCloseButton: {
    padding: Spacing.sm,
  },
  cityList: {
    paddingBottom: 40,
  },
  cityItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  cityItemSelected: {
    backgroundColor: "#EBF4FF",
  },
  cityItemText: {
    fontSize: 16,
  },
  cityItemTextSelected: {
    color: BrandColors.primaryBlue,
    fontWeight: "600",
  },
});
