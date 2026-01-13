import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
    { id: "3-serisi", name: "3 Serisi", years: "1975 - 2024" },
    { id: "5-serisi", name: "5 Serisi", years: "1972 - 2024" },
    { id: "x3", name: "X3", years: "2003 - 2024" },
    { id: "x5", name: "X5", years: "1999 - 2024" },
    { id: "1-serisi", name: "1 Serisi", years: "2004 - 2024" },
    { id: "x1", name: "X1", years: "2009 - 2024" },
    { id: "4-serisi", name: "4 Serisi", years: "2013 - 2024" },
    { id: "7-serisi", name: "7 Serisi", years: "1977 - 2024" },
  ],
  mercedes: [
    { id: "c-serisi", name: "C Serisi", years: "1993 - 2024" },
    { id: "e-serisi", name: "E Serisi", years: "1993 - 2024" },
    { id: "a-serisi", name: "A Serisi", years: "1997 - 2024" },
    { id: "glc", name: "GLC", years: "2015 - 2024" },
    { id: "gle", name: "GLE", years: "2015 - 2024" },
    { id: "cla", name: "CLA", years: "2013 - 2024" },
    { id: "s-serisi", name: "S Serisi", years: "1972 - 2024" },
  ],
  audi: [
    { id: "a3", name: "A3", years: "1996 - 2024" },
    { id: "a4", name: "A4", years: "1994 - 2024" },
    { id: "a6", name: "A6", years: "1994 - 2024" },
    { id: "q3", name: "Q3", years: "2011 - 2024" },
    { id: "q5", name: "Q5", years: "2008 - 2024" },
    { id: "q7", name: "Q7", years: "2005 - 2024" },
    { id: "a5", name: "A5", years: "2007 - 2024" },
  ],
  volkswagen: [
    { id: "golf", name: "Golf", years: "1974 - 2024" },
    { id: "passat", name: "Passat", years: "1973 - 2024" },
    { id: "polo", name: "Polo", years: "1975 - 2024" },
    { id: "tiguan", name: "Tiguan", years: "2007 - 2024" },
    { id: "t-roc", name: "T-Roc", years: "2017 - 2024" },
    { id: "arteon", name: "Arteon", years: "2017 - 2024" },
  ],
  toyota: [
    { id: "corolla", name: "Corolla", years: "1966 - 2024" },
    { id: "yaris", name: "Yaris", years: "1999 - 2024" },
    { id: "c-hr", name: "C-HR", years: "2016 - 2024" },
    { id: "rav4", name: "RAV4", years: "1994 - 2024" },
    { id: "camry", name: "Camry", years: "1982 - 2024" },
    { id: "supra", name: "Supra", years: "1978 - 2024" },
  ],
  honda: [
    { id: "civic", name: "Civic", years: "1972 - 2024" },
    { id: "accord", name: "Accord", years: "1976 - 2024" },
    { id: "cr-v", name: "CR-V", years: "1995 - 2024" },
    { id: "hr-v", name: "HR-V", years: "1998 - 2024" },
    { id: "jazz", name: "Jazz", years: "2001 - 2024" },
  ],
  tesla: [
    { id: "model-3", name: "Model 3", years: "2017 - 2024" },
    { id: "model-y", name: "Model Y", years: "2020 - 2024" },
    { id: "model-s", name: "Model S", years: "2012 - 2024" },
    { id: "model-x", name: "Model X", years: "2015 - 2024" },
  ],
  togg: [
    { id: "t10x", name: "T10X", years: "2023 - 2024" },
  ],
};

export default function ModelListScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ModelListRouteProp>();
  const { categoryId, categoryName, brandId, brandName } = route.params;

  const models = MODELS_BY_BRAND[brandId] || [];

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
      <ScrollView
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{brandName}</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>Model seçin</ThemedText>
        </View>

        <View style={styles.modelsContainer}>
          {models.map((model) => (
            <Pressable
              key={model.id}
              style={({ pressed }) => [
                styles.modelCard,
                pressed && styles.modelCardPressed,
              ]}
              onPress={() => handleModelPress(model.id, model.name)}
              testID={`card-model-${model.id}`}
            >
              <View style={styles.modelContent}>
                <ThemedText style={styles.modelName}>{model.name}</ThemedText>
                <ThemedText style={styles.modelYears}>{model.years}</ThemedText>
              </View>
              <Feather name="chevron-right" size={20} color="#9CA3AF" />
            </Pressable>
          ))}

          {models.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="inbox" size={48} color="#9CA3AF" />
              <ThemedText style={styles.emptyText}>Bu marka için model bulunamadı</ThemedText>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  listContent: {
    flexGrow: 1,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },
  modelsContainer: {
    gap: Spacing.sm,
  },
  modelCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: Spacing.md,
  },
  modelCardPressed: {
    backgroundColor: "#F9FAFB",
    transform: [{ scale: 0.98 }],
  },
  modelContent: {
    flex: 1,
  },
  modelName: {
    fontSize: 16,
    fontWeight: "600",
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
