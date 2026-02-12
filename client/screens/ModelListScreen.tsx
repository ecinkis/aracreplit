import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import { MODELS_BY_BRAND } from "@/data/vehicleModels";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ModelListRouteProp = RouteProp<RootStackParamList, "ModelList">;

export default function ModelListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ModelListRouteProp>();
  const insets = useSafeAreaInsets();
  const { categoryId, categoryName, brandId, brandName } = route.params;
  const [searchQuery, setSearchQuery] = useState("");

  const models = MODELS_BY_BRAND[brandId] || [];
  const filteredModels = models.filter((model) =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleModelPress = (modelId: string, modelName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("SearchResults", {
      categoryId,
      categoryName,
      brandId,
      brandName,
      modelId,
      modelName,
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="arrow-left" size={24} color="#000000" />
          </Pressable>
          <ThemedText style={styles.headerTitle}>{brandName}</ThemedText>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Model ara..."
            placeholderTextColor="#9CA3AF"
            testID="input-model-search"
          />
          {searchQuery.length > 0 ? (
            <Pressable onPress={() => setSearchQuery("")} testID="button-clear-model-search">
              <Feather name="x-circle" size={18} color="#9CA3AF" />
            </Pressable>
          ) : null}
        </View>
      </View>

      <FlatList
        data={filteredModels}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              styles.modelRow,
              pressed && styles.modelRowPressed,
            ]}
            onPress={() => handleModelPress(item.id, item.name)}
            testID={`row-model-${item.id}`}
          >
            <View style={styles.modelInfo}>
              <ThemedText style={styles.modelName}>{item.name}</ThemedText>
              <ThemedText style={styles.modelYears}>{item.years}</ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </Pressable>
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="inbox" size={48} color="#9CA3AF" />
            <ThemedText style={styles.emptyText}>Model bulunamadi</ThemedText>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    height: 44,
    marginTop: Spacing.xs,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#000000",
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  modelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modelRowPressed: {
    backgroundColor: "#F9FAFB",
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    fontSize: 16,
    color: "#000000",
  },
  modelYears: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl * 2,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: Spacing.md,
  },
});
