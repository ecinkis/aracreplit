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
  Modal,
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
import { Listing, Story } from "@shared/schema";
import defaultVehicleImage from "../assets/images/default-vehicle.png";
import { getApiUrl } from "@/lib/query-client";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_GAP = 8;
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - CARD_GAP * 2) / 3;

const DEMO_STORIES = [
  { id: "1", brandName: "BMW Turkiye", title: "Yeni BMW M5", imageUrl: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800", isActive: true, viewCount: 0, expiresAt: new Date(Date.now() + 86400000).toISOString(), createdAt: new Date().toISOString() },
  { id: "2", brandName: "Mercedes", title: "Mercedes EQS", imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800", isActive: true, viewCount: 0, expiresAt: new Date(Date.now() + 86400000).toISOString(), createdAt: new Date().toISOString() },
  { id: "3", brandName: "Audi TR", title: "Audi RS e-tron GT", imageUrl: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800", isActive: true, viewCount: 0, expiresAt: new Date(Date.now() + 86400000).toISOString(), createdAt: new Date().toISOString() },
  { id: "4", brandName: "Volkswagen", title: "VW ID.4", imageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800", isActive: true, viewCount: 0, expiresAt: new Date(Date.now() + 86400000).toISOString(), createdAt: new Date().toISOString() },
  { id: "5", brandName: "Toyota", title: "Toyota Supra", imageUrl: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800", isActive: true, viewCount: 0, expiresAt: new Date(Date.now() + 86400000).toISOString(), createdAt: new Date().toISOString() },
  { id: "6", brandName: "Honda", title: "Honda Civic Type R", imageUrl: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800", isActive: true, viewCount: 0, expiresAt: new Date(Date.now() + 86400000).toISOString(), createdAt: new Date().toISOString() },
];

type StoryItem = typeof DEMO_STORIES[0] | Story;

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
              <Feather name="map-pin" size={8} color="#1C6BF9" />
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
              <Feather name="map-pin" size={8} color="#1C6BF9" />
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
      <ActivityIndicator size="large" color={BrandColors.primaryBlue} />
    </View>
  );
}

export default function VitrinScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStory, setSelectedStory] = useState<StoryItem | null>(null);

  const { data: listings, isLoading, refetch } = useQuery<Listing[]>({
    queryKey: ["/api/listings"],
  });

  const { data: featuredListings } = useQuery<Listing[]>({
    queryKey: ["/api/listings/featured"],
  });

  const { data: apiStories } = useQuery<Story[]>({
    queryKey: ["/api/stories"],
  });

  const displayStories = apiStories && apiStories.length > 0 ? apiStories : DEMO_STORIES;

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
      <View style={styles.titleSpacer} />
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
        {displayStories.map((story) => (
          <Pressable 
            key={story.id} 
            style={styles.storyItem}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedStory(story);
            }}
          >
            <View style={[
              styles.storyRing,
              story.isActive ? styles.storyRingActive : styles.storyRingInactive,
            ]}>
              <Image 
                source={{ uri: story.imageUrl }} 
                style={styles.storyAvatar}
                resizeMode="cover"
              />
            </View>
            <ThemedText style={styles.storyUsername} numberOfLines={1}>
              {story.brandName}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {featuredListings && featuredListings.length > 0 ? (
        <View style={styles.featuredSection}>
          <View style={styles.featuredHeader}>
            <View style={styles.featuredTitleRow}>
              <Feather name="star" size={18} color="#000000" />
              <ThemedText style={styles.featuredTitle}>Vitrin İlanları</ThemedText>
            </View>
            <ThemedText style={styles.featuredSubtitle}>Öne çıkan araçlar</ThemedText>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          >
            {featuredListings.map((item, index) => (
              <Pressable
                key={item.id}
                style={styles.featuredCard}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  handleListingPress(item.id);
                }}
              >
                <View style={styles.featuredBadge}>
                  <Feather name="star" size={10} color="#FFFFFF" />
                  <ThemedText style={styles.featuredBadgeText}>VİTRİN</ThemedText>
                </View>
                <Image
                  source={item.photos && item.photos.length > 0 ? { uri: item.photos[0] } : defaultVehicleImage}
                  style={styles.featuredImage}
                  resizeMode="cover"
                />
                <View style={styles.featuredInfo}>
                  <ThemedText style={styles.featuredCardTitle} numberOfLines={1}>
                    {item.brand} {item.model}
                  </ThemedText>
                  <ThemedText style={styles.featuredCardSubtitle}>
                    {item.year} · {item.km.toLocaleString("tr-TR")} km
                  </ThemedText>
                  <View style={styles.featuredCityRow}>
                    <Feather name="map-pin" size={10} color={BrandColors.primaryBlue} />
                    <ThemedText style={styles.featuredCityText}>{item.city}</ThemedText>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.allListingsHeader}>
        <ThemedText style={styles.allListingsTitle}>Tüm İlanlar</ThemedText>
      </View>
    </View>
  );

  const hasListings = listings && listings.length > 0;
  const mockData = Array.from({ length: 9 }, (_, i) => ({ id: String(i + 1) }));

  return (
    <View style={[styles.container, { paddingTop: 4 }]}>
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
              tintColor={BrandColors.primaryBlue}
            />
          }
        />
      )}

      <Modal
        visible={selectedStory !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedStory(null)}
      >
        <Pressable
          style={styles.storyModalOverlay}
          onPress={() => setSelectedStory(null)}
        >
          <View style={styles.storyModalContent}>
            <View style={styles.storyModalHeader}>
              <View style={styles.storyModalUserInfo}>
                <Image
                  source={{ uri: selectedStory?.imageUrl }}
                  style={styles.storyModalAvatar}
                  resizeMode="cover"
                />
                <View>
                  <ThemedText style={styles.storyModalUsername}>
                    {selectedStory?.brandName}
                  </ThemedText>
                  <ThemedText style={styles.storyModalTime}>
                    {selectedStory?.title}
                  </ThemedText>
                </View>
              </View>
              <Pressable
                onPress={() => setSelectedStory(null)}
                style={styles.storyModalClose}
              >
                <Feather name="x" size={24} color="#FFFFFF" />
              </Pressable>
            </View>
            <View style={styles.storyProgressContainer}>
              <View style={styles.storyProgressBar} />
            </View>
            <Image
              source={{ uri: selectedStory?.imageUrl }}
              style={styles.storyModalImage}
              resizeMode="cover"
            />
            <View style={styles.storyModalFooter}>
              <ThemedText style={styles.storyModalFooterText}>
                {selectedStory?.title}
              </ThemedText>
            </View>
          </View>
        </Pressable>
      </Modal>
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
  titleSpacer: {
    height: 44,
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
    justifyContent: "center",
    alignItems: "center",
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
  storyAvatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  featuredSection: {
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  featuredHeader: {
    marginBottom: Spacing.sm,
  },
  featuredTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
  },
  featuredSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  featuredList: {
    paddingRight: Spacing.lg,
  },
  featuredCard: {
    width: 160,
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    marginRight: Spacing.sm,
    borderWidth: 2,
    borderColor: "#000000",
  },
  featuredBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#000000",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    zIndex: 10,
  },
  featuredBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  featuredImage: {
    width: "100%",
    height: 100,
    backgroundColor: "#F9FAFB",
  },
  featuredInfo: {
    padding: Spacing.sm,
  },
  featuredCardTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000000",
  },
  featuredCardSubtitle: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  featuredCityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  featuredCityText: {
    fontSize: 11,
    color: BrandColors.primaryBlue,
  },
  allListingsHeader: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  allListingsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
  },
  storyModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  storyModalContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
  },
  storyModalHeader: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    zIndex: 10,
  },
  storyModalUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  storyModalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  storyModalUsername: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  storyModalTime: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
  storyModalClose: {
    padding: Spacing.sm,
  },
  storyProgressContainer: {
    position: "absolute",
    top: 50,
    left: Spacing.md,
    right: Spacing.md,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    zIndex: 10,
  },
  storyProgressBar: {
    width: "100%",
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 2,
  },
  storyModalImage: {
    width: "100%",
    height: "70%",
  },
  storyModalFooter: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  storyModalFooterText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
});
