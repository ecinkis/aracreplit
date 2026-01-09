import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInRight } from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Spacing, BorderRadius, Typography, BrandColors } from "@/constants/theme";
import { Match } from "@shared/schema";
import emptyMessagesImage from "../assets/images/empty-states/empty-messages.png";
import defaultAvatarImage from "../assets/images/default-avatar.png";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function MessageRow({ match, index, onPress }: { match: Match; index: number; onPress: () => void }) {
  const { theme } = useTheme();
  const { user } = useAuth();

  const otherUserId = match.user1Id === user?.id ? match.user2Id : match.user1Id;

  return (
    <Animated.View entering={FadeInRight.delay(index * 50).springify()}>
      <Pressable
        style={({ pressed }) => [
          styles.messageRow,
          { backgroundColor: theme.cardBackground },
          pressed && { opacity: 0.8 },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
      >
        <Image source={defaultAvatarImage} style={styles.avatar} />
        <View style={styles.messageContent}>
          <ThemedText style={styles.userName}>Kullanıcı</ThemedText>
          <ThemedText style={[styles.lastMessage, { color: theme.textSecondary }]} numberOfLines={1}>
            Yeni eşleşme! Sohbete başlayın...
          </ThemedText>
        </View>
        <View style={styles.messageRight}>
          <ThemedText style={[styles.timeText, { color: theme.textSecondary }]}>
            Şimdi
          </ThemedText>
          <Feather name="chevron-right" size={20} color={theme.textSecondary} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <Image source={emptyMessagesImage} style={styles.emptyImage} resizeMode="contain" />
      <ThemedText style={styles.emptyTitle}>Henüz mesajınız yok</ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        Eşleştikten sonra mesajlaşmaya başlayabilirsiniz
      </ThemedText>
    </View>
  );
}

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const { data: matches, isLoading, refetch } = useQuery<Match[]>({
    queryKey: ["/api/matches", user?.id],
    enabled: !!user?.id,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleMatchPress = (match: Match) => {
    navigation.navigate("Chat", {
      matchId: match.id,
      otherUserName: "Kullanıcı",
    });
  };

  const renderItem = ({ item, index }: { item: Match; index: number }) => (
    <MessageRow
      match={item}
      index={index}
      onPress={() => handleMatchPress(item)}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <ThemedText style={styles.headerTitle}>Mesajlar</ThemedText>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BrandColors.primaryOrange} />
        </View>
      ) : !matches || matches.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={matches}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={BrandColors.primaryOrange}
            />
          }
          ItemSeparatorComponent={() => (
            <View style={[styles.separator, { backgroundColor: theme.border }]} />
          )}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    ...Typography.h1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: Spacing.md,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.md,
  },
  messageContent: {
    flex: 1,
  },
  userName: {
    ...Typography.body,
    fontWeight: "600",
    marginBottom: 4,
  },
  lastMessage: {
    ...Typography.small,
  },
  messageRight: {
    alignItems: "flex-end",
    gap: Spacing.xs,
  },
  timeText: {
    ...Typography.caption,
  },
  separator: {
    height: 1,
    marginVertical: Spacing.xs,
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
  },
  emptySubtitle: {
    ...Typography.body,
    textAlign: "center",
    opacity: 0.7,
  },
});
