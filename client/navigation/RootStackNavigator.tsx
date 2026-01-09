import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import AuthScreen from "@/screens/AuthScreen";
import ListingDetailScreen from "@/screens/ListingDetailScreen";
import ChatScreen from "@/screens/ChatScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import EditProfileScreen from "@/screens/EditProfileScreen";
import CreateListingScreen from "@/screens/CreateListingScreen";
import QuickCreateListingScreen from "@/screens/QuickCreateListingScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useAuth } from "@/contexts/AuthContext";
import { BrandColors } from "@/constants/theme";

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  ListingDetail: { listingId: string };
  Chat: { matchId: string; otherUserName: string };
  Settings: undefined;
  EditProfile: undefined;
  CreateListing: undefined;
  QuickCreateListing: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {!isAuthenticated ? (
        <Stack.Screen
          name="Login"
          component={AuthScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ListingDetail"
            component={ListingDetailScreen}
            options={{
              headerTitle: "İlan Detayı",
              headerTintColor: BrandColors.primaryOrange,
            }}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={({ route }) => ({
              headerTitle: route.params.otherUserName,
              headerTintColor: BrandColors.primaryOrange,
            })}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              headerTitle: "Ayarlar",
              headerTintColor: BrandColors.primaryOrange,
            }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{
              headerTitle: "Profil Düzenle",
              headerTintColor: BrandColors.primaryOrange,
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="CreateListing"
            component={CreateListingScreen}
            options={{
              headerTitle: "Detayli Ilan Ver",
              headerTintColor: BrandColors.primaryOrange,
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="QuickCreateListing"
            component={QuickCreateListingScreen}
            options={{
              headerShown: false,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
