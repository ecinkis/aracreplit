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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ModelListRouteProp = RouteProp<RootStackParamList, "ModelList">;

const MODELS_BY_BRAND: Record<string, Array<{ id: string; name: string; years: string }>> = {
  bmw: [
    { id: "1-serisi", name: "1 Serisi", years: "2004 - 2024" },
    { id: "3-serisi", name: "3 Serisi", years: "1975 - 2024" },
    { id: "4-serisi", name: "4 Serisi", years: "2013 - 2024" },
    { id: "5-serisi", name: "5 Serisi", years: "1972 - 2024" },
    { id: "7-serisi", name: "7 Serisi", years: "1977 - 2024" },
    { id: "x1", name: "X1", years: "2009 - 2024" },
    { id: "x3", name: "X3", years: "2003 - 2024" },
    { id: "x5", name: "X5", years: "1999 - 2024" },
  ],
  mercedes: [
    { id: "a-serisi", name: "A Serisi", years: "1997 - 2024" },
    { id: "c-serisi", name: "C Serisi", years: "1993 - 2024" },
    { id: "cla", name: "CLA", years: "2013 - 2024" },
    { id: "e-serisi", name: "E Serisi", years: "1993 - 2024" },
    { id: "glc", name: "GLC", years: "2015 - 2024" },
    { id: "gle", name: "GLE", years: "2015 - 2024" },
    { id: "s-serisi", name: "S Serisi", years: "1972 - 2024" },
  ],
  audi: [
    { id: "a3", name: "A3", years: "1996 - 2024" },
    { id: "a4", name: "A4", years: "1994 - 2024" },
    { id: "a5", name: "A5", years: "2007 - 2024" },
    { id: "a6", name: "A6", years: "1994 - 2024" },
    { id: "q3", name: "Q3", years: "2011 - 2024" },
    { id: "q5", name: "Q5", years: "2008 - 2024" },
    { id: "q7", name: "Q7", years: "2005 - 2024" },
  ],
  volkswagen: [
    { id: "arteon", name: "Arteon", years: "2017 - 2024" },
    { id: "golf", name: "Golf", years: "1974 - 2024" },
    { id: "passat", name: "Passat", years: "1973 - 2024" },
    { id: "polo", name: "Polo", years: "1975 - 2024" },
    { id: "t-roc", name: "T-Roc", years: "2017 - 2024" },
    { id: "tiguan", name: "Tiguan", years: "2007 - 2024" },
  ],
  toyota: [
    { id: "c-hr", name: "C-HR", years: "2016 - 2024" },
    { id: "camry", name: "Camry", years: "1982 - 2024" },
    { id: "corolla", name: "Corolla", years: "1966 - 2024" },
    { id: "rav4", name: "RAV4", years: "1994 - 2024" },
    { id: "supra", name: "Supra", years: "1978 - 2024" },
    { id: "yaris", name: "Yaris", years: "1999 - 2024" },
  ],
  honda: [
    { id: "accord", name: "Accord", years: "1976 - 2024" },
    { id: "civic", name: "Civic", years: "1972 - 2024" },
    { id: "cr-v", name: "CR-V", years: "1995 - 2024" },
    { id: "hr-v", name: "HR-V", years: "1998 - 2024" },
    { id: "jazz", name: "Jazz", years: "2001 - 2024" },
  ],
  tesla: [
    { id: "model-3", name: "Model 3", years: "2017 - 2024" },
    { id: "model-s", name: "Model S", years: "2012 - 2024" },
    { id: "model-x", name: "Model X", years: "2015 - 2024" },
    { id: "model-y", name: "Model Y", years: "2020 - 2024" },
  ],
  togg: [
    { id: "t10x", name: "T10X", years: "2023 - 2024" },
  ],
};

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
      <View style={styles.searchRow}>
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: Spacing.md,
    height: 48,
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
