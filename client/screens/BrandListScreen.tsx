import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type BrandListRouteProp = RouteProp<RootStackParamList, "BrandList">;

const BRANDS_BY_CATEGORY: Record<string, Array<{ id: string; name: string }>> = {
  otomobil: [
    { id: "alfa-romeo", name: "Alfa Romeo" },
    { id: "aston-martin", name: "Aston Martin" },
    { id: "audi", name: "Audi" },
    { id: "bentley", name: "Bentley" },
    { id: "bmw", name: "BMW" },
    { id: "bugatti", name: "Bugatti" },
    { id: "buick", name: "Buick" },
    { id: "byd", name: "BYD" },
    { id: "cadillac", name: "Cadillac" },
    { id: "chery", name: "Chery" },
    { id: "chevrolet", name: "Chevrolet" },
    { id: "chrysler", name: "Chrysler" },
    { id: "citroen", name: "Citroen" },
    { id: "cupra", name: "Cupra" },
    { id: "dacia", name: "Dacia" },
    { id: "daewoo", name: "Daewoo" },
    { id: "daihatsu", name: "Daihatsu" },
    { id: "dfsk", name: "DFSK" },
    { id: "dodge", name: "Dodge" },
    { id: "ds", name: "DS Automobiles" },
    { id: "ferrari", name: "Ferrari" },
    { id: "fiat", name: "Fiat" },
    { id: "ford", name: "Ford" },
    { id: "geely", name: "Geely" },
    { id: "genesis", name: "Genesis" },
    { id: "gmc", name: "GMC" },
    { id: "haval", name: "Haval" },
    { id: "honda", name: "Honda" },
    { id: "hummer", name: "Hummer" },
    { id: "hyundai", name: "Hyundai" },
    { id: "infiniti", name: "Infiniti" },
    { id: "isuzu", name: "Isuzu" },
    { id: "iveco", name: "Iveco" },
    { id: "jac", name: "JAC" },
    { id: "jaguar", name: "Jaguar" },
    { id: "jeep", name: "Jeep" },
    { id: "kia", name: "Kia" },
    { id: "lada", name: "Lada" },
    { id: "lamborghini", name: "Lamborghini" },
    { id: "lancia", name: "Lancia" },
    { id: "land-rover", name: "Land Rover" },
    { id: "lexus", name: "Lexus" },
    { id: "lincoln", name: "Lincoln" },
    { id: "lotus", name: "Lotus" },
    { id: "maserati", name: "Maserati" },
    { id: "mazda", name: "Mazda" },
    { id: "mclaren", name: "McLaren" },
    { id: "mercedes", name: "Mercedes-Benz" },
    { id: "mg", name: "MG" },
    { id: "mini", name: "Mini" },
    { id: "mitsubishi", name: "Mitsubishi" },
    { id: "nissan", name: "Nissan" },
    { id: "omoda", name: "Omoda" },
    { id: "opel", name: "Opel" },
    { id: "peugeot", name: "Peugeot" },
    { id: "polestar", name: "Polestar" },
    { id: "porsche", name: "Porsche" },
    { id: "proton", name: "Proton" },
    { id: "ram", name: "RAM" },
    { id: "renault", name: "Renault" },
    { id: "rolls-royce", name: "Rolls-Royce" },
    { id: "rover", name: "Rover" },
    { id: "saab", name: "Saab" },
    { id: "seat", name: "Seat" },
    { id: "skoda", name: "Skoda" },
    { id: "smart", name: "Smart" },
    { id: "ssangyong", name: "SsangYong" },
    { id: "subaru", name: "Subaru" },
    { id: "suzuki", name: "Suzuki" },
    { id: "tata", name: "Tata" },
    { id: "tesla", name: "Tesla" },
    { id: "togg", name: "TOGG" },
    { id: "toyota", name: "Toyota" },
    { id: "volkswagen", name: "Volkswagen" },
    { id: "volvo", name: "Volvo" },
  ],
  suv: [
    { id: "alfa-romeo", name: "Alfa Romeo" },
    { id: "audi", name: "Audi" },
    { id: "bmw", name: "BMW" },
    { id: "cadillac", name: "Cadillac" },
    { id: "chery", name: "Chery" },
    { id: "chevrolet", name: "Chevrolet" },
    { id: "citroen", name: "Citroen" },
    { id: "cupra", name: "Cupra" },
    { id: "dacia", name: "Dacia" },
    { id: "dodge", name: "Dodge" },
    { id: "ds", name: "DS Automobiles" },
    { id: "fiat", name: "Fiat" },
    { id: "ford", name: "Ford" },
    { id: "geely", name: "Geely" },
    { id: "genesis", name: "Genesis" },
    { id: "haval", name: "Haval" },
    { id: "honda", name: "Honda" },
    { id: "hyundai", name: "Hyundai" },
    { id: "infiniti", name: "Infiniti" },
    { id: "isuzu", name: "Isuzu" },
    { id: "jaguar", name: "Jaguar" },
    { id: "jeep", name: "Jeep" },
    { id: "kia", name: "Kia" },
    { id: "land-rover", name: "Land Rover" },
    { id: "lexus", name: "Lexus" },
    { id: "lincoln", name: "Lincoln" },
    { id: "maserati", name: "Maserati" },
    { id: "mazda", name: "Mazda" },
    { id: "mercedes", name: "Mercedes-Benz" },
    { id: "mg", name: "MG" },
    { id: "mini", name: "Mini" },
    { id: "mitsubishi", name: "Mitsubishi" },
    { id: "nissan", name: "Nissan" },
    { id: "omoda", name: "Omoda" },
    { id: "opel", name: "Opel" },
    { id: "peugeot", name: "Peugeot" },
    { id: "porsche", name: "Porsche" },
    { id: "ram", name: "RAM" },
    { id: "renault", name: "Renault" },
    { id: "seat", name: "Seat" },
    { id: "skoda", name: "Skoda" },
    { id: "ssangyong", name: "SsangYong" },
    { id: "subaru", name: "Subaru" },
    { id: "suzuki", name: "Suzuki" },
    { id: "tesla", name: "Tesla" },
    { id: "togg", name: "TOGG" },
    { id: "toyota", name: "Toyota" },
    { id: "volkswagen", name: "Volkswagen" },
    { id: "volvo", name: "Volvo" },
  ],
  elektrikli: [
    { id: "audi", name: "Audi e-tron" },
    { id: "bmw", name: "BMW i" },
    { id: "byd", name: "BYD" },
    { id: "cupra", name: "Cupra Born" },
    { id: "fiat", name: "Fiat 500e" },
    { id: "ford", name: "Ford Mustang Mach-E" },
    { id: "honda", name: "Honda e" },
    { id: "hyundai", name: "Hyundai Ioniq" },
    { id: "jaguar", name: "Jaguar I-Pace" },
    { id: "kia", name: "Kia EV" },
    { id: "lexus", name: "Lexus RZ" },
    { id: "mazda", name: "Mazda MX-30" },
    { id: "mercedes", name: "Mercedes EQ" },
    { id: "mg", name: "MG" },
    { id: "mini", name: "Mini Electric" },
    { id: "nissan", name: "Nissan Leaf" },
    { id: "opel", name: "Opel Corsa-e" },
    { id: "peugeot", name: "Peugeot e-208" },
    { id: "polestar", name: "Polestar" },
    { id: "porsche", name: "Porsche Taycan" },
    { id: "renault", name: "Renault Zoe" },
    { id: "skoda", name: "Skoda Enyaq" },
    { id: "smart", name: "Smart EQ" },
    { id: "tesla", name: "Tesla" },
    { id: "togg", name: "TOGG" },
    { id: "volkswagen", name: "Volkswagen ID" },
    { id: "volvo", name: "Volvo EX" },
  ],
  motosiklet: [
    { id: "aprilia", name: "Aprilia" },
    { id: "bajaj", name: "Bajaj" },
    { id: "benelli", name: "Benelli" },
    { id: "bmw", name: "BMW Motorrad" },
    { id: "cfmoto", name: "CFMoto" },
    { id: "ducati", name: "Ducati" },
    { id: "gilera", name: "Gilera" },
    { id: "harley", name: "Harley-Davidson" },
    { id: "hero", name: "Hero" },
    { id: "honda", name: "Honda" },
    { id: "husqvarna", name: "Husqvarna" },
    { id: "indian", name: "Indian" },
    { id: "kawasaki", name: "Kawasaki" },
    { id: "keeway", name: "Keeway" },
    { id: "kral", name: "Kral Motor" },
    { id: "ktm", name: "KTM" },
    { id: "kymco", name: "Kymco" },
    { id: "mondial", name: "Mondial" },
    { id: "motoguzzi", name: "Moto Guzzi" },
    { id: "mv-agusta", name: "MV Agusta" },
    { id: "piaggio", name: "Piaggio" },
    { id: "rks", name: "RKS" },
    { id: "royal-enfield", name: "Royal Enfield" },
    { id: "suzuki-moto", name: "Suzuki" },
    { id: "sym", name: "SYM" },
    { id: "triumph", name: "Triumph" },
    { id: "tvs", name: "TVS" },
    { id: "vespa", name: "Vespa" },
    { id: "yamaha", name: "Yamaha" },
    { id: "yuki", name: "Yuki" },
    { id: "zontes", name: "Zontes" },
  ],
};

export default function BrandListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<BrandListRouteProp>();
  const insets = useSafeAreaInsets();
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
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="arrow-left" size={24} color="#000000" />
          </Pressable>
          <ThemedText style={styles.headerTitle}>{categoryName}</ThemedText>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#9CA3AF" />
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
              <Feather name="x-circle" size={18} color="#9CA3AF" />
            </Pressable>
          ) : null}
        </View>
      </View>

      <FlatList
        data={filteredBrands}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.brandRow,
              pressed && styles.brandRowPressed,
            ]}
            onPress={() => handleBrandPress(item.id, item.name)}
            testID={`row-brand-${item.id}`}
          >
            <ThemedText style={styles.brandName}>{item.name}</ThemedText>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </Pressable>
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="inbox" size={48} color="#9CA3AF" />
            <ThemedText style={styles.emptyText}>Marka bulunamadi</ThemedText>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 44,
    marginTop: Spacing.xs,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#000000",
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
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
