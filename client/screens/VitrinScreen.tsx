import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Spacing, BorderRadius, Typography, BrandColors } from "@/constants/theme";
import { Listing } from "@shared/schema";
import emptyVitrinImage from "../assets/images/empty-states/empty-vitrin.png";
import defaultVehicleImage from "../assets/images/default-vehicle.png";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function ListingCard({ item, index, onPress }: { item: Listing; index: number; onPress: () => void }) {
  const { theme } = useTheme();
  const photoUrl = item.photos && item.photos.length > 0 ? item.photos[0] : null;

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: theme.cardBackground },
          pressed && styles.cardPressed,
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
      >
        <Image
          source={photoUrl ? { uri: photoUrl } : defaultVehicleImage}
          style={styles.cardImage}
          resizeMode="cover"
        />
        {item.swapActive && (
          <View style={styles.badge}>
            <ThemedText style={styles.badgeText}>Takasa Açık</ThemedText>
          </View>
        )}
        <View style={styles.cardContent}>
          <ThemedText style={styles.cardTitle} numberOfLines={1}>
            {item.brand} {item.model}
          </ThemedText>
          <ThemedText style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
            {item.year} - {item.km.toLocaleString("tr-TR")} km
          </ThemedText>
          <View style={styles.cardFooter}>
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={12} color={theme.textSecondary} />
              <ThemedText style={[styles.locationText, { color: theme.textSecondary }]}>
                {item.city}
              </ThemedText>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Image source={emptyVitrinImage} style={styles.emptyImage} resizeMode="contain" />
      <ThemedText style={styles.emptyTitle}>Henüz ilan yok</ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        İlk ilanı sen ekle ve takasa başla!
      </ThemedText>
    </View>
  );
}

function LoadingState() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={BrandColors.primaryOrange} />
    </View>
  );
}

export default function VitrinScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const { data: listings, isLoading, refetch } = useQuery<Listing[]>({
    queryKey: ["/api/listings"],
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleListingPress = (listingId: string) => {
    navigation.navigate("ListingDetail", { listingId });
  };

  const renderItem = ({ item, index }: { item: Listing; index: number }) => (
    <ListingCard
      item={item}
      index={index}
      onPress={() => handleListingPress(item.id)}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <ThemedText style={styles.headerTitle}>Vitrin</ThemedText>
        <Pressable
          style={({ pressed }) => [
            styles.filterButton,
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Feather name="sliders" size={20} color={theme.text} />
        </Pressable>
      </View>

      {isLoading ? (
        <LoadingState />
      ) : !listings || listings.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={listings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={BrandColors.primaryOrange}
            />
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    ...Typography.h1,
  },
  filterButton: {
    padding: Spacing.sm,
  },
  listContent: {
    paddingHorizontal: Spacing.sm,
  },
  row: {
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    marginHorizontal: "1%",
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  cardImage: {
    width: "100%",
    height: 120,
    backgroundColor: "#E5E8EB",
  },
  badge: {
    position: "absolute",
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: BrandColors.successGreen,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  badgeText: {
    ...Typography.caption,
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  cardContent: {
    padding: Spacing.sm,
  },
  cardTitle: {
    ...Typography.small,
    fontWeight: "600",
  },
  cardSubtitle: {
    ...Typography.caption,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    ...Typography.caption,
    fontSize: 11,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  emptyImage: {
    width: 200,
    height: 150,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    ...Typography.h3,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.body,
    textAlign: "center",
    opacity: 0.7,
  },
});
