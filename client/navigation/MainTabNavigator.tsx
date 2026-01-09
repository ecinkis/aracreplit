import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View, Pressable } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { BrandColors, Spacing, BorderRadius } from "@/constants/theme";

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

function CreateTabButton({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.createButton,
        pressed && styles.createButtonPressed,
      ]}
    >
      <Feather name="plus" size={28} color="#FFFFFF" />
    </Pressable>
  );
}

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="VitrinTab"
      screenOptions={{
        tabBarActiveTintColor: BrandColors.primaryOrange,
        tabBarInactiveTintColor: theme.tabIconDefault,
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
          tabBarButton: (props) => <CreateTabButton onPress={props.onPress} />,
        }}
      />
      <Tab.Screen
        name="MatchTab"
        component={MatchScreen}
        options={{
          title: "eşleş",
          tabBarIcon: ({ color, size }) => (
            <Feather name="repeat" size={size} color={color} />
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
});
