import React, { useState, useEffect, useCallback } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import AuthScreen from "@/screens/AuthScreen";
import OnboardingScreen from "@/screens/OnboardingScreen";
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
import VerificationScreen from "@/screens/VerificationScreen";
import StoryCreationScreen from "@/screens/StoryCreationScreen";
import VideoCallScreen from "@/screens/VideoCallScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useAuth } from "@/contexts/AuthContext";
import { BrandColors } from "@/constants/theme";

const ONBOARDING_KEY = "@takas_onboarding_seen";

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  ListingDetail: { listingId: string };
  Chat: { matchId: string; otherUserName: string };
  Settings: undefined;
  EditProfile: undefined;
  CreateListing: { editListingId?: string } | undefined;
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
  StoryCreation: undefined;
  BrandList: { categoryId: string; categoryName: string };
  ModelList: { categoryId?: string; categoryName?: string; brandId: string; brandName: string };
  SearchResults: { categoryId?: string; categoryName?: string; brandId?: string; brandName?: string; modelId?: string; modelName?: string; brand?: string; model?: string; query?: string };
  Verification: { documentType: string };
  VideoCall: { matchId: string; userId: string; userName: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function OnboardingWrapper({ onDone }: { onDone: () => void }) {
  const handleComplete = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    onDone();
  }, [onDone]);

  return <OnboardingScreen onComplete={handleComplete} />;
}

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { isAuthenticated, isLoading } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => {
      setHasSeenOnboarding(value === "true");
    });
  }, []);

  const handleOnboardingDone = useCallback(() => {
    setHasSeenOnboarding(true);
  }, []);

  if (isLoading || hasSeenOnboarding === null) {
    return null;
  }

  if (!hasSeenOnboarding && !isAuthenticated) {
    return <OnboardingWrapper onDone={handleOnboardingDone} />;
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
              headerTitle: "Ilan Detayi",
              headerTintColor: "#000000",
            }}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={({ route }) => ({
              headerTitle: route.params.otherUserName,
              headerTintColor: "#333333",
              headerBackTitleVisible: false,
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
              headerTitle: "Profil Duzenle",
              headerTintColor: "#000000",
              presentation: "modal",
            }}
          />
          <Stack.Screen
            name="CreateListing"
            component={CreateListingScreen}
            options={{
              headerShown: false,
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
            name="StoryCreation"
            component={StoryCreationScreen}
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
            options={{
              headerTitle: "Arama Sonuclari",
              headerBackTitle: "Geri",
            }}
          />
          <Stack.Screen
            name="Verification"
            component={VerificationScreen}
            options={{
              headerTitle: "Belge Dogrulama",
              headerTintColor: "#000000",
            }}
          />
          <Stack.Screen
            name="VideoCall"
            component={VideoCallScreen}
            options={{
              headerShown: false,
              presentation: "fullScreenModal",
              animation: "slide_from_bottom",
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
