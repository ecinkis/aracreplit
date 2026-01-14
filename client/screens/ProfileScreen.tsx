import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/query-client";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/contexts/AuthContext";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Spacing, BorderRadius, BrandColors } from "@/constants/theme";
import { Listing, Match, Favorite, Notification } from "@shared/schema";
const defaultAvatarImage = require("../assets/images/default-avatar.png");
const defaultVehicleImage = require("../assets/images/default-vehicle.png");

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const showComingSoon = () => {
  Alert.alert("Yakinda", "Bu ozellik cok yakinda aktif olacak.");
};

function MenuRow({ 
  icon, 
  label, 
  onPress, 
  rightElement,
  verified,
  showChevron = true,
}: { 
  icon: string; 
  label: string; 
  onPress?: () => void;
  rightElement?: React.ReactNode;
  verified?: boolean;
  showChevron?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuRow,
        pressed && onPress && { opacity: 0.7 },
      ]}
      onPress={() => {
        if (onPress) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }
      }}
      disabled={!onPress}
    >
      <View style={styles.menuRowLeft}>
        <View style={styles.menuIconContainer}>
          <Feather name={icon as any} size={20} color="#374151" />
        </View>
        <ThemedText style={styles.menuRowLabel}>{label}</ThemedText>
        {verified !== undefined && (
          <View style={[styles.verifiedDot, verified ? styles.verifiedDotActive : styles.verifiedDotInactive]} />
        )}
      </View>
      {rightElement ? rightElement : (
        showChevron && <Feather name="chevron-right" size={20} color="#9CA3AF" />
      )}
    </Pressable>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <View style={styles.statCard}>
      <Feather name={icon as any} size={20} color={BrandColors.primaryBlue} />
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </View>
  );
}

function ListingMiniCard({ listing, onPress }: { listing: Listing; onPress: () => void }) {
  const photoUrl = listing.photos && listing.photos.length > 0 ? listing.photos[0] : null;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.miniCard,
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
        <ThemedText style={styles.miniCardSubtitle}>
          {listing.year}
        </ThemedText>
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    if (Platform.OS === "web") {
      if (window.confirm("Hesabınızdan çıkış yapmak istediğinize emin misiniz?")) {
        logout();
      }
    } else {
      Alert.alert(
        "Çıkış Yap",
        "Hesabınızdan çıkış yapmak istediğinize emin misiniz?",
        [
          { text: "İptal", style: "cancel" },
          { 
            text: "Çıkış Yap", 
            style: "destructive",
            onPress: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              logout();
            }
          },
        ]
      );
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Hesabımı Sil",
      "Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm verileriniz silinecektir.",
      [
        { text: "İptal", style: "cancel" },
        { 
          text: "Hesabımı Sil", 
          style: "destructive",
          onPress: () => {
            Alert.alert("Bilgi", "Hesap silme talebi alındı. En kısa sürede işleme alınacaktır.");
          }
        },
      ]
    );
  };

  const userType = (user as any)?.userType || "bireysel";
  const isKurumsal = userType === "kurumsal";
  const trustScore = user?.trustScore || 0;
  const phoneVerified = user?.phoneVerified || false;
  const identityVerified = (user as any)?.identityVerified || false;
  const companyVerified = (user as any)?.companyVerified || false;

  const changeUserTypeMutation = useMutation({
    mutationFn: async (newType: string) => {
      return apiRequest(`/api/users/${user?.id}`, {
        method: "PATCH",
        body: JSON.stringify({ userType: newType }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id] });
      Alert.alert("Başarılı", "Üyelik tipiniz değiştirildi.");
    },
    onError: () => {
      Alert.alert("Hata", "Üyelik tipi değiştirilemedi. Lütfen tekrar deneyin.");
    },
  });

  const handleChangeUserType = () => {
    if (isKurumsal) {
      const newType = "bireysel";
      Alert.alert(
        "Üyelik Tipi Değiştir",
        "Bireysel üyeliğe geçmek istediğinize emin misiniz?",
        [
          { text: "İptal", style: "cancel" },
          { 
            text: "Evet, Değiştir", 
            onPress: () => changeUserTypeMutation.mutate(newType) 
          },
        ]
      );
    } else {
      navigation.navigate("CorporateApplication");
    }
  };

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

  const { data: notificationCount } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications", user?.id, "count"],
    enabled: !!user?.id,
  });

  const unreadCount = notificationCount?.count || 0;

  const handleListingPress = (listingId: string) => {
    navigation.navigate("ListingDetail", { listingId });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <Image 
            source={(user as any)?.avatarUrl ? { uri: (user as any).avatarUrl } : defaultAvatarImage} 
            style={styles.avatar} 
          />
          <View style={styles.profileInfo}>
            <ThemedText style={styles.profileName}>
              {user?.name || "İsim belirtilmedi"}
            </ThemedText>
            <ThemedText style={styles.profilePhone}>
              {user?.phone}
            </ThemedText>
            <View style={styles.userTypeBadge}>
              <ThemedText style={styles.userTypeText}>
                {isKurumsal ? "Kurumsal Üye" : "Bireysel Üye"}
              </ThemedText>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.editButton,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("EditProfile");
            }}
          >
            {({ pressed }) => (
              <Feather name="edit-2" size={18} color={pressed ? "#000000" : BrandColors.primaryBlue} />
            )}
          </Pressable>
        </View>

        <View style={styles.trustScoreCard}>
          <View style={styles.trustScoreHeader}>
            <ThemedText style={styles.trustScoreLabel}>Guven Skoru</ThemedText>
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

        <Pressable
          style={({ pressed }) => [
            styles.premiumCard,
            user?.isPremium && styles.premiumCardActive,
            pressed && { opacity: 0.9 },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate("Premium");
          }}
        >
          <View style={styles.premiumIcon}>
            <Feather name="award" size={24} color={user?.isPremium ? "#FFD700" : BrandColors.primaryBlue} />
          </View>
          <View style={styles.premiumContent}>
            <ThemedText style={[styles.premiumTitle, user?.isPremium && { color: "#FFFFFF" }]}>
              {user?.isPremium ? "Premium Üye" : "Premium'a Yükselt"}
            </ThemedText>
            <ThemedText style={[styles.premiumSubtitle, user?.isPremium && { color: "rgba(255,255,255,0.8)" }]}>
              {user?.isPremium 
                ? "Tüm avantajlardan yararlanıyorsunuz" 
                : "Sınırsız beğeni, öne çıkan ilanlar"}
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={24} color={user?.isPremium ? "#FFFFFF" : BrandColors.primaryBlue} />
        </Pressable>

        <View style={styles.statsRow}>
          <StatCard icon="file-text" label="İlanlarım" value={userListings?.length || 0} />
          <StatCard icon="heart" label="Eşleşmeler" value={matches?.length || 0} />
          <StatCard icon="star" label="Favoriler" value={favorites?.length || 0} />
        </View>

        <View style={styles.sectionCard}>
          <ThemedText style={styles.sectionTitle}>Dogrulama</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Hesabinizi dogrulayarak guven skorunuzu artirin
          </ThemedText>
          
          <MenuRow 
            icon="phone" 
            label="Telefon Dogrulama" 
            verified={phoneVerified}
            onPress={phoneVerified ? undefined : showComingSoon}
          />
          
          {isKurumsal ? (
            <>
              <MenuRow 
                icon="briefcase" 
                label="Sirket Dogrulama" 
                verified={companyVerified}
                onPress={() => navigation.navigate("Verification", { documentType: "company_registration" })}
              />
              <MenuRow 
                icon="file-text" 
                label="Vergi Levhasi Yukleme" 
                verified={companyVerified}
                onPress={() => navigation.navigate("Verification", { documentType: "tax_certificate" })}
              />
            </>
          ) : null}
        </View>

        <View style={styles.sectionCard}>
          <ThemedText style={styles.sectionTitle}>Üyelik Tipi</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            {isKurumsal 
              ? "Kurumsal üye olarak kayıtlısınız" 
              : "Bireysel üye olarak kayıtlısınız"}
          </ThemedText>
          
          <Pressable
            style={({ pressed }) => [
              styles.changeTypeButton,
              pressed && { opacity: 0.7, backgroundColor: "#EBF4FF" }
            ]}
            onPress={() => {
              console.log("Button pressed!");
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              handleChangeUserType();
            }}
            testID="change-user-type-button"
          >
            <ThemedText style={styles.changeTypeButtonText}>
              {isKurumsal ? "Bireysel Üyeliğe Geç" : "Kurumsal Üyeliğe Geç"}
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>İlanlarım</ThemedText>
            <ThemedText style={styles.sectionCount}>
              {userListings?.length || 0}/5
            </ThemedText>
          </View>
          {listingsLoading ? (
            <ActivityIndicator size="small" color={BrandColors.primaryBlue} />
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
              style={styles.addListingCard}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                (navigation.getParent() as any)?.navigate("CreateTab");
              }}
            >
              <Feather name="plus" size={32} color={BrandColors.primaryBlue} />
              <ThemedText style={styles.addListingText}>İlan Ekle</ThemedText>
            </Pressable>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Mesajlarım</ThemedText>
            <ThemedText style={styles.sectionCount}>
              {matches?.length || 0}
            </ThemedText>
          </View>
          {matches && matches.length > 0 ? (
            <View style={styles.messagesContainer}>
              {matches.slice(0, 3).map((match) => (
                <Pressable
                  key={match.id}
                  style={({ pressed }) => [
                    styles.messageItem,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.navigate("Chat", { 
                      matchId: match.id, 
                      otherUserName: "Kullanıcı" 
                    });
                  }}
                >
                  <View style={styles.messageAvatar}>
                    <Feather name="message-circle" size={20} color={BrandColors.primaryBlue} />
                  </View>
                  <View style={styles.messageContent}>
                    <ThemedText style={styles.messageTitle}>Takas Görüşmesi</ThemedText>
                    <ThemedText style={styles.messageSubtitle}>
                      Mesajlaşmak için tıklayın
                    </ThemedText>
                  </View>
                  <Feather name="chevron-right" size={20} color="#9CA3AF" />
                </Pressable>
              ))}
              {matches.length > 3 && (
                <Pressable
                  style={styles.seeAllButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    (navigation.getParent() as any)?.navigate("MatchTab");
                  }}
                >
                  <ThemedText style={styles.seeAllText}>
                    Tüm mesajları gör ({matches.length})
                  </ThemedText>
                </Pressable>
              )}
            </View>
          ) : (
            <View style={styles.emptySection}>
              <Feather name="message-circle" size={32} color="#D1D5DB" />
              <ThemedText style={styles.emptySectionText}>
                Henüz mesajınız yok
              </ThemedText>
              <ThemedText style={styles.emptySectionSubtext}>
                Eşleşme sayfasından araç takası yapın
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Favorilerim</ThemedText>
            <ThemedText style={styles.sectionCount}>
              {favorites?.length || 0}
            </ThemedText>
          </View>
          {favorites && favorites.length > 0 ? (
            <FlatList
              data={favorites.slice(0, 5)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.favoriteCard,
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    handleListingPress(item.listingId);
                  }}
                >
                  <View style={styles.favoriteIconContainer}>
                    <Feather name="heart" size={20} color="#EF4444" />
                  </View>
                  <ThemedText style={styles.favoriteText}>Favori İlan</ThemedText>
                </Pressable>
              )}
              contentContainerStyle={styles.horizontalList}
            />
          ) : (
            <View style={styles.emptySection}>
              <Feather name="heart" size={32} color="#D1D5DB" />
              <ThemedText style={styles.emptySectionText}>
                Henüz favoriniz yok
              </ThemedText>
              <ThemedText style={styles.emptySectionSubtext}>
                Beğendiğiniz ilanları favorilere ekleyin
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Sözleşmeler ve Politikalar</ThemedText>
          
          <Pressable
            style={({ pressed }) => [styles.legalItem, pressed && { opacity: 0.7 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("LegalDocument", { documentType: "kullanim-kosullari" });
            }}
          >
            <View style={styles.legalItemLeft}>
              <Feather name="file-text" size={20} color="#374151" />
              <ThemedText style={styles.legalItemText}>Kullanım Koşulları</ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.legalItem, pressed && { opacity: 0.7 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("LegalDocument", { documentType: "gizlilik-politikasi" });
            }}
          >
            <View style={styles.legalItemLeft}>
              <Feather name="shield" size={20} color="#374151" />
              <ThemedText style={styles.legalItemText}>Gizlilik Politikası</ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.legalItem, pressed && { opacity: 0.7 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("LegalDocument", { documentType: "kvkk" });
            }}
          >
            <View style={styles.legalItemLeft}>
              <Feather name="lock" size={20} color="#374151" />
              <ThemedText style={styles.legalItemText}>KVKK Aydınlatma Metni</ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.legalItem, pressed && { opacity: 0.7 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("LegalDocument", { documentType: "mesafeli-satis" });
            }}
          >
            <View style={styles.legalItemLeft}>
              <Feather name="clipboard" size={20} color="#374151" />
              <ThemedText style={styles.legalItemText}>Mesafeli Satış Sözleşmesi</ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.legalItem, pressed && { opacity: 0.7 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("LegalDocument", { documentType: "cerez-politikasi" });
            }}
          >
            <View style={styles.legalItemLeft}>
              <Feather name="info" size={20} color="#374151" />
              <ThemedText style={styles.legalItemText}>Çerez Politikası</ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </Pressable>
        </View>

        <View style={styles.accountActionsSection}>
          <Pressable
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleLogout}
          >
            <Feather name="log-out" size={20} color="#374151" />
            <ThemedText style={styles.logoutButtonText}>Çıkış Yap</ThemedText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.deleteAccountButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleDeleteAccount}
          >
            <Feather name="trash-2" size={20} color="#EF4444" />
            <ThemedText style={styles.deleteAccountButtonText}>Hesabımı Sil</ThemedText>
          </Pressable>
        </View>
      </ScrollView>
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
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  headerButton: {
    padding: Spacing.sm,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#EF4444",
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
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
    backgroundColor: "#F9FAFB",
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
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: Spacing.xs,
  },
  userTypeBadge: {
    backgroundColor: BrandColors.primaryBlue + "20",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    alignSelf: "flex-start",
  },
  userTypeText: {
    fontSize: 12,
    fontWeight: "600",
    color: BrandColors.primaryBlue,
  },
  editButton: {
    padding: Spacing.sm,
  },
  trustScoreCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    backgroundColor: "#F9FAFB",
  },
  trustScoreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  trustScoreLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  trustScoreValue: {
    fontSize: 18,
    fontWeight: "700",
    color: BrandColors.primaryBlue,
  },
  trustScoreBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  trustScoreFill: {
    height: "100%",
    backgroundColor: BrandColors.primaryBlue,
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
    backgroundColor: "#F9FAFB",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
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
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: Spacing.md,
  },
  sectionCount: {
    fontSize: 14,
    color: "#6B7280",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  menuRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  menuRowLabel: {
    fontSize: 15,
    color: "#374151",
    flex: 1,
  },
  verifiedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: Spacing.sm,
  },
  verifiedDotActive: {
    backgroundColor: BrandColors.successGreen,
  },
  verifiedDotInactive: {
    backgroundColor: "#D1D5DB",
  },
  changeTypeButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BrandColors.primaryBlue,
  },
  changeTypeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: BrandColors.primaryBlue,
  },
  horizontalList: {
    gap: Spacing.sm,
  },
  miniCard: {
    width: 140,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    backgroundColor: "#F9FAFB",
  },
  miniCardImage: {
    width: "100%",
    height: 90,
    backgroundColor: "#E5E7EB",
  },
  miniCardContent: {
    padding: Spacing.sm,
  },
  miniCardTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  miniCardSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  addListingCard: {
    width: 140,
    height: 130,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: BrandColors.primaryBlue,
    backgroundColor: "#EBF4FF",
  },
  addListingText: {
    fontSize: 13,
    color: BrandColors.primaryBlue,
    marginTop: Spacing.sm,
    fontWeight: "500",
  },
  legalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  legalItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  legalItemText: {
    fontSize: 15,
    color: "#374151",
  },
  messagesContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  messageItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  messageAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EBF4FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  messageContent: {
    flex: 1,
  },
  messageTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  messageSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  seeAllButton: {
    padding: Spacing.md,
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 14,
    color: BrandColors.primaryBlue,
    fontWeight: "500",
  },
  emptySection: {
    backgroundColor: "#F9FAFB",
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    alignItems: "center",
  },
  emptySectionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: Spacing.md,
  },
  emptySectionSubtext: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  favoriteCard: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  favoriteText: {
    fontSize: 12,
    color: "#6B7280",
  },
  premiumCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EBF4FF",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: BrandColors.primaryBlue,
  },
  premiumCardActive: {
    backgroundColor: BrandColors.primaryBlue,
    borderColor: BrandColors.primaryBlue,
  },
  premiumIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  premiumContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: BrandColors.primaryBlue,
  },
  premiumSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  accountActionsSection: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: "#F3F4F6",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  deleteAccountButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: "#FEF2F2",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  deleteAccountButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
  },
});
