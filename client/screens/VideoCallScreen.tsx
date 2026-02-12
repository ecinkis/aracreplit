import React, { useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Pressable,
} from "react-native";
import { WebView } from "react-native-webview";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getApiUrl } from "@/lib/query-client";
import { Spacing } from "@/constants/theme";

type VideoCallRouteProp = RouteProp<RootStackParamList, "VideoCall">;

export default function VideoCallScreen() {
  const route = useRoute<VideoCallRouteProp>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const { matchId, userId, userName } = route.params;

  const roomId = `match-${matchId}`;
  const baseUrl = getApiUrl();
  const videoCallUrl = `${baseUrl}video-call?room=${encodeURIComponent(roomId)}&userId=${encodeURIComponent(userId)}&userName=${encodeURIComponent(userName)}`;

  const handleMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === "call-ended") {
          navigation.goBack();
        }
      } catch (err) {
        console.error("WebView message error:", err);
      }
    },
    [navigation]
  );

  if (Platform.OS === "web") {
    return (
      <View style={[styles.webFallback, { paddingTop: insets.top + Spacing.xl }]}>
        <Feather name="video" size={64} color="#6B7280" />
        <ThemedText style={styles.webFallbackTitle}>
          Video Gorusme
        </ThemedText>
        <ThemedText style={styles.webFallbackText}>
          Video gorusme ozelligi mobil cihazlarda kullanilabilir. Lutfen Expo Go uygulamasindan deneyin.
        </ThemedText>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ThemedText style={styles.backButtonText}>Geri Don</ThemedText>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: videoCallUrl }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        mediaCapturePermissionGrantType="grant"
        onMessage={handleMessage}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <ThemedText style={styles.loadingText}>
              Video baglantisi hazirlaniyor...
            </ThemedText>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  webview: {
    flex: 1,
    backgroundColor: "#000",
  },
  loading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loadingText: {
    color: "#fff",
    marginTop: Spacing.md,
    fontSize: 16,
  },
  webFallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    padding: Spacing.xl,
  },
  webFallbackTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  webFallbackText: {
    color: "#9CA3AF",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  backButton: {
    marginTop: Spacing.xl,
    backgroundColor: "#3B82F6",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
