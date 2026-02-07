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
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { TakasLogo } from "@/components/TakasLogo";
import { Spacing, BorderRadius } from "@/constants/theme";

import onboarding1 from "../assets/images/onboarding-1.png";
import onboarding2 from "../assets/images/onboarding-2.png";
import onboarding3 from "../assets/images/onboarding-3.png";
import onboarding4 from "../assets/images/onboarding-4.png";

const { width, height } = Dimensions.get("window");

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
      "Sana uygun araclari kesfet. Saga kaydir, begen ve eslesen arac sahipleriyle iletisime gec!",
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
        <Image
          source={item.image}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.85)"]}
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.overlay}>
          <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
            <TakasLogo size={28} color="#FFFFFF" />
            {!isLastSlide ? (
              <Pressable onPress={handleSkip} hitSlop={12}>
                <ThemedText style={styles.skipText}>Atla</ThemedText>
              </Pressable>
            ) : (
              <View style={{ width: 40 }} />
            )}
          </View>

          <View style={styles.contentArea}>
            <ThemedText style={styles.title}>{item.title}</ThemedText>
            <ThemedText style={styles.description}>{item.description}</ThemedText>

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
                  <Feather name="arrow-right" size={20} color="#000000" />
                </View>
              )}
            </Pressable>

            <View style={{ height: insets.bottom + Spacing.md }} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
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
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  slide: {
    width,
    height,
    overflow: "hidden",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  skipText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
  },
  contentArea: {
    paddingHorizontal: Spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: Spacing.sm,
    lineHeight: 40,
  },
  description: {
    fontSize: 16,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  dotsContainer: {
    flexDirection: "row",
    marginBottom: Spacing.lg,
  },
  dot: {
    height: 4,
    borderRadius: 2,
    marginRight: 6,
  },
  dotActive: {
    width: 24,
    backgroundColor: "#FFFFFF",
  },
  dotInactive: {
    width: 8,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  button: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
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
    fontWeight: "700",
    color: "#000000",
  },
});
