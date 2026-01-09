import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
  Image,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Spacing, BorderRadius, BrandColors } from "@/constants/theme";
import { Listing } from "@shared/schema";
import defaultVehicleImage from "../assets/images/default-vehicle.png";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_GAP = 8;
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - CARD_GAP * 2) / 3;

const DEMO_STORIES = [
  { id: "1", username: "BMW Turkiye", hasNewStory: true, timeAgo: "2s" },
  { id: "2", username: "Mercedes", hasNewStory: true, timeAgo: "5s" },
  { id: "3", username: "Audi TR", hasNewStory: true, timeAgo: "8s" },
  { id: "4", username: "Volkswagen", hasNewStory: false, timeAgo: "12s" },
  { id: "5", username: "Toyota", hasNewStory: true, timeAgo: "18s" },
  { id: "6", username: "Honda", hasNewStory: false, timeAgo: "22s" },
];

function ListingCard({ item, index, onPress }: { item: Listing; index: number; onPress: () => void }) {
  const photoUrl = item.photos && item.photos.length > 0 ? item.photos[0] : null;
  const formattedPrice = item.estimatedValue 
    ? item.estimatedValue.toLocaleString("tr-TR") 
    : "0";

  return (
    <Animated.View entering={FadeInDown.delay(index * 30).springify()}>
      <Pressable
        style={styles.vehicleCard}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
      >
        <View style={styles.vehicleImageContainer}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.vehicleImage} resizeMode="cover" />
          ) : (
            <Image source={defaultVehicleImage} style={styles.vehicleImage} resizeMode="cover" />
          )}
        </View>
        <View style={styles.vehicleInfo}>
          <View style={styles.vehicleTitleRow}>
            <ThemedText style={styles.vehicleTitle} numberOfLines={1}>
              {item.brand} {item.model}
            </ThemedText>
            <View style={styles.locationBadge}>
              <Feather name="map-pin" size={8} color="#EF4444" />
              <ThemedText style={styles.locationText} numberOfLines={1}>
                {item.city}
              </ThemedText>
            </View>
          </View>
          <View style={styles.vehiclePriceRow}>
            <ThemedText style={styles.vehiclePrice}>₺ {formattedPrice}</ThemedText>
            <View style={styles.dateBadge}>
              <Feather name="clock" size={8} color="#9CA3AF" />
              <ThemedText style={styles.dateText}>
                {new Date(item.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
              </ThemedText>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function MockListingCard({ index }: { index: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 30).springify()}>
      <Pressable style={styles.vehicleCard}>
        <View style={styles.vehicleImageContainer}>
          <View style={styles.vehicleImagePlaceholder}>
            <Feather name="image" size={24} color="#9CA3AF" />
          </View>
        </View>
        <View style={styles.vehicleInfo}>
          <View style={styles.vehicleTitleRow}>
            <ThemedText style={styles.vehicleTitle} numberOfLines={1}>
              Audi A5
            </ThemedText>
            <View style={styles.locationBadge}>
              <Feather name="map-pin" size={8} color="#EF4444" />
              <ThemedText style={styles.locationText} numberOfLines={1}>
                Esenyurt
              </ThemedText>
            </View>
          </View>
          <View style={styles.vehiclePriceRow}>
            <ThemedText style={styles.vehiclePrice}>₺ 1.500.000</ThemedText>
            <View style={styles.dateBadge}>
              <Feather name="clock" size={8} color="#9CA3AF" />
              <ThemedText style={styles.dateText}>6 Eylül</ThemedText>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
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
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const renderMockItem = ({ index }: { index: number }) => (
    <MockListingCard index={index} />
  );

  const ListHeader = () => (
    <View style={styles.headerContent}>
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
        contentContainerStyle={styles.storiesContainer}
      >
        {DEMO_STORIES.map((story) => (
          <Pressable key={story.id} style={styles.storyItem}>
            <View style={[
              styles.storyRing,
              story.hasNewStory ? styles.storyRingActive : styles.storyRingInactive,
            ]}>
              <View style={styles.storyCircle}>
                <Feather name="user" size={20} color="#9CA3AF" />
              </View>
            </View>
            <ThemedText style={styles.storyUsername} numberOfLines={1}>
              {story.username}
            </ThemedText>
            {story.timeAgo ? (
              <ThemedText style={styles.storyTime}>{story.timeAgo}</ThemedText>
            ) : null}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  const hasListings = listings && listings.length > 0;
  const mockData = Array.from({ length: 9 }, (_, i) => ({ id: String(i + 1) }));

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.md }]}>
      {isLoading ? (
        <LoadingState />
      ) : (
        <FlatList
          data={hasListings ? listings : mockData}
          renderItem={hasListings ? renderItem : ({ index }) => renderMockItem({ index })}
          keyExtractor={(item) => ('id' in item ? item.id : String(item))}
          numColumns={3}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: tabBarHeight + Spacing.xl },
          ]}
          ListHeaderComponent={ListHeader}
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
  storiesContainer: {
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  storyItem: {
    alignItems: "center",
    width: 72,
    marginRight: Spacing.xs,
  },
  storyRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 3,
    marginBottom: 4,
  },
  storyRingActive: {
    borderWidth: 2,
    borderColor: "#F87171",
  },
  storyRingInactive: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  storyCircle: {
    flex: 1,
    borderRadius: 30,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  storyUsername: {
    fontSize: 10,
    color: "#374151",
    textAlign: "center",
  },
  storyTime: {
    fontSize: 9,
    color: "#9CA3AF",
    marginTop: 1,
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
  vehicleImage: {
    width: "100%",
    height: "100%",
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
    color: "#EF4444",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
