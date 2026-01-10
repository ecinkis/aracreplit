import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";
import appIcon from "../assets/images/icon.png";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_GAP = 8;
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - CARD_GAP * 2) / 3;

const CATEGORIES = [
  { id: "1", name: "Sedan" },
  { id: "2", name: "SUV" },
  { id: "3", name: "Hatchback" },
  { id: "4", name: "Coupe" },
  { id: "5", name: "Pickup" },
  { id: "6", name: "Van" },
];

const MOCK_VEHICLES = [
  { id: "1", title: "Audi A5", location: "Esenyurt", price: "1.500.000", date: "6 Eylül" },
  { id: "2", title: "Audi A5", location: "Esenyurt", price: "1.500.000", date: "6 Eylül" },
  { id: "3", title: "Audi A5", location: "Esenyurt", price: "1.500.000", date: "6 Eylül" },
  { id: "4", title: "Audi A5", location: "Esenyurt", price: "1.500.000", date: "6 Eylül" },
  { id: "5", title: "Audi A5", location: "Esenyurt", price: "1.500.000", date: "6 Eylül" },
  { id: "6", title: "Audi A5", location: "Esenyurt", price: "1.500.000", date: "6 Eylül" },
  { id: "7", title: "Audi A5", location: "Esenyurt", price: "1.500.000", date: "6 Eylül" },
  { id: "8", title: "Audi A5", location: "Esenyurt", price: "1.500.000", date: "6 Eylül" },
  { id: "9", title: "Audi A5", location: "Esenyurt", price: "1.500.000", date: "6 Eylül" },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [searchQuery, setSearchQuery] = useState("");

  const renderCategory = ({ item }: { item: typeof CATEGORIES[0] }) => (
    <Pressable style={styles.categoryItem}>
      <View style={styles.categoryCircle} />
      <ThemedText style={styles.categoryText} numberOfLines={1}>
        {item.name}
      </ThemedText>
    </Pressable>
  );

  const renderVehicle = ({ item }: { item: typeof MOCK_VEHICLES[0] }) => (
    <Pressable style={styles.vehicleCard}>
      <View style={styles.vehicleImageContainer}>
        <View style={styles.vehicleImagePlaceholder}>
          <Feather name="image" size={24} color="#9CA3AF" />
        </View>
      </View>
      <View style={styles.vehicleInfo}>
        <View style={styles.vehicleTitleRow}>
          <ThemedText style={styles.vehicleTitle} numberOfLines={1}>
            {item.title}
          </ThemedText>
          <View style={styles.locationBadge}>
            <Feather name="map-pin" size={8} color="#1C6BF9" />
            <ThemedText style={styles.locationText} numberOfLines={1}>
              {item.location}
            </ThemedText>
          </View>
        </View>
        <View style={styles.vehiclePriceRow}>
          <ThemedText style={styles.vehiclePrice}>₺ {item.price}</ThemedText>
          <View style={styles.dateBadge}>
            <Feather name="clock" size={8} color="#9CA3AF" />
            <ThemedText style={styles.dateText}>{item.date}</ThemedText>
          </View>
        </View>
      </View>
    </Pressable>
  );

  const ListHeader = () => (
    <View style={styles.headerContent}>
      <View style={styles.logoContainer}>
        <Image source={appIcon} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Kelime veya ilan No. ile ara"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {CATEGORIES.map((cat) => (
          <Pressable key={cat.id} style={styles.categoryItem}>
            <View style={styles.categoryCircle} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={MOCK_VEHICLES}
        renderItem={renderVehicle}
        keyExtractor={(item) => item.id}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight + Spacing.xl },
        ]}
        ListHeaderComponent={ListHeader}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  headerContent: {
    marginBottom: Spacing.lg,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  logo: {
    width: 40,
    height: 40,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: Spacing.md,
    height: 44,
    marginBottom: Spacing.lg,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#000000",
  },
  categoriesContainer: {
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  categoryItem: {
    alignItems: "center",
    marginRight: Spacing.sm,
  },
  categoryCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E5E7EB",
  },
  categoryText: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: CARD_GAP,
  },
  vehicleCard: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  vehicleImageContainer: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#F9FAFB",
  },
  vehicleImagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  vehicleInfo: {
    padding: 6,
  },
  vehicleTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  vehicleTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#000000",
    flex: 1,
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  locationText: {
    fontSize: 9,
    color: "#1C6BF9",
  },
  vehiclePriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  vehiclePrice: {
    fontSize: 10,
    fontWeight: "600",
    color: "#000000",
  },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  dateText: {
    fontSize: 8,
    color: "#9CA3AF",
  },
});
