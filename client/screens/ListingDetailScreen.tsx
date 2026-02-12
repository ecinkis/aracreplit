import React, { useState, useLayoutEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Linking,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation, RouteProp, NavigationProp } from "@react-navigation/native";
import { HeaderButton, useHeaderHeight } from "@react-navigation/elements";
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
import { apiRequest, getApiUrl } from "@/lib/query-client";
import defaultVehicleImage from "../assets/images/default-vehicle.png";
import defaultAvatarImage from "../assets/images/default-avatar.png";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type ListingDetailRouteProp = RouteProp<RootStackParamList, "ListingDetail">;
type ListingDetailNavigationProp = NavigationProp<RootStackParamList>;

function SpecItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.specItem, { backgroundColor: theme.backgroundSecondary }]}>
      <Feather name={icon as any} size={18} color={BrandColors.primaryBlue} />
      <View style={styles.specContent}>
        <ThemedText style={[styles.specLabel, { color: theme.textSecondary }]}>{label}</ThemedText>
        <ThemedText style={styles.specValue}>{value}</ThemedText>
      </View>
    </View>
  );
}

export default function ListingDetailScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const route = useRoute<ListingDetailRouteProp>();
  const navigation = useNavigation<ListingDetailNavigationProp>();
  const { theme } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { listingId } = route.params;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [priceAlertModalVisible, setPriceAlertModalVisible] = useState(false);
  const [targetPrice, setTargetPrice] = useState("");
  const [offerModalVisible, setOfferModalVisible] = useState(false);
  const [customOfferPrice, setCustomOfferPrice] = useState("");
  const [activeTab, setActiveTab] = useState<"info" | "description">("info");
  const [selectedOfferOption, setSelectedOfferOption] = useState<"10" | "15" | "custom" | null>(null);

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

  const { data: priceAlertData } = useQuery<{ hasAlert: boolean; alert: any }>({
    queryKey: ["/api/price-alerts", user?.id, listingId, "check"],
    enabled: !!user?.id && !!listingId,
  });

  const createPriceAlertMutation = useMutation({
    mutationFn: async (price: number) => {
      await apiRequest("/api/price-alerts", {
        method: "POST",
        body: JSON.stringify({
          userId: user?.id,
          listingId,
          targetPrice: price,
          originalPrice: listing?.estimatedValue || 0,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/price-alerts", user?.id, listingId, "check"] });
      queryClient.invalidateQueries({ queryKey: ["/api/price-alerts", user?.id] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPriceAlertModalVisible(false);
      setTargetPrice("");
      Alert.alert("Fiyat Alarmı", "Fiyat alarmı başarıyla oluşturuldu!");
    },
    onError: () => {
      Alert.alert("Hata", "Fiyat alarmı oluşturulamadı.");
    },
  });

  const deletePriceAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      await apiRequest(`/api/price-alerts/${alertId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/price-alerts", user?.id, listingId, "check"] });
      queryClient.invalidateQueries({ queryKey: ["/api/price-alerts", user?.id] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Fiyat Alarmı", "Fiyat alarmı kaldırıldı.");
    },
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
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id, "listing-quota"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    },
  });

  const handleDelete = () => {
    if (Platform.OS === "web") {
      if (window.confirm("Bu ilani silmek istediginize emin misiniz?")) {
        deleteMutation.mutate();
      }
    } else {
      Alert.alert(
        "Ilani Sil",
        "Bu ilani silmek istediginize emin misiniz?",
        [
          { text: "Iptal", style: "cancel" },
          { text: "Sil", style: "destructive", onPress: () => deleteMutation.mutate() },
        ]
      );
    }
  };

  const isOwner = listing?.userId === user?.id;

  useLayoutEffect(() => {
    if (!listing || isOwner) return;
    
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row", gap: 8, marginRight: 15 }}>
          <HeaderButton
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (priceAlertData?.hasAlert) {
                Alert.alert(
                  "Fiyat Alarmı",
                  "Bu ilan için fiyat alarmı mevcut. Kaldırmak ister misiniz?",
                  [
                    { text: "İptal", style: "cancel" },
                    { 
                      text: "Kaldır", 
                      style: "destructive", 
                      onPress: () => deletePriceAlertMutation.mutate(priceAlertData.alert.id) 
                    },
                  ]
                );
              } else {
                setPriceAlertModalVisible(true);
              }
            }}
          >
            <Feather
              name="bell"
              size={22}
              color={priceAlertData?.hasAlert ? BrandColors.primaryBlue : "#666666"}
            />
          </HeaderButton>
          <HeaderButton onPress={() => favoriteMutation.mutate()}>
            <Feather
              name="heart"
              size={22}
              color={isFavorite?.isFavorite ? BrandColors.alertRed : "#666666"}
            />
          </HeaderButton>
        </View>
      ),
    });
  }, [navigation, listing, isOwner, priceAlertData, isFavorite, favoriteMutation, deletePriceAlertMutation]);

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BrandColors.primaryBlue} />
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

  return (
    <View style={[styles.container, { backgroundColor: "#FFFFFF" }]}>
      <ScrollView
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: insets.bottom + Spacing.xl }}
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
              <View style={styles.titleWithBadge}>
                <ThemedText style={styles.title} numberOfLines={1}>
                  {listing.brand} {listing.model}
                </ThemedText>
                {listing.swapActive ? (
                  <View style={styles.swapBadgeInline}>
                    <Feather name="repeat" size={12} color="#FFFFFF" />
                    <ThemedText style={styles.swapBadgeTextSmall}>
                      {listing.onlySwap ? "Takas" : "Takas + Nakit"}
                    </ThemedText>
                  </View>
                ) : null}
              </View>
              <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
                {listing.year} - {listing.km.toLocaleString("tr-TR")} km
              </ThemedText>
            </View>
          </View>

          <View style={styles.tabContainer}>
            <Pressable
              style={[
                styles.tabButton,
                activeTab === "info" && styles.tabButtonActive,
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setActiveTab("info");
              }}
            >
              <ThemedText style={[
                styles.tabButtonText,
                activeTab === "info" && styles.tabButtonTextActive,
              ]}>
                İlan Bilgileri
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.tabButton,
                activeTab === "description" && styles.tabButtonActive,
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setActiveTab("description");
              }}
            >
              <ThemedText style={[
                styles.tabButtonText,
                activeTab === "description" && styles.tabButtonTextActive,
              ]}>
                Açıklama
              </ThemedText>
            </Pressable>
          </View>

          {activeTab === "info" ? (
            <>
              <View style={styles.specsGrid}>
                <SpecItem icon="calendar" label="Yıl" value={listing.year.toString()} />
                <SpecItem icon="activity" label="Kilometre" value={`${listing.km.toLocaleString("tr-TR")} km`} />
                <SpecItem icon="droplet" label="Yakıt" value={listing.fuelType} />
                <SpecItem icon="settings" label="Vites" value={listing.transmission} />
                <SpecItem icon="map-pin" label="Şehir" value={listing.city} />
                <SpecItem icon="eye" label="Görüntülenme" value={(listing.viewCount || 0).toString()} />
              </View>

              {listing.swapActive ? (
                <View style={[styles.swapPreferencesCard, { backgroundColor: theme.backgroundSecondary }]}>
                  <View style={styles.swapPreferencesHeader}>
                    <Feather name="repeat" size={18} color={BrandColors.primaryBlue} />
                    <ThemedText style={styles.swapPreferencesTitle}>Takas Tercihleri</ThemedText>
                  </View>
                  <View style={styles.swapPreferencesContent}>
                    <View style={styles.swapPreferenceRow}>
                      <ThemedText style={[styles.swapPreferenceLabel, { color: theme.textSecondary }]}>
                        Takas Tipi
                      </ThemedText>
                      <ThemedText style={styles.swapPreferenceValue}>
                        {listing.onlySwap ? "Sadece Takas" : "Takas + Nakit Fark"}
                      </ThemedText>
                    </View>
                    {listing.acceptsCashDiff ? (
                      <View style={styles.swapPreferenceRow}>
                        <ThemedText style={[styles.swapPreferenceLabel, { color: theme.textSecondary }]}>
                          Nakit Fark
                        </ThemedText>
                        <View style={styles.acceptsBadge}>
                          <Feather name="check" size={12} color="#FFFFFF" />
                          <ThemedText style={styles.acceptsBadgeText}>Kabul Ediyor</ThemedText>
                        </View>
                      </View>
                    ) : null}
                    {listing.estimatedValue ? (
                      <View style={styles.swapPreferenceRow}>
                        <ThemedText style={[styles.swapPreferenceLabel, { color: theme.textSecondary }]}>
                          Tahmini Değer
                        </ThemedText>
                        <ThemedText style={[styles.swapPreferenceValue, { color: BrandColors.primaryBlue, fontWeight: "700" }]}>
                          {listing.estimatedValue.toLocaleString("tr-TR")} TL
                        </ThemedText>
                      </View>
                    ) : null}
                  </View>
                </View>
              ) : null}
            </>
          ) : (
            <View style={styles.descriptionContainer}>
              <ThemedText style={styles.descriptionText}>
                {listing.description || "Bu ilan için açıklama girilmemiş."}
              </ThemedText>
            </View>
          )}

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

          <View style={[styles.historyCard, { backgroundColor: theme.backgroundSecondary }]}>
            <View style={styles.historyHeader}>
              <Feather name="file-text" size={20} color={BrandColors.primaryBlue} />
              <ThemedText style={styles.historyTitle}>Araç Geçmişi</ThemedText>
            </View>

            <View style={styles.historyRow}>
              <ThemedText style={[styles.historyLabel, { color: theme.textSecondary }]}>Kaza Durumu</ThemedText>
              <View style={[
                styles.historyBadge,
                { backgroundColor: listing.accidentFree ? BrandColors.successGreen : BrandColors.alertRed }
              ]}>
                <Feather 
                  name={listing.accidentFree ? "check" : "x"} 
                  size={14} 
                  color="#FFFFFF" 
                />
                <ThemedText style={styles.historyBadgeText}>
                  {listing.accidentFree ? "Kazasız" : "Kazalı"}
                </ThemedText>
              </View>
            </View>

            <View style={styles.historyRow}>
              <ThemedText style={[styles.historyLabel, { color: theme.textSecondary }]}>Tramer Kaydı</ThemedText>
              <ThemedText style={styles.historyValue}>
                {(listing.tramerRecord || 0) > 0 
                  ? `${(listing.tramerRecord || 0).toLocaleString("tr-TR")} TL` 
                  : "Kayıt Yok"}
              </ThemedText>
            </View>

            {listing.paintedParts && listing.paintedParts.length > 0 && (
              <View style={styles.historySection}>
                <ThemedText style={[styles.historySubLabel, { color: theme.textSecondary }]}>
                  Boyalı Parçalar ({listing.paintedParts.length})
                </ThemedText>
                <View style={styles.partsContainer}>
                  {listing.paintedParts.map((part, index) => (
                    <View key={index} style={[styles.partChip, { backgroundColor: "#FFF3E0" }]}>
                      <Feather name="droplet" size={12} color="#FF9800" />
                      <ThemedText style={[styles.partChipText, { color: "#E65100" }]}>{part}</ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {listing.replacedParts && listing.replacedParts.length > 0 && (
              <View style={styles.historySection}>
                <ThemedText style={[styles.historySubLabel, { color: theme.textSecondary }]}>
                  Değişen Parçalar ({listing.replacedParts.length})
                </ThemedText>
                <View style={styles.partsContainer}>
                  {listing.replacedParts.map((part, index) => (
                    <View key={index} style={[styles.partChip, { backgroundColor: "#FFEBEE" }]}>
                      <Feather name="refresh-cw" size={12} color="#F44336" />
                      <ThemedText style={[styles.partChipText, { color: "#C62828" }]}>{part}</ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {(!listing.paintedParts || listing.paintedParts.length === 0) && 
             (!listing.replacedParts || listing.replacedParts.length === 0) && 
             listing.accidentFree && 
             (listing.tramerRecord || 0) === 0 && (
              <View style={styles.cleanHistoryBadge}>
                <Feather name="award" size={20} color={BrandColors.successGreen} />
                <ThemedText style={[styles.cleanHistoryText, { color: BrandColors.successGreen }]}>
                  Temiz Geçmiş
                </ThemedText>
              </View>
            )}
          </View>

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
                style={[styles.messageButton, { backgroundColor: "#25D366" }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  if (listingUser?.phone) {
                    const phoneNumber = listingUser.phone.replace(/\D/g, "");
                    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(`Merhaba, ${listing.brand} ${listing.model} ilanınızla ilgileniyorum.`)}`;
                    Linking.openURL(whatsappUrl);
                  } else {
                    Alert.alert("Bilgi", "Satıcının telefon numarası bulunamadı.");
                  }
                }}
              >
                <Feather name="message-circle" size={18} color="#FFFFFF" />
                <ThemedText style={styles.messageButtonText}>WhatsApp</ThemedText>
              </Pressable>
            </View>
          )}

          {isOwner && (
            <View style={styles.ownerActions}>
              <Pressable
                style={[styles.actionButton, { backgroundColor: theme.backgroundSecondary }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate("CreateListing", { editListingId: listingId });
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

      <Modal
        visible={priceAlertModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPriceAlertModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Fiyat Alarmı Oluştur</ThemedText>
              <Pressable onPress={() => setPriceAlertModalVisible(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>
            
            <ThemedText style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
              Fiyat bu değere düştüğünde bildirim alacaksınız
            </ThemedText>

            {listing?.estimatedValue ? (
              <View style={styles.currentPriceRow}>
                <ThemedText style={[styles.currentPriceLabel, { color: theme.textSecondary }]}>
                  Mevcut Fiyat:
                </ThemedText>
                <ThemedText style={styles.currentPrice}>
                  {listing.estimatedValue.toLocaleString("tr-TR")} TL
                </ThemedText>
              </View>
            ) : null}

            <View style={styles.priceInputContainer}>
              <TextInput
                style={[
                  styles.priceInput,
                  { 
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                  },
                ]}
                placeholder="Hedef fiyat"
                placeholderTextColor={theme.textSecondary}
                value={targetPrice}
                onChangeText={setTargetPrice}
                keyboardType="numeric"
              />
              <ThemedText style={styles.priceSuffix}>TL</ThemedText>
            </View>

            <Pressable
              style={[
                styles.createAlertButton,
                { backgroundColor: BrandColors.primaryBlue },
                !targetPrice && { opacity: 0.5 },
              ]}
              onPress={() => {
                const price = parseInt(targetPrice.replace(/\D/g, ""), 10);
                if (price > 0) {
                  createPriceAlertMutation.mutate(price);
                }
              }}
              disabled={!targetPrice || createPriceAlertMutation.isPending}
            >
              <Feather name="bell" size={18} color="#FFFFFF" />
              <ThemedText style={styles.createAlertButtonText}>
                {createPriceAlertMutation.isPending ? "Oluşturuluyor..." : "Alarm Oluştur"}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={offerModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setOfferModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setOfferModalVisible(false)}
        >
          <Pressable
            style={[styles.modalContent, { backgroundColor: "#FFFFFF" }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Teklif Gönder</ThemedText>
              <Pressable onPress={() => setOfferModalVisible(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ThemedText style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
              Satıcıya teklif gönderin
            </ThemedText>

            {listing?.estimatedValue ? (
              <View style={styles.currentPriceRow}>
                <ThemedText style={styles.currentPriceLabel}>İlan Fiyatı</ThemedText>
                <ThemedText style={styles.currentPrice}>
                  {(listing.estimatedValue).toLocaleString("tr-TR")} TL
                </ThemedText>
              </View>
            ) : null}

            <ThemedText style={[styles.offerOptionsLabel, { color: theme.textSecondary }]}>
              Hızlı Teklif Seçenekleri
            </ThemedText>

            <View style={styles.offerOptionsRow}>
              <Pressable
                style={[
                  styles.offerOptionButton,
                  { borderColor: selectedOfferOption === "10" ? BrandColors.primaryBlue : "#E5E8EB" },
                  selectedOfferOption === "10" && { backgroundColor: BrandColors.primaryBlue },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedOfferOption("10");
                  setCustomOfferPrice("");
                }}
              >
                <ThemedText style={[
                  styles.offerOptionDiscount,
                  selectedOfferOption === "10" && { color: "#FFFFFF" },
                ]}>%10 indirimli</ThemedText>
                <ThemedText style={[
                  styles.offerOptionPrice,
                  selectedOfferOption === "10" && { color: "#FFFFFF" },
                ]}>
                  {listing?.estimatedValue ? Math.round(listing.estimatedValue * 0.90).toLocaleString("tr-TR") : "—"} TL
                </ThemedText>
              </Pressable>

              <Pressable
                style={[
                  styles.offerOptionButton,
                  { borderColor: selectedOfferOption === "15" ? BrandColors.primaryBlue : "#E5E8EB" },
                  selectedOfferOption === "15" && { backgroundColor: BrandColors.primaryBlue },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedOfferOption("15");
                  setCustomOfferPrice("");
                }}
              >
                <ThemedText style={[
                  styles.offerOptionDiscount,
                  selectedOfferOption === "15" && { color: "#FFFFFF" },
                ]}>%15 indirimli</ThemedText>
                <ThemedText style={[
                  styles.offerOptionPrice,
                  selectedOfferOption === "15" && { color: "#FFFFFF" },
                ]}>
                  {listing?.estimatedValue ? Math.round(listing.estimatedValue * 0.85).toLocaleString("tr-TR") : "—"} TL
                </ThemedText>
              </Pressable>
            </View>

            <ThemedText style={[styles.offerOptionsLabel, { color: theme.textSecondary, marginTop: Spacing.md }]}>
              Özel Teklif
            </ThemedText>

            <View style={styles.priceInputContainer}>
              <TextInput
                style={[
                  styles.priceInput,
                  { 
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                  },
                  selectedOfferOption === "custom" && { borderWidth: 2, borderColor: BrandColors.primaryBlue },
                ]}
                placeholder="Teklif tutarı girin"
                placeholderTextColor={theme.textSecondary}
                value={customOfferPrice}
                onChangeText={(text) => {
                  setCustomOfferPrice(text);
                  if (text) {
                    setSelectedOfferOption("custom");
                  } else {
                    setSelectedOfferOption(null);
                  }
                }}
                keyboardType="numeric"
              />
              <ThemedText style={styles.priceSuffix}>TL</ThemedText>
            </View>

            <Pressable
              style={[
                styles.sendOfferButton,
                { backgroundColor: BrandColors.primaryBlue },
                !selectedOfferOption && { opacity: 0.5 },
              ]}
              onPress={() => {
                let offerPrice = 0;
                if (selectedOfferOption === "10" && listing?.estimatedValue) {
                  offerPrice = Math.round(listing.estimatedValue * 0.90);
                } else if (selectedOfferOption === "15" && listing?.estimatedValue) {
                  offerPrice = Math.round(listing.estimatedValue * 0.85);
                } else if (selectedOfferOption === "custom" && customOfferPrice) {
                  offerPrice = parseInt(customOfferPrice.replace(/\D/g, ""), 10);
                }
                
                if (offerPrice > 0) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  Alert.alert(
                    "Teklif Gönderildi",
                    `${offerPrice.toLocaleString("tr-TR")} TL teklifiniz satıcıya iletildi.`
                  );
                  setCustomOfferPrice("");
                  setSelectedOfferOption(null);
                  setOfferModalVisible(false);
                }
              }}
              disabled={!selectedOfferOption}
            >
              <Feather name="send" size={18} color="#FFFFFF" />
              <ThemedText style={styles.sendOfferButtonText}>Teklif Gönder</ThemedText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {!isOwner && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.sm }]}>
          <Pressable
            style={styles.footerButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (listingUser?.phone) {
                Linking.openURL(`tel:${listingUser.phone}`);
              } else {
                Alert.alert("Bilgi", "Satıcının telefon numarası bulunamadı.");
              }
            }}
          >
            <Feather name="phone" size={20} color="#000000" />
            <ThemedText style={styles.footerButtonText}>Ara</ThemedText>
          </Pressable>

          <Pressable
            style={[styles.footerButton, styles.footerButtonPrimary]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setOfferModalVisible(true);
            }}
          >
            <Feather name="tag" size={20} color="#FFFFFF" />
            <ThemedText style={styles.footerButtonTextPrimary}>Teklif</ThemedText>
          </Pressable>

          <Pressable
            style={styles.footerButton}
            onPress={async () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (!user?.id || !listingUser?.id || !listing?.id) {
                Alert.alert("Hata", "Mesaj göndermek için giriş yapmanız gerekiyor.");
                return;
              }
              try {
                const response = await fetch(
                  new URL("/api/conversations/start", getApiUrl()).toString(),
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      fromUserId: user.id,
                      toUserId: listingUser.id,
                      listingId: listing.id,
                    }),
                  }
                );
                if (!response.ok) throw new Error("Failed to start conversation");
                const { match } = await response.json();
                navigation.navigate("Chat", {
                  matchId: match.id,
                  otherUserName: listingUser.name || "İlan Sahibi",
                });
              } catch (error) {
                Alert.alert("Hata", "Mesaj başlatılamadı. Lütfen tekrar deneyin.");
              }
            }}
          >
            <Feather name="message-circle" size={20} color="#000000" />
            <ThemedText style={styles.footerButtonText}>Mesaj</ThemedText>
          </Pressable>
        </View>
      )}
    </View>
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
  titleWithBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  title: {
    ...Typography.h2,
    flexShrink: 1,
  },
  swapBadgeInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: BrandColors.successGreen,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  swapBadgeTextSmall: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "600",
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
  historyCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  historyTitle: {
    ...Typography.body,
    fontWeight: "600",
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  historyLabel: {
    ...Typography.small,
  },
  historyValue: {
    ...Typography.body,
    fontWeight: "600",
  },
  historyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  historyBadgeText: {
    ...Typography.caption,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  historySection: {
    marginTop: Spacing.md,
  },
  historySubLabel: {
    ...Typography.caption,
    marginBottom: Spacing.sm,
  },
  partsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  partChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  partChipText: {
    ...Typography.caption,
    fontWeight: "500",
  },
  cleanHistoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  cleanHistoryText: {
    ...Typography.body,
    fontWeight: "600",
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl + 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  modalTitle: {
    ...Typography.h3,
    fontWeight: "700",
  },
  modalSubtitle: {
    ...Typography.small,
    marginBottom: Spacing.lg,
  },
  currentPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E8EB",
  },
  currentPriceLabel: {
    ...Typography.body,
  },
  currentPrice: {
    ...Typography.h3,
    fontWeight: "700",
    color: BrandColors.primaryBlue,
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  priceInput: {
    flex: 1,
    height: 50,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: 18,
    fontWeight: "600",
  },
  priceSuffix: {
    ...Typography.body,
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },
  createAlertButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  createAlertButtonText: {
    ...Typography.button,
    color: "#FFFFFF",
  },
  offerOptionsLabel: {
    ...Typography.small,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  offerOptionsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  offerOptionButton: {
    flex: 1,
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
  },
  offerOptionDiscount: {
    ...Typography.small,
    fontWeight: "600",
    color: BrandColors.primaryBlue,
    marginBottom: Spacing.xs,
  },
  offerOptionPrice: {
    ...Typography.body,
    fontWeight: "700",
  },
  sendOfferButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  sendOfferButtonText: {
    ...Typography.button,
    color: "#FFFFFF",
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "#E5E8EB",
    backgroundColor: "#FFFFFF",
    gap: Spacing.sm,
  },
  footerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    gap: 6,
  },
  footerButtonPrimary: {
    backgroundColor: "#000000",
    borderRadius: BorderRadius.sm,
  },
  footerButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  footerButtonTextPrimary: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: Spacing.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderRadius: BorderRadius.sm,
  },
  tabButtonActive: {
    backgroundColor: "#FFFFFF",
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  tabButtonTextActive: {
    color: BrandColors.primaryBlue,
    fontWeight: "600",
  },
  descriptionContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#374151",
  },
  swapPreferencesCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  swapPreferencesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  swapPreferencesTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  swapPreferencesContent: {
    gap: Spacing.sm,
  },
  swapPreferenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  swapPreferenceLabel: {
    fontSize: 14,
  },
  swapPreferenceValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  acceptsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: BrandColors.successGreen,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  acceptsBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
