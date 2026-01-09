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
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";

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
    title: "Araç Takası",
    description: "Aracınızı satmadan, istediğiniz araçla takas yapın. Nakit ödeme yapmadan hayalinizdeki araca kavuşun.",
  },
  {
    id: "2",
    image: onboarding2,
    title: "Eşleşme Sistemi",
    description: "Tinder tarzı kaydırma ile size uygun araçları keşfedin. Sağa kaydırın, beğenin ve eşleşin!",
  },
  {
    id: "3",
    image: onboarding3,
    title: "Anında Mesajlaşma",
    description: "Eşleştiğiniz araç sahipleriyle güvenli bir şekilde mesajlaşın ve takas detaylarını konuşun.",
  },
  {
    id: "4",
    image: onboarding4,
    title: "Güvenli Takas",
    description: "Telefon doğrulaması ve güven puanı sistemi ile güvenle takas yapın. Türkiye'nin ilk araç takas platformu!",
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

  const handleComplete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onComplete();
  };

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
          <ThemedText style={styles.title}>{item.title}</ThemedText>
          <ThemedText style={styles.description}>{item.description}</ThemedText>
        </View>
      </View>
    );
  };

  const isLastSlide = currentIndex === slides.length - 1;

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
      />
      
      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleNext}
        >
          <ThemedText style={styles.buttonText}>
            {isLastSlide ? "Başlayalım" : "Devam"}
          </ThemedText>
        </Pressable>
      </View>
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
    flex: 1,
  },
  imageContainer: {
    flex: 0.6,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    flex: 0.4,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    backgroundColor: "#000000",
  },
  dotsContainer: {
    flexDirection: "row",
    marginBottom: Spacing.lg,
  },
  dot: {
    height: 4,
    borderRadius: 2,
    marginRight: Spacing.xs,
  },
  dotActive: {
    width: 24,
    backgroundColor: "#FFFFFF",
  },
  dotInactive: {
    width: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: Spacing.md,
    lineHeight: 40,
  },
  description: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 24,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xl,
    backgroundColor: "#000000",
  },
  button: {
    backgroundColor: "#FFFFFF",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
});
