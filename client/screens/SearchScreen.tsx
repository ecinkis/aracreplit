import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  FlatList,
} from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import { VEHICLE_BRANDS } from "@/constants/vehicleData";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface SearchResult {
  type: "brand" | "model";
  brand: string;
  model?: string;
}

const VEHICLE_CATEGORIES = [
  { 
    id: "otomobil", 
    name: "Otomobil", 
    icon: "truck" as const,
    description: "Sedan, Hatchback, Coupe ve daha fazlası"
  },
  { 
    id: "suv", 
    name: "Arazi, SUV & Pickup", 
    icon: "compass" as const,
    description: "SUV, Crossover, Pickup ve Arazi araçları"
  },
  { 
    id: "elektrikli", 
    name: "Elektrikli Araçlar", 
    icon: "zap" as const,
    description: "Tam elektrikli ve hibrit araçlar"
  },
  { 
    id: "motosiklet", 
    name: "Motosiklet", 
    icon: "wind" as const,
    description: "Motosiklet, Scooter ve ATV"
  },
];

export default function SearchScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return [];
    
    const query = searchQuery.toLowerCase().trim();
    const results: SearchResult[] = [];
    
    for (const brand of VEHICLE_BRANDS) {
      const brandName = brand.name.toLowerCase();
      
      if (brandName.includes(query)) {
        results.push({ type: "brand", brand: brand.name });
      }
      
      for (const model of brand.models) {
        const modelName = model.name.toLowerCase();
        if (modelName.includes(query) || `${brandName} ${modelName}`.includes(query)) {
          results.push({ type: "model", brand: brand.name, model: model.name });
        }
      }
    }
    
    return results.slice(0, 20);
  }, [searchQuery]);

  const handleCategoryPress = (categoryId: string, categoryName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("BrandList", { categoryId, categoryName });
  };

  const handleSearchResultPress = (result: SearchResult) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (result.type === "brand") {
      navigation.navigate("ModelList", { 
        brandId: result.brand.toLowerCase(), 
        brandName: result.brand 
      });
    } else if (result.model) {
      navigation.navigate("SearchResults", { 
        brand: result.brand, 
        model: result.model 
      });
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim().length > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      navigation.navigate("SearchResults", { query: searchQuery.trim() });
    }
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <Pressable
      style={({ pressed }) => [
        styles.searchResultItem,
        pressed && styles.searchResultItemPressed,
      ]}
      onPress={() => handleSearchResultPress(item)}
    >
      <View style={styles.searchResultIcon}>
        <Feather 
          name={item.type === "brand" ? "grid" : "tag"} 
          size={16} 
          color="#6B7280" 
        />
      </View>
      <View style={styles.searchResultContent}>
        <ThemedText style={styles.searchResultTitle}>
          {item.type === "brand" ? item.brand : `${item.brand} ${item.model}`}
        </ThemedText>
        <ThemedText style={styles.searchResultSubtitle}>
          {item.type === "brand" ? "Marka" : "Model"}
        </ThemedText>
      </View>
      <Feather name="chevron-right" size={18} color="#9CA3AF" />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Marka, model veya ilan no ara..."
          placeholderTextColor="#9CA3AF"
          testID="input-search"
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        {searchQuery.length > 0 ? (
          <Pressable onPress={() => setSearchQuery("")} testID="button-clear-search">
            <Feather name="x" size={18} color="#9CA3AF" />
          </Pressable>
        ) : null}
      </View>

      {searchQuery.length >= 2 && searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item, index) => `${item.brand}-${item.model || ""}-${index}`}
          renderItem={renderSearchResult}
          contentContainerStyle={[
            styles.searchResultsList,
            { paddingBottom: tabBarHeight + Spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <ThemedText style={styles.resultsHeader}>
              Arama Sonuçları ({searchResults.length})
            </ThemedText>
          }
        />
      ) : searchQuery.length >= 2 && searchResults.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <Feather name="search" size={48} color="#D1D5DB" />
          <ThemedText style={styles.noResultsText}>Sonuç bulunamadı</ThemedText>
          <ThemedText style={styles.noResultsSubtext}>
            Farklı bir arama terimi deneyin
          </ThemedText>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: tabBarHeight + Spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Araç Kategorileri</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>Aramak istediğiniz kategoriyi seçin</ThemedText>
          </View>

          <View style={styles.categoriesContainer}>
            {VEHICLE_CATEGORIES.map((category) => (
              <Pressable
                key={category.id}
                style={({ pressed }) => [
                  styles.categoryCard,
                  pressed && styles.categoryCardPressed,
                ]}
                onPress={() => handleCategoryPress(category.id, category.name)}
                testID={`card-category-${category.id}`}
              >
                <View style={styles.categoryIconContainer}>
                  <Feather name={category.icon} size={20} color="#000000" />
                </View>
                <View style={styles.categoryContent}>
                  <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
                  <ThemedText style={styles.categoryDescription}>{category.description}</ThemedText>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: Spacing.lg,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
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
  searchButton: {
    backgroundColor: "#000000",
    paddingHorizontal: Spacing.lg,
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  listContent: {
    flexGrow: 1,
  },
  section: {
    marginBottom: Spacing.md,
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
  categoriesContainer: {
    gap: Spacing.md,
  },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  categoryCardPressed: {
    backgroundColor: "#F9FAFB",
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  categoryContent: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: 13,
    color: "#6B7280",
  },
  searchResultsList: {
    flexGrow: 1,
  },
  resultsHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: Spacing.md,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: Spacing.md,
  },
  searchResultItemPressed: {
    backgroundColor: "#F9FAFB",
  },
  searchResultIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000000",
  },
  searchResultSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: Spacing.md,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
});
