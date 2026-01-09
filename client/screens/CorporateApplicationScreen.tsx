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
import * as FileSystem from "expo-file-system";
import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/lib/query-client";
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
      const formData = new FormData();
      formData.append("userType", "kurumsal");
      formData.append("companyName", data.companyName);
      formData.append("taxNumber", data.taxNumber);
      formData.append("taxOffice", data.taxOffice);
      formData.append("companyAddress", data.companyAddress || "");
      formData.append("authorizedPerson", data.authorizedPerson || "");
      
      for (const doc of data.documents) {
        const file = new FileSystem.File(doc.uri);
        formData.append("documents", file);
      }
      
      const response = await fetch(new URL(`/api/users/${user?.id}`, getApiUrl()).toString(), {
        method: "PATCH",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit");
      }
      
      return response.json();
    },
    onSuccess: () => {
      Alert.alert(
        "Basarili",
        "Kurumsal basvurunuz alindi. Evraklariniz incelendikten sonra hesabiniz aktif edilecektir.",
        [{ text: "Tamam", onPress: () => navigation.goBack() }]
      );
    },
    onError: () => {
      Alert.alert("Hata", "Basvuru gonderilemedi. Lutfen tekrar deneyin.");
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
      Alert.alert("Hata", "Belge secilirken bir hata olustu.");
    }
  };

  const removeDocument = (index: number) => {
    const newDocs = [...documents];
    newDocs.splice(index, 1);
    setDocuments(newDocs);
  };

  const handleSubmit = () => {
    if (!companyName.trim()) {
      Alert.alert("Hata", "Firma adi zorunludur.");
      return;
    }
    if (!taxNumber.trim()) {
      Alert.alert("Hata", "Vergi numarasi zorunludur.");
      return;
    }
    if (!taxOffice.trim()) {
      Alert.alert("Hata", "Vergi dairesi zorunludur.");
      return;
    }

    Alert.alert(
      "Basvuruyu Onayla",
      "Kurumsal uyelik basvurunuzu gondermek istediginize emin misiniz?",
      [
        { text: "Iptal", style: "cancel" },
        {
          text: "Gonder",
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
        <ThemedText style={styles.headerTitle}>Kurumsal Basvuru</ThemedText>
        <View style={styles.backButton} />
      </View>

      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <Feather name="info" size={20} color={BrandColors.primaryOrange} />
          <ThemedText style={styles.infoText}>
            Kurumsal uyelik icin asagidaki bilgileri doldurun ve gerekli evraklari yukleyin.
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Firma Bilgileri</ThemedText>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Firma Adi *</ThemedText>
            <TextInput
              style={styles.input}
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="Ornek Otomotiv A.S."
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Vergi Numarasi *</ThemedText>
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
              placeholder="Kadikoy Vergi Dairesi"
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
            Ticaret sicil gazetesi, vergi levhasi ve imza sirkuleri yukleyin
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
            <Feather name="upload" size={20} color={BrandColors.primaryOrange} />
            <ThemedText style={styles.uploadButtonText}>Evrak Yukle</ThemedText>
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
            <ThemedText style={styles.submitButtonText}>Basvuruyu Gonder</ThemedText>
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
    backgroundColor: "#FFF7ED",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#92400E",
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
    backgroundColor: "#FFF7ED",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: BrandColors.primaryOrange,
    gap: Spacing.sm,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: BrandColors.primaryOrange,
  },
  submitButton: {
    backgroundColor: BrandColors.primaryOrange,
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
