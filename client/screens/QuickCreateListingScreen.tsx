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
  Platform,
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
import { MODELS_BY_BRAND } from "@/data/vehicleModels";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CATEGORIES = [
  { id: "otomobil", name: "Otomobil", icon: "truck" },
  { id: "suv", name: "SUV / Pickup", icon: "compass" },
  { id: "elektrikli", name: "Elektrikli", icon: "zap" },
  { id: "motosiklet", name: "Motosiklet", icon: "wind" },
];

const MOTO_BRANDS = [
  "aprilia", "bajaj", "benelli", "cfmoto", "ducati", "gilera",
  "harley", "hero", "husqvarna", "indian", "kawasaki", "keeway",
  "kral", "ktm", "kymco", "mondial", "motoguzzi", "mv-agusta",
  "piaggio", "rks", "royal-enfield", "suzuki-moto", "sym",
  "triumph", "tvs", "vespa", "yamaha", "yuki", "zontes",
];

const EV_BRANDS = [
  "tesla", "togg", "byd", "polestar",
];

const SUV_MODELS: Record<string, string[]> = {
  "audi": ["Q2", "Q3", "Q4 e-tron", "Q5", "Q7", "Q8"],
  "bmw": ["X1", "X2", "X3", "X4", "X5", "X6", "X7", "iX", "iX1", "iX3"],
  "mercedes": ["GLA", "GLB", "GLC", "GLE", "GLS", "G Serisi", "EQA", "EQB", "EQC"],
  "volkswagen": ["T-Cross", "T-Roc", "Tiguan", "Touareg", "ID.4"],
  "volvo": ["XC40", "XC60", "XC90"],
  "hyundai": ["Kona", "Tucson", "Santa Fe", "Bayon"],
  "kia": ["Stonic", "Sportage", "Sorento", "Niro"],
  "toyota": ["C-HR", "RAV4", "Highlander", "Land Cruiser"],
  "honda": ["HR-V", "CR-V"],
  "nissan": ["Juke", "Qashqai", "X-Trail"],
  "ford": ["EcoSport", "Puma", "Kuga", "Explorer"],
  "renault": ["Captur", "Kadjar", "Koleos", "Austral"],
  "peugeot": ["2008", "3008", "5008"],
  "citroen": ["C3 Aircross", "C5 Aircross"],
  "opel": ["Crossland", "Grandland", "Mokka"],
  "skoda": ["Kamiq", "Karoq", "Kodiaq"],
  "seat": ["Arona", "Ateca", "Tarraco"],
  "cupra": ["Ateca", "Formentor"],
  "mazda": ["CX-3", "CX-5", "CX-30", "CX-60"],
  "subaru": ["XV", "Forester", "Outback"],
  "mitsubishi": ["ASX", "Eclipse Cross", "Outlander"],
  "jeep": ["Renegade", "Compass", "Cherokee", "Grand Cherokee", "Wrangler"],
  "land-rover": ["Defender", "Discovery", "Discovery Sport", "Range Rover", "Range Rover Sport", "Range Rover Evoque", "Range Rover Velar"],
  "dacia": ["Duster"],
  "ssangyong": ["Tivoli", "Korando", "Rexton"],
  "haval": ["Jolion", "H6"],
  "chery": ["Tiggo 4", "Tiggo 7", "Tiggo 8"],
  "fiat": ["500X"],
  "mg": ["ZS", "HS"],
  "ds": ["DS 3 Crossback", "DS 7 Crossback"],
  "lexus": ["NX", "RX", "UX"],
  "porsche": ["Cayenne", "Macan"],
  "maserati": ["Levante", "Grecale"],
  "jaguar": ["E-PACE", "F-PACE", "I-PACE"],
  "infiniti": ["QX50", "QX60"],
  "genesis": ["GV60", "GV70", "GV80"],
  "dodge": ["Durango"],
  "cadillac": ["XT4", "XT5", "Escalade"],
  "lincoln": ["Corsair", "Aviator", "Navigator"],
  "ram": ["1500"],
  "isuzu": ["D-Max"],
  "iveco": ["Daily"],
  "tata": ["Nexon", "Harrier"],
  "proton": ["X50", "X70"],
};

const BRAND_DISPLAY_NAMES: Record<string, string> = {
  "alfa-romeo": "Alfa Romeo",
  "aston-martin": "Aston Martin",
  "audi": "Audi",
  "bajaj": "Bajaj",
  "benelli": "Benelli",
  "bentley": "Bentley",
  "bmw": "BMW",
  "bugatti": "Bugatti",
  "buick": "Buick",
  "byd": "BYD",
  "cadillac": "Cadillac",
  "cfmoto": "CFMoto",
  "chery": "Chery",
  "chevrolet": "Chevrolet",
  "chrysler": "Chrysler",
  "citroen": "Citroen",
  "cupra": "Cupra",
  "dacia": "Dacia",
  "daewoo": "Daewoo",
  "daihatsu": "Daihatsu",
  "dfsk": "DFSK",
  "dodge": "Dodge",
  "ds": "DS",
  "ducati": "Ducati",
  "ferrari": "Ferrari",
  "fiat": "Fiat",
  "ford": "Ford",
  "geely": "Geely",
  "genesis": "Genesis",
  "gilera": "Gilera",
  "gmc": "GMC",
  "harley": "Harley-Davidson",
  "haval": "Haval",
  "hero": "Hero",
  "honda": "Honda",
  "hummer": "Hummer",
  "husqvarna": "Husqvarna",
  "hyundai": "Hyundai",
  "indian": "Indian",
  "infiniti": "Infiniti",
  "isuzu": "Isuzu",
  "iveco": "Iveco",
  "jac": "JAC",
  "jaguar": "Jaguar",
  "jeep": "Jeep",
  "kawasaki": "Kawasaki",
  "keeway": "Keeway",
  "kia": "Kia",
  "kral": "Kral",
  "ktm": "KTM",
  "kymco": "Kymco",
  "lada": "Lada",
  "lamborghini": "Lamborghini",
  "lancia": "Lancia",
  "land-rover": "Land Rover",
  "lexus": "Lexus",
  "lincoln": "Lincoln",
  "lotus": "Lotus",
  "maserati": "Maserati",
  "mazda": "Mazda",
  "mclaren": "McLaren",
  "mercedes": "Mercedes-Benz",
  "mg": "MG",
  "mini": "Mini",
  "mitsubishi": "Mitsubishi",
  "mondial": "Mondial",
  "motoguzzi": "Moto Guzzi",
  "mv-agusta": "MV Agusta",
  "nissan": "Nissan",
  "omoda": "Omoda",
  "opel": "Opel",
  "peugeot": "Peugeot",
  "piaggio": "Piaggio",
  "polestar": "Polestar",
  "porsche": "Porsche",
  "proton": "Proton",
  "ram": "RAM",
  "renault": "Renault",
  "rks": "RKS",
  "rolls-royce": "Rolls-Royce",
  "rover": "Rover",
  "royal-enfield": "Royal Enfield",
  "saab": "Saab",
  "seat": "SEAT",
  "skoda": "Skoda",
  "smart": "Smart",
  "ssangyong": "SsangYong",
  "subaru": "Subaru",
  "suzuki": "Suzuki",
  "suzuki-moto": "Suzuki (Moto)",
  "sym": "SYM",
  "tata": "Tata",
  "tesla": "Tesla",
  "togg": "TOGG",
  "toyota": "Toyota",
  "triumph": "Triumph",
  "tvs": "TVS",
  "vespa": "Vespa",
  "volkswagen": "Volkswagen",
  "volvo": "Volvo",
  "yamaha": "Yamaha",
  "yuki": "Yuki",
  "zontes": "Zontes",
  "aprilia": "Aprilia",
};

function getBrandsForCategory(categoryId: string): string[] {
  const allBrands = Object.keys(MODELS_BY_BRAND);

  if (categoryId === "motosiklet") {
    return MOTO_BRANDS.filter(b => allBrands.includes(b)).sort((a, b) =>
      (BRAND_DISPLAY_NAMES[a] || a).localeCompare(BRAND_DISPLAY_NAMES[b] || b, "tr")
    );
  }

  if (categoryId === "elektrikli") {
    return allBrands
      .filter(b => !MOTO_BRANDS.includes(b))
      .sort((a, b) =>
        (BRAND_DISPLAY_NAMES[a] || a).localeCompare(BRAND_DISPLAY_NAMES[b] || b, "tr")
      );
  }

  const carBrands = allBrands.filter(b => !MOTO_BRANDS.includes(b));
  return carBrands.sort((a, b) =>
    (BRAND_DISPLAY_NAMES[a] || a).localeCompare(BRAND_DISPLAY_NAMES[b] || b, "tr")
  );
}

function getModelsForBrandAndCategory(brandKey: string, categoryId: string): Array<{ id: string; name: string; years: string }> {
  const allModels = MODELS_BY_BRAND[brandKey] || [];

  if (categoryId === "suv") {
    const suvModelNames = SUV_MODELS[brandKey];
    if (suvModelNames) {
      const filtered = allModels.filter(m =>
        suvModelNames.some(sn => m.name.toLowerCase().includes(sn.toLowerCase()))
      );
      if (filtered.length > 0) return filtered;
    }
    return allModels;
  }

  if (categoryId === "elektrikli") {
    const evFiltered = allModels.filter(m => {
      const n = m.name.toLowerCase();
      return n.includes("e-tron") || n.includes("electric") || n.includes("ev") ||
        n.startsWith("i") || n.startsWith("eq") || n.startsWith("id.") ||
        EV_BRANDS.includes(brandKey);
    });
    if (evFiltered.length > 0) return evFiltered;
    return allModels;
  }

  if (categoryId === "otomobil") {
    const suvModelNames = SUV_MODELS[brandKey];
    if (suvModelNames) {
      return allModels.filter(m =>
        !suvModelNames.some(sn => m.name.toLowerCase() === sn.toLowerCase())
      );
    }
  }

  return allModels;
}

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
  const [category, setCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedModelName, setSelectedModelName] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");

  const [brandModalVisible, setBrandModalVisible] = useState(false);
  const [modelModalVisible, setModelModalVisible] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const [modelSearch, setModelSearch] = useState("");

  const filteredBrands = useMemo(() => {
    if (!category) return [];
    const brands = getBrandsForCategory(category);
    if (!brandSearch.trim()) return brands;
    const q = brandSearch.toLowerCase().trim();
    return brands.filter(b => {
      const displayName = BRAND_DISPLAY_NAMES[b] || b;
      return displayName.toLowerCase().includes(q);
    });
  }, [category, brandSearch]);

  const filteredModels = useMemo(() => {
    if (!selectedBrand || !category) return [];
    const models = getModelsForBrandAndCategory(selectedBrand, category);
    if (!modelSearch.trim()) return models;
    const q = modelSearch.toLowerCase().trim();
    return models.filter(m => m.name.toLowerCase().includes(q));
  }, [selectedBrand, category, modelSearch]);

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
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "listing-quota"] });
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch(e) {}

      Alert.alert(
        "Ilaniniz Onaya Gonderildi",
        "Ilaniniz kontrolden sonra aktif edilecektir. Onaylandiginda bildirim alacaksiniz.",
        [
          {
            text: "Tamam",
            onPress: () => {
              try { navigation.navigate("Main" as any); } catch(e) { navigation.goBack(); }
            },
          },
        ]
      );
    },
    onError: (error: any) => {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch(e) {}
      const message = error?.message || "Ilan olusturulurken bir hata olustu.";
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

  const handleCategorySelect = (catId: string) => {
    Haptics.selectionAsync();
    setCategory(catId);
    setSelectedBrand("");
    setSelectedModel("");
    setSelectedModelName("");
  };

  const handleBrandSelect = (brandKey: string) => {
    Haptics.selectionAsync();
    setSelectedBrand(brandKey);
    setSelectedModel("");
    setSelectedModelName("");
    setBrandModalVisible(false);
    setBrandSearch("");
  };

  const handleModelSelect = (model: { id: string; name: string }) => {
    Haptics.selectionAsync();
    setSelectedModel(model.id);
    setSelectedModelName(model.name);
    setModelModalVisible(false);
    setModelSearch("");
  };

  const handleSubmit = () => {
    if (!category) {
      Alert.alert("Uyari", "Lutfen kategori secin.");
      return;
    }
    if (!selectedBrand) {
      Alert.alert("Uyari", "Lutfen marka secin.");
      return;
    }
    if (!selectedModel) {
      Alert.alert("Uyari", "Lutfen model secin.");
      return;
    }

    const brandName = BRAND_DISPLAY_NAMES[selectedBrand] || selectedBrand;
    const title = `${brandName} ${selectedModelName}`;

    createMutation.mutate({
      userId: user?.id,
      brand: brandName,
      model: selectedModelName,
      year: new Date().getFullYear(),
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
      title,
      description: description.trim() || null,
      estimatedValue: estimatedValue ? parseInt(estimatedValue.replace(/\D/g, "")) : null,
      needsCompletion: true,
    });
  };

  const isValid = category && selectedBrand && selectedModel;

  const brandDisplayName = selectedBrand ? (BRAND_DISPLAY_NAMES[selectedBrand] || selectedBrand) : "";

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
                  {quotaData.quotaLabel} - {quotaData.remainingListings} ilan hakkiniz kaldi
                </ThemedText>
                <ThemedText style={styles.quotaSubtitle}>
                  {quotaData.currentListings}/{quotaData.maxListings} ilan kullanildi
                </ThemedText>
              </View>
            </View>
          </View>
        ) : null}

        {quotaData && quotaData.remainingListings <= 0 ? (
          <View style={styles.quotaBlockedContainer}>
            <Feather name="alert-triangle" size={48} color={BrandColors.alertRed} />
            <ThemedText style={styles.quotaBlockedTitle}>Ilan Limitinize Ulastiniz</ThemedText>
            <ThemedText style={styles.quotaBlockedText}>
              {!quotaData.phoneVerified || !quotaData.emailVerified
                ? "Telefon ve e-posta dogrulamasi yaparak 2 ilan hakki kazanabilirsiniz."
                : "Premium uyelikle aylik 5 ilan hakki kazanabilirsiniz (199 TL/ay)."}
            </ThemedText>
            <Pressable
              style={styles.quotaUpgradeButton}
              onPress={() => navigation.navigate("Premium")}
            >
              <Feather name="zap" size={16} color="#FFFFFF" />
              <ThemedText style={styles.quotaUpgradeButtonText}>Premium'a Yukselt</ThemedText>
            </Pressable>
          </View>
        ) : null}

        {!quotaData || quotaData.remainingListings > 0 ? (
          <View>
            <View style={styles.heroSection}>
              <ThemedText style={styles.heroTitle}>30 saniyede ilan ver</ThemedText>
              <ThemedText style={styles.heroSubtitle}>
                Kategori, marka ve model sec. Detaylari sonra ekle.
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
              <ThemedText style={styles.fieldLabel}>Kategori *</ThemedText>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat.id}
                    style={[
                      styles.categoryCard,
                      category === cat.id && styles.categoryCardSelected,
                    ]}
                    onPress={() => handleCategorySelect(cat.id)}
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

            {category ? (
              <View style={styles.formSection}>
                <ThemedText style={styles.fieldLabel}>Marka *</ThemedText>
                <Pressable
                  style={[
                    styles.selectorButton,
                    selectedBrand ? styles.selectorButtonSelected : null,
                  ]}
                  onPress={() => {
                    setBrandSearch("");
                    setBrandModalVisible(true);
                  }}
                >
                  <Feather name="search" size={18} color={selectedBrand ? "#000000" : "#9CA3AF"} />
                  <ThemedText style={[
                    styles.selectorButtonText,
                    selectedBrand ? styles.selectorButtonTextSelected : null,
                  ]}>
                    {selectedBrand ? brandDisplayName : "Marka secin..."}
                  </ThemedText>
                  <Feather name="chevron-down" size={18} color="#9CA3AF" />
                </Pressable>
              </View>
            ) : null}

            {selectedBrand ? (
              <View style={styles.formSection}>
                <ThemedText style={styles.fieldLabel}>Model *</ThemedText>
                <Pressable
                  style={[
                    styles.selectorButton,
                    selectedModel ? styles.selectorButtonSelected : null,
                  ]}
                  onPress={() => {
                    setModelSearch("");
                    setModelModalVisible(true);
                  }}
                >
                  <Feather name="search" size={18} color={selectedModel ? "#000000" : "#9CA3AF"} />
                  <ThemedText style={[
                    styles.selectorButtonText,
                    selectedModel ? styles.selectorButtonTextSelected : null,
                  ]}>
                    {selectedModel ? selectedModelName : "Model secin..."}
                  </ThemedText>
                  <Feather name="chevron-down" size={18} color="#9CA3AF" />
                </Pressable>
              </View>
            ) : null}

            {selectedBrand && selectedModel ? (
              <View style={styles.selectionSummary}>
                <Feather name="check-circle" size={16} color={BrandColors.successGreen} />
                <ThemedText style={styles.selectionSummaryText}>
                  {brandDisplayName} {selectedModelName}
                </ThemedText>
              </View>
            ) : null}

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
                pressed && isValid ? { opacity: 0.9 } : null,
              ]}
              onPress={handleSubmit}
              disabled={!isValid || createMutation.isPending}
            >
              {createMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={styles.submitButtonInner}>
                  <Feather name="zap" size={20} color="#FFFFFF" />
                  <ThemedText style={styles.submitButtonText}>Hemen Yayinla</ThemedText>
                </View>
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
          </View>
        ) : null}
      </KeyboardAwareScrollViewCompat>

      <Modal
        visible={brandModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setBrandModalVisible(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: Platform.OS === "ios" ? 12 : insets.top }]}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Marka Sec</ThemedText>
            <Pressable onPress={() => setBrandModalVisible(false)} hitSlop={12}>
              <Feather name="x" size={24} color="#000000" />
            </Pressable>
          </View>

          <View style={styles.searchContainer}>
            <Feather name="search" size={18} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              value={brandSearch}
              onChangeText={setBrandSearch}
              placeholder="Marka ara..."
              placeholderTextColor="#9CA3AF"
              autoFocus
            />
            {brandSearch.length > 0 ? (
              <Pressable onPress={() => setBrandSearch("")}>
                <Feather name="x-circle" size={18} color="#9CA3AF" />
              </Pressable>
            ) : null}
          </View>

          <FlatList
            data={filteredBrands}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.listItem,
                  selectedBrand === item && styles.listItemSelected,
                ]}
                onPress={() => handleBrandSelect(item)}
              >
                <ThemedText style={[
                  styles.listItemText,
                  selectedBrand === item && styles.listItemTextSelected,
                ]}>
                  {BRAND_DISPLAY_NAMES[item] || item}
                </ThemedText>
                {selectedBrand === item ? (
                  <Feather name="check" size={20} color="#FFFFFF" />
                ) : null}
              </Pressable>
            )}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
            ListEmptyComponent={
              <View style={styles.emptyList}>
                <ThemedText style={styles.emptyText}>Marka bulunamadi</ThemedText>
              </View>
            }
          />
        </View>
      </Modal>

      <Modal
        visible={modelModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModelModalVisible(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: Platform.OS === "ios" ? 12 : insets.top }]}>
          <View style={styles.modalHeader}>
            <View>
              <ThemedText style={styles.modalTitle}>Model Sec</ThemedText>
              <ThemedText style={styles.modalSubtitle}>{brandDisplayName}</ThemedText>
            </View>
            <Pressable onPress={() => setModelModalVisible(false)} hitSlop={12}>
              <Feather name="x" size={24} color="#000000" />
            </Pressable>
          </View>

          <View style={styles.searchContainer}>
            <Feather name="search" size={18} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              value={modelSearch}
              onChangeText={setModelSearch}
              placeholder="Model ara..."
              placeholderTextColor="#9CA3AF"
              autoFocus
            />
            {modelSearch.length > 0 ? (
              <Pressable onPress={() => setModelSearch("")}>
                <Feather name="x-circle" size={18} color="#9CA3AF" />
              </Pressable>
            ) : null}
          </View>

          <FlatList
            data={filteredModels}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.listItem,
                  selectedModel === item.id && styles.listItemSelected,
                ]}
                onPress={() => handleModelSelect(item)}
              >
                <View style={{ flex: 1 }}>
                  <ThemedText style={[
                    styles.listItemText,
                    selectedModel === item.id && styles.listItemTextSelected,
                  ]}>
                    {item.name}
                  </ThemedText>
                  <ThemedText style={[
                    styles.listItemYears,
                    selectedModel === item.id && { color: "rgba(255,255,255,0.7)" },
                  ]}>
                    {item.years}
                  </ThemedText>
                </View>
                {selectedModel === item.id ? (
                  <Feather name="check" size={20} color="#FFFFFF" />
                ) : null}
              </Pressable>
            )}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
            ListEmptyComponent={
              <View style={styles.emptyList}>
                <ThemedText style={styles.emptyText}>Model bulunamadi</ThemedText>
              </View>
            }
          />
        </View>
      </Modal>
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
  selectorButton: {
    height: 56,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  selectorButtonSelected: {
    borderColor: "#000000",
    backgroundColor: "#FFFFFF",
  },
  selectorButtonText: {
    flex: 1,
    fontSize: 16,
    color: "#9CA3AF",
  },
  selectorButtonTextSelected: {
    color: "#000000",
    fontWeight: "600",
  },
  selectionSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: `${BrandColors.successGreen}10`,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  selectionSummaryText: {
    fontSize: 15,
    fontWeight: "600",
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
    marginTop: Spacing.md,
  },
  submitButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
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
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: "#F3F4F6",
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#000000",
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
  },
  listItem: {
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listItemSelected: {
    backgroundColor: "#000000",
  },
  listItemText: {
    fontSize: 16,
    color: "#000000",
  },
  listItemTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  listItemYears: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  listSeparator: {
    height: 1,
    backgroundColor: "#F3F4F6",
  },
  emptyList: {
    paddingVertical: Spacing.xl * 2,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    color: "#9CA3AF",
  },
});
