import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { getApiUrl } from "@/lib/query-client";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === "web") {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: undefined,
    });
    return tokenData.data;
  } catch (error) {
    console.error("Failed to get push token:", error);
    return null;
  }
}

async function sendTokenToServer(userId: string, token: string) {
  try {
    const baseUrl = getApiUrl();
    await fetch(new URL("/api/push-token", baseUrl).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        token,
        platform: Platform.OS,
      }),
    });
  } catch (error) {
    console.error("Failed to save push token:", error);
  }
}

export function usePushNotifications(userId: string | null | undefined) {
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    registerForPushNotifications().then((token) => {
      if (token) {
        tokenRef.current = token;
        sendTokenToServer(userId, token);
      }
    });
  }, [userId]);

  return { token: tokenRef.current };
}
