import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
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
import { ThemedView } from "@/components/ThemedView";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, Typography, BrandColors } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";

const BRANDS = ["Audi", "BMW", "Mercedes", "Volkswagen", "Toyota", "Honda", "Ford", "Renault", "Fiat", "Hyundai", "Kia", "Opel", "Peugeot", "Citroen", "Seat", "Skoda", "Volvo", "Nissan", "Mazda"];
const FUEL_TYPES = ["Benzin", "Dizel", "Hibrit", "Elektrik", "LPG"];
const TRANSMISSIONS = ["Manuel", "Otomatik"];
const CITIES = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep", "Şanlıurfa", "Kocaeli", "Mersin", "Diyarbakır", "Hatay", "Manisa", "Kayseri"];
const CAR_PARTS = ["Ön Tampon", "Arka Tampon", "Ön Kaput", "Ön Çamurluk Sol", "Ön Çamurluk Sağ", "Ön Kapı Sol", "Ön Kapı Sağ", "Arka Kapı Sol", "Arka Kapı Sağ", "Tavan", "Bagaj Kapağı", "Arka Çamurluk Sol", "Arka Çamurluk Sağ"];

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
  const { theme } = useTheme();
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
            { backgroundColor: theme.backgroundSecondary },
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

export default function CreateListingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [photos, setPhotos] = useState<string[]>([]);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [km, setKm] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [transmission, setTransmission] = useState("");
  const [city, setCity] = useState("");
  const [onlySwap, setOnlySwap] = useState(true);
  const [preferredBrands, setPreferredBrands] = useState<string[]>([]);
  const [swapActive, setSwapActive] = useState(true);
  const [tramerRecord, setTramerRecord] = useState("");
  const [accidentFree, setAccidentFree] = useState(true);
  const [paintedParts, setPaintedParts] = useState<string[]>([]);
  const [replacedParts, setReplacedParts] = useState<string[]>([]);

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
      Alert.alert("Başarılı", "İlanınız yayınlandı!", [
        { text: "Tamam", onPress: () => navigation.goBack() },
      ]);
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Hata", "İlan oluşturulurken bir hata oluştu.");
    },
  });

  const pickImage = async () => {
    if (photos.length >= 10) {
      Alert.alert("Uyarı", "En fazla 10 fotoğraf ekleyebilirsiniz.");
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

  const handlePaintedPartToggle = (part: string) => {
    if (paintedParts.includes(part)) {
      setPaintedParts(paintedParts.filter((p) => p !== part));
    } else {
      setPaintedParts([...paintedParts, part]);
    }
  };

  const handleReplacedPartToggle = (part: string) => {
    if (replacedParts.includes(part)) {
      setReplacedParts(replacedParts.filter((p) => p !== part));
    } else {
      setReplacedParts([...replacedParts, part]);
    }
  };

  const handleSubmit = () => {
    if (photos.length < 3) {
      Alert.alert("Uyarı", "En az 3 fotoğraf eklemelisiniz.");
      return;
    }
    if (!brand || !model || !year || !km || !fuelType || !transmission || !city) {
      Alert.alert("Uyarı", "Lütfen tüm alanları doldurun.");
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
      city,
      photos,
      swapActive,
      onlySwap,
      acceptsCashDiff: !onlySwap,
      preferredBrands,
      tramerRecord: tramerRecord ? parseInt(tramerRecord.replace(/\D/g, "")) : 0,
      accidentFree,
      paintedParts,
      replacedParts,
    });
  };

  const isValid =
    photos.length >= 3 &&
    brand &&
    model &&
    year &&
    km &&
    fuelType &&
    transmission &&
    city;

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={() => navigation.goBack()}>
          <Feather name="x" size={24} color={theme.text} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Hızlı İlan Ver</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 100 },
        ]}
      >
        <ThemedText style={styles.sectionTitle}>Fotoğraflar (min 3)</ThemedText>
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
          {photos.length < 10 && (
            <Pressable
              style={[styles.addPhotoButton, { backgroundColor: theme.backgroundSecondary }]}
              onPress={pickImage}
            >
              <Feather name="camera" size={24} color={theme.textSecondary} />
              <ThemedText style={[styles.addPhotoText, { color: theme.textSecondary }]}>
                Ekle
              </ThemedText>
            </Pressable>
          )}
        </View>

        <ThemedText style={styles.sectionTitle}>Marka</ThemedText>
        <ChipSelect options={BRANDS} selected={brand} onSelect={setBrand} />

        <ThemedText style={styles.sectionTitle}>Model</ThemedText>
        <TextInput
          style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
          value={model}
          onChangeText={setModel}
          placeholder="Model girin"
          placeholderTextColor={theme.textSecondary}
        />

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <ThemedText style={styles.sectionTitle}>Yıl</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
              value={year}
              onChangeText={setYear}
              placeholder="2020"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
              maxLength={4}
            />
          </View>
          <View style={styles.halfInput}>
            <ThemedText style={styles.sectionTitle}>Kilometre</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
              value={km}
              onChangeText={(text) => setKm(text.replace(/\D/g, ""))}
              placeholder="50000"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <ThemedText style={styles.sectionTitle}>Yakıt</ThemedText>
        <ChipSelect options={FUEL_TYPES} selected={fuelType} onSelect={setFuelType} />

        <ThemedText style={styles.sectionTitle}>Vites</ThemedText>
        <ChipSelect options={TRANSMISSIONS} selected={transmission} onSelect={setTransmission} />

        <ThemedText style={styles.sectionTitle}>Şehir</ThemedText>
        <ChipSelect options={CITIES} selected={city} onSelect={setCity} />

        <ThemedText style={styles.sectionTitle}>Takas Tercihi</ThemedText>
        <View style={styles.toggleContainer}>
          <Pressable
            style={[
              styles.toggleButton,
              { backgroundColor: theme.backgroundSecondary },
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
              { backgroundColor: theme.backgroundSecondary },
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

        <ThemedText style={styles.sectionTitle}>Kabul Ettiğim Markalar</ThemedText>
        <ChipSelect
          options={BRANDS}
          selected={preferredBrands}
          onSelect={handlePreferredBrandToggle}
          multiSelect
        />

        <View style={[styles.historySection, { backgroundColor: theme.backgroundSecondary }]}>
          <View style={styles.historySectionHeader}>
            <Feather name="file-text" size={20} color={BrandColors.primaryBlue} />
            <ThemedText style={styles.historySectionTitle}>Araç Geçmişi</ThemedText>
          </View>

          <View style={styles.historyRow}>
            <ThemedText style={styles.historyLabel}>Kazasız</ThemedText>
            <Pressable
              style={[
                styles.switch,
                accidentFree ? styles.switchOn : styles.switchOff,
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setAccidentFree(!accidentFree);
              }}
            >
              <View
                style={[
                  styles.switchThumb,
                  accidentFree ? styles.switchThumbOn : styles.switchThumbOff,
                ]}
              />
            </Pressable>
          </View>

          <ThemedText style={styles.historyLabel}>Tramer Kaydı (TL)</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text }]}
            value={tramerRecord}
            onChangeText={(text) => setTramerRecord(text.replace(/\D/g, ""))}
            placeholder="0"
            placeholderTextColor={theme.textSecondary}
            keyboardType="number-pad"
          />

          <ThemedText style={[styles.historyLabel, { marginTop: Spacing.md }]}>Boyalı Parçalar</ThemedText>
          <ChipSelect
            options={CAR_PARTS}
            selected={paintedParts}
            onSelect={handlePaintedPartToggle}
            multiSelect
          />

          <ThemedText style={[styles.historyLabel, { marginTop: Spacing.md }]}>Değişen Parçalar</ThemedText>
          <ChipSelect
            options={CAR_PARTS}
            selected={replacedParts}
            onSelect={handleReplacedPartToggle}
            multiSelect
          />
        </View>

        <View style={styles.swapActiveRow}>
          <ThemedText style={styles.swapActiveLabel}>Takas için aktif</ThemedText>
          <Pressable
            style={[
              styles.switch,
              swapActive ? styles.switchOn : styles.switchOff,
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              setSwapActive(!swapActive);
            }}
          >
            <View
              style={[
                styles.switchThumb,
                swapActive ? styles.switchThumbOn : styles.switchThumbOff,
              ]}
            />
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            !isValid && styles.submitButtonDisabled,
            pressed && isValid && { opacity: 0.9, transform: [{ scale: 0.98 }] },
          ]}
          onPress={handleSubmit}
          disabled={!isValid || createMutation.isPending}
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.submitButtonText}>İlanı Yayınla</ThemedText>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    ...Typography.h3,
  },
  content: {
    paddingHorizontal: Spacing.md,
  },
  sectionTitle: {
    ...Typography.small,
    fontWeight: "600",
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
    borderColor: "#E5E8EB",
  },
  addPhotoText: {
    ...Typography.caption,
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
  },
  chipSelected: {
    backgroundColor: BrandColors.primaryBlue,
  },
  chipText: {
    ...Typography.small,
  },
  chipTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  input: {
    height: 48,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
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
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  toggleButtonSelected: {
    backgroundColor: BrandColors.primaryBlue,
  },
  toggleText: {
    ...Typography.small,
    fontWeight: "500",
  },
  toggleTextSelected: {
    color: "#FFFFFF",
  },
  swapActiveRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  swapActiveLabel: {
    ...Typography.body,
  },
  switch: {
    width: 51,
    height: 31,
    borderRadius: 16,
    padding: 2,
  },
  switchOn: {
    backgroundColor: BrandColors.successGreen,
  },
  switchOff: {
    backgroundColor: "#E5E8EB",
  },
  switchThumb: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },
  switchThumbOn: {
    transform: [{ translateX: 20 }],
  },
  switchThumbOff: {
    transform: [{ translateX: 0 }],
  },
  submitButton: {
    backgroundColor: BrandColors.primaryBlue,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    ...Typography.button,
    color: "#FFFFFF",
  },
  historySection: {
    marginTop: Spacing.xl,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  historySectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  historySectionTitle: {
    ...Typography.body,
    fontWeight: "600",
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  historyLabel: {
    ...Typography.small,
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
});
