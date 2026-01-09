import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Spacing, BorderRadius, Typography, BrandColors } from "@/constants/theme";
import { Listing, User } from "@shared/schema";
import { apiRequest } from "@/lib/query-client";
import defaultVehicleImage from "../assets/images/default-vehicle.png";
import defaultAvatarImage from "../assets/images/default-avatar.png";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type ListingDetailRouteProp = RouteProp<RootStackParamList, "ListingDetail">;

function SpecItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.specItem, { backgroundColor: theme.backgroundSecondary }]}>
      <Feather name={icon as any} size={18} color={BrandColors.primaryOrange} />
      <View style={styles.specContent}>
        <ThemedText style={[styles.specLabel, { color: theme.textSecondary }]}>{label}</ThemedText>
        <ThemedText style={styles.specValue}>{value}</ThemedText>
      </View>
    </View>
  );
}

export default function ListingDetailScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<ListingDetailRouteProp>();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { listingId } = route.params;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: listing, isLoading } = useQuery<Listing>({
    queryKey: ["/api/listings", listingId],
  });

  const { data: listingUser } = useQuery<User>({
    queryKey: ["/api/users", listing?.userId],
    enabled: !!listing?.userId,
  });

  const { data: isFavorite } = useQuery<{ isFavorite: boolean }>({
    queryKey: ["/api/favorites", user?.id, listingId, "check"],
    enabled: !!user?.id && !!listingId,
  });

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite?.isFavorite) {
        await apiRequest(`/api/favorites/${user?.id}/${listingId}`, { method: "DELETE" });
      } else {
        await apiRequest("/api/favorites", {
          method: "POST",
          body: JSON.stringify({ userId: user?.id, listingId }),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites", user?.id, listingId, "check"] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites", user?.id] });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest(`/api/listings/${listingId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "listings"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    },
  });

  const handleDelete = () => {
    Alert.alert(
      "İlanı Sil",
      "Bu ilanı silmek istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        { text: "Sil", style: "destructive", onPress: () => deleteMutation.mutate() },
      ]
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BrandColors.primaryOrange} />
      </ThemedView>
    );
  }

  if (!listing) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>İlan bulunamadı</ThemedText>
      </ThemedView>
    );
  }

  const photos = listing.photos && listing.photos.length > 0 ? listing.photos : [];
  const isOwner = listing.userId === user?.id;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setCurrentImageIndex(index);
            }}
          >
            {photos.length > 0 ? (
              photos.map((photo, index) => (
                <Image
                  key={index}
                  source={{ uri: photo }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ))
            ) : (
              <Image
                source={defaultVehicleImage}
                style={styles.image}
                resizeMode="cover"
              />
            )}
          </ScrollView>
          {photos.length > 1 && (
            <View style={styles.pagination}>
              {photos.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentImageIndex && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={styles.titleContent}>
              <ThemedText style={styles.title}>
                {listing.brand} {listing.model}
              </ThemedText>
              <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
                {listing.year} - {listing.km.toLocaleString("tr-TR")} km
              </ThemedText>
            </View>
            {!isOwner && (
              <Pressable
                style={[
                  styles.favoriteButton,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
                onPress={() => favoriteMutation.mutate()}
              >
                <Feather
                  name={isFavorite?.isFavorite ? "heart" : "heart"}
                  size={24}
                  color={isFavorite?.isFavorite ? BrandColors.alertRed : theme.textSecondary}
                  style={{ opacity: isFavorite?.isFavorite ? 1 : 0.5 }}
                />
              </Pressable>
            )}
          </View>

          {listing.swapActive && (
            <View style={styles.swapBadge}>
              <Feather name="repeat" size={16} color="#FFFFFF" />
              <ThemedText style={styles.swapBadgeText}>
                {listing.onlySwap ? "Sadece Takas" : "Takas + Nakit"}
              </ThemedText>
            </View>
          )}

          <View style={styles.specsGrid}>
            <SpecItem icon="calendar" label="Yıl" value={listing.year.toString()} />
            <SpecItem icon="activity" label="Kilometre" value={`${listing.km.toLocaleString("tr-TR")} km`} />
            <SpecItem icon="droplet" label="Yakıt" value={listing.fuelType} />
            <SpecItem icon="settings" label="Vites" value={listing.transmission} />
            <SpecItem icon="map-pin" label="Şehir" value={listing.city} />
            <SpecItem icon="eye" label="Görüntülenme" value={(listing.viewCount || 0).toString()} />
          </View>

          {listing.preferredBrands && listing.preferredBrands.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Kabul Edilen Markalar</ThemedText>
              <View style={styles.brandsContainer}>
                {listing.preferredBrands.map((brand, index) => (
                  <View key={index} style={[styles.brandChip, { backgroundColor: theme.backgroundSecondary }]}>
                    <ThemedText style={styles.brandChipText}>{brand}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {!isOwner && (
            <View style={[styles.userCard, { backgroundColor: theme.cardBackground }]}>
              <Image source={defaultAvatarImage} style={styles.userAvatar} />
              <View style={styles.userInfo}>
                <ThemedText style={styles.userName}>
                  {listingUser?.name || "İlan Sahibi"}
                </ThemedText>
                {listingUser?.phoneVerified && (
                  <View style={styles.verifiedBadge}>
                    <Feather name="check-circle" size={12} color={BrandColors.successGreen} />
                    <ThemedText style={styles.verifiedText}>Doğrulanmış</ThemedText>
                  </View>
                )}
              </View>
              <Pressable
                style={[styles.messageButton, { backgroundColor: BrandColors.primaryOrange }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  Alert.alert("Bilgi", "Mesaj göndermek için önce eşleşmeniz gerekiyor.");
                }}
              >
                <Feather name="message-circle" size={18} color="#FFFFFF" />
                <ThemedText style={styles.messageButtonText}>Mesaj</ThemedText>
              </Pressable>
            </View>
          )}

          {isOwner && (
            <View style={styles.ownerActions}>
              <Pressable
                style={[styles.actionButton, { backgroundColor: theme.backgroundSecondary }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert("Bilgi", "Düzenleme özelliği yakında eklenecek.");
                }}
              >
                <Feather name="edit-2" size={18} color={theme.text} />
                <ThemedText style={styles.actionButtonText}>Düzenle</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.actionButton, { backgroundColor: BrandColors.alertRed }]}
                onPress={handleDelete}
              >
                <Feather name="trash-2" size={18} color="#FFFFFF" />
                <ThemedText style={[styles.actionButtonText, { color: "#FFFFFF" }]}>Sil</ThemedText>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
    backgroundColor: "#E5E8EB",
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
  },
  pagination: {
    flexDirection: "row",
    position: "absolute",
    bottom: Spacing.md,
    alignSelf: "center",
    gap: Spacing.xs,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  paginationDotActive: {
    backgroundColor: "#FFFFFF",
    width: 20,
  },
  content: {
    padding: Spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  titleContent: {
    flex: 1,
  },
  title: {
    ...Typography.h2,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
  },
  favoriteButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  swapBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: Spacing.xs,
    backgroundColor: BrandColors.successGreen,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
  },
  swapBadgeText: {
    ...Typography.small,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  specsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  specItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  specContent: {
    flex: 1,
  },
  specLabel: {
    ...Typography.caption,
  },
  specValue: {
    ...Typography.small,
    fontWeight: "600",
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.sm,
  },
  brandsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  brandChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  brandChipText: {
    ...Typography.small,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
  },
  userInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  userName: {
    ...Typography.body,
    fontWeight: "600",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  verifiedText: {
    ...Typography.caption,
    color: BrandColors.successGreen,
  },
  messageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  messageButtonText: {
    ...Typography.small,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  ownerActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  actionButtonText: {
    ...Typography.button,
  },
});
