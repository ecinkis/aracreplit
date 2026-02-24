import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, Typography, BrandColors } from "@/constants/theme";

interface SettingsItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
  showArrow?: boolean;
}

function SettingsItem({ icon, label, onPress, danger, showArrow = true }: SettingsItemProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingsItem,
        { backgroundColor: theme.cardBackground },
        pressed && { opacity: 0.8 },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <Feather
        name={icon as any}
        size={20}
        color={danger ? BrandColors.alertRed : theme.text}
      />
      <ThemedText
        style={[
          styles.settingsLabel,
          danger && { color: BrandColors.alertRed },
        ]}
      >
        {label}
      </ThemedText>
      {showArrow && (
        <Feather
          name="chevron-right"
          size={20}
          color={theme.textSecondary}
        />
      )}
    </Pressable>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={styles.section}>
      <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
        {title}
      </ThemedText>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Çıkış Yap",
      "Hesabınızdan çıkış yapmak istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Çıkış Yap",
          style: "destructive",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await logout();
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection title="Hesap">
          <SettingsItem
            icon="user"
            label="Profil Düzenle"
            onPress={() => (navigation as any).navigate("EditProfile")}
          />
          <SettingsItem
            icon="phone"
            label="Telefon Numarası"
            onPress={() => Alert.alert("Bilgi", user?.phone || "Telefon numarası yok")}
          />
        </SettingsSection>

        <SettingsSection title="Bildirimler">
          <SettingsItem
            icon="bell"
            label="Bildirim Ayarları"
            onPress={() => Alert.alert("Bilgi", "Bildirim ayarları yakında eklenecek")}
          />
        </SettingsSection>

        <SettingsSection title="Gizlilik">
          <SettingsItem
            icon="lock"
            label="Gizlilik Ayarları"
            onPress={() => Alert.alert("Bilgi", "Gizlilik ayarları yakında eklenecek")}
          />
        </SettingsSection>

        <SettingsSection title="Destek">
          <SettingsItem
            icon="help-circle"
            label="Sık Sorulan Sorular"
            onPress={() => Alert.alert("Bilgi", "SSS yakında eklenecek")}
          />
          <SettingsItem
            icon="mail"
            label="İletişim"
            onPress={() => Alert.alert("İletişim", "destek@aractakasi.com")}
          />
        </SettingsSection>

        <SettingsSection title="Hakkında">
          <SettingsItem
            icon="file-text"
            label="Kullanım Koşulları"
            onPress={() => Alert.alert("Bilgi", "Kullanım koşulları yakında eklenecek")}
          />
          <SettingsItem
            icon="shield"
            label="Gizlilik Politikası"
            onPress={() => Alert.alert("Bilgi", "Gizlilik politikası yakında eklenecek")}
          />
          <SettingsItem
            icon="info"
            label="Uygulama Versiyonu"
            onPress={() => {}}
            showArrow={false}
          />
        </SettingsSection>

        <View style={styles.logoutSection}>
          <SettingsItem
            icon="log-out"
            label="Çıkış Yap"
            onPress={handleLogout}
            danger
            showArrow={false}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.caption,
    textTransform: "uppercase",
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  sectionContent: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  settingsLabel: {
    ...Typography.body,
    flex: 1,
  },
  logoutSection: {
    marginTop: Spacing.lg,
  },
});
