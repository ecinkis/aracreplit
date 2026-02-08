import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, Typography, BrandColors } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CATEGORIES = [
  { id: "otomobil", name: "Otomobil", icon: "truck" },
  { id: "suv", name: "SUV / Pickup", icon: "compass" },
  { id: "elektrikli", name: "Elektrikli", icon: "zap" },
  { id: "motosiklet", name: "Motosiklet", icon: "wind" },
];

const HEADER_HEIGHT = 56;

export default function QuickCreateListingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: quotaData } = useQuery<{
    maxListings: number;
    currentListings: number;
    remainingListings: number;
    quotaLabel: string;
    phoneVerified: boolean;
    emailVerified: boolean;
    isPremium: boolean;
  }>({
    queryKey: ["/api/users", user?.id, "listing-quota"],
    enabled: !!user?.id,
  });

  const [photo, setPhoto] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/listings", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "listings"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        "İlanınız Onaya Gönderildi",
        "İlanınız kontrolden sonra aktif edilecektir. Onaylandığında bildirim alacaksınız.",
        [
          { 
            text: "Tamam", 
            onPress: () => navigation.navigate("Main") 
          },
        ]
      );
    },
    onError: (error: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = error?.message || "İlan oluşturulurken bir hata oluştu.";
      Alert.alert("Hata", message);
    },
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Izin Gerekli", "Kamera kullanmak icin izin vermelisiniz.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const parseTitle = (titleText: string) => {
    const words = titleText.trim().split(/\s+/);
    const yearMatch = titleText.match(/\b(19|20)\d{2}\b/);
    const year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();
    
    const brand = words[0] || "Diger";
    const modelWords = words.slice(1).filter(w => !w.match(/\b(19|20)\d{2}\b/));
    const model = modelWords.join(" ") || titleText;
    
    return { brand, model, year };
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Uyari", "Lutfen ilan basligi girin.");
      return;
    }
    if (!category) {
      Alert.alert("Uyari", "Lutfen kategori secin.");
      return;
    }

    const { brand, model, year } = parseTitle(title);

    createMutation.mutate({
      userId: user?.id,
      brand,
      model,
      year,
      km: 0,
      fuelType: "Belirtilmedi",
      transmission: "Belirtilmedi",
      city: "Belirtilmedi",
      photos: photo ? [photo] : [],
      swapActive: true,
      onlySwap: true,
      acceptsCashDiff: false,
      preferredBrands: [],
      category,
      description: description.trim() || null,
      estimatedValue: estimatedValue ? parseInt(estimatedValue.replace(/\D/g, "")) : null,
      needsCompletion: true,
    });
  };

  const isValid = title.trim().length > 0 && category;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { height: HEADER_HEIGHT + insets.top, paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <Pressable 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="x" size={24} color="#FFFFFF" />
          </Pressable>
          <ThemedText style={styles.headerTitle}>Hizli Ilan</ThemedText>
        </View>
      </View>

      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        {quotaData ? (
          <View style={[styles.quotaCard, { 
            backgroundColor: quotaData.remainingListings > 0 ? `${BrandColors.successGreen}10` : `${BrandColors.alertRed}10`,
            borderColor: quotaData.remainingListings > 0 ? `${BrandColors.successGreen}30` : `${BrandColors.alertRed}30`,
          }]}>
            <View style={styles.quotaRow}>
              <Feather 
                name={quotaData.remainingListings > 0 ? "check-circle" : "alert-circle"} 
                size={18} 
                color={quotaData.remainingListings > 0 ? BrandColors.successGreen : BrandColors.alertRed} 
              />
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.quotaTitle}>
                  {quotaData.quotaLabel} - {quotaData.remainingListings} ilan hakkınız kaldı
                </ThemedText>
                <ThemedText style={styles.quotaSubtitle}>
                  {quotaData.currentListings}/{quotaData.maxListings} ilan kullanıldı
                </ThemedText>
              </View>
            </View>
          </View>
        ) : null}

        {quotaData && quotaData.remainingListings <= 0 ? (
          <View style={styles.quotaBlockedContainer}>
            <Feather name="alert-triangle" size={48} color={BrandColors.alertRed} />
            <ThemedText style={styles.quotaBlockedTitle}>İlan Limitinize Ulaştınız</ThemedText>
            <ThemedText style={styles.quotaBlockedText}>
              {!quotaData.phoneVerified || !quotaData.emailVerified
                ? "Telefon ve e-posta doğrulaması yaparak 2 ilan hakkı kazanabilirsiniz."
                : "Premium üyelikle aylık 5 ilan hakkı kazanabilirsiniz (199₺/ay)."}
            </ThemedText>
            <Pressable
              style={styles.quotaUpgradeButton}
              onPress={() => navigation.navigate("Premium")}
            >
              <Feather name="zap" size={16} color="#FFFFFF" />
              <ThemedText style={styles.quotaUpgradeButtonText}>Premium'a Yükselt</ThemedText>
            </Pressable>
          </View>
        ) : (
        <>
        <View style={styles.heroSection}>
          <ThemedText style={styles.heroTitle}>30 saniyede ilan ver</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Sadece basligi yaz, kategorini sec. Detaylari sonra ekle.
          </ThemedText>
        </View>

        <View style={styles.photoSection}>
          {photo ? (
            <View style={styles.photoPreview}>
              <Image source={{ uri: photo }} style={styles.photoImage} />
              <Pressable
                style={styles.removePhotoButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setPhoto(null);
                }}
              >
                <Feather name="x" size={18} color="#FFFFFF" />
              </Pressable>
            </View>
          ) : (
            <View style={styles.photoButtons}>
              <Pressable style={styles.photoButton} onPress={takePhoto}>
                <Feather name="camera" size={28} color="#000000" />
                <ThemedText style={styles.photoButtonText}>Fotograf Cek</ThemedText>
              </Pressable>
              <Pressable style={styles.photoButton} onPress={pickImage}>
                <Feather name="image" size={28} color="#000000" />
                <ThemedText style={styles.photoButtonText}>Galeriden Sec</ThemedText>
              </Pressable>
            </View>
          )}
          <ThemedText style={styles.optionalText}>Fotograf opsiyonel - sonra ekleyebilirsin</ThemedText>
        </View>

        <View style={styles.formSection}>
          <ThemedText style={styles.fieldLabel}>Ilan Basligi</ThemedText>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Ornegin: BMW 320i 2019 Otomatik"
            placeholderTextColor="#9CA3AF"
            autoFocus
          />
          <ThemedText style={styles.fieldHint}>
            Marka, model ve yil bilgisi girmen yeterli
          </ThemedText>
        </View>

        <View style={styles.formSection}>
          <ThemedText style={styles.fieldLabel}>Kategori</ThemedText>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                style={[
                  styles.categoryCard,
                  category === cat.id && styles.categoryCardSelected,
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setCategory(cat.id);
                }}
              >
                <Feather 
                  name={cat.icon as any} 
                  size={24} 
                  color={category === cat.id ? "#FFFFFF" : "#000000"} 
                />
                <ThemedText 
                  style={[
                    styles.categoryText,
                    category === cat.id && styles.categoryTextSelected,
                  ]}
                >
                  {cat.name}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.formSection}>
          <ThemedText style={styles.fieldLabel}>Aciklama (Opsiyonel)</ThemedText>
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Arac hakkinda kisa bilgi..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formSection}>
          <ThemedText style={styles.fieldLabel}>Tahmini Deger (Opsiyonel)</ThemedText>
          <View style={styles.priceInputContainer}>
            <TextInput
              style={styles.priceInput}
              value={estimatedValue ? parseInt(estimatedValue).toLocaleString("tr-TR") : ""}
              onChangeText={(text) => setEstimatedValue(text.replace(/\D/g, ""))}
              placeholder="500.000"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
            />
            <ThemedText style={styles.currencyText}>TL</ThemedText>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            !isValid && styles.submitButtonDisabled,
            pressed && isValid && { opacity: 0.9 },
          ]}
          onPress={handleSubmit}
          disabled={!isValid || createMutation.isPending}
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Feather name="zap" size={20} color="#FFFFFF" />
              <ThemedText style={styles.submitButtonText}>Hemen Yayinla</ThemedText>
            </>
          )}
        </Pressable>

        <Pressable
          style={styles.detailedButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate("CreateListing");
          }}
        >
          <ThemedText style={styles.detailedButtonText}>
            Detayli ilan olusturmak istiyorum
          </ThemedText>
          <Feather name="arrow-right" size={16} color="#6B7280" />
        </Pressable>
        </>
        )}
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#000000",
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  backButton: {
    marginRight: Spacing.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  heroSection: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#000000",
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
  },
  photoSection: {
    marginBottom: Spacing.lg,
  },
  photoButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  photoButton: {
    flex: 1,
    height: 100,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.xs,
  },
  photoButtonText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  photoPreview: {
    height: 200,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  photoImage: {
    width: "100%",
    height: "100%",
  },
  removePhotoButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: BorderRadius.full,
    padding: 8,
  },
  optionalText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  formSection: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    marginBottom: Spacing.sm,
  },
  fieldHint: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: Spacing.xs,
  },
  titleInput: {
    height: 56,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: 17,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    color: "#000000",
  },
  descriptionInput: {
    height: 88,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 15,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    color: "#000000",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  categoryCard: {
    width: "48%",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  categoryCardSelected: {
    backgroundColor: "#000000",
    borderColor: "#000000",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
  },
  categoryTextSelected: {
    color: "#FFFFFF",
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  priceInput: {
    flex: 1,
    fontSize: 17,
    color: "#000000",
  },
  currencyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  submitButton: {
    backgroundColor: "#000000",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  detailedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    gap: Spacing.xs,
  },
  detailedButtonText: {
    fontSize: 14,
    color: "#6B7280",
  },
  quotaCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  quotaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  quotaTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  quotaSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  quotaBlockedContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xl * 2,
    gap: Spacing.md,
  },
  quotaBlockedTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  quotaBlockedText: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: Spacing.md,
  },
  quotaUpgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: "#000000",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.md,
  },
  quotaUpgradeButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
