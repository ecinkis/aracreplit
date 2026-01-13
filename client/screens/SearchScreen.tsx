import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
} from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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

  const handleCategoryPress = (categoryId: string, categoryName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("BrandList", { categoryId, categoryName });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Marka, model veya ilan no ara..."
            placeholderTextColor="#9CA3AF"
            testID="input-search"
          />
          {searchQuery.length > 0 ? (
            <Pressable onPress={() => setSearchQuery("")} testID="button-clear-search">
              <Feather name="x" size={18} color="#9CA3AF" />
            </Pressable>
          ) : null}
        </View>
      </View>

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
                <Feather name={category.icon} size={28} color="#000000" />
              </View>
              <View style={styles.categoryContent}>
                <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
                <ThemedText style={styles.categoryDescription}>{category.description}</ThemedText>
              </View>
              <Feather name="chevron-right" size={24} color="#9CA3AF" />
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
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
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: Spacing.md,
    gap: Spacing.md,
  },
  categoryCardPressed: {
    backgroundColor: "#F9FAFB",
    transform: [{ scale: 0.98 }],
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryContent: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  categoryDescription: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
});
