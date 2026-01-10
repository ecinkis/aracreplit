import React from "react";
import {
  View,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/contexts/AuthContext";
import { BrandColors, Spacing, BorderRadius } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";
import type { Notification } from "@shared/schema";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function getNotificationIcon(type: string) {
  switch (type) {
    case "match":
      return "heart";
    case "message":
      return "message-circle";
    case "like":
      return "thumbs-up";
    case "listing":
      return "tag";
    default:
      return "bell";
  }
}

function getNotificationColor(type: string) {
  switch (type) {
    case "match":
      return "#EF4444";
    case "message":
      return BrandColors.primaryBlue;
    case "like":
      return "#10B981";
    case "listing":
      return "#F59E0B";
    default:
      return "#6B7280";
  }
}

function formatTimeAgo(date: Date | string | null): string {
  if (!date) return "";
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return "Az once";
  if (minutes < 60) return `${minutes} dk once`;
  if (hours < 24) return `${hours} saat once`;
  if (days < 7) return `${days} gun once`;
  return then.toLocaleDateString("tr-TR");
}

function NotificationItem({ 
  notification, 
  onPress 
}: { 
  notification: Notification; 
  onPress: () => void;
}) {
  const iconName = getNotificationIcon(notification.type);
  const iconColor = getNotificationColor(notification.type);
  
  return (
    <Pressable
      style={({ pressed }) => [
        styles.notificationItem,
        !notification.read && styles.unreadItem,
        pressed && { opacity: 0.7 },
      ]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
        <Feather name={iconName as any} size={20} color={iconColor} />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.titleRow}>
          <ThemedText style={[styles.title, !notification.read && styles.unreadText]}>
            {notification.title}
          </ThemedText>
          {!notification.read && <View style={styles.unreadDot} />}
        </View>
        <ThemedText style={styles.message} numberOfLines={2}>
          {notification.message}
        </ThemedText>
        <ThemedText style={styles.time}>
          {formatTimeAgo(notification.createdAt)}
        </ThemedText>
      </View>
      <Feather name="chevron-right" size={20} color="#9CA3AF" />
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = React.useState(false);

  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications", user?.id],
    enabled: !!user?.id,
  });

  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await apiRequest(`/api/notifications/${notificationId}/read`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications", user?.id] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest(`/api/notifications/${user?.id}/read-all`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications", user?.id] });
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["/api/notifications", user?.id] });
    setRefreshing(false);
  };

  const handleNotificationPress = (notification: Notification) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (!notification.read) {
      markReadMutation.mutate(notification.id);
    }
    
    if (notification.type === "match" && notification.relatedMatchId) {
      navigation.navigate("Chat", { 
        matchId: notification.relatedMatchId, 
        otherUserName: "Kullanici" 
      });
    } else if (notification.type === "listing" && notification.relatedListingId) {
      navigation.navigate("ListingDetail", { 
        listingId: notification.relatedListingId 
      });
    }
  };

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
        >
          <Feather name="arrow-left" size={24} color="#000000" />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Bildirimler</ThemedText>
        {unreadCount > 0 && (
          <Pressable
            style={styles.markAllButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              markAllReadMutation.mutate();
            }}
          >
            <ThemedText style={styles.markAllText}>Tumunu Oku</ThemedText>
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BrandColors.primaryBlue} />
        </View>
      ) : notifications && notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              onPress={() => handleNotificationPress(item)}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + Spacing.xl },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={BrandColors.primaryBlue}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Feather name="bell-off" size={48} color="#D1D5DB" />
          </View>
          <ThemedText style={styles.emptyTitle}>Bildirim Yok</ThemedText>
          <ThemedText style={styles.emptySubtitle}>
            Yeni eslesmeler ve mesajlar burada gorunecek
          </ThemedText>
        </View>
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
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
  },
  markAllButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  markAllText: {
    fontSize: 14,
    color: BrandColors.primaryBlue,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingTop: Spacing.sm,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  unreadItem: {
    backgroundColor: "#F0F7FF",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "500",
    color: "#374151",
  },
  unreadText: {
    fontWeight: "600",
    color: "#111827",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BrandColors.primaryBlue,
    marginLeft: Spacing.sm,
  },
  message: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  time: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
});
