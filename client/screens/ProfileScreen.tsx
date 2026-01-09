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
import { Listing, Match, Favorite } from "@shared/schema";
import defaultAvatarImage from "../assets/images/default-avatar.png";
import defaultVehicleImage from "../assets/images/default-vehicle.png";

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
      <Feather name={icon as any} size={20} color={BrandColors.primaryOrange} />
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
  const { user } = useAuth();
  const queryClient = useQueryClient();

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
      Alert.alert("Basarili", "Uyelik tipiniz degistirildi.");
    },
    onError: () => {
      Alert.alert("Hata", "Uyelik tipi degistirilemedi. Lutfen tekrar deneyin.");
    },
  });

  const handleChangeUserType = () => {
    const newType = isKurumsal ? "bireysel" : "kurumsal";
    Alert.alert(
      "Uyelik Tipi Degistir",
      `${isKurumsal ? "Bireysel" : "Kurumsal"} uyelige gecmek istediginize emin misiniz?`,
      [
        { text: "Iptal", style: "cancel" },
        { 
          text: "Evet, Degistir", 
          onPress: () => changeUserTypeMutation.mutate(newType) 
        },
      ]
    );
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

  const handleListingPress = (listingId: string) => {
    navigation.navigate("ListingDetail", { listingId });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <ThemedText style={styles.headerTitle}>Profil</ThemedText>
        <Pressable
          style={({ pressed }) => [styles.settingsButton, pressed && { opacity: 0.7 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate("Settings");
          }}
        >
          <Feather name="settings" size={22} color="#000000" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <Image source={defaultAvatarImage} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <ThemedText style={styles.profileName}>
              {user?.name || "Isim belirtilmedi"}
            </ThemedText>
            <ThemedText style={styles.profilePhone}>
              {user?.phone}
            </ThemedText>
            <View style={styles.userTypeBadge}>
              <ThemedText style={styles.userTypeText}>
                {isKurumsal ? "Kurumsal Uye" : "Bireysel Uye"}
              </ThemedText>
            </View>
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

        <View style={styles.statsRow}>
          <StatCard icon="file-text" label="Ilanlarim" value={userListings?.length || 0} />
          <StatCard icon="heart" label="Eslesmeler" value={matches?.length || 0} />
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
                onPress={showComingSoon}
              />
              <MenuRow 
                icon="file-text" 
                label="Vergi Levhasi Yukleme" 
                verified={companyVerified}
                onPress={showComingSoon}
              />
            </>
          ) : (
            <MenuRow 
              icon="user" 
              label="Kimlik Dogrulama" 
              verified={identityVerified}
              onPress={showComingSoon}
            />
          )}
        </View>

        <View style={styles.sectionCard}>
          <ThemedText style={styles.sectionTitle}>Profil Duzenleme</ThemedText>
          
          {isKurumsal ? (
            <>
              <MenuRow 
                icon="briefcase" 
                label="Sirket Bilgileri" 
                onPress={showComingSoon}
              />
              <MenuRow 
                icon="map-pin" 
                label="Sirket Adresi" 
                onPress={showComingSoon}
              />
              <MenuRow 
                icon="user" 
                label="Yetkili Kisi Bilgileri" 
                onPress={showComingSoon}
              />
              <MenuRow 
                icon="mail" 
                label="Iletisim Bilgileri" 
                onPress={showComingSoon}
              />
            </>
          ) : (
            <>
              <MenuRow 
                icon="user" 
                label="Kisisel Bilgiler" 
                onPress={showComingSoon}
              />
              <MenuRow 
                icon="map-pin" 
                label="Adres Bilgileri" 
                onPress={showComingSoon}
              />
              <MenuRow 
                icon="mail" 
                label="Iletisim Bilgileri" 
                onPress={showComingSoon}
              />
            </>
          )}
        </View>

        <View style={styles.sectionCard}>
          <ThemedText style={styles.sectionTitle}>Uyelik Tipi</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            {isKurumsal 
              ? "Kurumsal uye olarak kayitlisiniz" 
              : "Bireysel uye olarak kayitlisiniz"}
          </ThemedText>
          
          <Pressable
            style={({ pressed }) => [
              styles.changeTypeButton,
              pressed && { opacity: 0.7, backgroundColor: "#FFF7ED" }
            ]}
            onPress={() => {
              console.log("Button pressed!");
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              handleChangeUserType();
            }}
            testID="change-user-type-button"
          >
            <ThemedText style={styles.changeTypeButtonText}>
              {isKurumsal ? "Bireysel Uyelige Gec" : "Kurumsal Uyelige Gec"}
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Ilanlarim</ThemedText>
            <ThemedText style={styles.sectionCount}>
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
              style={styles.addListingCard}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                (navigation.getParent() as any)?.navigate("CreateTab");
              }}
            >
              <Feather name="plus" size={32} color={BrandColors.primaryOrange} />
              <ThemedText style={styles.addListingText}>Ilan Ekle</ThemedText>
            </Pressable>
          )}
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
    backgroundColor: BrandColors.primaryOrange + "20",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    alignSelf: "flex-start",
  },
  userTypeText: {
    fontSize: 12,
    fontWeight: "600",
    color: BrandColors.primaryOrange,
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
    color: BrandColors.primaryOrange,
  },
  trustScoreBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
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
    borderColor: BrandColors.primaryOrange,
  },
  changeTypeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: BrandColors.primaryOrange,
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
    borderColor: BrandColors.primaryOrange,
    backgroundColor: "#FFF7ED",
  },
  addListingText: {
    fontSize: 13,
    color: BrandColors.primaryOrange,
    marginTop: Spacing.sm,
    fontWeight: "500",
  },
});
