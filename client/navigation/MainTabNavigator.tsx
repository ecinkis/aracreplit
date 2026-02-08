import React, { useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { Platform, StyleSheet, View, Pressable, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/hooks/useTheme";
import { BrandColors, Spacing, BorderRadius } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

import VitrinScreen from "@/screens/VitrinScreen";
import { TakasLogo } from "@/components/TakasLogo";
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
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <Animated.View
          entering={SlideInDown.springify().damping(18).stiffness(140)}
          exiting={SlideOutDown.duration(250)}
          style={[
            styles.bottomSheet,
            { paddingBottom: insets.bottom + Spacing.xl }
          ]}
        >
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <View style={styles.sheetTitleRow}>
              <View style={styles.sheetTitleIcon}>
                <Feather name="plus-circle" size={20} color="#FFFFFF" />
              </View>
              <ThemedText style={styles.sheetTitle}>Yeni İlan Oluştur</ThemedText>
            </View>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && { opacity: 0.6, transform: [{ scale: 0.9 }] }
              ]}
            >
              <Feather name="x" size={18} color="#999999" />
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
              <LinearGradient
                colors={["#10B981", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.optionIconContainer}
              >
                <Feather name="zap" size={22} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.optionContent}>
                <ThemedText style={styles.optionTitle}>Hızlı İlan</ThemedText>
                <ThemedText style={styles.optionDescription}>
                  Birkaç adımda hızlıca ilan oluştur
                </ThemedText>
              </View>
              <View style={styles.optionArrow}>
                <Feather name="arrow-right" size={18} color="#666666" />
              </View>
            </Pressable>

            <View style={styles.optionDivider} />

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
              <LinearGradient
                colors={["#1F2937", "#111827"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.optionIconContainer}
              >
                <Feather name="file-text" size={22} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.optionContent}>
                <ThemedText style={styles.optionTitle}>Detaylı İlan</ThemedText>
                <ThemedText style={styles.optionDescription}>
                  Tüm detayları ekleyerek profesyonel ilan oluştur
                </ThemedText>
              </View>
              <View style={styles.optionArrow}>
                <Feather name="arrow-right" size={18} color="#666666" />
              </View>
            </Pressable>
          </View>
        </Animated.View>
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
            backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
            borderTopWidth: 0,
            elevation: 0,
            height: Platform.OS === "ios" ? 100 : 72,
            paddingBottom: Platform.OS === "ios" ? 32 : 12,
          },
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
          tabBarIconStyle: {
            marginTop: 5,
          },
        }}
      >
        <Tab.Screen
          name="VitrinTab"
          component={VitrinScreen}
          options={{
            title: "Vitrin",
            headerTitle: () => (
              <ThemedText style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "600", marginLeft: 9 }}>
                Vitrin
              </ThemedText>
            ),
            tabBarLabel: "vitrin",
            tabBarIcon: ({ color, size }) => (
              <Feather name="home" size={size} color={color} />
            ),
            headerRight: () => (
              <View style={{ flexDirection: "row", alignItems: "center", marginRight: Spacing.lg }}>
                <TakasLogo size={28} />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="SearchTab"
          component={SearchScreen}
          options={{
            title: "Ara",
            headerTitle: () => (
              <ThemedText style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "600", marginLeft: Spacing.lg - 3 }}>
                Ara
              </ThemedText>
            ),
            tabBarLabel: "arama",
            tabBarIcon: ({ color, size }) => (
              <Feather name="search" size={size} color={color} />
            ),
            headerRight: () => (
              <Pressable
                style={{ flexDirection: "row", alignItems: "center", gap: 6, marginRight: 21 }}
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
                <View style={[styles.createButtonOuter, { backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF" }]}>
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
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="MatchTab"
          component={MatchScreen}
          options={{
            title: "Eşleş",
            headerTitle: () => (
              <ThemedText style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "600", marginLeft: 9 }}>
                Eşleş
              </ThemedText>
            ),
            tabBarLabel: "eşleş",
            tabBarIcon: ({ color, size }) => (
              <Feather name="repeat" size={size} color={color} />
            ),
            headerRight: () => (
              <View style={{ flexDirection: "row", alignItems: "center", marginRight: Spacing.lg }}>
                <TakasLogo size={28} />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileScreen}
          options={{
            title: "Profil",
            headerTitle: () => (
              <ThemedText style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "600", marginLeft: 9 }}>
                Profil
              </ThemedText>
            ),
            tabBarLabel: "profil",
            tabBarIcon: ({ color, size }) => (
              <Feather name="user" size={size} color={color} />
            ),
            headerRight: () => (
              <View style={{ flexDirection: "row", alignItems: "center", marginRight: Spacing.lg }}>
                <TakasLogo size={28} />
              </View>
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
  createButtonOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -28,
  },
  createButton: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
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
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "#1A1A1A",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#3A3A3A",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  sheetTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sheetTitleIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  sheetTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
  },
  optionsContainer: {
    backgroundColor: "#222222",
    borderRadius: 16,
    overflow: "hidden",
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  optionCardPressed: {
    backgroundColor: "#2A2A2A",
  },
  optionDivider: {
    height: 1,
    backgroundColor: "#2E2E2E",
    marginHorizontal: 16,
  },
  optionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 12,
    color: "#888888",
    lineHeight: 16,
  },
  optionArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
  },
});
