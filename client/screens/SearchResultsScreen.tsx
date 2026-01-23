import React, { useState, useMemo, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
  TextInput,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius, BrandColors } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { Listing } from "@shared/schema";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SearchResultsRouteProp = RouteProp<RootStackParamList, "SearchResults">;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const FILTER_PANEL_WIDTH = SCREEN_WIDTH * 0.85;

type SortOption = "default" | "price-asc" | "price-desc" | "year-desc" | "year-asc" | "km-asc" | "km-desc";

interface Filters {
  minPrice: string;
  maxPrice: string;
  minYear: string;
  maxYear: string;
  minKm: string;
  maxKm: string;
  city: string;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "default", label: "Varsayılan" },
  { value: "price-asc", label: "Fiyat: Düşükten Yükseğe" },
  { value: "price-desc", label: "Fiyat: Yüksekten Düşüğe" },
  { value: "year-desc", label: "Yıl: Yeniden Eskiye" },
  { value: "year-asc", label: "Yıl: Eskiden Yeniye" },
  { value: "km-asc", label: "KM: Düşükten Yükseğe" },
  { value: "km-desc", label: "KM: Yüksekten Düşüğe" },
];

const initialFilters: Filters = {
  minPrice: "",
  maxPrice: "",
  minYear: "",
  maxYear: "",
  minKm: "",
  maxKm: "",
  city: "",
};

export default function SearchResultsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SearchResultsRouteProp>();
  const insets = useSafeAreaInsets();
  const params = route.params || {};
  const { brandName, modelName, brand, model, query } = params as any;

  const searchBrand = brand || brandName || "";
  const searchModel = model || modelName || "";
  const searchQuery = query || "";

  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(initialFilters);

  const slideAnim = useRef(new Animated.Value(FILTER_PANEL_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const { data: listings, isLoading } = useQuery<Listing[]>({
    queryKey: ["/api/listings"],
  });

  const openFilterPanel = () => {
    setShowFilterPanel(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeFilterPanel = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: FILTER_PANEL_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowFilterPanel(false);
      setFilters(appliedFilters);
    });
  };

  const applyFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAppliedFilters(filters);
    closeFilterPanel();
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };

  const handleSortSelect = (option: SortOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSortOption(option);
    setShowSortModal(false);
  };

  const hasActiveFilters = useMemo(() => {
    return Object.values(appliedFilters).some((v) => v !== "");
  }, [appliedFilters]);

  const filteredAndSortedListings = useMemo(() => {
    let result = listings?.filter((listing) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          listing.brand.toLowerCase().includes(q) ||
          listing.model.toLowerCase().includes(q) ||
          (listing.description && listing.description.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      } else {
        if (searchBrand && searchModel) {
          if (
            listing.brand.toLowerCase() !== searchBrand.toLowerCase() &&
            listing.model.toLowerCase() !== searchModel.toLowerCase()
          ) {
            return false;
          }
        } else if (searchBrand) {
          if (!listing.brand.toLowerCase().includes(searchBrand.toLowerCase())) {
            return false;
          }
        }
      }

      if (appliedFilters.minPrice && listing.estimatedValue) {
        if (listing.estimatedValue < parseInt(appliedFilters.minPrice, 10)) return false;
      }
      if (appliedFilters.maxPrice && listing.estimatedValue) {
        if (listing.estimatedValue > parseInt(appliedFilters.maxPrice, 10)) return false;
      }
      if (appliedFilters.minYear) {
        if (listing.year < parseInt(appliedFilters.minYear, 10)) return false;
      }
      if (appliedFilters.maxYear) {
        if (listing.year > parseInt(appliedFilters.maxYear, 10)) return false;
      }
      if (appliedFilters.minKm) {
        if (listing.km < parseInt(appliedFilters.minKm, 10)) return false;
      }
      if (appliedFilters.maxKm) {
        if (listing.km > parseInt(appliedFilters.maxKm, 10)) return false;
      }
      if (appliedFilters.city) {
        if (!listing.city.toLowerCase().includes(appliedFilters.city.toLowerCase())) return false;
      }

      return true;
    }) || [];

    if (sortOption !== "default") {
      result = [...result].sort((a, b) => {
        switch (sortOption) {
          case "price-asc":
            return (a.estimatedValue || 0) - (b.estimatedValue || 0);
          case "price-desc":
            return (b.estimatedValue || 0) - (a.estimatedValue || 0);
          case "year-desc":
            return b.year - a.year;
          case "year-asc":
            return a.year - b.year;
          case "km-asc":
            return a.km - b.km;
          case "km-desc":
            return b.km - a.km;
          default:
            return 0;
        }
      });
    }

    return result;
  }, [listings, searchQuery, searchBrand, searchModel, appliedFilters, sortOption]);

  const handleListingPress = (listingId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("ListingDetail", { listingId });
  };

  console.log("SearchResultsScreen rendering, isLoading:", isLoading);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BrandColors.primaryBlue} />
        </View>
      </View>
    );
  }

  console.log("SearchResultsScreen - rendering filterSortBar");

  return (
    <View style={styles.container}>
      <View style={styles.filterSortBar}>
        <Pressable
          style={[
            styles.filterButton,
            hasActiveFilters && styles.activeFilterButton,
          ]}
          onPress={openFilterPanel}
          testID="button-filter"
        >
          <Feather
            name="sliders"
            size={16}
            color={hasActiveFilters ? "#FFFFFF" : "#000000"}
          />
          <ThemedText
            style={[
              styles.filterButtonText,
              hasActiveFilters && styles.activeFilterButtonText,
            ]}
          >
            Filtrele
          </ThemedText>
          {hasActiveFilters ? (
            <View style={styles.filterBadge}>
              <ThemedText style={styles.filterBadgeText}>
                {Object.values(appliedFilters).filter((v) => v !== "").length}
              </ThemedText>
            </View>
          ) : null}
        </Pressable>

        <Pressable
          style={[
            styles.sortButton,
            sortOption !== "default" && styles.activeSortButton,
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowSortModal(true);
          }}
          testID="button-sort"
        >
          <Feather
            name="bar-chart-2"
            size={16}
            color={sortOption !== "default" ? "#FFFFFF" : "#000000"}
          />
          <ThemedText
            style={[
              styles.sortButtonText,
              sortOption !== "default" && styles.activeSortButtonText,
            ]}
          >
            Sirala
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.resultInfo}>
        <ThemedText style={styles.resultCount}>
          {filteredAndSortedListings.length} ilan bulundu
        </ThemedText>
      </View>

      <FlatList
        data={filteredAndSortedListings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.listingCard]}
            onPress={() => handleListingPress(item.id)}
            testID={`card-listing-${item.id}`}
          >
            <View style={styles.listingImageContainer}>
              {item.photos && item.photos.length > 0 ? (
                <Image
                  source={{ uri: item.photos[0] }}
                  style={styles.listingImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.listingImagePlaceholder}>
                  <Feather name="image" size={24} color="#9CA3AF" />
                </View>
              )}
            </View>
            <View style={styles.listingContent}>
              <ThemedText style={styles.listingTitle} numberOfLines={1}>
                {item.brand} {item.model}
              </ThemedText>
              <ThemedText style={styles.listingDetails}>
                {item.year} - {item.km.toLocaleString("tr-TR")} km
              </ThemedText>
              <View style={styles.listingFooter}>
                <ThemedText style={styles.listingPrice}>
                  {item.estimatedValue?.toLocaleString("tr-TR")} TL
                </ThemedText>
                <View style={styles.locationBadge}>
                  <Feather name="map-pin" size={10} color={BrandColors.primaryBlue} />
                  <ThemedText style={styles.locationText}>{item.city}</ThemedText>
                </View>
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="inbox" size={48} color="#9CA3AF" />
            <ThemedText style={styles.emptyText}>
              Bu arama kriterlerine uygun ilan bulunamadı
            </ThemedText>
          </View>
        }
      />

      {showFilterPanel ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.backdrop,
              { opacity: backdropAnim },
            ]}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={closeFilterPanel} />
          </Animated.View>

          <Animated.View
            style={[
              styles.filterPanel,
              {
                transform: [{ translateX: slideAnim }],
                paddingTop: insets.top + Spacing.md,
                paddingBottom: insets.bottom + Spacing.md,
              },
            ]}
          >
            <View style={styles.filterHeader}>
              <ThemedText style={styles.filterTitle}>Filtreler</ThemedText>
              <Pressable onPress={closeFilterPanel} hitSlop={12}>
                <Feather name="x" size={24} color="#000000" />
              </Pressable>
            </View>

            <ScrollView style={styles.filterContent} showsVerticalScrollIndicator={false}>
              <View style={styles.filterSection}>
                <ThemedText style={styles.filterSectionTitle}>Fiyat Aralığı</ThemedText>
                <View style={styles.rangeInputs}>
                  <TextInput
                    style={styles.rangeInput}
                    placeholder="Min"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={filters.minPrice}
                    onChangeText={(text) => setFilters({ ...filters, minPrice: text })}
                  />
                  <ThemedText style={styles.rangeSeparator}>-</ThemedText>
                  <TextInput
                    style={styles.rangeInput}
                    placeholder="Max"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={filters.maxPrice}
                    onChangeText={(text) => setFilters({ ...filters, maxPrice: text })}
                  />
                </View>
              </View>

              <View style={styles.filterSection}>
                <ThemedText style={styles.filterSectionTitle}>Yıl Aralığı</ThemedText>
                <View style={styles.rangeInputs}>
                  <TextInput
                    style={styles.rangeInput}
                    placeholder="Min"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={filters.minYear}
                    onChangeText={(text) => setFilters({ ...filters, minYear: text })}
                  />
                  <ThemedText style={styles.rangeSeparator}>-</ThemedText>
                  <TextInput
                    style={styles.rangeInput}
                    placeholder="Max"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={filters.maxYear}
                    onChangeText={(text) => setFilters({ ...filters, maxYear: text })}
                  />
                </View>
              </View>

              <View style={styles.filterSection}>
                <ThemedText style={styles.filterSectionTitle}>KM Aralığı</ThemedText>
                <View style={styles.rangeInputs}>
                  <TextInput
                    style={styles.rangeInput}
                    placeholder="Min"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={filters.minKm}
                    onChangeText={(text) => setFilters({ ...filters, minKm: text })}
                  />
                  <ThemedText style={styles.rangeSeparator}>-</ThemedText>
                  <TextInput
                    style={styles.rangeInput}
                    placeholder="Max"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={filters.maxKm}
                    onChangeText={(text) => setFilters({ ...filters, maxKm: text })}
                  />
                </View>
              </View>

              <View style={styles.filterSection}>
                <ThemedText style={styles.filterSectionTitle}>Şehir</ThemedText>
                <TextInput
                  style={styles.cityInput}
                  placeholder="Şehir adı girin"
                  placeholderTextColor="#9CA3AF"
                  value={filters.city}
                  onChangeText={(text) => setFilters({ ...filters, city: text })}
                />
              </View>
            </ScrollView>

            <View style={styles.filterActions}>
              <Pressable style={styles.clearButton} onPress={clearFilters}>
                <ThemedText style={styles.clearButtonText}>Temizle</ThemedText>
              </Pressable>
              <Pressable style={styles.applyButton} onPress={applyFilters}>
                <ThemedText style={styles.applyButtonText}>Uygula</ThemedText>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      ) : null}

      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowSortModal(false)}>
          <View style={styles.sortModal}>
            <View style={styles.sortModalHeader}>
              <ThemedText style={styles.sortModalTitle}>Sıralama</ThemedText>
            </View>
            {SORT_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.sortOption,
                  sortOption === option.value && styles.sortOptionActive,
                ]}
                onPress={() => handleSortSelect(option.value)}
              >
                <ThemedText
                  style={[
                    styles.sortOptionText,
                    sortOption === option.value && styles.sortOptionTextActive,
                  ]}
                >
                  {option.label}
                </ThemedText>
                {sortOption === option.value ? (
                  <Feather name="check" size={18} color={BrandColors.primaryBlue} />
                ) : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  filterSortBar: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
    minHeight: 44,
    paddingVertical: Spacing.sm,
  },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  activeFilterButton: {
    backgroundColor: "#000000",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
  },
  activeFilterButtonText: {
    color: "#FFFFFF",
  },
  filterBadge: {
    backgroundColor: BrandColors.primaryBlue,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  sortButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  activeSortButton: {
    backgroundColor: "#000000",
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
  },
  activeSortButtonText: {
    color: "#FFFFFF",
  },
  resultInfo: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  resultCount: {
    fontSize: 13,
    color: "#6B7280",
  },
  listContent: {
    flexGrow: 1,
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  listingCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  listingImageContainer: {
    width: 120,
    height: 100,
    backgroundColor: "#F3F4F6",
  },
  listingImage: {
    width: "100%",
    height: "100%",
  },
  listingImagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listingContent: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: "space-between",
  },
  listingTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000000",
  },
  listingDetails: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  listingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  listingPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000000",
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 11,
    color: BrandColors.primaryBlue,
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
    textAlign: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  filterPanel: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: FILTER_PANEL_WIDTH,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: Spacing.lg,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  filterContent: {
    flex: 1,
    marginTop: Spacing.md,
  },
  filterSection: {
    marginBottom: Spacing.lg,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    marginBottom: Spacing.sm,
  },
  rangeInputs: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  rangeInput: {
    flex: 1,
    height: 44,
    backgroundColor: "#F3F4F6",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: 14,
    color: "#000000",
  },
  rangeSeparator: {
    fontSize: 16,
    color: "#6B7280",
  },
  cityInput: {
    height: 44,
    backgroundColor: "#F3F4F6",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: 14,
    color: "#000000",
  },
  filterActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  clearButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    backgroundColor: "#F3F4F6",
    borderRadius: BorderRadius.md,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
  },
  applyButton: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    backgroundColor: "#000000",
    borderRadius: BorderRadius.md,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  sortModal: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    width: "100%",
    maxWidth: 320,
    overflow: "hidden",
  },
  sortModalHeader: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  sortModalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
  },
  sortOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  sortOptionActive: {
    backgroundColor: "#F0F9FF",
  },
  sortOptionText: {
    fontSize: 14,
    color: "#000000",
  },
  sortOptionTextActive: {
    color: BrandColors.primaryBlue,
    fontWeight: "500",
  },
});
