import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
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
      modelName 
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color="#9CA3AF" style={styles.searchIcon} />
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
            <Feather name="x" size={18} color="#9CA3AF" />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredModels.map((model) => (
          <Pressable
            key={model.id}
            style={({ pressed }) => [
              styles.modelRow,
              pressed && styles.modelRowPressed,
            ]}
            onPress={() => handleModelPress(model.id, model.name)}
            testID={`row-model-${model.id}`}
          >
            <View style={styles.modelInfo}>
              <ThemedText style={styles.modelName}>{model.name}</ThemedText>
              <ThemedText style={styles.modelYears}>{model.years}</ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </Pressable>
        ))}

        {filteredModels.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="inbox" size={48} color="#9CA3AF" />
            <ThemedText style={styles.emptyText}>Model bulunamadı</ThemedText>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: Spacing.lg,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: Spacing.md,
    height: 48,
    marginTop: 13,
    marginBottom: Spacing.xs,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#000000",
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xl,
  },
  modelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
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
