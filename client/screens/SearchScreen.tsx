import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";

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

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.md }]}>
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
              <ThemedText style={styles.sectionTitle}>Popüler Markalar</ThemedText>
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
    marginBottom: Spacing.xl,
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
