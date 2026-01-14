import React, { useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View, Pressable, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/hooks/useTheme";
import { BrandColors, Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

import VitrinScreen from "@/screens/VitrinScreen";
import SearchScreen from "@/screens/SearchScreen";
import CreateListingScreen from "@/screens/CreateListingScreen";
import MatchScreen from "@/screens/MatchScreen";
import ProfileScreen from "@/screens/ProfileScreen";

import type { FilterValues } from "@/screens/FilterScreen";

export type MainTabParamList = {
  VitrinTab: undefined;
  SearchTab: { appliedFilters?: FilterValues } | undefined;
  CreateTab: undefined;
  MatchTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

function CreateMenuModal({ 
  visible, 
  onClose,
  onQuickCreate,
  onDetailedCreate,
}: { 
  visible: boolean; 
  onClose: () => void;
  onQuickCreate: () => void;
  onDetailedCreate: () => void;
}) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={StyleSheet.absoluteFill} />
      </Pressable>
      <View 
        style={[
          styles.bottomSheet,
          { paddingBottom: insets.bottom + Spacing.lg }
        ]}
      >
        <View style={styles.sheetHandle} />
        
        <View style={styles.sheetHeader}>
          <ThemedText style={styles.sheetTitle}>İlan Ver</ThemedText>
          <Pressable 
            onPress={onClose}
            style={({ pressed }) => [
              styles.closeButton,
              pressed && { opacity: 0.7 }
            ]}
          >
            <Feather name="x" size={24} color="#374151" />
          </Pressable>
        </View>

        <View style={styles.optionsContainer}>
          <Pressable 
            style={({ pressed }) => [
              styles.optionCard,
              pressed && styles.optionCardPressed
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onQuickCreate();
            }}
          >
            <View style={[styles.optionIconContainer, { backgroundColor: "#10B981" }]}>
              <Feather name="zap" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.optionContent}>
              <ThemedText style={styles.optionTitle}>Hızlı İlan Ver</ThemedText>
              <ThemedText style={styles.optionDescription}>
                Çok detaya girmeden kısa sürede ilan ver
              </ThemedText>
            </View>
            <Feather name="chevron-right" size={24} color="#9CA3AF" />
          </Pressable>

          <Pressable 
            style={({ pressed }) => [
              styles.optionCard,
              pressed && styles.optionCardPressed
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onDetailedCreate();
            }}
          >
            <View style={[styles.optionIconContainer, { backgroundColor: "#1F2937" }]}>
              <Feather name="file-text" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.optionContent}>
              <ThemedText style={styles.optionTitle}>Detaylı İlan Ver</ThemedText>
              <ThemedText style={styles.optionDescription}>
                Tüm özellikleri detaylıca belirterek ilan ver
              </ThemedText>
            </View>
            <Feather name="chevron-right" size={24} color="#9CA3AF" />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleCreatePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMenuVisible(true);
  };

  const handleQuickCreate = () => {
    setMenuVisible(false);
    navigation.navigate("QuickCreateListing");
  };

  const handleDetailedCreate = () => {
    setMenuVisible(false);
    navigation.navigate("CreateListing");
  };

  return (
    <>
      <Tab.Navigator
        initialRouteName="VitrinTab"
        screenOptions={{
          tabBarActiveTintColor: "#6B7280",
          tabBarInactiveTintColor: "#9CA3AF",
          tabBarStyle: {
            position: "absolute",
            backgroundColor: Platform.select({
              ios: "transparent",
              android: theme.backgroundRoot,
            }),
            borderTopWidth: 0,
            elevation: 0,
            height: Platform.OS === "ios" ? 88 : 60,
            paddingBottom: Platform.OS === "ios" ? 28 : 8,
          },
          tabBarBackground: () =>
            Platform.OS === "ios" ? (
              <BlurView
                intensity={100}
                tint={isDark ? "dark" : "light"}
                style={StyleSheet.absoluteFill}
              />
            ) : null,
          headerShown: true,
          headerStyle: {
            backgroundColor: "#000000",
            height: 110,
          },
          headerTitleStyle: {
            color: "#FFFFFF",
            fontSize: 20,
            fontWeight: "600",
          },
          headerTitleAlign: "left",
          headerShadowVisible: false,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "500",
          },
        }}
      >
        <Tab.Screen
          name="VitrinTab"
          component={VitrinScreen}
          options={{
            title: "Vitrin",
            headerTitle: () => (
              <ThemedText style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "600", marginLeft: Spacing.lg }}>
                Vitrin
              </ThemedText>
            ),
            tabBarLabel: "vitrin",
            tabBarIcon: ({ color, size }) => (
              <Feather name="home" size={size} color={color} />
            ),
            headerRight: () => (
              <ThemedText style={{ color: "#FFFFFF", fontSize: 11, marginRight: Spacing.lg, fontStyle: "italic" }}>
                "Yeni nesil ilan sistemi"
              </ThemedText>
            ),
          }}
        />
        <Tab.Screen
          name="SearchTab"
          component={SearchScreen}
          options={{
            title: "Ara",
            headerTitle: () => (
              <ThemedText style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "600", marginLeft: Spacing.lg }}>
                Ara
              </ThemedText>
            ),
            tabBarLabel: "arama",
            tabBarIcon: ({ color, size }) => (
              <Feather name="search" size={size} color={color} />
            ),
            headerRight: () => (
              <Pressable
                style={{ flexDirection: "row", alignItems: "center", gap: 6, marginRight: 16 }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate("Compare");
                }}
              >
                <Feather name="columns" size={18} color="#FFFFFF" />
                <ThemedText style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "500" }}>Karsilastir</ThemedText>
              </Pressable>
            ),
          }}
        />
        <Tab.Screen
          name="CreateTab"
          component={CreateListingScreen}
          options={{
            title: "",
            tabBarIcon: () => null,
            tabBarButton: (props) => (
              <View style={[props.style, styles.createButtonWrapper]}>
                <Pressable
                  onPress={handleCreatePress}
                  style={({ pressed }) => [
                    styles.createButton,
                    pressed && styles.createButtonPressed,
                  ]}
                >
                  <Feather name="plus" size={28} color="#FFFFFF" />
                </Pressable>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="MatchTab"
          component={MatchScreen}
          options={{
            title: "Eşleş",
            headerTitle: "Eşleş",
            tabBarLabel: "eşleş",
            tabBarIcon: ({ color, size }) => (
              <Feather name="layers" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileScreen}
          options={{
            title: "Profil",
            headerTitle: () => (
              <ThemedText style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "600", marginLeft: Spacing.lg }}>
                Profil
              </ThemedText>
            ),
            tabBarLabel: "profil",
            tabBarIcon: ({ color, size }) => (
              <Feather name="user" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
      <CreateMenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onQuickCreate={handleQuickCreate}
        onDetailedCreate={handleDetailedCreate}
      />
    </>
  );
}

const styles = StyleSheet.create({
  createButtonWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  createButton: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: Spacing.md,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  closeButton: {
    padding: Spacing.xs,
  },
  optionsContainer: {
    gap: Spacing.md,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  optionCardPressed: {
    backgroundColor: "#F3F4F6",
    transform: [{ scale: 0.98 }],
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
});
