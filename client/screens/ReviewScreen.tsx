import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useMutation } from "@tanstack/react-query";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius, BrandColors } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ReviewRouteProp = RouteProp<RootStackParamList, "Review">;

const STAR_LABELS = [
  "",
  "Cok Kotu",
  "Kotu",
  "Orta",
  "Iyi",
  "Mukemmel",
];

export default function ReviewScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ReviewRouteProp>();
  const { matchId, reviewerId, reviewedUserId, reviewedUserName } = route.params;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          reviewerId,
          reviewedUserId,
          matchId,
          rating,
          comment: comment.trim() || null,
        }),
      });
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    },
  });

  const handleStarPress = (starIndex: number) => {
    Haptics.selectionAsync();
    setRating(starIndex);
  };

  const handleSubmit = () => {
    if (rating === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    submitReviewMutation.mutate();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Feather name="x" size={24} color="#000000" />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Degerlendirme Yap</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.userSection}>
          <View style={styles.avatarPlaceholder}>
            <Feather name="user" size={32} color="#9CA3AF" />
          </View>
          <ThemedText style={styles.userName}>{reviewedUserName}</ThemedText>
          <ThemedText style={styles.swapLabel}>Takas Deneyiminizi Puanlayin</ThemedText>
        </View>

        <View style={styles.starsSection}>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => handleStarPress(star)}
                style={({ pressed }) => [
                  styles.starButton,
                  pressed && { transform: [{ scale: 1.2 }] }
                ]}
              >
                <Feather
                  name="star"
                  size={40}
                  color={star <= rating ? "#FBBF24" : "#E5E7EB"}
                  style={star <= rating ? styles.starFilled : undefined}
                />
              </Pressable>
            ))}
          </View>
          {rating > 0 ? (
            <ThemedText style={styles.ratingLabel}>{STAR_LABELS[rating]}</ThemedText>
          ) : null}
        </View>

        <View style={styles.commentSection}>
          <ThemedText style={styles.commentLabel}>Yorum (Istege Bagli)</ThemedText>
          <TextInput
            style={styles.commentInput}
            placeholder="Takas deneyiminizi paylasın..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            rating === 0 && styles.submitButtonDisabled,
            pressed && rating > 0 && { opacity: 0.9 }
          ]}
          onPress={handleSubmit}
          disabled={rating === 0 || submitReviewMutation.isPending}
        >
          {submitReviewMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Feather name="check" size={20} color="#FFFFFF" />
              <ThemedText style={styles.submitButtonText}>Degerlendirmeyi Gonder</ThemedText>
            </>
          )}
        </Pressable>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  userSection: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
    marginBottom: Spacing.xs,
  },
  swapLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  starsSection: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  starsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  starButton: {
    padding: Spacing.xs,
  },
  starFilled: {
    textShadowColor: "#FBBF24",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FBBF24",
  },
  commentSection: {
    flex: 1,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: Spacing.sm,
  },
  commentInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: 15,
    color: "#000000",
    minHeight: 120,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: BrandColors.primaryBlue,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
  },
  submitButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
