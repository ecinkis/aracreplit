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
import CorporateApplicationScreen from "@/screens/CorporateApplicationScreen";
import LegalDocumentScreen from "@/screens/LegalDocumentScreen";
import NotificationsScreen from "@/screens/NotificationsScreen";
import CompareScreen from "@/screens/CompareScreen";
import FilterScreen, { type FilterValues } from "@/screens/FilterScreen";
import ReviewScreen from "@/screens/ReviewScreen";
import PremiumScreen from "@/screens/PremiumScreen";
import BrandListScreen from "@/screens/BrandListScreen";
import ModelListScreen from "@/screens/ModelListScreen";
import SearchResultsScreen from "@/screens/SearchResultsScreen";
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
  CorporateApplication: undefined;
  LegalDocument: { documentType: string };
  Notifications: undefined;
  Compare: undefined;
  Filter: { currentFilters?: FilterValues };
  Review: {
    matchId: string;
    reviewerId: string;
    reviewedUserId: string;
    reviewedUserName: string;
  };
  Premium: undefined;
  BrandList: { categoryId: string; categoryName: string };
  ModelList: { categoryId: string; categoryName: string; brandId: string; brandName: string };
  SearchResults: { categoryId: string; categoryName: string; brandId: string; brandName: string; modelId: string; modelName: string };
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
              headerTintColor: "#000000",
            }}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={({ route }) => ({
              headerTitle: route.params.otherUserName,
              headerTintColor: BrandColors.primaryBlue,
            })}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              headerTitle: "Ayarlar",
              headerTintColor: BrandColors.primaryBlue,
            }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{
              headerTitle: "Profil Düzenle",
              headerTintColor: BrandColors.primaryBlue,
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="CreateListing"
            component={CreateListingScreen}
            options={{
              headerTitle: "Detayli Ilan Ver",
              headerTintColor: "#FFFFFF",
              headerStyle: { backgroundColor: "#000000", height: 110 },
              headerTitleAlign: "left",
              headerTitleStyle: { marginTop: 20 },
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
          <Stack.Screen
            name="CorporateApplication"
            component={CorporateApplicationScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="LegalDocument"
            component={LegalDocumentScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Compare"
            component={CompareScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Filter"
            component={FilterScreen}
            options={{
              headerShown: false,
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="Review"
            component={ReviewScreen}
            options={{
              headerShown: false,
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="Premium"
            component={PremiumScreen}
            options={{
              headerShown: false,
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="BrandList"
            component={BrandListScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ModelList"
            component={ModelListScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SearchResults"
            component={SearchResultsScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
