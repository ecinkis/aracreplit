import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Spacing, BorderRadius, BrandColors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, getApiUrl } from "@/lib/query-client";
import { Listing } from "@shared/schema";
import defaultVehicleImage from "../assets/images/default-vehicle.png";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function StoryCreationScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [storyImage, setStoryImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: userListings, isLoading } = useQuery<Listing[]>({
    queryKey: ["/api/user/listings"],
    enabled: !!user,
  });

  const approvedListings = userListings?.filter(l => l.status === "active") || [];

  const createStoryMutation = useMutation({
    mutationFn: async (data: { listingId: string; imageUrl: string }) => {
      return apiRequest("/api/user/stories", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/me"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Başarılı", "Hikayeniz oluşturuldu! 24 saat boyunca aktif olacak.", [
        { text: "Tamam", onPress: () => navigation.goBack() },
      ]);
    },
    onError: (error: any) => {
      const message = error?.message || "Hikaye oluşturulamadı";
      Alert.alert("Hata", message);
    },
  });

  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      try {
        const manipulated = await ImageManipulator.manipulateAsync(
          asset.uri,
          [{ resize: { width: 1080, height: 1920 } }],
          { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
        );
        setStoryImage(manipulated.uri);
      } catch {
        setStoryImage(asset.uri);
      }
    }
  }, []);

  const handleCreate = async () => {
    if (!selectedListingId) {
      Alert.alert("Uyarı", "Lütfen bir ilan seçin");
      return;
    }
    if (!storyImage) {
      Alert.alert("Uyarı", "Lütfen bir görsel seçin");
      return;
    }

    setIsSubmitting(true);
    try {
      await createStoryMutation.mutateAsync({
        listingId: selectedListingId,
        imageUrl: storyImage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderListingItem = ({ item }: { item: Listing }) => {
    const isSelected = selectedListingId === item.id;
    const photoUrl = item.photos && item.photos.length > 0 ? item.photos[0] : null;

    return (
      <Pressable
        style={[styles.listingItem, isSelected && styles.listingItemSelected]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setSelectedListingId(item.id);
        }}
      >
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.listingImage} />
        ) : (
          <Image source={defaultVehicleImage} style={styles.listingImage} />
        )}
        <View style={styles.listingInfo}>
          <ThemedText style={styles.listingTitle} numberOfLines={1}>
            {item.brand} {item.model}
          </ThemedText>
          <ThemedText style={styles.listingYear}>{item.year}</ThemedText>
        </View>
        {isSelected ? (
          <View style={styles.checkCircle}>
            <Feather name="check" size={16} color="#FFFFFF" />
          </View>
        ) : null}
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BrandColors.primaryBlue} />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="x" size={24} color="#000000" />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Hikaye Oluştur</ThemedText>
        <Pressable
          onPress={handleCreate}
          disabled={isSubmitting || !selectedListingId || !storyImage}
          style={[
            styles.createButton,
            (!selectedListingId || !storyImage) && styles.createButtonDisabled,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.createButtonText}>Paylaş</ThemedText>
          )}
        </Pressable>
      </View>

      <View style={styles.creditsInfo}>
        <Feather name="zap" size={18} color={BrandColors.primaryBlue} />
        <ThemedText style={styles.creditsText}>
          Hikaye Hakkı: {user?.storyCredits || 0}
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Hikaye Görseli</ThemedText>
        <Pressable style={styles.imagePickerContainer} onPress={pickImage}>
          {storyImage ? (
            <Image source={{ uri: storyImage }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Feather name="image" size={32} color="#9CA3AF" />
              <ThemedText style={styles.imagePlaceholderText}>
                Görsel Seç
              </ThemedText>
            </View>
          )}
        </Pressable>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>İlan Seç</ThemedText>
        {approvedListings.length > 0 ? (
          <FlatList
            data={approvedListings}
            renderItem={renderListingItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listingsContainer}
          />
        ) : (
          <View style={styles.emptyState}>
            <Feather name="inbox" size={32} color="#9CA3AF" />
            <ThemedText style={styles.emptyText}>
              Onaylanmış ilanınız bulunmuyor
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.infoBox}>
        <Feather name="info" size={16} color="#6B7280" />
        <ThemedText style={styles.infoText}>
          Hikayeler 24 saat boyunca aktif kalır. Her onaylanan ilan için 1 hikaye hakkı kazanırsınız.
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
  },
  createButton: {
    backgroundColor: BrandColors.primaryBlue,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  creditsInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    backgroundColor: "#F0F9FF",
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  creditsText: {
    fontSize: 14,
    fontWeight: "500",
    color: BrandColors.primaryBlue,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: Spacing.md,
  },
  imagePickerContainer: {
    aspectRatio: 9 / 16,
    maxHeight: 300,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  listingsContainer: {
    paddingRight: Spacing.lg,
    gap: Spacing.md,
  },
  listingItem: {
    width: 140,
    backgroundColor: "#F9FAFB",
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  listingItemSelected: {
    borderColor: BrandColors.primaryBlue,
  },
  listingImage: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
  listingInfo: {
    padding: Spacing.sm,
  },
  listingTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000000",
  },
  listingYear: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  checkCircle: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: BrandColors.primaryBlue,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    paddingVertical: Spacing.xl,
    alignItems: "center",
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    padding: Spacing.md,
    backgroundColor: "#F9FAFB",
    borderRadius: BorderRadius.lg,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
});
