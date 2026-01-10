import React, { useState, useRef, useEffect, useMemo, useLayoutEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
  Alert,
  Linking,
} from "react-native";
import * as FileSystem from "expo-file-system";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HeaderButton } from "@react-navigation/elements";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Audio, AVPlaybackStatus } from "expo-av";
import Animated, { FadeInUp, FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { Spacing, BorderRadius, Typography, BrandColors } from "@/constants/theme";
import { Message, Match } from "@shared/schema";
import { apiRequest, getApiUrl } from "@/lib/query-client";

type ChatRouteProp = RouteProp<RootStackParamList, "Chat">;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function VoiceMessageBubble({
  message,
  isOwn,
}: {
  message: Message;
  isOwn: boolean;
}) {
  const { theme } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playbackPosition, setPlaybackPosition] = useState(0);

  const duration = message.audioDuration || 0;

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const handlePlayPause = async () => {
    try {
      if (isPlaying && sound) {
        await sound.pauseAsync();
        setIsPlaying(false);
        return;
      }

      if (sound) {
        await sound.playAsync();
        setIsPlaying(true);
        return;
      }

      if (!message.audioData) return;

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: message.audioData },
        { shouldPlay: true },
        (status: AVPlaybackStatus) => {
          if (status.isLoaded) {
            setPlaybackPosition(status.positionMillis / 1000);
            if (status.didJustFinish) {
              setIsPlaying(false);
              setPlaybackPosition(0);
            }
          }
        }
      );
      setSound(newSound);
      setIsPlaying(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error("Playback error:", error);
      Alert.alert("Hata", "Ses kaydı oynatılamadı");
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (playbackPosition / duration) * 100 : 0;

  const waveformHeights = useMemo(() => 
    [...Array(20)].map(() => 4 + Math.random() * 12), 
    []
  );

  return (
    <Animated.View
      entering={FadeInUp.springify()}
      style={[
        styles.voiceBubble,
        isOwn ? styles.ownBubble : [styles.otherBubble, { backgroundColor: theme.backgroundSecondary }],
      ]}
    >
      <Pressable
        onPress={handlePlayPause}
        style={[
          styles.playButton,
          { backgroundColor: isOwn ? "rgba(255,255,255,0.2)" : BrandColors.primaryBlue },
        ]}
      >
        <Feather
          name={isPlaying ? "pause" : "play"}
          size={20}
          color="#FFFFFF"
        />
      </Pressable>

      <View style={styles.voiceContent}>
        <View style={styles.waveformContainer}>
          <View
            style={[
              styles.waveformProgress,
              {
                width: `${progress}%`,
                backgroundColor: isOwn ? "rgba(255,255,255,0.5)" : BrandColors.primaryBlue,
              },
            ]}
          />
          {waveformHeights.map((height, i) => (
            <View
              key={i}
              style={[
                styles.waveformBar,
                {
                  height,
                  backgroundColor: isOwn ? "rgba(255,255,255,0.4)" : "#D1D5DB",
                },
              ]}
            />
          ))}
        </View>
        <ThemedText
          style={[
            styles.voiceDuration,
            isOwn ? { color: "rgba(255,255,255,0.7)" } : { color: theme.textSecondary },
          ]}
        >
          {formatDuration(isPlaying ? playbackPosition : duration)}
        </ThemedText>
      </View>

      <ThemedText
        style={[
          styles.messageTime,
          isOwn ? { color: "rgba(255,255,255,0.7)" } : { color: theme.textSecondary },
        ]}
      >
        {new Date(message.createdAt!).toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </ThemedText>
    </Animated.View>
  );
}

function MessageBubble({
  message,
  isOwn,
  index,
}: {
  message: Message;
  isOwn: boolean;
  index: number;
}) {
  const { theme } = useTheme();

  if (message.messageType === "audio") {
    return <VoiceMessageBubble message={message} isOwn={isOwn} />;
  }

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 30).springify()}
      style={[
        styles.messageBubble,
        isOwn ? styles.ownBubble : [styles.otherBubble, { backgroundColor: theme.backgroundSecondary }],
      ]}
    >
      <ThemedText style={[styles.messageText, isOwn && { color: "#FFFFFF" }]}>
        {message.content}
      </ThemedText>
      <ThemedText
        style={[
          styles.messageTime,
          isOwn ? { color: "rgba(255,255,255,0.7)" } : { color: theme.textSecondary },
        ]}
      >
        {new Date(message.createdAt!).toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </ThemedText>
    </Animated.View>
  );
}

function RecordingIndicator({ duration }: { duration: number }) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.3, { duration: 500 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.recordingIndicator}>
      <Animated.View style={[styles.recordingDot, animatedStyle]} />
      <ThemedText style={styles.recordingText}>
        Kaydediliyor... {formatDuration(duration)}
      </ThemedText>
      <ThemedText style={styles.recordingHint}>
        Bırakmak için parmağını kaldır
      </ThemedText>
    </Animated.View>
  );
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<ChatRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { matchId, otherUserName } = route.params;
  const [messageText, setMessageText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { data: match } = useQuery<Match>({
    queryKey: ["/api/match", matchId],
  });

  const { data: reviewCheck } = useQuery<{ hasReviewed: boolean }>({
    queryKey: [`/api/reviews/match/${matchId}/check/${user?.id}`],
    enabled: !!user?.id && !!matchId,
  });

  const otherUserId = match
    ? match.user1Id === user?.id
      ? match.user2Id
      : match.user1Id
    : null;

  useLayoutEffect(() => {
    if (!reviewCheck?.hasReviewed && otherUserId) {
      navigation.setOptions({
        headerRight: () => (
          <HeaderButton
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("Review", {
                matchId,
                reviewerId: user?.id || "",
                reviewedUserId: otherUserId,
                reviewedUserName: otherUserName,
              });
            }}
          >
            <Feather name="star" size={22} color={BrandColors.primaryBlue} />
          </HeaderButton>
        ),
      });
    }
  }, [navigation, reviewCheck, otherUserId, matchId, user?.id, otherUserName]);

  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", matchId],
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: async (data: { content?: string; messageType?: string; audioData?: string; audioDuration?: number }) => {
      return apiRequest("/api/messages", {
        method: "POST",
        body: JSON.stringify({
          matchId,
          senderId: user?.id,
          ...data,
        }),
      });
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages", matchId] });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
  });

  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      let permission = await Audio.getPermissionsAsync();
      
      if (permission.status !== "granted") {
        permission = await Audio.requestPermissionsAsync();
      }
      
      if (permission.status !== "granted") {
        if (!permission.canAskAgain && Platform.OS !== "web") {
          Alert.alert(
            "Mikrofon İzni Gerekli",
            "Sesli mesaj göndermek için ayarlardan mikrofon iznini açmanız gerekiyor.",
            [
              { text: "İptal", style: "cancel" },
              { 
                text: "Ayarlara Git", 
                onPress: async () => {
                  try {
                    await Linking.openSettings();
                  } catch (error) {
                    console.error("Failed to open settings:", error);
                  }
                }
              },
            ]
          );
        } else {
          Alert.alert("İzin Gerekli", "Sesli mesaj göndermek için mikrofon izni vermeniz gerekiyor.");
        }
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Recording start error:", error);
      Alert.alert("Hata", "Ses kaydı başlatılamadı");
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    try {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      const duration = recordingDuration;

      recordingRef.current = null;
      setIsRecording(false);
      setRecordingDuration(0);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      if (uri && duration >= 1) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        const base64Audio = await FileSystem.readAsStringAsync(uri, {
          encoding: 'base64',
        });
        const audioDataUri = `data:audio/m4a;base64,${base64Audio}`;
        
        sendMutation.mutate({
          messageType: "audio",
          audioData: audioDataUri,
          audioDuration: duration,
        });
      } else if (duration < 1) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch (error) {
      console.error("Recording stop error:", error);
      setIsRecording(false);
      setRecordingDuration(0);
    }
  };

  const handleSend = () => {
    if (messageText.trim()) {
      sendMutation.mutate({ content: messageText.trim(), messageType: "text" });
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => (
    <MessageBubble
      message={item}
      isOwn={item.senderId === user?.id}
      index={index}
    />
  );

  return (
    <ThemedView style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BrandColors.primaryBlue} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.messagesList,
            { paddingBottom: Spacing.md },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Feather name="message-circle" size={48} color={theme.textSecondary} />
              <ThemedText style={[styles.emptyChatText, { color: theme.textSecondary }]}>
                Henüz mesaj yok. Sohbete başlayın!
              </ThemedText>
            </View>
          }
        />
      )}

      {isRecording ? (
        <RecordingIndicator duration={recordingDuration} />
      ) : null}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.cardBackground,
            paddingBottom: insets.bottom + Spacing.sm,
          },
        ]}
      >
        <Pressable
          onPressIn={startRecording}
          onPressOut={stopRecording}
          style={({ pressed }) => [
            styles.micButton,
            pressed && { backgroundColor: "#EF4444" },
            isRecording && { backgroundColor: "#EF4444" },
          ]}
        >
          <Feather name="mic" size={20} color="#FFFFFF" />
        </Pressable>

        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.backgroundSecondary, color: theme.text },
          ]}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Mesajınızı yazın..."
          placeholderTextColor={theme.textSecondary}
          multiline
          maxLength={500}
        />
        <Pressable
          style={({ pressed }) => [
            styles.sendButton,
            !messageText.trim() && styles.sendButtonDisabled,
            pressed && messageText.trim() && { opacity: 0.8 },
          ]}
          onPress={handleSend}
          disabled={!messageText.trim() || sendMutation.isPending}
        >
          {sendMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Feather name="send" size={20} color="#FFFFFF" />
          )}
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesList: {
    padding: Spacing.md,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  voiceBubble: {
    maxWidth: "80%",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  ownBubble: {
    backgroundColor: BrandColors.primaryBlue,
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    ...Typography.body,
  },
  messageTime: {
    ...Typography.caption,
    fontSize: 11,
    marginTop: Spacing.xs,
    alignSelf: "flex-end",
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  voiceContent: {
    flex: 1,
    gap: 4,
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 20,
    gap: 2,
    overflow: "hidden",
    position: "relative",
  },
  waveformProgress: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 2,
  },
  waveformBar: {
    width: 3,
    borderRadius: 2,
  },
  voiceDuration: {
    fontSize: 12,
  },
  emptyChat: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  emptyChatText: {
    ...Typography.body,
    marginTop: Spacing.md,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: Spacing.sm,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: "#6B7280",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: BrandColors.primaryBlue,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  recordingIndicator: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingVertical: Spacing.xl,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  recordingDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#EF4444",
    marginBottom: Spacing.md,
  },
  recordingText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  recordingHint: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
  },
});
