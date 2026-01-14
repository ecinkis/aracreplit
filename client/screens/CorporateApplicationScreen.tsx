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
import * as DocumentPicker from "expo-document-picker";
import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/query-client";
import { Spacing, BorderRadius, BrandColors } from "@/constants/theme";

interface DocumentFile {
  name: string;
  uri: string;
  type: string;
}

export default function CorporateApplicationScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user } = useAuth();

  const [companyName, setCompanyName] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [taxOffice, setTaxOffice] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [authorizedPerson, setAuthorizedPerson] = useState("");
  const [documents, setDocuments] = useState<DocumentFile[]>([]);

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/applications", {
        method: "POST",
        body: JSON.stringify({
          userId: user?.id,
          type: "corporate",
          companyName: data.companyName,
          taxNumber: data.taxNumber,
          taxOffice: data.taxOffice,
          companyAddress: data.companyAddress || null,
          authorizedPerson: data.authorizedPerson || null,
          documents: data.documents.map((d: DocumentFile) => d.name),
        }),
      });
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Başvuru Alındı",
        "Kurumsal üyelik başvurunuz incelemeye alındı. Onaylandığında size bildirim gönderilecektir.",
        [{ text: "Tamam", onPress: () => navigation.goBack() }]
      );
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Hata", "Başvuru gönderilemedi. Lütfen tekrar deneyin.");
    },
  });

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setDocuments([...documents, {
          name: asset.name,
          uri: asset.uri,
          type: asset.mimeType || "application/octet-stream",
        }]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Alert.alert("Hata", "Belge seçilirken bir hata oluştu.");
    }
  };

  const removeDocument = (index: number) => {
    const newDocs = [...documents];
    newDocs.splice(index, 1);
    setDocuments(newDocs);
  };

  const handleSubmit = () => {
    if (!companyName.trim()) {
      Alert.alert("Hata", "Firma adı zorunludur.");
      return;
    }
    if (!taxNumber.trim()) {
      Alert.alert("Hata", "Vergi numarası zorunludur.");
      return;
    }
    if (!taxOffice.trim()) {
      Alert.alert("Hata", "Vergi dairesi zorunludur.");
      return;
    }

    Alert.alert(
      "Başvuruyu Onayla",
      "Kurumsal üyelik başvurunuzu göndermek istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Gönder",
          onPress: () => {
            submitMutation.mutate({
              companyName,
              taxNumber,
              taxOffice,
              companyAddress,
              authorizedPerson,
              documents,
            });
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
        >
          <Feather name="arrow-left" size={24} color="#000000" />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Kurumsal Başvuru</ThemedText>
        <View style={styles.backButton} />
      </View>

      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <Feather name="info" size={20} color={BrandColors.secondaryBlue} />
          <ThemedText style={styles.infoText}>
            Kurumsal üyelik için aşağıdaki bilgileri doldurun ve gerekli evrakları yükleyin.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Firma Bilgileri</ThemedText>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Firma Adı *</ThemedText>
            <TextInput
              style={styles.input}
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="Örnek Otomotiv A.Ş."
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Vergi Numarası *</ThemedText>
            <TextInput
              style={styles.input}
              value={taxNumber}
              onChangeText={setTaxNumber}
              placeholder="1234567890"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Vergi Dairesi *</ThemedText>
            <TextInput
              style={styles.input}
              value={taxOffice}
              onChangeText={setTaxOffice}
              placeholder="Kadıköy Vergi Dairesi"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Firma Adresi</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={companyAddress}
              onChangeText={setCompanyAddress}
              placeholder="Tam adres bilgisi"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Yetkili Kisi</ThemedText>
            <TextInput
              style={styles.input}
              value={authorizedPerson}
              onChangeText={setAuthorizedPerson}
              placeholder="Ad Soyad"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Evraklar</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Ticaret sicil gazetesi, vergi levhası ve imza sirküleri yükleyin
          </ThemedText>

          {documents.map((doc, index) => (
            <View key={index} style={styles.documentRow}>
              <View style={styles.documentInfo}>
                <Feather name="file-text" size={20} color="#374151" />
                <ThemedText style={styles.documentName} numberOfLines={1}>
                  {doc.name}
                </ThemedText>
              </View>
              <Pressable
                style={styles.removeButton}
                onPress={() => removeDocument(index)}
              >
                <Feather name="x" size={18} color="#EF4444" />
              </Pressable>
            </View>
          ))}

          <Pressable
            style={({ pressed }) => [
              styles.uploadButton,
              pressed && { opacity: 0.7 }
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              pickDocument();
            }}
          >
            <Feather name="upload" size={20} color={BrandColors.secondaryBlue} />
            <ThemedText style={styles.uploadButtonText}>Evrak Yükle</ThemedText>
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            pressed && { opacity: 0.8 },
            submitMutation.isPending && { opacity: 0.6 }
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleSubmit();
          }}
          disabled={submitMutation.isPending}
        >
          {submitMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.submitButtonText}>Başvuruyu Gönder</ThemedText>
          )}
        </Pressable>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#EBF2FF",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1C5BB9",
    lineHeight: 20,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    fontSize: 15,
    color: "#111827",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  documentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  documentInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: Spacing.sm,
  },
  documentName: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  removeButton: {
    padding: Spacing.xs,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EBF2FF",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: BrandColors.secondaryBlue,
    gap: Spacing.sm,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: BrandColors.secondaryBlue,
  },
  submitButton: {
    backgroundColor: "#000000",
    paddingVertical: Spacing.md + 4,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
