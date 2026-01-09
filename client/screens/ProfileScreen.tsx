import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Spacing, BorderRadius, Typography, BrandColors } from "@/constants/theme";
import { Listing, Match, Favorite } from "@shared/schema";
import defaultAvatarImage from "../assets/images/default-avatar.png";
import defaultVehicleImage from "../assets/images/default-vehicle.png";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function StatCard({ icon, label, value }: { icon: string; label: string; value: number }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: theme.backgroundSecondary }]}>
      <Feather name={icon as any} size={20} color={BrandColors.primaryOrange} />
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

function ListingMiniCard({ listing, onPress }: { listing: Listing; onPress: () => void }) {
  const { theme } = useTheme();
  const photoUrl = listing.photos && listing.photos.length > 0 ? listing.photos[0] : null;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.miniCard,
        { backgroundColor: theme.cardBackground },
        pressed && { opacity: 0.8 },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <Image
        source={photoUrl ? { uri: photoUrl } : defaultVehicleImage}
        style={styles.miniCardImage}
        resizeMode="cover"
      />
      <View style={styles.miniCardContent}>
        <ThemedText style={styles.miniCardTitle} numberOfLines={1}>
          {listing.brand} {listing.model}
        </ThemedText>
        <ThemedText style={[styles.miniCardSubtitle, { color: theme.textSecondary }]}>
          {listing.year}
        </ThemedText>
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { user } = useAuth();

  const { data: userListings, isLoading: listingsLoading } = useQuery<Listing[]>({
    queryKey: ["/api/users", user?.id, "listings"],
    enabled: !!user?.id,
  });

  const { data: matches } = useQuery<Match[]>({
    queryKey: ["/api/matches", user?.id],
    enabled: !!user?.id,
  });

  const { data: favorites } = useQuery<Favorite[]>({
    queryKey: ["/api/favorites", user?.id],
    enabled: !!user?.id,
  });

  const handleListingPress = (listingId: string) => {
    navigation.navigate("ListingDetail", { listingId });
  };

  const trustScore = user?.trustScore || 0;
  const phoneVerified = user?.phoneVerified || false;

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <ThemedText style={styles.headerTitle}>Profil</ThemedText>
        <Pressable
          style={({ pressed }) => [styles.settingsButton, pressed && { opacity: 0.7 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate("Settings");
          }}
        >
          <Feather name="settings" size={22} color={theme.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.profileCard, { backgroundColor: theme.cardBackground }]}>
          <Image source={defaultAvatarImage} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <ThemedText style={styles.profileName}>
              {user?.name || "İsim belirtilmedi"}
            </ThemedText>
            <ThemedText style={[styles.profilePhone, { color: theme.textSecondary }]}>
              {user?.phone}
            </ThemedText>
            {phoneVerified && (
              <View style={styles.verifiedBadge}>
                <Feather name="check-circle" size={14} color={BrandColors.successGreen} />
                <ThemedText style={styles.verifiedText}>Telefon Doğrulandı</ThemedText>
              </View>
            )}
          </View>
          <Pressable
            style={styles.editButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("EditProfile");
            }}
          >
            <Feather name="edit-2" size={18} color={BrandColors.primaryOrange} />
          </Pressable>
        </View>

        <View style={[styles.trustScoreCard, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.trustScoreHeader}>
            <ThemedText style={styles.trustScoreLabel}>Güven Skoru</ThemedText>
            <ThemedText style={styles.trustScoreValue}>{trustScore}/100</ThemedText>
          </View>
          <View style={styles.trustScoreBar}>
            <View
              style={[
                styles.trustScoreFill,
                { width: `${trustScore}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatCard icon="file-text" label="İlanlarım" value={userListings?.length || 0} />
          <StatCard icon="heart" label="Eşleşmeler" value={matches?.length || 0} />
          <StatCard icon="star" label="Favoriler" value={favorites?.length || 0} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>İlanlarım</ThemedText>
            <ThemedText style={[styles.sectionCount, { color: theme.textSecondary }]}>
              {userListings?.length || 0}/5
            </ThemedText>
          </View>
          {listingsLoading ? (
            <ActivityIndicator size="small" color={BrandColors.primaryOrange} />
          ) : userListings && userListings.length > 0 ? (
            <FlatList
              data={userListings}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ListingMiniCard
                  listing={item}
                  onPress={() => handleListingPress(item.id)}
                />
              )}
              contentContainerStyle={styles.horizontalList}
            />
          ) : (
            <Pressable
              style={[styles.addListingCard, { backgroundColor: theme.backgroundSecondary }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                (navigation.getParent() as any)?.navigate("CreateTab");
              }}
            >
              <Feather name="plus" size={32} color={BrandColors.primaryOrange} />
              <ThemedText style={styles.addListingText}>İlan Ekle</ThemedText>
            </Pressable>
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
  settingsButton: {
    padding: Spacing.sm,
  },
  content: {
    paddingHorizontal: Spacing.md,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.full,
  },
  profileInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  profileName: {
    ...Typography.h3,
    marginBottom: 4,
  },
  profilePhone: {
    ...Typography.small,
    marginBottom: Spacing.xs,
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
  editButton: {
    padding: Spacing.sm,
  },
  trustScoreCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  trustScoreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  trustScoreLabel: {
    ...Typography.small,
    fontWeight: "600",
  },
  trustScoreValue: {
    ...Typography.h3,
    color: BrandColors.primaryOrange,
  },
  trustScoreBar: {
    height: 8,
    backgroundColor: "#E5E8EB",
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  trustScoreFill: {
    height: "100%",
    backgroundColor: BrandColors.primaryOrange,
    borderRadius: BorderRadius.full,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  statValue: {
    ...Typography.h3,
    marginTop: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
    marginTop: 2,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
  },
  sectionCount: {
    ...Typography.small,
  },
  horizontalList: {
    gap: Spacing.sm,
  },
  miniCard: {
    width: 140,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  miniCardImage: {
    width: "100%",
    height: 90,
    backgroundColor: "#E5E8EB",
  },
  miniCardContent: {
    padding: Spacing.sm,
  },
  miniCardTitle: {
    ...Typography.small,
    fontWeight: "600",
  },
  miniCardSubtitle: {
    ...Typography.caption,
  },
  addListingCard: {
    width: 140,
    height: 130,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: BrandColors.primaryOrange,
  },
  addListingText: {
    ...Typography.small,
    color: BrandColors.primaryOrange,
    marginTop: Spacing.sm,
  },
});
