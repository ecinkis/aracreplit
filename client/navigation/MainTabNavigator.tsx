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

export type MainTabParamList = {
  VitrinTab: undefined;
  SearchTab: undefined;
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
  const tabBarHeight = Platform.OS === "ios" ? 88 : 60;

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Animated.View 
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={StyleSheet.absoluteFill}
        />
      </Pressable>
      <Animated.View 
        entering={SlideInDown.springify().damping(20)}
        exiting={SlideOutDown.duration(200)}
        style={[
          styles.menuContainer,
          { bottom: tabBarHeight + insets.bottom + 20 }
        ]}
      >
        <Pressable 
          style={({ pressed }) => [
            styles.menuItem,
            pressed && styles.menuItemPressed
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onDetailedCreate();
          }}
        >
          <View style={styles.menuIconContainer}>
            <Feather name="file-text" size={20} color="#000000" />
          </View>
          <ThemedText style={styles.menuText}>Detayli ilan ver</ThemedText>
        </Pressable>
        <Pressable 
          style={({ pressed }) => [
            styles.menuItem,
            pressed && styles.menuItemPressed
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onQuickCreate();
          }}
        >
          <View style={styles.menuIconContainer}>
            <Feather name="zap" size={20} color="#000000" />
          </View>
          <ThemedText style={styles.menuText}>Hizli ilan ver</ThemedText>
        </Pressable>
      </Animated.View>
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
          headerShown: false,
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
            title: "vitrin",
            tabBarIcon: ({ color, size }) => (
              <Feather name="home" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="SearchTab"
          component={SearchScreen}
          options={{
            title: "arama",
            tabBarIcon: ({ color, size }) => (
              <Feather name="search" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="CreateTab"
          component={CreateListingScreen}
          options={{
            title: "",
            tabBarIcon: () => null,
            tabBarButton: () => (
              <Pressable
                onPress={handleCreatePress}
                style={({ pressed }) => [
                  styles.createButton,
                  pressed && styles.createButtonPressed,
                ]}
              >
                <Feather name="plus" size={28} color="#FFFFFF" />
              </Pressable>
            ),
          }}
        />
        <Tab.Screen
          name="MatchTab"
          component={MatchScreen}
          options={{
            title: "esles",
            tabBarIcon: ({ color, size }) => (
              <Feather name="layers" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="ProfileTab"
          component={ProfileScreen}
          options={{
            title: "profil",
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
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  menuContainer: {
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -100 }],
    width: 200,
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  menuItemPressed: {
    backgroundColor: "#F3F4F6",
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000000",
  },
});
