import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const BRANDS = [
  "Audi", "BMW", "Citroen", "Dacia", "Fiat", "Ford", "Honda", "Hyundai", 
  "Kia", "Mercedes", "Nissan", "Opel", "Peugeot", "Renault", "Seat", 
  "Skoda", "Toyota", "Volkswagen", "Volvo", "Diger"
];

const CATEGORIES = [
  { id: "otomobil", name: "Otomobil", icon: "truck" },
  { id: "suv", name: "SUV / Pickup", icon: "compass" },
  { id: "elektrikli", name: "Elektrikli", icon: "zap" },
  { id: "motosiklet", name: "Motosiklet", icon: "wind" },
];

const HEADER_HEIGHT = 110;

function QuickPicker({
  label,
  placeholder,
  options,
  selected,
  onSelect,
}: {
  label: string;
  placeholder: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    return options.filter((option) =>
      option.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery]);

  return (
    <>
      <Pressable
        style={[styles.pickerButton, selected && styles.pickerButtonSelected]}
        onPress={() => {
          Haptics.selectionAsync();
          setModalVisible(true);
        }}
      >
        <ThemedText style={[styles.pickerText, !selected && styles.pickerPlaceholder]}>
          {selected || placeholder}
        </ThemedText>
        <Feather name="chevron-down" size={20} color="#6B7280" />
      </Pressable>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>{label}</ThemedText>
            <Pressable onPress={() => setModalVisible(false)}>
              <Feather name="x" size={24} color="#000000" />
            </Pressable>
          </View>

          <View style={styles.modalSearchContainer}>
            <Feather name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Ara..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <FlatList
            data={filteredOptions}
            keyExtractor={(item) => item}
            contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.lg }}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.optionItem, selected === item && styles.optionItemSelected]}
                onPress={() => {
                  Haptics.selectionAsync();
                  onSelect(item);
                  setModalVisible(false);
                  setSearchQuery("");
                }}
              >
                <ThemedText style={[styles.optionText, selected === item && styles.optionTextSelected]}>
                  {item}
                </ThemedText>
                {selected === item ? <Feather name="check" size={20} color="#000000" /> : null}
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </>
  );
}

export default function QuickCreateListingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [photo, setPhoto] = useState<string | null>(null);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [category, setCategory] = useState("");

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 30 }, (_, i) => String(currentYear - i));

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/listings", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "listings"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      const listingId = data?.id;
      
      Alert.alert(
        "Ilaniniz Yayinda!",
        "Detaylari ekleyerek ilaninizi zenginlestirebilirsiniz.",
        [
          { 
            text: "Detaylari Ekle", 
            onPress: () => {
              if (listingId) {
                navigation.navigate("ListingDetail", { listingId });
              } else {
                navigation.navigate("Main");
              }
            }
          },
          { 
            text: "Tamam", 
            style: "cancel",
            onPress: () => navigation.navigate("Main") 
          },
        ]
      );
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Hata", "Ilan olusturulurken bir hata olustu.");
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

  const handleSubmit = () => {
    if (!brand) {
      Alert.alert("Uyari", "Lutfen marka secin.");
      return;
    }
    if (!model.trim()) {
      Alert.alert("Uyari", "Lutfen model girin.");
      return;
    }
    if (!year) {
      Alert.alert("Uyari", "Lutfen yil secin.");
      return;
    }
    if (!category) {
      Alert.alert("Uyari", "Lutfen kategori secin.");
      return;
    }

    createMutation.mutate({
      userId: user?.id,
      brand,
      model: model.trim(),
      year: parseInt(year),
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
      needsCompletion: true,
    });
  };

  const isValid = brand && model.trim() && year && category;

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
        <View style={styles.heroSection}>
          <ThemedText style={styles.heroTitle}>Hizli ilan olustur</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            4 adimda ilanini yayinla. Detaylari sonra ekleyebilirsin.
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
                <Feather name="camera" size={24} color="#000000" />
                <ThemedText style={styles.photoButtonText}>Cek</ThemedText>
              </Pressable>
              <Pressable style={styles.photoButton} onPress={pickImage}>
                <Feather name="image" size={24} color="#000000" />
                <ThemedText style={styles.photoButtonText}>Sec</ThemedText>
              </Pressable>
            </View>
          )}
          <ThemedText style={styles.optionalText}>Opsiyonel - sonra ekleyebilirsin</ThemedText>
        </View>

        <View style={styles.formSection}>
          <View style={styles.stepIndicator}>
            <View style={styles.stepNumber}><ThemedText style={styles.stepNumberText}>1</ThemedText></View>
            <ThemedText style={styles.fieldLabel}>Marka</ThemedText>
          </View>
          <QuickPicker
            label="Marka Sec"
            placeholder="Marka secin"
            options={BRANDS}
            selected={brand}
            onSelect={setBrand}
          />
        </View>

        <View style={styles.formSection}>
          <View style={styles.stepIndicator}>
            <View style={styles.stepNumber}><ThemedText style={styles.stepNumberText}>2</ThemedText></View>
            <ThemedText style={styles.fieldLabel}>Model</ThemedText>
          </View>
          <TextInput
            style={styles.textInput}
            value={model}
            onChangeText={setModel}
            placeholder="Ornegin: 320i, Corolla, Focus"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.formSection}>
          <View style={styles.stepIndicator}>
            <View style={styles.stepNumber}><ThemedText style={styles.stepNumberText}>3</ThemedText></View>
            <ThemedText style={styles.fieldLabel}>Yil</ThemedText>
          </View>
          <QuickPicker
            label="Model Yili"
            placeholder="Yil secin"
            options={yearOptions}
            selected={year}
            onSelect={setYear}
          />
        </View>

        <View style={styles.formSection}>
          <View style={styles.stepIndicator}>
            <View style={styles.stepNumber}><ThemedText style={styles.stepNumberText}>4</ThemedText></View>
            <ThemedText style={styles.fieldLabel}>Kategori</ThemedText>
          </View>
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
                  size={20} 
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
              <ThemedText style={styles.submitButtonText}>Yayinla</ThemedText>
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
            Detayli ilan olustur
          </ThemedText>
          <Feather name="arrow-right" size={16} color="#6B7280" />
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
    backgroundColor: "#000000",
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
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
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#000000",
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  photoSection: {
    marginBottom: Spacing.md,
  },
  photoButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  photoButton: {
    flex: 1,
    height: 80,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  photoButtonText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  photoPreview: {
    height: 160,
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
    padding: 6,
  },
  optionalText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  formSection: {
    marginBottom: Spacing.md,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000000",
  },
  pickerButton: {
    height: 52,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerButtonSelected: {
    borderColor: "#000000",
  },
  pickerText: {
    fontSize: 16,
    color: "#000000",
  },
  pickerPlaceholder: {
    color: "#9CA3AF",
  },
  textInput: {
    height: 52,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
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
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  categoryCardSelected: {
    backgroundColor: "#000000",
    borderColor: "#000000",
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#000000",
  },
  categoryTextSelected: {
    color: "#FFFFFF",
  },
  submitButton: {
    backgroundColor: "#000000",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
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
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  detailedButtonText: {
    fontSize: 14,
    color: "#6B7280",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
  },
  modalSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: "#F3F4F6",
    gap: Spacing.sm,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  optionItemSelected: {
    backgroundColor: "#F9FAFB",
  },
  optionText: {
    fontSize: 16,
    color: "#000000",
  },
  optionTextSelected: {
    fontWeight: "600",
  },
});
