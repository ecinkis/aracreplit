import React from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, Typography, BrandColors } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";

const PREMIUM_FEATURES = [
  { icon: "file-text", title: "Aylık 5 İlan Hakkı", description: "Bireysel üye olarak aylık 5 adet ilan yayınlayabilirsiniz" },
  { icon: "heart", title: "Sınırsız Beğeni", description: "Günlük beğeni limiti olmadan istediğiniz kadar kaydırın" },
  { icon: "star", title: "Öne Çıkan İlanlar", description: "İlanlarınız arama sonuçlarında üstte görünsün" },
  { icon: "zap", title: "Öncelikli Eşleşme", description: "Eşleşmeleriniz daha hızlı gerçekleşsin" },
  { icon: "eye", title: "Görüntüleyenleri Gör", description: "İlanlarınızı kimlerin incelediğini öğrenin" },
  { icon: "award", title: "Premium Rozet", description: "Profilinizde özel premium rozeti" },
  { icon: "shield", title: "Öncelikli Destek", description: "7/24 öncelikli müşteri desteği" },
];

const PLAN = { id: "monthly", title: "Aylık Premium", price: "199", period: "ay" };

function FeatureItem({ icon, title, description }: { icon: string; title: string; description: string }) {
  const { theme } = useTheme();
  return (
    <View style={styles.featureItem}>
      <View style={[styles.featureIcon, { backgroundColor: `${BrandColors.primaryBlue}15` }]}>
        <Feather name={icon as any} size={20} color={BrandColors.primaryBlue} />
      </View>
      <View style={styles.featureContent}>
        <ThemedText style={styles.featureTitle}>{title}</ThemedText>
        <ThemedText style={[styles.featureDescription, { color: theme.textSecondary }]}>
          {description}
        </ThemedText>
      </View>
    </View>
  );
}


export default function PremiumScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/applications", {
        method: "POST",
        body: JSON.stringify({
          userId: user?.id,
          type: "premium",
          planType: "monthly",
        }),
      });
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Başvuru Alındı",
        "Premium üyelik başvurunuz incelemeye alındı. Onaylandığında size bildirim gönderilecektir.",
        [{ text: "Tamam", onPress: () => navigation.goBack() }]
      );
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Hata", "Bir sorun oluştu. Lütfen tekrar deneyin.");
    },
  });

  const handleSubscribe = () => {
    Alert.alert(
      "Premium Başvurusu",
      "Aylık 199 TL premium üyelik başvurusu yapmak istiyor musunuz? Başvurunuz onaylandığında ödeme bilgileri için sizinle iletişime geçilecektir.",
      [
        { text: "İptal", style: "cancel" },
        { text: "Başvur", onPress: () => subscribeMutation.mutate() },
      ]
    );
  };

  const isPremium = user?.isPremium;

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={() => navigation.goBack()}>
          <Feather name="x" size={24} color={theme.text} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Premium Üyelik</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={[styles.contentContainer, { paddingBottom: isPremium ? insets.bottom + Spacing.xl : Spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[BrandColors.primaryBlue, "#4A90E2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <Feather name="award" size={48} color="#FFFFFF" />
          <ThemedText style={styles.heroTitle}>
            {isPremium ? "Premium Üyesiniz" : "Premium'a Yükselt"}
          </ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            {isPremium
              ? "Tüm premium avantajlarından yararlanıyorsunuz"
              : "Daha fazla eşleşme, daha hızlı takas"}
          </ThemedText>
        </LinearGradient>

        <ThemedText style={styles.sectionTitle}>Premium Avantajları</ThemedText>
        <View style={styles.featuresContainer}>
          {PREMIUM_FEATURES.map((feature, index) => (
            <FeatureItem key={index} {...feature} />
          ))}
        </View>

        {!isPremium && (
          <View style={[styles.priceCard, { backgroundColor: theme.backgroundSecondary }]}>
            <ThemedText style={styles.priceLabel}>Aylık Üyelik</ThemedText>
            <View style={styles.priceRow}>
              <ThemedText style={styles.priceAmount}>199</ThemedText>
              <ThemedText style={[styles.priceCurrency, { color: theme.textSecondary }]}>TL/ay</ThemedText>
            </View>
          </View>
        )}
      </ScrollView>

      {!isPremium ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom : Spacing.lg }]}>
          <Pressable
            style={({ pressed }) => [
              styles.subscribeButton,
              pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
            ]}
            onPress={handleSubscribe}
            disabled={subscribeMutation.isPending}
          >
            <View style={styles.subscribeButtonGradient}>
              <Feather name="zap" size={20} color="#FFFFFF" />
              <ThemedText style={styles.subscribeButtonText}>
                {subscribeMutation.isPending ? "İşleniyor..." : "Premium'a Yükselt"}
              </ThemedText>
            </View>
          </Pressable>
          <ThemedText style={[styles.disclaimer, { color: theme.textSecondary }]}>
            İstediğiniz zaman iptal edebilirsiniz
          </ThemedText>
        </View>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    ...Typography.h3,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  heroCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  heroTitle: {
    ...Typography.h2,
    color: "#FFFFFF",
    marginTop: Spacing.md,
  },
  heroSubtitle: {
    ...Typography.body,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
  },
  featuresContainer: {
    marginBottom: Spacing.xl,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  featureContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  featureTitle: {
    ...Typography.body,
    fontWeight: "600",
  },
  featureDescription: {
    ...Typography.small,
  },
  priceCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  priceLabel: {
    ...Typography.body,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceAmount: {
    fontSize: 48,
    fontWeight: "700",
  },
  priceCurrency: {
    ...Typography.body,
    marginLeft: Spacing.xs,
  },
  footer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  subscribeButton: {
    backgroundColor: "#000000",
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
  },
  subscribeButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  subscribeButtonText: {
    ...Typography.button,
    color: "#FFFFFF",
  },
  disclaimer: {
    ...Typography.caption,
    textAlign: "center",
    marginTop: Spacing.sm,
  },
});
