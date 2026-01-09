import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, BrandColors } from "@/constants/theme";
import { Listing } from "@shared/schema";
import { apiRequest } from "@/lib/query-client";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import emptyMatchesImage from "../assets/images/empty-states/empty-matches.png";
import defaultVehicleImage from "../assets/images/default-vehicle.png";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const CARD_WIDTH = SCREEN_WIDTH - Spacing.xl * 2;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.52;

const DEMO_LISTINGS = [
  { id: "demo1", brand: "BMW", model: "320i", year: 2021, km: 45000, city: "Kadikoy", estimatedValue: 1850000, photos: ["https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80"] },
  { id: "demo2", brand: "Mercedes", model: "C180", year: 2020, km: 62000, city: "Besiktas", estimatedValue: 2100000, photos: ["https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80"] },
  { id: "demo3", brand: "Audi", model: "A4", year: 2019, km: 78000, city: "Sisli", estimatedValue: 1650000, photos: ["https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80"] },
  { id: "demo4", brand: "Volkswagen", model: "Passat", year: 2022, km: 25000, city: "Uskudar", estimatedValue: 1450000, photos: ["https://images.unsplash.com/photo-1632245889029-e406faaa34cd?w=800&q=80"] },
  { id: "demo5", brand: "Toyota", model: "Corolla", year: 2021, km: 38000, city: "Bakirkoy", estimatedValue: 1250000, photos: ["https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80"] },
] as Listing[];

function SwipeCard({
  listing,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onDetailPress,
  isFirst,
}: {
  listing: Listing;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
  onDetailPress: () => void;
  isFirst: boolean;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const photoUrl = listing.photos && listing.photos.length > 0 ? listing.photos[0] : null;

  const handleSwipeComplete = useCallback((direction: "left" | "right" | "up") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (direction === "left") {
      onSwipeLeft();
    } else if (direction === "right") {
      onSwipeRight();
    } else {
      onSwipeUp();
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp]);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (event.translationY < -100) {
        translateY.value = withSpring(-SCREEN_HEIGHT);
        runOnJS(handleSwipeComplete)("up");
      } else if (event.translationX > SWIPE_THRESHOLD) {
        translateX.value = withSpring(SCREEN_WIDTH * 1.5);
        runOnJS(handleSwipeComplete)("right");
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5);
        runOnJS(handleSwipeComplete)("left");
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-12, 0, 12],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolate.CLAMP),
  }));

  const nopeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], Extrapolate.CLAMP),
  }));

  const favoriteOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [-100, 0], [1, 0], Extrapolate.CLAMP),
  }));

  const formattedPrice = listing.estimatedValue 
    ? listing.estimatedValue.toLocaleString("tr-TR") 
    : "0";

  if (!isFirst) {
    return (
      <View style={[styles.card, styles.cardBehind]}>
        <Image
          source={photoUrl ? { uri: photoUrl } : defaultVehicleImage}
          style={styles.cardImage}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <Image
          source={photoUrl ? { uri: photoUrl } : defaultVehicleImage}
          style={styles.cardImage}
          resizeMode="cover"
        />
        
        <View style={styles.topBadgesRow}>
          <View style={styles.distanceBadge}>
            <Feather name="map-pin" size={12} color="#FFFFFF" />
            <ThemedText style={styles.distanceText}>
              {listing.city || "Istanbul"}
            </ThemedText>
          </View>
          <View style={styles.yearBadge}>
            <ThemedText style={styles.yearText}>{listing.year}</ThemedText>
          </View>
        </View>

        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.95)"]}
          style={styles.gradient}
        />

        <Animated.View style={[styles.likeLabel, likeOpacity]}>
          <ThemedText style={styles.likeLabelText}>TAKAS</ThemedText>
        </Animated.View>
        <Animated.View style={[styles.nopeLabel, nopeOpacity]}>
          <ThemedText style={styles.nopeLabelText}>GEC</ThemedText>
        </Animated.View>
        <Animated.View style={[styles.favoriteLabel, favoriteOpacity]}>
          <ThemedText style={styles.favoriteLabelText}>FAVORI</ThemedText>
        </Animated.View>

        <View style={styles.cardContent}>
          <View style={styles.cardInfoSection}>
            <ThemedText style={styles.cardTitle}>
              {listing.brand} {listing.model}
            </ThemedText>
            <View style={styles.cardSpecs}>
              <View style={styles.specItem}>
                <Feather name="activity" size={14} color="#9CA3AF" />
                <ThemedText style={styles.specText}>
                  {listing.km.toLocaleString("tr-TR")} km
                </ThemedText>
              </View>
              <View style={styles.specDivider} />
              <View style={styles.specItem}>
                <Feather name="tag" size={14} color="#9CA3AF" />
                <ThemedText style={styles.specText}>
                  {formattedPrice} TL
                </ThemedText>
              </View>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.detailButton,
              pressed && styles.detailButtonPressed,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onDetailPress();
            }}
          >
            <ThemedText style={styles.detailButtonText}>Detaylari Gor</ThemedText>
            <Feather name="chevron-right" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Image source={emptyMatchesImage} style={styles.emptyImage} resizeMode="contain" />
      <ThemedText style={styles.emptyTitle}>Su an icin arac yok</ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        Once bir ilan ekleyerek takasa basla
      </ThemedText>
    </View>
  );
}

export default function MatchScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();
  const { user, selectedListingId } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: userListings } = useQuery<Listing[]>({
    queryKey: ["/api/users", user?.id, "listings"],
    queryFn: async () => {
      const response = await fetch(`/api/users/${user?.id}/listings`);
      return response.json();
    },
    enabled: !!user?.id,
  });

  const activeListingId = selectedListingId || (userListings && userListings[0]?.id);

  const { data: swipeableListings, isLoading } = useQuery<Listing[]>({
    queryKey: ["/api/swipe", user?.id, activeListingId],
    enabled: !!user?.id && !!activeListingId,
  });

  const swipeMutation = useMutation({
    mutationFn: async (data: {
      fromUserId: string;
      toUserId: string;
      fromListingId: string;
      toListingId: string;
      liked: boolean;
    }) => {
      return apiRequest("/api/swipe", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      if (data.isMatch) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    },
  });

  const handleSwipe = useCallback(async (direction: "left" | "right" | "up") => {
    const allListings = swipeableListings && swipeableListings.length > 0 ? swipeableListings : DEMO_LISTINGS;
    if (currentIndex >= allListings.length) return;
    
    const listing = allListings[currentIndex];
    const liked = direction === "right" || direction === "up";

    if (user?.id && activeListingId && listing.userId) {
      swipeMutation.mutate({
        fromUserId: user.id,
        toUserId: listing.userId,
        fromListingId: activeListingId,
        toListingId: listing.id,
        liked,
      });
    }

    setCurrentIndex((prev) => prev + 1);
  }, [swipeableListings, currentIndex, user?.id, activeListingId, swipeMutation]);

  const handleButtonSwipe = (direction: "left" | "right" | "up") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleSwipe(direction);
  };

  const handleDetailPress = (listingId: string) => {
    navigation.navigate("ListingDetail", { listingId });
  };

  const apiListings = swipeableListings?.slice(currentIndex) || [];
  const remainingListings = apiListings.length > 0 ? apiListings : DEMO_LISTINGS.slice(currentIndex);
  const showEmptyState = remainingListings.length === 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.md }]}>
      <View style={styles.titleSpacer} />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ThemedText style={styles.headerTitle}>Kesfet</ThemedText>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={12} color="#6B7280" />
            <ThemedText style={styles.headerLocation}>Istanbul, TR</ThemedText>
          </View>
        </View>
        <Pressable style={styles.filterButton}>
          <Feather name="sliders" size={20} color="#000000" />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      ) : showEmptyState ? (
        <EmptyState />
      ) : (
        <>
          <View style={styles.cardsContainer}>
            {remainingListings.slice(0, 2).reverse().map((listing, index) => (
              <SwipeCard
                key={listing.id}
                listing={listing}
                isFirst={index === remainingListings.slice(0, 2).length - 1}
                onSwipeLeft={() => handleSwipe("left")}
                onSwipeRight={() => handleSwipe("right")}
                onSwipeUp={() => handleSwipe("up")}
                onDetailPress={() => handleDetailPress(listing.id)}
              />
            ))}
          </View>

          <View style={styles.bottomSection}>
            <View style={styles.buttonsContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.rejectButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => handleButtonSwipe("left")}
              >
                <Feather name="x" size={26} color="#EF4444" />
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.likeButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => handleButtonSwipe("right")}
              >
                <Feather name="heart" size={28} color="#10B981" />
              </Pressable>
              
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.superButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => handleButtonSwipe("up")}
              >
                <Feather name="star" size={22} color="#F59E0B" />
              </Pressable>
            </View>

            <View style={[styles.tipSection, { paddingBottom: tabBarHeight + Spacing.sm }]}>
              <ThemedText style={styles.tipText}>
                Saga kaydir: Takas teklifi gonder
              </ThemedText>
              <ThemedText style={styles.tipText}>
                Sola kaydir: Sonraki araca gec
              </ThemedText>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  titleSpacer: {
    height: 44,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  headerLeft: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: -0.5,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerLocation: {
    fontSize: 13,
    color: "#6B7280",
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    position: "absolute",
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  cardBehind: {
    transform: [{ scale: 0.94 }],
    top: 12,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  topBadgesRow: {
    position: "absolute",
    top: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    gap: 4,
    backdropFilter: "blur(10px)",
  },
  distanceText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  yearBadge: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  yearText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
  },
  cardContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
  },
  cardInfoSection: {
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  cardSpecs: {
    flexDirection: "row",
    alignItems: "center",
  },
  specItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  specText: {
    fontSize: 14,
    color: "#D1D5DB",
    fontWeight: "500",
  },
  specDivider: {
    width: 1,
    height: 14,
    backgroundColor: "#4B5563",
    marginHorizontal: Spacing.sm,
  },
  detailButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    gap: 6,
  },
  detailButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  detailButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000000",
  },
  likeLabel: {
    position: "absolute",
    top: 100,
    left: Spacing.xl,
    borderWidth: 4,
    borderColor: "#10B981",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    transform: [{ rotate: "-15deg" }],
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  likeLabelText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#10B981",
    letterSpacing: 2,
  },
  nopeLabel: {
    position: "absolute",
    top: 100,
    right: Spacing.xl,
    borderWidth: 4,
    borderColor: "#EF4444",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    transform: [{ rotate: "15deg" }],
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  nopeLabelText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#EF4444",
    letterSpacing: 2,
  },
  favoriteLabel: {
    position: "absolute",
    top: 100,
    alignSelf: "center",
    borderWidth: 4,
    borderColor: "#F59E0B",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
  },
  favoriteLabelText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#F59E0B",
    letterSpacing: 2,
  },
  bottomSection: {
    marginTop: -Spacing.md,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.lg,
  },
  tipSection: {
    alignItems: "center",
    marginTop: Spacing.md,
    gap: 4,
  },
  tipText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonPressed: {
    transform: [{ scale: 0.9 }],
  },
  rejectButton: {
    borderColor: "#EF4444",
  },
  likeButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderColor: "#10B981",
  },
  superButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderColor: "#F59E0B",
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
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
  },
});
