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
import emptyMatchesImage from "../assets/images/empty-states/empty-matches.png";
import defaultVehicleImage from "../assets/images/default-vehicle.png";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const CARD_WIDTH = SCREEN_WIDTH - Spacing.lg * 2;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.55;

function SwipeCard({
  listing,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  isFirst,
}: {
  listing: Listing;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
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
      [-15, 0, 15],
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
        <View style={styles.distanceBadge}>
          <Feather name="map-pin" size={12} color="#FFFFFF" />
          <ThemedText style={styles.distanceText}>
            {listing.city || "1 km"}
          </ThemedText>
        </View>
        <View style={styles.pageIndicator}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.85)"]}
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
        <View style={styles.cardInfo}>
          <ThemedText style={styles.cardTitle}>
            {listing.brand} {listing.model}, {listing.year}
          </ThemedText>
          <ThemedText style={styles.cardSubtitle}>
            {listing.km.toLocaleString("tr-TR")} km
          </ThemedText>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

function MockCard() {
  return (
    <View style={styles.card}>
      <View style={styles.mockImageContainer}>
        <Feather name="image" size={48} color="#6B7280" />
      </View>
      <View style={styles.distanceBadge}>
        <Feather name="map-pin" size={12} color="#FFFFFF" />
        <ThemedText style={styles.distanceText}>1 km</ThemedText>
      </View>
      <View style={styles.pageIndicator}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.85)"]}
        style={styles.gradient}
      />
      <View style={styles.cardInfo}>
        <ThemedText style={styles.cardTitle}>BMW 320i, 2021</ThemedText>
        <ThemedText style={styles.cardSubtitle}>45.000 km</ThemedText>
      </View>
    </View>
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

function NoListingState() {
  return (
    <View style={styles.emptyContainer}>
      <Feather name="alert-circle" size={64} color={BrandColors.warning} />
      <ThemedText style={styles.emptyTitle}>Ilan Gerekli</ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        Eslesme yapabilmek icin once bir ilan eklemelisin
      </ThemedText>
    </View>
  );
}

export default function MatchScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
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
    if (!swipeableListings || currentIndex >= swipeableListings.length) return;
    
    const listing = swipeableListings[currentIndex];
    const liked = direction === "right" || direction === "up";

    if (user?.id && activeListingId) {
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

  const remainingListings = swipeableListings?.slice(currentIndex) || [];
  const showMockCard = !user?.id || !activeListingId || remainingListings.length === 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.headerButton}>
          <Feather name="chevron-left" size={24} color="#F87171" />
        </Pressable>
        <View style={styles.headerCenter}>
          <ThemedText style={styles.headerTitle}>Kesfet</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Istanbul, TR</ThemedText>
        </View>
        <Pressable style={styles.headerButton}>
          <Feather name="sliders" size={20} color="#F87171" />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F87171" />
        </View>
      ) : (
        <>
          <View style={styles.cardsContainer}>
            {showMockCard ? (
              <MockCard />
            ) : (
              remainingListings.slice(0, 2).reverse().map((listing, index) => (
                <SwipeCard
                  key={listing.id}
                  listing={listing}
                  isFirst={index === remainingListings.slice(0, 2).length - 1}
                  onSwipeLeft={() => handleSwipe("left")}
                  onSwipeRight={() => handleSwipe("right")}
                  onSwipeUp={() => handleSwipe("up")}
                />
              ))
            )}
          </View>

          <View style={[styles.buttonsContainer, { paddingBottom: tabBarHeight + Spacing.lg }]}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.rejectButton,
                pressed && { transform: [{ scale: 0.9 }] },
              ]}
              onPress={() => handleButtonSwipe("left")}
            >
              <Feather name="x" size={28} color="#F87171" />
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.likeButton,
                pressed && { transform: [{ scale: 0.9 }] },
              ]}
              onPress={() => handleButtonSwipe("right")}
            >
              <Feather name="heart" size={32} color="#FFFFFF" />
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.favoriteButton,
                pressed && { transform: [{ scale: 0.9 }] },
              ]}
              onPress={() => handleButtonSwipe("up")}
            >
              <Feather name="star" size={24} color="#A855F7" />
            </Pressable>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 2,
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
    paddingHorizontal: Spacing.lg,
  },
  card: {
    position: "absolute",
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#1F2937",
  },
  cardBehind: {
    transform: [{ scale: 0.95 }],
    top: 10,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  mockImageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#374151",
  },
  distanceBadge: {
    position: "absolute",
    top: Spacing.md,
    left: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  pageIndicator: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: "column",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  dotActive: {
    backgroundColor: "#FFFFFF",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "40%",
  },
  cardInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
  },
  likeLabel: {
    position: "absolute",
    top: 80,
    left: Spacing.lg,
    borderWidth: 4,
    borderColor: "#10B981",
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    transform: [{ rotate: "-15deg" }],
  },
  likeLabelText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#10B981",
  },
  nopeLabel: {
    position: "absolute",
    top: 80,
    right: Spacing.lg,
    borderWidth: 4,
    borderColor: "#EF4444",
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    transform: [{ rotate: "15deg" }],
  },
  nopeLabelText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#EF4444",
  },
  favoriteLabel: {
    position: "absolute",
    top: 80,
    alignSelf: "center",
    borderWidth: 4,
    borderColor: "#A855F7",
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  favoriteLabelText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#A855F7",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  rejectButton: {
    backgroundColor: "#FEF2F2",
  },
  likeButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F87171",
  },
  favoriteButton: {
    backgroundColor: "#FAF5FF",
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
