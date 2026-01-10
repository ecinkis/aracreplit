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
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  { icon: "heart", title: "Sınırsız Beğeni", description: "Günlük beğeni limiti olmadan istediğiniz kadar kaydırın" },
  { icon: "star", title: "Öne Çıkan İlanlar", description: "İlanlarınız arama sonuçlarında üstte görünsün" },
  { icon: "zap", title: "Öncelikli Eşleşme", description: "Eşleşmeleriniz daha hızlı gerçekleşsin" },
  { icon: "eye", title: "Görüntüleyenleri Gör", description: "İlanlarınızı kimlerin incelediğini öğrenin" },
  { icon: "award", title: "Premium Rozet", description: "Profilinizde özel premium rozeti" },
  { icon: "shield", title: "Öncelikli Destek", description: "7/24 öncelikli müşteri desteği" },
];

const PLANS = [
  { id: "monthly", title: "Aylık", price: "149", period: "ay", popular: false },
  { id: "quarterly", title: "3 Aylık", price: "349", period: "3 ay", popular: true, save: "22%" },
  { id: "yearly", title: "Yıllık", price: "999", period: "yıl", popular: false, save: "44%" },
];

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

function PlanCard({
  plan,
  selected,
  onSelect,
}: {
  plan: typeof PLANS[0];
  selected: boolean;
  onSelect: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      style={[
        styles.planCard,
        { backgroundColor: theme.backgroundSecondary },
        selected && styles.planCardSelected,
      ]}
      onPress={() => {
        Haptics.selectionAsync();
        onSelect();
      }}
    >
      {plan.popular && (
        <View style={styles.popularBadge}>
          <ThemedText style={styles.popularBadgeText}>Popüler</ThemedText>
        </View>
      )}
      <ThemedText style={styles.planTitle}>{plan.title}</ThemedText>
      <View style={styles.priceRow}>
        <ThemedText style={styles.planPrice}>{plan.price}</ThemedText>
        <ThemedText style={[styles.planCurrency, { color: theme.textSecondary }]}>TL</ThemedText>
      </View>
      <ThemedText style={[styles.planPeriod, { color: theme.textSecondary }]}>/{plan.period}</ThemedText>
      {plan.save && (
        <View style={styles.saveBadge}>
          <ThemedText style={styles.saveBadgeText}>{plan.save} tasarruf</ThemedText>
        </View>
      )}
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
    </Pressable>
  );
}

export default function PremiumScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = React.useState("quarterly");

  const subscribeMutation = useMutation({
    mutationFn: async (planId: string) => {
      const days = planId === "monthly" ? 30 : planId === "quarterly" ? 90 : 365;
      return apiRequest(`/api/users/${user?.id}/premium`, {
        method: "POST",
        body: JSON.stringify({ days }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user?.id] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Tebrikler!",
        "Premium üyeliğiniz aktif edildi. Tüm avantajlardan yararlanmaya başlayabilirsiniz.",
        [{ text: "Harika", onPress: () => navigation.goBack() }]
      );
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Hata", "Bir sorun oluştu. Lütfen tekrar deneyin.");
    },
  });

  const handleSubscribe = () => {
    Alert.alert(
      "Premium Üyelik",
      "Bu bir demo uygulamasıdır. Gerçek ödeme sistemi entegre edilmemiştir. Premium üyelik simüle edilsin mi?",
      [
        { text: "İptal", style: "cancel" },
        { text: "Evet, Aktif Et", onPress: () => subscribeMutation.mutate(selectedPlan) },
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
        contentContainerStyle={styles.contentContainer}
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
          <>
            <ThemedText style={styles.sectionTitle}>Plan Seçin</ThemedText>
            <View style={styles.plansContainer}>
              {PLANS.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  selected={selectedPlan === plan.id}
                  onSelect={() => setSelectedPlan(plan.id)}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {!isPremium && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.md }]}>
          <Pressable
            style={({ pressed }) => [
              styles.subscribeButton,
              pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
            ]}
            onPress={handleSubscribe}
            disabled={subscribeMutation.isPending}
          >
            <LinearGradient
              colors={[BrandColors.primaryBlue, "#4A90E2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.subscribeButtonGradient}
            >
              <Feather name="zap" size={20} color="#FFFFFF" />
              <ThemedText style={styles.subscribeButtonText}>
                {subscribeMutation.isPending ? "İşleniyor..." : "Premium'a Yükselt"}
              </ThemedText>
            </LinearGradient>
          </Pressable>
          <ThemedText style={[styles.disclaimer, { color: theme.textSecondary }]}>
            İstediğiniz zaman iptal edebilirsiniz
          </ThemedText>
        </View>
      )}
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
  plansContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  planCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  planCardSelected: {
    borderColor: BrandColors.primaryBlue,
  },
  popularBadge: {
    position: "absolute",
    top: -10,
    backgroundColor: BrandColors.successGreen,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  popularBadgeText: {
    ...Typography.caption,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  planTitle: {
    ...Typography.small,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  planPrice: {
    ...Typography.h2,
    fontWeight: "700",
  },
  planCurrency: {
    ...Typography.body,
    marginLeft: 2,
  },
  planPeriod: {
    ...Typography.caption,
  },
  saveBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xs,
  },
  saveBadgeText: {
    ...Typography.caption,
    color: BrandColors.successGreen,
    fontWeight: "600",
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E5E8EB",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  radioOuterSelected: {
    borderColor: BrandColors.primaryBlue,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BrandColors.primaryBlue,
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  subscribeButton: {
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
