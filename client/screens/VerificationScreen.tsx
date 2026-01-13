import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, BrandColors } from "@/constants/theme";
import { apiRequest, getApiUrl } from "@/lib/query-client";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type VerificationScreenRouteProp = RouteProp<RootStackParamList, "Verification">;

export default function VerificationScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<VerificationScreenRouteProp>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const documentType = route.params?.documentType || "tax_certificate";
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const title = documentType === "tax_certificate" 
    ? "Vergi Levhası Yükleme" 
    : documentType === "company_registration"
    ? "Şirket Doğrulama"
    : "Belge Yükleme";

  const description = documentType === "tax_certificate"
    ? "Şirketinizin vergi levhasını yükleyerek kurumsal hesabınızı doğrulayın."
    : documentType === "company_registration"
    ? "Şirket tescil belgenizi yükleyerek kurumsal hesabınızı doğrulayın."
    : "Belgenizi yükleyerek hesabınızı doğrulayın.";

  const { data: existingDocs } = useQuery<any[]>({
    queryKey: ["/api/verification", user?.id],
    enabled: !!user?.id,
  });

  const existingDoc = existingDocs?.find((doc) => doc.documentType === documentType);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("İzin Gerekli", "Fotoğraf seçmek için galeri izni gereklidir.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("İzin Gerekli", "Fotoğraf çekmek için kamera izni gereklidir.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const uploadMutation = useMutation({
    mutationFn: async (imageUri: string) => {
      setUploading(true);
      
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      const base64Image = await base64Promise;

      const uploadResponse = await apiRequest("/api/upload", {
        method: "POST",
        body: JSON.stringify({ image: base64Image }),
      });

      const documentUrl = uploadResponse.url;

      return apiRequest("/api/verification", {
        method: "POST",
        body: JSON.stringify({
          userId: user?.id,
          documentType,
          documentUrl,
        }),
      });
    },
    onSuccess: () => {
      setUploading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["/api/verification", user?.id] });
      Alert.alert(
        "Başarılı",
        "Belgeniz yüklendi ve incelemeye alındı. Onaylandığında size bildirim göndereceğiz.",
        [{ text: "Tamam", onPress: () => navigation.goBack() }]
      );
    },
    onError: (error) => {
      setUploading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Hata", "Belge yüklenirken bir hata oluştu. Lütfen tekrar deneyin.");
    },
  });

  const handleUpload = () => {
    if (!selectedImage) {
      Alert.alert("Uyarı", "Lütfen önce bir belge seçin.");
      return;
    }
    uploadMutation.mutate(selectedImage);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return { text: "İnceleniyor", color: "#F59E0B", bgColor: "#FEF3C7" };
      case "approved":
        return { text: "Onaylandı", color: "#10B981", bgColor: "#D1FAE5" };
      case "rejected":
        return { text: "Reddedildi", color: "#EF4444", bgColor: "#FEE2E2" };
      default:
        return { text: "Bilinmiyor", color: "#6B7280", bgColor: "#F3F4F6" };
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Spacing.xl, paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <View style={styles.header}>
          <Feather name="file-text" size={48} color={BrandColors.primaryBlue} />
          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText style={styles.description}>{description}</ThemedText>
        </View>

        {existingDoc ? (
          <View style={styles.existingDocCard}>
            <View style={styles.existingDocHeader}>
              <ThemedText style={styles.existingDocTitle}>Yüklenen Belge</ThemedText>
              <View style={[styles.statusBadge, { backgroundColor: getStatusBadge(existingDoc.status).bgColor }]}>
                <ThemedText style={[styles.statusText, { color: getStatusBadge(existingDoc.status).color }]}>
                  {getStatusBadge(existingDoc.status).text}
                </ThemedText>
              </View>
            </View>
            <ThemedText style={styles.existingDocDate}>
              Yükleme tarihi: {new Date(existingDoc.createdAt).toLocaleDateString("tr-TR")}
            </ThemedText>
            {existingDoc.status === "rejected" && existingDoc.rejectionReason && (
              <View style={styles.rejectionBox}>
                <ThemedText style={styles.rejectionLabel}>Red Sebebi:</ThemedText>
                <ThemedText style={styles.rejectionText}>{existingDoc.rejectionReason}</ThemedText>
              </View>
            )}
            {existingDoc.status === "rejected" && (
              <ThemedText style={styles.retryHint}>
                Yeni bir belge yükleyerek tekrar başvurabilirsiniz.
              </ThemedText>
            )}
          </View>
        ) : null}

        {(!existingDoc || existingDoc.status === "rejected") && (
          <>
            <View style={styles.uploadSection}>
              <ThemedText style={styles.sectionTitle}>Belge Seçin</ThemedText>
              
              <View style={styles.uploadButtons}>
                <Pressable
                  style={({ pressed }) => [
                    styles.uploadButton,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={pickImage}
                >
                  <Feather name="image" size={24} color={BrandColors.primaryBlue} />
                  <ThemedText style={styles.uploadButtonText}>Galeriden Seç</ThemedText>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.uploadButton,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={takePhoto}
                >
                  <Feather name="camera" size={24} color={BrandColors.primaryBlue} />
                  <ThemedText style={styles.uploadButtonText}>Fotoğraf Çek</ThemedText>
                </Pressable>
              </View>
            </View>

            {selectedImage ? (
              <View style={styles.previewSection}>
                <ThemedText style={styles.sectionTitle}>Önizleme</ThemedText>
                <View style={styles.previewContainer}>
                  <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                  <Pressable
                    style={styles.removeButton}
                    onPress={() => setSelectedImage(null)}
                  >
                    <Feather name="x" size={20} color="#FFFFFF" />
                  </Pressable>
                </View>
              </View>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                !selectedImage && styles.submitButtonDisabled,
                pressed && selectedImage && { opacity: 0.9 },
              ]}
              onPress={handleUpload}
              disabled={!selectedImage || uploading}
            >
              {uploading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="upload" size={20} color="#FFFFFF" />
                  <ThemedText style={styles.submitButtonText}>Belgeyi Yükle</ThemedText>
                </>
              )}
            </Pressable>
          </>
        )}

        <View style={styles.infoSection}>
          <ThemedText style={styles.infoTitle}>Bilgilendirme</ThemedText>
          <View style={styles.infoItem}>
            <Feather name="check-circle" size={16} color="#10B981" />
            <ThemedText style={styles.infoText}>
              Belgeler güvenli şekilde saklanır
            </ThemedText>
          </View>
          <View style={styles.infoItem}>
            <Feather name="clock" size={16} color="#F59E0B" />
            <ThemedText style={styles.infoText}>
              İnceleme süresi 1-3 iş günüdür
            </ThemedText>
          </View>
          <View style={styles.infoItem}>
            <Feather name="shield" size={16} color={BrandColors.primaryBlue} />
            <ThemedText style={styles.infoText}>
              Onay sonrası güven skorunuz artar
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: Spacing.md,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  existingDocCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  existingDocHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  existingDocTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  existingDocDate: {
    fontSize: 13,
    color: "#6B7280",
  },
  rejectionBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  rejectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#EF4444",
    marginBottom: 4,
  },
  rejectionText: {
    fontSize: 13,
    color: "#991B1B",
  },
  retryHint: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: Spacing.md,
    fontStyle: "italic",
  },
  uploadSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  uploadButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: "center",
    gap: Spacing.sm,
  },
  uploadButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
  },
  previewSection: {
    marginBottom: Spacing.xl,
  },
  previewContainer: {
    position: "relative",
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.md,
  },
  removeButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: BorderRadius.full,
    padding: Spacing.sm,
  },
  submitButton: {
    backgroundColor: "#000000",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  infoSection: {
    backgroundColor: "#F9FAFB",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.md,
    color: "#374151",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: 13,
    color: "#6B7280",
  },
});
