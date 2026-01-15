import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from "react-native";
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

const BRANDS_BY_CATEGORY: Record<string, Array<{ id: string; name: string }>> = {
  otomobil: [
    { id: "audi", name: "Audi" },
    { id: "bmw", name: "BMW" },
    { id: "fiat", name: "Fiat" },
    { id: "ford", name: "Ford" },
    { id: "honda", name: "Honda" },
    { id: "hyundai", name: "Hyundai" },
    { id: "kia", name: "Kia" },
    { id: "mercedes", name: "Mercedes-Benz" },
    { id: "nissan", name: "Nissan" },
    { id: "opel", name: "Opel" },
    { id: "peugeot", name: "Peugeot" },
    { id: "renault", name: "Renault" },
    { id: "seat", name: "Seat" },
    { id: "skoda", name: "Skoda" },
    { id: "toyota", name: "Toyota" },
    { id: "volkswagen", name: "Volkswagen" },
  ],
  suv: [
    { id: "audi", name: "Audi" },
    { id: "bmw", name: "BMW" },
    { id: "ford", name: "Ford" },
    { id: "hyundai", name: "Hyundai" },
    { id: "jeep", name: "Jeep" },
    { id: "land-rover", name: "Land Rover" },
    { id: "mercedes", name: "Mercedes-Benz" },
    { id: "nissan", name: "Nissan" },
    { id: "toyota", name: "Toyota" },
    { id: "volkswagen", name: "Volkswagen" },
  ],
  elektrikli: [
    { id: "audi", name: "Audi e-tron" },
    { id: "bmw", name: "BMW i" },
    { id: "hyundai", name: "Hyundai Ioniq" },
    { id: "kia", name: "Kia EV" },
    { id: "mercedes", name: "Mercedes EQ" },
    { id: "porsche", name: "Porsche Taycan" },
    { id: "tesla", name: "Tesla" },
    { id: "togg", name: "TOGG" },
    { id: "volkswagen", name: "Volkswagen ID" },
  ],
  motosiklet: [
    { id: "bmw", name: "BMW Motorrad" },
    { id: "ducati", name: "Ducati" },
    { id: "harley", name: "Harley-Davidson" },
    { id: "honda", name: "Honda" },
    { id: "kawasaki", name: "Kawasaki" },
    { id: "ktm", name: "KTM" },
    { id: "suzuki", name: "Suzuki" },
    { id: "triumph", name: "Triumph" },
    { id: "yamaha", name: "Yamaha" },
  ],
};

export default function BrandListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<BrandListRouteProp>();
  const { categoryId, categoryName } = route.params;
  const [searchQuery, setSearchQuery] = useState("");

  const brands = BRANDS_BY_CATEGORY[categoryId] || [];
  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBrandPress = (brandId: string, brandName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("ModelList", { categoryId, categoryName, brandId, brandName });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Marka ara..."
          placeholderTextColor="#9CA3AF"
          testID="input-brand-search"
        />
        {searchQuery.length > 0 ? (
          <Pressable onPress={() => setSearchQuery("")} testID="button-clear-brand-search">
            <Feather name="x" size={18} color="#9CA3AF" />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredBrands.map((brand) => (
          <Pressable
            key={brand.id}
            style={({ pressed }) => [
              styles.brandRow,
              pressed && styles.brandRowPressed,
            ]}
            onPress={() => handleBrandPress(brand.id, brand.name)}
            testID={`row-brand-${brand.id}`}
          >
            <ThemedText style={styles.brandName}>{brand.name}</ThemedText>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </Pressable>
        ))}

        {filteredBrands.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="inbox" size={48} color="#9CA3AF" />
            <ThemedText style={styles.emptyText}>Marka bulunamadı</ThemedText>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: Spacing.lg,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: Spacing.md,
    height: 48,
    marginTop: 13,
    marginBottom: Spacing.xs,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#000000",
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xl,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  brandRowPressed: {
    backgroundColor: "#F9FAFB",
  },
  brandName: {
    fontSize: 16,
    color: "#000000",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl * 2,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: Spacing.md,
  },
});
