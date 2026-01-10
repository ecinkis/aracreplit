import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius, BrandColors } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type FilterRouteProp = RouteProp<RootStackParamList, "Filter">;

const FUEL_TYPES = ["Benzin", "Dizel", "LPG", "Hibrit", "Elektrik"];
const TRANSMISSION_TYPES = ["Manuel", "Otomatik", "Yarı Otomatik"];
const BRANDS = [
  "BMW", "Mercedes", "Audi", "Volkswagen", "Toyota", "Honda",
  "Ford", "Renault", "Fiat", "Hyundai", "Kia", "Opel",
  "Peugeot", "Citroen", "Nissan", "Mazda", "Volvo", "Skoda"
];

export interface FilterValues {
  minPrice?: number;
  maxPrice?: number;
  minKm?: number;
  maxKm?: number;
  minYear?: number;
  maxYear?: number;
  fuelTypes: string[];
  transmissionTypes: string[];
  brands: string[];
}

const defaultFilters: FilterValues = {
  fuelTypes: [],
  transmissionTypes: [],
  brands: [],
};

export default function FilterScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<FilterRouteProp>();
  
  const initialFilters = route.params?.currentFilters || defaultFilters;
  
  const [filters, setFilters] = useState<FilterValues>(initialFilters);

  const toggleArrayItem = (array: string[], item: string): string[] => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    }
    return [...array, item];
  };

  const handleApply = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate("Main", { appliedFilters: filters } as any);
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilters(defaultFilters);
  };

  const activeFilterCount = [
    filters.minPrice !== undefined,
    filters.maxPrice !== undefined,
    filters.minKm !== undefined,
    filters.maxKm !== undefined,
    filters.minYear !== undefined,
    filters.maxYear !== undefined,
    filters.fuelTypes.length > 0,
    filters.transmissionTypes.length > 0,
    filters.brands.length > 0,
  ].filter(Boolean).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
        >
          <Feather name="x" size={24} color="#000000" />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Filtreler</ThemedText>
        <Pressable onPress={handleReset}>
          <ThemedText style={styles.resetText}>Sifirla</ThemedText>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Fiyat Araligi (TL)</ThemedText>
          <View style={styles.rangeRow}>
            <View style={styles.rangeInput}>
              <TextInput
                style={styles.input}
                placeholder="Min"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={filters.minPrice?.toString() || ""}
                onChangeText={(text) => setFilters({
                  ...filters,
                  minPrice: text ? parseInt(text) : undefined
                })}
              />
            </View>
            <ThemedText style={styles.rangeSeparator}>-</ThemedText>
            <View style={styles.rangeInput}>
              <TextInput
                style={styles.input}
                placeholder="Max"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={filters.maxPrice?.toString() || ""}
                onChangeText={(text) => setFilters({
                  ...filters,
                  maxPrice: text ? parseInt(text) : undefined
                })}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Kilometre</ThemedText>
          <View style={styles.rangeRow}>
            <View style={styles.rangeInput}>
              <TextInput
                style={styles.input}
                placeholder="Min km"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={filters.minKm?.toString() || ""}
                onChangeText={(text) => setFilters({
                  ...filters,
                  minKm: text ? parseInt(text) : undefined
                })}
              />
            </View>
            <ThemedText style={styles.rangeSeparator}>-</ThemedText>
            <View style={styles.rangeInput}>
              <TextInput
                style={styles.input}
                placeholder="Max km"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={filters.maxKm?.toString() || ""}
                onChangeText={(text) => setFilters({
                  ...filters,
                  maxKm: text ? parseInt(text) : undefined
                })}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Model Yili</ThemedText>
          <View style={styles.rangeRow}>
            <View style={styles.rangeInput}>
              <TextInput
                style={styles.input}
                placeholder="Min yil"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={filters.minYear?.toString() || ""}
                onChangeText={(text) => setFilters({
                  ...filters,
                  minYear: text ? parseInt(text) : undefined
                })}
              />
            </View>
            <ThemedText style={styles.rangeSeparator}>-</ThemedText>
            <View style={styles.rangeInput}>
              <TextInput
                style={styles.input}
                placeholder="Max yil"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={filters.maxYear?.toString() || ""}
                onChangeText={(text) => setFilters({
                  ...filters,
                  maxYear: text ? parseInt(text) : undefined
                })}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Yakit Tipi</ThemedText>
          <View style={styles.chipsRow}>
            {FUEL_TYPES.map((fuel) => (
              <Pressable
                key={fuel}
                style={[
                  styles.chip,
                  filters.fuelTypes.includes(fuel) && styles.chipActive
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setFilters({
                    ...filters,
                    fuelTypes: toggleArrayItem(filters.fuelTypes, fuel)
                  });
                }}
              >
                <ThemedText
                  style={[
                    styles.chipText,
                    filters.fuelTypes.includes(fuel) && styles.chipTextActive
                  ]}
                >
                  {fuel}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Vites Tipi</ThemedText>
          <View style={styles.chipsRow}>
            {TRANSMISSION_TYPES.map((trans) => (
              <Pressable
                key={trans}
                style={[
                  styles.chip,
                  filters.transmissionTypes.includes(trans) && styles.chipActive
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setFilters({
                    ...filters,
                    transmissionTypes: toggleArrayItem(filters.transmissionTypes, trans)
                  });
                }}
              >
                <ThemedText
                  style={[
                    styles.chipText,
                    filters.transmissionTypes.includes(trans) && styles.chipTextActive
                  ]}
                >
                  {trans}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Marka</ThemedText>
          <View style={styles.chipsRow}>
            {BRANDS.map((brand) => (
              <Pressable
                key={brand}
                style={[
                  styles.chip,
                  filters.brands.includes(brand) && styles.chipActive
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setFilters({
                    ...filters,
                    brands: toggleArrayItem(filters.brands, brand)
                  });
                }}
              >
                <ThemedText
                  style={[
                    styles.chipText,
                    filters.brands.includes(brand) && styles.chipTextActive
                  ]}
                >
                  {brand}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <Pressable
          style={({ pressed }) => [styles.applyButton, pressed && { opacity: 0.9 }]}
          onPress={handleApply}
        >
          <Feather name="check" size={20} color="#FFFFFF" />
          <ThemedText style={styles.applyButtonText}>
            Uygula {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
          </ThemedText>
        </Pressable>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  resetText: {
    fontSize: 14,
    fontWeight: "500",
    color: BrandColors.primaryBlue,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: Spacing.md,
  },
  rangeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  rangeInput: {
    flex: 1,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 15,
    color: "#000000",
  },
  rangeSeparator: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: "#F3F4F6",
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipActive: {
    backgroundColor: BrandColors.primaryBlue + "15",
    borderColor: BrandColors.primaryBlue,
  },
  chipText: {
    fontSize: 14,
    color: "#374151",
  },
  chipTextActive: {
    color: BrandColors.primaryBlue,
    fontWeight: "500",
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  applyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: BrandColors.primaryBlue,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
