import React, { useState, useMemo, useRef } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
  Modal,
  FlatList,
  Text,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, Typography, BrandColors } from "@/constants/theme";
import { apiRequest, getApiUrl } from "@/lib/query-client";
import { 
  BRAND_NAMES, 
  getModelsByBrand, 
  getVariantsByBrandModel,
  BODY_TYPES,
  FUEL_TYPES,
  TRANSMISSIONS,
  TRIM_PACKAGES,
} from "@/constants/vehicleData";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CITIES = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep", "Şanlıurfa", "Kocaeli", "Mersin", "Diyarbakır", "Hatay", "Manisa", "Kayseri"];
const CAR_PARTS = ["Ön Tampon", "Arka Tampon", "Ön Kaput", "Ön Çamurluk Sol", "Ön Çamurluk Sağ", "Ön Kapı Sol", "Ön Kapı Sağ", "Arka Kapı Sol", "Arka Kapı Sağ", "Tavan", "Bagaj Kapağı", "Arka Çamurluk Sol", "Arka Çamurluk Sağ"];

const HEADER_HEIGHT = 110;

const STEPS = [
  { id: 1, title: "Fotograflar", icon: "camera" },
  { id: 2, title: "Arac Bilgileri", icon: "truck" },
  { id: 3, title: "Teknik Ozellikler", icon: "settings" },
  { id: 4, title: "Takas Tercihleri", icon: "refresh-cw" },
  { id: 5, title: "Arac Gecmisi", icon: "file-text" },
  { id: 6, title: "Onizleme", icon: "eye" },
];

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <View style={styles.stepIndicatorContainer}>
      <View style={styles.stepProgressBar}>
        <Animated.View 
          style={[
            styles.stepProgressFill, 
            { width: `${(currentStep / totalSteps) * 100}%` }
          ]} 
        />
      </View>
      <ThemedText style={styles.stepText}>
        Adım {currentStep} / {totalSteps}
      </ThemedText>
    </View>
  );
}

function SearchablePicker({
  label,
  placeholder,
  options,
  selected,
  onSelect,
  disabled = false,
}: {
  label: string;
  placeholder: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  disabled?: boolean;
}) {
  const { theme } = useTheme();
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
        style={[
          styles.pickerButton,
          disabled && { opacity: 0.5 },
        ]}
        onPress={() => {
          if (!disabled) {
            Haptics.selectionAsync();
            setModalVisible(true);
          }
        }}
        disabled={disabled}
      >
        <ThemedText
          style={[
            styles.pickerButtonText,
            !selected && { color: theme.textSecondary },
          ]}
        >
          {selected || placeholder}
        </ThemedText>
        <Feather name="chevron-down" size={20} color={theme.textSecondary} />
      </Pressable>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.backgroundDefault }]}>
          <View style={[styles.modalHeader, { paddingTop: insets.top + Spacing.sm }]}>
            <ThemedText style={styles.modalTitle}>{label}</ThemedText>
            <Pressable onPress={() => setModalVisible(false)}>
              <Feather name="x" size={24} color={theme.text} />
            </Pressable>
          </View>

          <View style={[styles.searchContainer, { backgroundColor: theme.backgroundSecondary }]}>
            <Feather name="search" size={20} color={theme.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Ara..."
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")}>
                <Feather name="x-circle" size={18} color={theme.textSecondary} />
              </Pressable>
            )}
          </View>

          <FlatList
            data={filteredOptions}
            keyExtractor={(item) => item}
            contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.lg }}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.optionItem,
                  selected === item && { backgroundColor: "#F3F4F6" },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  onSelect(item);
                  setModalVisible(false);
                  setSearchQuery("");
                }}
              >
                <ThemedText
                  style={[
                    styles.optionText,
                    selected === item && { color: "#000000", fontWeight: "600" },
                  ]}
                >
                  {item}
                </ThemedText>
                {selected === item && (
                  <Feather name="check" size={20} color="#000000" />
                )}
              </Pressable>
            )}
            ListEmptyComponent={
              <View style={styles.emptyList}>
                <ThemedText style={{ color: theme.textSecondary }}>
                  Sonuç bulunamadı
                </ThemedText>
              </View>
            }
          />
        </View>
      </Modal>
    </>
  );
}

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

export default function CreateListingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const scrollRef = useRef<ScrollView>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [photos, setPhotos] = useState<string[]>([]);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [km, setKm] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [transmission, setTransmission] = useState("");
  const [variant, setVariant] = useState("");
  const [trimPackage, setTrimPackage] = useState("");
  const [city, setCity] = useState("");
  const [onlySwap, setOnlySwap] = useState(true);
  const [preferredBrands, setPreferredBrands] = useState<string[]>([]);
  const [swapActive, setSwapActive] = useState(true);
  const [tramerRecord, setTramerRecord] = useState("");
  const [accidentFree, setAccidentFree] = useState(true);
  const [paintedParts, setPaintedParts] = useState<string[]>([]);
  const [replacedParts, setReplacedParts] = useState<string[]>([]);
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

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (photos.length < 3) {
          Alert.alert("Uyarı", "En az 3 fotoğraf eklemelisiniz.");
          return false;
        }
        return true;
      case 2:
        if (!year || parseInt(year) < 1980 || parseInt(year) > new Date().getFullYear() + 1) {
          Alert.alert("Uyarı", "Geçerli bir yıl girin.");
          return false;
        }
        if (!brand || !model) {
          Alert.alert("Uyarı", "Marka ve model seçmelisiniz.");
          return false;
        }
        if (!variant) {
          Alert.alert("Uyarı", "Varyant bilgisi girin.");
          return false;
        }
        if (!km) {
          Alert.alert("Uyarı", "Kilometre bilgisi girin.");
          return false;
        }
        return true;
      case 3:
        if (!bodyType || !fuelType || !transmission || !trimPackage || !city) {
          Alert.alert("Uyarı", "Kasa tipi, yakıt, vites, donanım ve şehir seçin.");
          return false;
        }
        return true;
      case 4:
        return true;
      case 5:
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStep(currentStep + 1);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  const prevStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentStep(currentStep - 1);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const [isUploading, setIsUploading] = useState(false);

  const uploadPhoto = async (uri: string): Promise<string> => {
    try {
      let base64: string;
      
      // Use ImageManipulator to ensure we get a readable local file URI
      // This handles ph://, assets-library://, and other special URI schemes
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      
      base64 = manipResult.base64 || "";
      
      if (!base64) {
        // Fallback to FileSystem if base64 not returned
        base64 = await FileSystem.readAsStringAsync(manipResult.uri, {
          encoding: "base64",
        });
      }
      
      const dataUrl = `data:image/jpeg;base64,${base64}`;
      
      const response = await fetch(new URL("/api/upload", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      return new URL(data.url, getApiUrl()).toString();
    } catch (error) {
      console.error("Photo upload error:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    try {
      setIsUploading(true);
      
      const uploadedUrls = await Promise.all(photos.map(uploadPhoto));
      
      createMutation.mutate({
        userId: user?.id,
        brand,
        model,
        year: parseInt(year),
        km: parseInt(km.replace(/\D/g, "")),
        bodyType,
        fuelType,
        transmission,
        variant,
        trimPackage,
        city,
        photos: uploadedUrls,
        swapActive,
        onlySwap,
        acceptsCashDiff: !onlySwap,
        preferredBrands,
        tramerRecord: tramerRecord ? parseInt(tramerRecord.replace(/\D/g, "")) : 0,
        accidentFree,
        paintedParts,
        replacedParts,
        description,
        estimatedValue: estimatedValue ? parseInt(estimatedValue.replace(/\D/g, "")) : null,
      });
    } catch (error) {
      Alert.alert("Hata", "Fotoğraflar yüklenirken bir hata oluştu.");
    } finally {
      setIsUploading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Animated.View entering={FadeIn} style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <View style={styles.stepIconContainer}>
                <Feather name="camera" size={24} color="#000000" />
              </View>
              <ThemedText style={styles.stepTitle}>Araç Fotoğrafları</ThemedText>
              <ThemedText style={[styles.stepDescription, { color: theme.textSecondary }]}>
                Aracınızın en az 3, en fazla 10 fotoğrafını ekleyin. İlk fotoğraf kapak görseli olarak kullanılacak.
              </ThemedText>
            </View>

            <View style={styles.photosGrid}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoWrapper}>
                  <Image source={{ uri: photo }} style={styles.photo} />
                  {index === 0 && (
                    <View style={styles.coverBadge}>
                      <ThemedText style={styles.coverBadgeText}>Kapak</ThemedText>
                    </View>
                  )}
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
                  style={styles.addPhotoButton}
                  onPress={pickImage}
                >
                  <Feather name="plus" size={32} color="#9CA3AF" />
                  <ThemedText style={[styles.addPhotoText, { color: theme.textSecondary }]}>
                    Fotoğraf Ekle
                  </ThemedText>
                </Pressable>
              )}
            </View>

            <View style={styles.photoTips}>
              <View style={styles.tipRow}>
                <Feather name="check-circle" size={16} color={BrandColors.successGreen} />
                <ThemedText style={[styles.tipText, { color: theme.textSecondary }]}>Ön, arka ve yan görünümler</ThemedText>
              </View>
              <View style={styles.tipRow}>
                <Feather name="check-circle" size={16} color={BrandColors.successGreen} />
                <ThemedText style={[styles.tipText, { color: theme.textSecondary }]}>İç mekan ve gösterge paneli</ThemedText>
              </View>
              <View style={styles.tipRow}>
                <Feather name="check-circle" size={16} color={BrandColors.successGreen} />
                <ThemedText style={[styles.tipText, { color: theme.textSecondary }]}>Motor bölümü</ThemedText>
              </View>
            </View>
          </Animated.View>
        );

      case 2:
        const availableModels = brand ? getModelsByBrand(brand) : [];
        const currentYear = new Date().getFullYear();
        const yearOptions = Array.from({ length: currentYear - 1989 }, (_, i) => String(currentYear - i));
        return (
          <Animated.View entering={FadeIn} style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <View style={styles.stepIconContainer}>
                <Feather name="truck" size={24} color="#000000" />
              </View>
              <ThemedText style={styles.stepTitle}>Arac Bilgileri</ThemedText>
              <ThemedText style={[styles.stepDescription, { color: theme.textSecondary }]}>
                Aracınızın marka, model ve varyant bilgilerini seçin.
              </ThemedText>
            </View>

            <ThemedText style={styles.fieldLabel}>Model Yılı</ThemedText>
            <SearchablePicker
              label="Model Yılı Seçin"
              placeholder="Model yılı seçin..."
              options={yearOptions}
              selected={year}
              onSelect={setYear}
            />

            <ThemedText style={styles.fieldLabel}>Marka</ThemedText>
            <SearchablePicker
              label="Marka Seçin"
              placeholder="Marka seçin..."
              options={BRAND_NAMES}
              selected={brand}
              onSelect={(selectedBrand) => {
                setBrand(selectedBrand);
                setModel("");
              }}
            />

            <ThemedText style={styles.fieldLabel}>Seri / Model</ThemedText>
            <SearchablePicker
              label="Model Seçin"
              placeholder={brand ? "Model seçin..." : "Önce marka seçin"}
              options={availableModels}
              selected={model}
              onSelect={setModel}
              disabled={!brand}
            />

            <ThemedText style={styles.fieldLabel}>Varyant (Motor)</ThemedText>
            <TextInput
              style={styles.input}
              value={variant}
              onChangeText={setVariant}
              placeholder="Örn: 320i, 1.6 TDI, 2.0 Hybrid"
              placeholderTextColor={theme.textSecondary}
            />

            <ThemedText style={styles.fieldLabel}>Kilometre</ThemedText>
            <TextInput
              style={styles.input}
              value={km ? `${parseInt(km).toLocaleString("tr-TR")}` : ""}
              onChangeText={(text) => setKm(text.replace(/\D/g, ""))}
              placeholder="50.000"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
            />
          </Animated.View>
        );

      case 3:
        return (
          <Animated.View entering={FadeIn} style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <View style={styles.stepIconContainer}>
                <Feather name="settings" size={24} color="#000000" />
              </View>
              <ThemedText style={styles.stepTitle}>Teknik Ozellikler</ThemedText>
              <ThemedText style={[styles.stepDescription, { color: theme.textSecondary }]}>
                Kasa tipi, yakıt ve donanım bilgilerini seçin.
              </ThemedText>
            </View>

            <ThemedText style={styles.fieldLabel}>Kasa Tipi</ThemedText>
            <ChipSelect options={BODY_TYPES} selected={bodyType} onSelect={setBodyType} />

            <ThemedText style={styles.fieldLabel}>Yakıt Tipi</ThemedText>
            <ChipSelect options={FUEL_TYPES} selected={fuelType} onSelect={setFuelType} />

            <ThemedText style={styles.fieldLabel}>Vites</ThemedText>
            <ChipSelect options={TRANSMISSIONS} selected={transmission} onSelect={setTransmission} />

            <ThemedText style={styles.fieldLabel}>Donanım Paketi</ThemedText>
            <SearchablePicker
              label="Donanım Paketi Seçin"
              placeholder="Donanım paketi seçin..."
              options={TRIM_PACKAGES}
              selected={trimPackage}
              onSelect={setTrimPackage}
            />

            <ThemedText style={styles.fieldLabel}>Şehir</ThemedText>
            <SearchablePicker
              label="Şehir Seçin"
              placeholder="Şehir seçin..."
              options={CITIES}
              selected={city}
              onSelect={setCity}
            />

            <ThemedText style={styles.fieldLabel}>Tahmini Değer (TL) - Opsiyonel</ThemedText>
            <TextInput
              style={styles.input}
              value={estimatedValue ? `${parseInt(estimatedValue).toLocaleString("tr-TR")}` : ""}
              onChangeText={(text) => setEstimatedValue(text.replace(/\D/g, ""))}
              placeholder="500.000"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
            />

            <ThemedText style={styles.fieldLabel}>Açıklama (Opsiyonel)</ThemedText>
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              placeholder="Aracınız hakkında ek bilgiler yazın..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </Animated.View>
        );

      case 4:
        return (
          <Animated.View entering={FadeIn} style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <View style={styles.stepIconContainer}>
                <Feather name="refresh-cw" size={24} color="#000000" />
              </View>
              <ThemedText style={styles.stepTitle}>Takas Tercihleri</ThemedText>
              <ThemedText style={[styles.stepDescription, { color: theme.textSecondary }]}>
                Takas şartlarınızı ve kabul ettiğiniz markaları belirleyin.
              </ThemedText>
            </View>

            <ThemedText style={styles.fieldLabel}>Takas Türü</ThemedText>
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
                <Feather name="repeat" size={20} color={onlySwap ? "#FFFFFF" : theme.text} />
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
                <Feather name="dollar-sign" size={20} color={!onlySwap ? "#FFFFFF" : theme.text} />
                <ThemedText style={[styles.toggleText, !onlySwap && styles.toggleTextSelected]}>
                  Takas + Nakit
                </ThemedText>
              </Pressable>
            </View>

            <View style={styles.switchRow}>
              <View>
                <ThemedText style={styles.switchLabel}>Takas için Aktif</ThemedText>
                <ThemedText style={[styles.switchDescription, { color: theme.textSecondary }]}>
                  İlanınız takas aramasında görünsün
                </ThemedText>
              </View>
              <Pressable
                style={[styles.switch, swapActive ? styles.switchOn : styles.switchOff]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSwapActive(!swapActive);
                }}
              >
                <View style={[styles.switchThumb, swapActive ? styles.switchThumbOn : styles.switchThumbOff]} />
              </Pressable>
            </View>

            <ThemedText style={styles.fieldLabel}>Kabul Ettiğim Markalar (Opsiyonel)</ThemedText>
            <ThemedText style={[styles.fieldHint, { color: theme.textSecondary }]}>
              Boş bırakırsanız tüm markalar kabul edilir
            </ThemedText>
            <ChipSelect
              options={BRAND_NAMES}
              selected={preferredBrands}
              onSelect={handlePreferredBrandToggle}
              multiSelect
            />
          </Animated.View>
        );

      case 5:
        return (
          <Animated.View entering={FadeIn} style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <View style={styles.stepIconContainer}>
                <Feather name="file-text" size={24} color="#000000" />
              </View>
              <ThemedText style={styles.stepTitle}>Arac Gecmisi</ThemedText>
              <ThemedText style={[styles.stepDescription, { color: theme.textSecondary }]}>
                Aracınızın hasar geçmişi ve tramer kayıtlarını belirtin.
              </ThemedText>
            </View>

            <View style={styles.switchRow}>
              <View>
                <ThemedText style={styles.switchLabel}>Kazasız</ThemedText>
                <ThemedText style={[styles.switchDescription, { color: theme.textSecondary }]}>
                  Araç hiç kaza yapmadı
                </ThemedText>
              </View>
              <Pressable
                style={[styles.switch, accidentFree ? styles.switchOn : styles.switchOff]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setAccidentFree(!accidentFree);
                }}
              >
                <View style={[styles.switchThumb, accidentFree ? styles.switchThumbOn : styles.switchThumbOff]} />
              </Pressable>
            </View>

            <ThemedText style={styles.fieldLabel}>Tramer Kaydı (TL)</ThemedText>
            <TextInput
              style={styles.input}
              value={tramerRecord ? `${parseInt(tramerRecord).toLocaleString("tr-TR")}` : ""}
              onChangeText={(text) => setTramerRecord(text.replace(/\D/g, ""))}
              placeholder="0"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
            />

            <ThemedText style={styles.fieldLabel}>Boyalı Parçalar</ThemedText>
            <ThemedText style={[styles.fieldHint, { color: theme.textSecondary }]}>
              Boyanan parçaları seçin
            </ThemedText>
            <ChipSelect
              options={CAR_PARTS}
              selected={paintedParts}
              onSelect={handlePaintedPartToggle}
              multiSelect
            />

            <ThemedText style={styles.fieldLabel}>Değişen Parçalar</ThemedText>
            <ThemedText style={[styles.fieldHint, { color: theme.textSecondary }]}>
              Değiştirilen parçaları seçin
            </ThemedText>
            <ChipSelect
              options={CAR_PARTS}
              selected={replacedParts}
              onSelect={handleReplacedPartToggle}
              multiSelect
            />
          </Animated.View>
        );

      case 6:
        return (
          <Animated.View entering={FadeIn} style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <View style={styles.stepIconContainer}>
                <Feather name="eye" size={24} color="#000000" />
              </View>
              <ThemedText style={styles.stepTitle}>Onizleme</ThemedText>
              <ThemedText style={[styles.stepDescription, { color: theme.textSecondary }]}>
                İlan bilgilerinizi kontrol edin ve yayınlayın.
              </ThemedText>
            </View>

            <View style={[styles.previewCard, { backgroundColor: theme.backgroundSecondary }]}>
              {photos.length > 0 && (
                <Image source={{ uri: photos[0] }} style={styles.previewImage} />
              )}
              <View style={styles.previewContent}>
                <ThemedText style={styles.previewTitle}>
                  {[year, brand, model, variant].filter(Boolean).join(" ")}
                </ThemedText>
                <ThemedText style={[styles.previewSubtitle, { color: theme.textSecondary }]}>
                  {[trimPackage, `${km ? parseInt(km).toLocaleString("tr-TR") : "0"} km`].filter(Boolean).join(" | ")}
                </ThemedText>

                <View style={styles.previewTags}>
                  <View style={styles.previewTag}>
                    <ThemedText style={styles.previewTagText}>{bodyType}</ThemedText>
                  </View>
                  <View style={styles.previewTag}>
                    <ThemedText style={styles.previewTagText}>{fuelType}</ThemedText>
                  </View>
                  <View style={styles.previewTag}>
                    <ThemedText style={styles.previewTagText}>{transmission}</ThemedText>
                  </View>
                  <View style={styles.previewTag}>
                    <ThemedText style={styles.previewTagText}>{city}</ThemedText>
                  </View>
                </View>

                <View style={styles.previewDivider} />

                <View style={styles.previewRow}>
                  <ThemedText style={[styles.previewLabel, { color: theme.textSecondary }]}>Takas Tercihi:</ThemedText>
                  <ThemedText style={styles.previewValue}>{onlySwap ? "Sadece Takas" : "Takas + Nakit"}</ThemedText>
                </View>

                {estimatedValue ? (
                  <View style={styles.previewRow}>
                    <ThemedText style={[styles.previewLabel, { color: theme.textSecondary }]}>Tahmini Değer:</ThemedText>
                    <ThemedText style={styles.previewValue}>{parseInt(estimatedValue).toLocaleString("tr-TR")} TL</ThemedText>
                  </View>
                ) : null}

                <View style={styles.previewRow}>
                  <ThemedText style={[styles.previewLabel, { color: theme.textSecondary }]}>Kaza Durumu:</ThemedText>
                  <ThemedText style={[styles.previewValue, { color: accidentFree ? BrandColors.successGreen : BrandColors.alertRed }]}>
                    {accidentFree ? "Kazasız" : "Kazalı"}
                  </ThemedText>
                </View>

                {tramerRecord ? (
                  <View style={styles.previewRow}>
                    <ThemedText style={[styles.previewLabel, { color: theme.textSecondary }]}>Tramer:</ThemedText>
                    <ThemedText style={styles.previewValue}>{parseInt(tramerRecord).toLocaleString("tr-TR")} TL</ThemedText>
                  </View>
                ) : null}

                <View style={styles.previewRow}>
                  <ThemedText style={[styles.previewLabel, { color: theme.textSecondary }]}>Fotoğraf:</ThemedText>
                  <ThemedText style={styles.previewValue}>{photos.length} adet</ThemedText>
                </View>
              </View>
            </View>
          </Animated.View>
        );

      default:
        return null;
    }
  };

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
          <Text style={styles.headerTitle}>Detayli Ilan</Text>
        </View>
      </View>

      <StepIndicator currentStep={currentStep} totalSteps={STEPS.length} />

      <KeyboardAwareScrollViewCompat
        ref={scrollRef}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {renderStepContent()}
      </KeyboardAwareScrollViewCompat>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        {currentStep > 1 ? (
          <Pressable style={styles.footerBackButton} onPress={prevStep}>
            <Feather name="arrow-left" size={20} color="#000000" />
          </Pressable>
        ) : null}

        {currentStep < STEPS.length ? (
          <Pressable
            style={[styles.nextButton, currentStep === 1 && styles.fullWidthButton]}
            onPress={nextStep}
          >
            <ThemedText style={styles.nextButtonText}>Devam</ThemedText>
            <Feather name="arrow-right" size={20} color="#FFFFFF" />
          </Pressable>
        ) : (
          <Pressable
            style={[styles.submitButton, (createMutation.isPending || isUploading) && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={createMutation.isPending || isUploading}
          >
            {(createMutation.isPending || isUploading) ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Feather name="zap" size={20} color="#FFFFFF" />
                <ThemedText style={styles.submitButtonText}>Yayinla</ThemedText>
              </>
            )}
          </Pressable>
        )}
      </View>
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
  stepIndicatorContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  stepProgressBar: {
    height: 4,
    backgroundColor: "#E5E8EB",
    borderRadius: 2,
    marginBottom: Spacing.xs,
  },
  stepProgressFill: {
    height: "100%",
    backgroundColor: "#000000",
    borderRadius: 2,
  },
  stepText: {
    ...Typography.caption,
    color: "#9CA3AF",
    textAlign: "center",
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  stepIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
    backgroundColor: "#F3F4F6",
  },
  stepTitle: {
    ...Typography.h2,
    marginBottom: Spacing.xs,
  },
  stepDescription: {
    ...Typography.body,
    textAlign: "center",
    paddingHorizontal: Spacing.lg,
  },
  fieldLabel: {
    ...Typography.small,
    fontWeight: "600",
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  fieldHint: {
    ...Typography.caption,
    marginBottom: Spacing.sm,
    marginTop: -Spacing.xs,
  },
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  photoWrapper: {
    width: (SCREEN_WIDTH - Spacing.md * 2 - Spacing.sm * 2) / 3,
    aspectRatio: 1,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  coverBadge: {
    position: "absolute",
    top: 4,
    left: 4,
    backgroundColor: "#000000",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  coverBadgeText: {
    ...Typography.caption,
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 9,
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
    width: (SCREEN_WIDTH - Spacing.md * 2 - Spacing.sm * 2) / 3,
    aspectRatio: 1,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  addPhotoText: {
    ...Typography.caption,
    marginTop: 4,
  },
  photoTips: {
    marginTop: Spacing.lg,
    gap: Spacing.xs,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  tipText: {
    ...Typography.small,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    rowGap: Spacing.md,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    backgroundColor: "#F3F4F6",
  },
  chipSelected: {
    backgroundColor: "#000000",
  },
  chipText: {
    ...Typography.small,
  },
  chipTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  input: {
    height: 56,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: 17,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  textArea: {
    minHeight: 100,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 15,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: "#F3F4F6",
  },
  toggleButtonSelected: {
    backgroundColor: "#000000",
  },
  toggleText: {
    ...Typography.small,
    fontWeight: "500",
  },
  toggleTextSelected: {
    color: "#FFFFFF",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
  },
  switchLabel: {
    ...Typography.body,
    fontWeight: "500",
  },
  switchDescription: {
    ...Typography.caption,
    marginTop: 2,
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
  previewCard: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: 200,
  },
  previewContent: {
    padding: Spacing.md,
  },
  previewTitle: {
    ...Typography.h3,
    marginBottom: 4,
  },
  previewSubtitle: {
    ...Typography.body,
    marginBottom: Spacing.md,
  },
  previewTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  previewTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: "#F3F4F6",
  },
  previewTagText: {
    ...Typography.caption,
    fontWeight: "500",
    color: "#374151",
  },
  previewDivider: {
    height: 1,
    backgroundColor: "#E5E8EB",
    marginVertical: Spacing.md,
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  previewLabel: {
    ...Typography.small,
  },
  previewValue: {
    ...Typography.small,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: "#FFFFFF",
  },
  footerBackButton: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.md,
    backgroundColor: "#F3F4F6",
  },
  nextButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: "#000000",
  },
  fullWidthButton: {
    flex: 1,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  submitButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: "#000000",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  pickerButtonText: {
    ...Typography.body,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E8EB",
  },
  modalTitle: {
    ...Typography.h3,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    padding: 0,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  optionText: {
    ...Typography.body,
  },
  emptyList: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
});
