import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type BrandListRouteProp = RouteProp<RootStackParamList, "BrandList">;

const BRANDS_BY_CATEGORY: Record<string, Array<{ id: string; name: string; logo?: string }>> = {
  otomobil: [
    { id: "bmw", name: "BMW" },
    { id: "mercedes", name: "Mercedes-Benz" },
    { id: "audi", name: "Audi" },
    { id: "volkswagen", name: "Volkswagen" },
    { id: "toyota", name: "Toyota" },
    { id: "honda", name: "Honda" },
    { id: "ford", name: "Ford" },
    { id: "renault", name: "Renault" },
    { id: "fiat", name: "Fiat" },
    { id: "hyundai", name: "Hyundai" },
    { id: "kia", name: "Kia" },
    { id: "peugeot", name: "Peugeot" },
    { id: "opel", name: "Opel" },
    { id: "skoda", name: "Skoda" },
    { id: "seat", name: "Seat" },
    { id: "nissan", name: "Nissan" },
  ],
  suv: [
    { id: "jeep", name: "Jeep" },
    { id: "land-rover", name: "Land Rover" },
    { id: "toyota", name: "Toyota" },
    { id: "nissan", name: "Nissan" },
    { id: "ford", name: "Ford" },
    { id: "bmw", name: "BMW" },
    { id: "mercedes", name: "Mercedes-Benz" },
    { id: "audi", name: "Audi" },
    { id: "volkswagen", name: "Volkswagen" },
    { id: "hyundai", name: "Hyundai" },
  ],
  elektrikli: [
    { id: "tesla", name: "Tesla" },
    { id: "bmw", name: "BMW i" },
    { id: "mercedes", name: "Mercedes EQ" },
    { id: "audi", name: "Audi e-tron" },
    { id: "volkswagen", name: "Volkswagen ID" },
    { id: "porsche", name: "Porsche Taycan" },
    { id: "hyundai", name: "Hyundai Ioniq" },
    { id: "kia", name: "Kia EV" },
    { id: "togg", name: "TOGG" },
  ],
  motosiklet: [
    { id: "honda", name: "Honda" },
    { id: "yamaha", name: "Yamaha" },
    { id: "kawasaki", name: "Kawasaki" },
    { id: "suzuki", name: "Suzuki" },
    { id: "bmw", name: "BMW Motorrad" },
    { id: "ducati", name: "Ducati" },
    { id: "harley", name: "Harley-Davidson" },
    { id: "ktm", name: "KTM" },
    { id: "triumph", name: "Triumph" },
  ],
};

export default function BrandListScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<BrandListRouteProp>();
  const { categoryId, categoryName } = route.params;

  const brands = BRANDS_BY_CATEGORY[categoryId] || [];

  const handleBrandPress = (brandId: string, brandName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("ModelList", { categoryId, categoryName, brandId, brandName });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{categoryName}</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>Marka seçin</ThemedText>
        </View>

        <View style={styles.brandsGrid}>
          {brands.map((brand) => (
            <Pressable
              key={brand.id}
              style={({ pressed }) => [
                styles.brandCard,
                pressed && styles.brandCardPressed,
              ]}
              onPress={() => handleBrandPress(brand.id, brand.name)}
              testID={`card-brand-${brand.id}`}
            >
              <View style={styles.brandIconContainer}>
                <ThemedText style={styles.brandInitial}>
                  {brand.name.charAt(0)}
                </ThemedText>
              </View>
              <ThemedText style={styles.brandName} numberOfLines={1}>{brand.name}</ThemedText>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  listContent: {
    flexGrow: 1,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  brandsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  brandCard: {
    width: "30%",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: Spacing.md,
  },
  brandCardPressed: {
    backgroundColor: "#F9FAFB",
    transform: [{ scale: 0.98 }],
  },
  brandIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  brandInitial: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  brandName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
    textAlign: "center",
  },
});
