import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useFocusEffect, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius, BrandColors } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { FilterValues } from "@/screens/FilterScreen";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const RECENT_SEARCHES = [
  "BMW 3 Serisi",
  "Mercedes C180",
  "Audi A4",
  "Volkswagen Passat",
];

const POPULAR_BRANDS = [
  { id: "1", name: "BMW" },
  { id: "2", name: "Mercedes" },
  { id: "3", name: "Audi" },
  { id: "4", name: "Volkswagen" },
  { id: "5", name: "Toyota" },
  { id: "6", name: "Honda" },
];

const defaultFilters: FilterValues = {
  fuelTypes: [],
  transmissionTypes: [],
  brands: [],
};

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterValues>(defaultFilters);

  useFocusEffect(
    useCallback(() => {
      const params = route.params as { appliedFilters?: FilterValues } | undefined;
      if (params?.appliedFilters) {
        setFilters(params.appliedFilters);
        navigation.setParams({ appliedFilters: undefined } as any);
      }
    }, [route.params])
  );

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

  const openFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("Filter", { currentFilters: filters });
  };

  const clearFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilters(defaultFilters);
  };

  return (
    <View style={[styles.container, { paddingTop: Spacing.md }]}>
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Marka, model veya ilan no ara..."
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 ? (
            <Pressable onPress={() => setSearchQuery("")}>
              <Feather name="x" size={18} color="#9CA3AF" />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.filterButton,
            activeFilterCount > 0 && styles.filterButtonActive,
            pressed && { opacity: 0.7 }
          ]}
          onPress={openFilters}
        >
          <Feather
            name="sliders"
            size={20}
            color={activeFilterCount > 0 ? "#FFFFFF" : "#374151"}
          />
          {activeFilterCount > 0 ? (
            <View style={styles.filterBadge}>
              <ThemedText style={styles.filterBadgeText}>{activeFilterCount}</ThemedText>
            </View>
          ) : null}
        </Pressable>
      </View>

      {activeFilterCount > 0 ? (
        <View style={styles.activeFiltersRow}>
          <ScrollableFilters filters={filters} />
          <Pressable onPress={clearFilters} style={styles.clearButton}>
            <ThemedText style={styles.clearButtonText}>Temizle</ThemedText>
          </Pressable>
        </View>
      ) : null}

      <FlatList
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Son Aramalar</ThemedText>
              {RECENT_SEARCHES.map((item, index) => (
                <Pressable key={index} style={styles.recentItem}>
                  <Feather name="clock" size={16} color="#9CA3AF" />
                  <ThemedText style={styles.recentText}>{item}</ThemedText>
                </Pressable>
              ))}
            </View>

            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Populer Markalar</ThemedText>
              <View style={styles.brandsGrid}>
                {POPULAR_BRANDS.map((brand) => (
                  <Pressable key={brand.id} style={styles.brandItem}>
                    <View style={styles.brandCircle}>
                      <Feather name="star" size={20} color="#9CA3AF" />
                    </View>
                    <ThemedText style={styles.brandName}>{brand.name}</ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        }
        data={[]}
        renderItem={() => null}
      />
    </View>
  );
}

function ScrollableFilters({ filters }: { filters: FilterValues }) {
  const chips: string[] = [];
  
  if (filters.minPrice || filters.maxPrice) {
    const min = filters.minPrice ? `${(filters.minPrice / 1000).toFixed(0)}K` : "0";
    const max = filters.maxPrice ? `${(filters.maxPrice / 1000).toFixed(0)}K` : "...";
    chips.push(`${min} - ${max} TL`);
  }
  if (filters.minKm || filters.maxKm) {
    const min = filters.minKm ? `${(filters.minKm / 1000).toFixed(0)}K` : "0";
    const max = filters.maxKm ? `${(filters.maxKm / 1000).toFixed(0)}K` : "...";
    chips.push(`${min} - ${max} km`);
  }
  if (filters.minYear || filters.maxYear) {
    const min = filters.minYear || "...";
    const max = filters.maxYear || "...";
    chips.push(`${min} - ${max}`);
  }
  filters.fuelTypes.forEach(f => chips.push(f));
  filters.transmissionTypes.forEach(t => chips.push(t));
  filters.brands.forEach(b => chips.push(b));

  return (
    <View style={styles.filtersScroll}>
      {chips.map((chip, index) => (
        <View key={index} style={styles.filterChip}>
          <ThemedText style={styles.filterChipText}>{chip}</ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: Spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
  },
  compareButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: BrandColors.primaryBlue + "10",
    borderRadius: BorderRadius.md,
  },
  compareButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: BrandColors.primaryBlue,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#000000",
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonActive: {
    backgroundColor: BrandColors.primaryBlue,
  },
  filterBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: BrandColors.primaryBlue,
  },
  activeFiltersRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filtersScroll: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  filterChip: {
    backgroundColor: BrandColors.primaryBlue + "15",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  filterChipText: {
    fontSize: 12,
    color: BrandColors.primaryBlue,
    fontWeight: "500",
  },
  clearButton: {
    paddingVertical: Spacing.xs,
  },
  clearButtonText: {
    fontSize: 13,
    color: "#EF4444",
    fontWeight: "500",
  },
  listContent: {
    flexGrow: 1,
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
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  recentText: {
    fontSize: 15,
    color: "#374151",
  },
  brandsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.lg,
  },
  brandItem: {
    alignItems: "center",
    width: "28%",
  },
  brandCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  brandName: {
    fontSize: 12,
    color: "#374151",
    textAlign: "center",
  },
});
