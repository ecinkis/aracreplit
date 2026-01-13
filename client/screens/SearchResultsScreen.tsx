import React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius, BrandColors } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { Listing } from "@shared/schema";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SearchResultsRouteProp = RouteProp<RootStackParamList, "SearchResults">;

export default function SearchResultsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SearchResultsRouteProp>();
  const { brandName, modelName } = route.params;

  const { data: listings, isLoading } = useQuery<Listing[]>({
    queryKey: ["/api/listings"],
  });

  const filteredListings = listings?.filter(
    (listing) =>
      listing.brand.toLowerCase().includes(brandName.toLowerCase()) ||
      listing.model.toLowerCase().includes(modelName.toLowerCase())
  ) || [];

  const handleListingPress = (listingId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("ListingDetail", { listingId });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <View style={styles.headerContent}>
            <Pressable 
              onPress={() => navigation.goBack()} 
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="arrow-left" size={24} color="#FFFFFF" />
            </Pressable>
            <ThemedText style={styles.headerTitle}>{brandName} {modelName}</ThemedText>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BrandColors.primaryBlue} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <Pressable 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </Pressable>
          <ThemedText style={styles.headerTitle}>{brandName} {modelName}</ThemedText>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.resultInfo}>
          <ThemedText style={styles.resultCount}>
            {filteredListings.length} ilan bulundu
          </ThemedText>
        </View>

        <FlatList
          data={filteredListings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + Spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.listingCard,
                pressed && styles.listingCardPressed,
              ]}
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
    backgroundColor: "#000000",
    paddingBottom: Spacing.lg,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  backButton: {
    marginRight: Spacing.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
  },
  listingCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  listingCardPressed: {
    backgroundColor: "#F9FAFB",
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
});
