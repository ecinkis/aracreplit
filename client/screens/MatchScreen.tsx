import React, { useState, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, Typography, BrandColors } from "@/constants/theme";
import { Listing } from "@shared/schema";
import { apiRequest } from "@/lib/query-client";
import emptyMatchesImage from "../assets/images/empty-states/empty-matches.png";
import defaultVehicleImage from "../assets/images/default-vehicle.png";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

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
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.gradient}
        />
        <Animated.View style={[styles.likeLabel, likeOpacity]}>
          <ThemedText style={styles.likeLabelText}>TAKAS</ThemedText>
        </Animated.View>
        <Animated.View style={[styles.nopeLabel, nopeOpacity]}>
          <ThemedText style={styles.nopeLabelText}>HAYIR</ThemedText>
        </Animated.View>
        <Animated.View style={[styles.favoriteLabel, favoriteOpacity]}>
          <ThemedText style={styles.favoriteLabelText}>FAVORİ</ThemedText>
        </Animated.View>
        <View style={styles.cardInfo}>
          <ThemedText style={styles.cardTitle}>
            {listing.brand} {listing.model}
          </ThemedText>
          <ThemedText style={styles.cardSubtitle}>
            {listing.year} - {listing.km.toLocaleString("tr-TR")} km
          </ThemedText>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={14} color="#FFFFFF" />
            <ThemedText style={styles.locationText}>{listing.city}</ThemedText>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Image source={emptyMatchesImage} style={styles.emptyImage} resizeMode="contain" />
      <ThemedText style={styles.emptyTitle}>Şu an için araç yok</ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        Önce bir ilan ekleyerek takas yapmaya başla
      </ThemedText>
    </View>
  );
}

function NoListingState() {
  return (
    <View style={styles.emptyContainer}>
      <Feather name="alert-circle" size={64} color={BrandColors.warning} />
      <ThemedText style={styles.emptyTitle}>İlan Gerekli</ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        Match yapabilmek için önce bir ilan eklemelisin
      </ThemedText>
    </View>
  );
}

export default function MatchScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user, selectedListingId } = useAuth();
  const queryClient = useQueryClient();
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

  if (!activeListingId) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
          <ThemedText style={styles.headerTitle}>Match</ThemedText>
        </View>
        <NoListingState />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <ThemedText style={styles.headerTitle}>Match</ThemedText>
        {remainingListings.length > 0 && (
          <View style={styles.countBadge}>
            <ThemedText style={styles.countText}>{remainingListings.length}</ThemedText>
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BrandColors.primaryOrange} />
        </View>
      ) : remainingListings.length === 0 ? (
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
              />
            ))}
          </View>

          <View style={[styles.buttonsContainer, { paddingBottom: insets.bottom + 100 }]}>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.rejectButton,
                pressed && { transform: [{ scale: 0.9 }] },
              ]}
              onPress={() => handleButtonSwipe("left")}
            >
              <Feather name="x" size={32} color={BrandColors.alertRed} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.favoriteButton,
                pressed && { transform: [{ scale: 0.9 }] },
              ]}
              onPress={() => handleButtonSwipe("up")}
            >
              <Feather name="star" size={24} color={BrandColors.warning} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                styles.likeButton,
                pressed && { transform: [{ scale: 0.9 }] },
              ]}
              onPress={() => handleButtonSwipe("right")}
            >
              <Feather name="heart" size={32} color={BrandColors.successGreen} />
            </Pressable>
          </View>
        </>
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    ...Typography.h1,
  },
  countBadge: {
    backgroundColor: BrandColors.primaryOrange,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    marginLeft: Spacing.sm,
  },
  countText: {
    ...Typography.caption,
    color: "#FFFFFF",
    fontWeight: "600",
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
    width: SCREEN_WIDTH - Spacing.lg * 2,
    height: SCREEN_HEIGHT * 0.55,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    backgroundColor: "#E5E8EB",
  },
  cardBehind: {
    transform: [{ scale: 0.95 }],
    top: 10,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
  },
  cardInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
  },
  cardTitle: {
    ...Typography.h2,
    color: "#FFFFFF",
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    ...Typography.body,
    color: "rgba(255,255,255,0.9)",
    marginBottom: Spacing.sm,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  locationText: {
    ...Typography.small,
    color: "rgba(255,255,255,0.8)",
  },
  likeLabel: {
    position: "absolute",
    top: Spacing.xl,
    left: Spacing.lg,
    borderWidth: 4,
    borderColor: BrandColors.successGreen,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    transform: [{ rotate: "-15deg" }],
  },
  likeLabelText: {
    ...Typography.h2,
    color: BrandColors.successGreen,
    fontWeight: "700",
  },
  nopeLabel: {
    position: "absolute",
    top: Spacing.xl,
    right: Spacing.lg,
    borderWidth: 4,
    borderColor: BrandColors.alertRed,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    transform: [{ rotate: "15deg" }],
  },
  nopeLabelText: {
    ...Typography.h2,
    color: BrandColors.alertRed,
    fontWeight: "700",
  },
  favoriteLabel: {
    position: "absolute",
    top: Spacing.xl,
    alignSelf: "center",
    borderWidth: 4,
    borderColor: BrandColors.warning,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
  },
  favoriteLabelText: {
    ...Typography.h2,
    color: BrandColors.warning,
    fontWeight: "700",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  rejectButton: {
    borderWidth: 2,
    borderColor: BrandColors.alertRed,
  },
  favoriteButton: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: BrandColors.warning,
  },
  likeButton: {
    borderWidth: 2,
    borderColor: BrandColors.successGreen,
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
    textAlign: "center",
  },
  emptySubtitle: {
    ...Typography.body,
    textAlign: "center",
    opacity: 0.7,
  },
});
