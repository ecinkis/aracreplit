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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";

const BRANDS = ["Audi", "BMW", "Mercedes", "Volkswagen", "Toyota", "Honda", "Ford", "Renault", "Fiat", "Hyundai", "Kia", "Opel", "Peugeot", "Citroen"];
const FUEL_TYPES = ["Benzin", "Dizel", "Hibrit", "Elektrik", "LPG"];
const TRANSMISSIONS = ["Manuel", "Otomatik"];

function ChipSelect({
  options,
  selected,
  onSelect,
  multiSelect = false,
}: {
  options: string[];
  selected: string | string[];
  onSelect: (value: string) => void;
  multiSelect?: boolean;
}) {
  const isSelected = (option: string) =>
    multiSelect
      ? (selected as string[]).includes(option)
      : selected === option;

  return (
    <View style={styles.chipContainer}>
      {options.map((option) => (
        <Pressable
          key={option}
          style={[
            styles.chip,
            isSelected(option) && styles.chipSelected,
          ]}
          onPress={() => {
            Haptics.selectionAsync();
            onSelect(option);
          }}
        >
          <ThemedText
            style={[
              styles.chipText,
              isSelected(option) && styles.chipTextSelected,
            ]}
          >
            {option}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

export default function QuickCreateListingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [photos, setPhotos] = useState<string[]>([]);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [km, setKm] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [transmission, setTransmission] = useState("");
  const [onlySwap, setOnlySwap] = useState(true);
  const [preferredBrands, setPreferredBrands] = useState<string[]>([]);

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
      Alert.alert("Basarili", "Ilaniniz yayinlandi!", [
        { text: "Tamam", onPress: () => navigation.goBack() },
      ]);
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Hata", "Ilan olusturulurken bir hata olustu.");
    },
  });

  const pickImage = async () => {
    if (photos.length >= 10) {
      Alert.alert("Uyari", "En fazla 10 fotograf ekleyebilirsiniz.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 10 - photos.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newPhotos = result.assets.map((asset) => asset.uri);
      setPhotos([...photos, ...newPhotos]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const removePhoto = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handlePreferredBrandToggle = (brandName: string) => {
    if (preferredBrands.includes(brandName)) {
      setPreferredBrands(preferredBrands.filter((b) => b !== brandName));
    } else {
      setPreferredBrands([...preferredBrands, brandName]);
    }
  };

  const handleSubmit = () => {
    if (photos.length < 3) {
      Alert.alert("Uyari", "En az 3 fotograf eklemelisiniz.");
      return;
    }
    if (!brand || !model || !year || !km || !fuelType || !transmission) {
      Alert.alert("Uyari", "Lutfen tum alanlari doldurun.");
      return;
    }

    createMutation.mutate({
      userId: user?.id,
      brand,
      model,
      year: parseInt(year),
      km: parseInt(km.replace(/\D/g, "")),
      fuelType,
      transmission,
      city: "Istanbul",
      photos,
      swapActive: true,
      onlySwap,
      acceptsCashDiff: !onlySwap,
      preferredBrands,
    });
  };

  const isValid =
    photos.length >= 3 &&
    brand &&
    model &&
    year &&
    km &&
    fuelType &&
    transmission;

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 100 },
        ]}
      >
        <ThemedText style={styles.sectionTitle}>Fotograflar (min 3)</ThemedText>
        <View style={styles.photosContainer}>
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoWrapper}>
              <Image source={{ uri: photo }} style={styles.photo} />
              <Pressable
                style={styles.removePhotoButton}
                onPress={() => removePhoto(index)}
              >
                <Feather name="x" size={16} color="#FFFFFF" />
              </Pressable>
            </View>
          ))}
          {photos.length < 10 ? (
            <Pressable style={styles.addPhotoButton} onPress={pickImage}>
              <Feather name="camera" size={24} color="#6B7280" />
              <ThemedText style={styles.addPhotoText}>Ekle</ThemedText>
            </Pressable>
          ) : null}
        </View>

        <ThemedText style={styles.sectionTitle}>Marka</ThemedText>
        <ChipSelect options={BRANDS} selected={brand} onSelect={setBrand} />

        <ThemedText style={styles.sectionTitle}>Model</ThemedText>
        <TextInput
          style={styles.input}
          value={model}
          onChangeText={setModel}
          placeholder="Model girin"
          placeholderTextColor="#9CA3AF"
        />

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <ThemedText style={styles.sectionTitle}>Yil</ThemedText>
            <TextInput
              style={styles.input}
              value={year}
              onChangeText={setYear}
              placeholder="2020"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              maxLength={4}
            />
          </View>
          <View style={styles.halfInput}>
            <ThemedText style={styles.sectionTitle}>Kilometre</ThemedText>
            <TextInput
              style={styles.input}
              value={km}
              onChangeText={(text) => setKm(text.replace(/\D/g, ""))}
              placeholder="50000"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
            />
          </View>
        </View>

        <ThemedText style={styles.sectionTitle}>Yakit</ThemedText>
        <ChipSelect options={FUEL_TYPES} selected={fuelType} onSelect={setFuelType} />

        <ThemedText style={styles.sectionTitle}>Vites</ThemedText>
        <ChipSelect options={TRANSMISSIONS} selected={transmission} onSelect={setTransmission} />

        <ThemedText style={styles.sectionTitle}>Takas Tercihi</ThemedText>
        <View style={styles.toggleContainer}>
          <Pressable
            style={[
              styles.toggleButton,
              onlySwap && styles.toggleButtonSelected,
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              setOnlySwap(true);
            }}
          >
            <ThemedText style={[styles.toggleText, onlySwap && styles.toggleTextSelected]}>
              Sadece Takas
            </ThemedText>
          </Pressable>
          <Pressable
            style={[
              styles.toggleButton,
              !onlySwap && styles.toggleButtonSelected,
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              setOnlySwap(false);
            }}
          >
            <ThemedText style={[styles.toggleText, !onlySwap && styles.toggleTextSelected]}>
              Takas + Nakit
            </ThemedText>
          </Pressable>
        </View>

        <ThemedText style={styles.sectionTitle}>Kabul Ettigim Markalar</ThemedText>
        <ChipSelect
          options={BRANDS}
          selected={preferredBrands}
          onSelect={handlePreferredBrandToggle}
          multiSelect
        />

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
            <ThemedText style={styles.submitButtonText}>Ilani Yayinla</ThemedText>
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
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000000",
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  photosContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  photoWrapper: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  removePhotoButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: BorderRadius.full,
    padding: 4,
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  addPhotoText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: "#F3F4F6",
  },
  chipSelected: {
    backgroundColor: "#000000",
  },
  chipText: {
    fontSize: 13,
    color: "#374151",
  },
  chipTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  input: {
    height: 48,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    color: "#000000",
  },
  row: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  toggleContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  toggleButtonSelected: {
    backgroundColor: "#000000",
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  toggleTextSelected: {
    color: "#FFFFFF",
  },
  submitButton: {
    backgroundColor: "#000000",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
