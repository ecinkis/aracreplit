import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  Pressable,
  Image,
  ViewToken,
  ImageSourcePropType,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { TakasLogo } from "@/components/TakasLogo";
import { Spacing, BorderRadius } from "@/constants/theme";

import onboarding1 from "../assets/images/onboarding-1.png";
import onboarding2 from "../assets/images/onboarding-2.png";
import onboarding3 from "../assets/images/onboarding-3.png";
import onboarding4 from "../assets/images/onboarding-4.png";

const { width } = Dimensions.get("window");

interface OnboardingSlide {
  id: string;
  image: ImageSourcePropType;
  title: string;
  description: string;
}

const slides: OnboardingSlide[] = [
  {
    id: "1",
    image: onboarding1,
    title: "Aracini Takas Et",
    description:
      "Aracini satmadan, istedigin aracla takas yap. Nakit odeme yapmadan hayalindeki araca kavus.",
  },
  {
    id: "2",
    image: onboarding2,
    title: "Kaydir ve Esles",
    description:
      "Sana uygun araclari kesfedin. Saga kaydir, begen ve eslesen arac sahipleriyle iletisime gec!",
  },
  {
    id: "3",
    image: onboarding3,
    title: "Aninda Mesajlas",
    description:
      "Eslestignin arac sahipleriyle guvenli bir sekilde mesajlas ve takas detaylarini konus.",
  },
  {
    id: "4",
    image: onboarding4,
    title: "Guvenli Takas",
    description:
      "Telefon dogrulamasi ve guven puani sistemi ile guvenle takas yap. Turkiye'nin ilk arac takas platformu!",
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

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

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleComplete();
  };

  const handleComplete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onComplete();
  };

  const isLastSlide = currentIndex === slides.length - 1;

  const renderSlide = ({ item }: { item: OnboardingSlide }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.imageContainer}>
          <Image
            source={item.image}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        <View style={styles.contentContainer}>
          <ThemedText style={styles.title}>{item.title}</ThemedText>
          <ThemedText style={styles.description}>{item.description}</ThemedText>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TakasLogo size={28} color="#000000" />
        {!isLastSlide ? (
          <Pressable onPress={handleSkip} hitSlop={12}>
            <ThemedText style={styles.skipText}>Atla</ThemedText>
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
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
        scrollEventThrottle={16}
        style={styles.flatList}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleNext}
        >
          {isLastSlide ? (
            <ThemedText style={styles.buttonText}>Basla</ThemedText>
          ) : (
            <View style={styles.buttonContent}>
              <ThemedText style={styles.buttonText}>Devam</ThemedText>
              <Feather name="arrow-right" size={20} color="#FFFFFF" />
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  skipText: {
    fontSize: 16,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  flatList: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
  },
  imageContainer: {
    flex: 0.55,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    flex: 0.45,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
    marginBottom: Spacing.md,
    lineHeight: 36,
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  dot: {
    height: 4,
    borderRadius: 2,
    marginHorizontal: 3,
  },
  dotActive: {
    width: 24,
    backgroundColor: "#000000",
  },
  dotInactive: {
    width: 8,
    backgroundColor: "#D1D5DB",
  },
  button: {
    backgroundColor: "#000000",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
