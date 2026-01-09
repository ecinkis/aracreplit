import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  Pressable,
  Image,
  ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { BrandColors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import appIcon from "../assets/images/icon.png";

const { width, height } = Dimensions.get("window");

interface OnboardingSlide {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  color: string;
}

const slides: OnboardingSlide[] = [
  {
    id: "1",
    icon: "refresh-cw",
    title: "Araç Takası",
    description: "Aracınızı satmadan, istediğiniz araçla takas yapın. Nakit ödeme yapmadan hayalinizdeki araca kavuşun.",
    color: BrandColors.primaryOrange,
  },
  {
    id: "2",
    icon: "heart",
    title: "Eşleşme Sistemi",
    description: "Tinder tarzı kaydırma ile size uygun araçları keşfedin. Sağa kaydırın, beğenin ve eşleşin!",
    color: BrandColors.skyBlue,
  },
  {
    id: "3",
    icon: "message-circle",
    title: "Anında Mesajlaşma",
    description: "Eşleştiğiniz araç sahipleriyle güvenli bir şekilde mesajlaşın ve takas detaylarını konuşun.",
    color: BrandColors.successGreen,
  },
  {
    id: "4",
    icon: "shield",
    title: "Güvenli Takas",
    description: "Telefon doğrulaması ve güven puanı sistemi ile güvenle takas yapın. Türkiye'nin ilk araç takas platformu!",
    color: BrandColors.warning,
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

  const handleViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onComplete();
  };

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.slideContent}>
          <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
            <Feather name={item.icon} size={48} color="#FFFFFF" />
          </View>
          <ThemedText style={styles.slideTitle}>{item.title}</ThemedText>
          <ThemedText style={styles.slideDescription}>{item.description}</ThemedText>
        </View>
      </View>
    );
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => {
          const isActive = index === currentIndex;
          return (
            <View
              key={index}
              style={[
                styles.dot,
                isActive ? styles.dotActive : styles.dotInactive,
              ]}
            />
          );
        })}
      </View>
    );
  };

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <LinearGradient
      colors={[BrandColors.deepNavy, "#0D1520"]}
      style={styles.container}
    >
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <View style={styles.logoRow}>
          <Image source={appIcon} style={styles.logo} resizeMode="contain" />
          <ThemedText style={styles.appName}>TakasApp</ThemedText>
        </View>
        {!isLastSlide && (
          <Pressable onPress={handleComplete} style={styles.skipButton}>
            <ThemedText style={styles.skipText}>Atla</ThemedText>
          </Pressable>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScroll={(event) => {
          scrollX.value = event.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={16}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        {renderDots()}
        
        <Pressable
          style={({ pressed }) => [
            styles.nextButton,
            isLastSlide && styles.startButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleNext}
        >
          {isLastSlide ? (
            <ThemedText style={styles.startButtonText}>Başlayalım</ThemedText>
          ) : (
            <>
              <ThemedText style={styles.nextButtonText}>Devam</ThemedText>
              <Feather name="arrow-right" size={20} color="#FFFFFF" />
            </>
          )}
        </Pressable>
      </View>
    </LinearGradient>
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
    paddingHorizontal: Spacing.lg,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: Spacing.sm,
  },
  appName: {
    ...Typography.h2,
    color: "#FFFFFF",
  },
  skipButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  skipText: {
    ...Typography.body,
    color: "rgba(255,255,255,0.6)",
  },
  slide: {
    width,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  slideContent: {
    alignItems: "center",
    maxWidth: 320,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  slideTitle: {
    ...Typography.h1,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  slideDescription: {
    ...Typography.body,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  dotActive: {
    backgroundColor: BrandColors.primaryOrange,
    width: 24,
  },
  dotInactive: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    minWidth: 160,
  },
  startButton: {
    backgroundColor: BrandColors.primaryOrange,
    minWidth: 200,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  nextButtonText: {
    ...Typography.button,
    color: "#FFFFFF",
    marginRight: Spacing.sm,
  },
  startButtonText: {
    ...Typography.button,
    color: "#FFFFFF",
  },
});
