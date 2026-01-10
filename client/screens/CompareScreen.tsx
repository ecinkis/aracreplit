import React, { useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "expo-image";

import { ThemedText } from "@/components/ThemedText";
import { BrandColors, Spacing, BorderRadius } from "@/constants/theme";
import type { Listing } from "@shared/schema";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function CompareRow({ 
  label, 
  value1, 
  value2,
  highlight = false,
}: { 
  label: string; 
  value1: string; 
  value2: string;
  highlight?: boolean;
}) {
  return (
    <View style={[styles.compareRow, highlight && styles.compareRowHighlight]}>
      <ThemedText style={styles.compareLabel}>{label}</ThemedText>
      <View style={styles.compareValues}>
        <ThemedText style={styles.compareValue}>{value1}</ThemedText>
        <View style={styles.compareDivider} />
        <ThemedText style={styles.compareValue}>{value2}</ThemedText>
      </View>
    </View>
  );
}

function VehicleSelector({
  listing,
  onSelect,
  position,
}: {
  listing: Listing | null;
  onSelect: () => void;
  position: "left" | "right";
}) {
  if (!listing) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.selectorEmpty,
          pressed && { opacity: 0.7 },
        ]}
        onPress={onSelect}
      >
        <View style={styles.selectorIcon}>
          <Feather name="plus" size={32} color={BrandColors.primaryBlue} />
        </View>
        <ThemedText style={styles.selectorText}>
          {position === "left" ? "1. Arac Sec" : "2. Arac Sec"}
        </ThemedText>
      </Pressable>
    );
  }

  const photoUrl = listing.photos && listing.photos.length > 0 
    ? listing.photos[0] 
    : null;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.selectorFilled,
        pressed && { opacity: 0.8 },
      ]}
      onPress={onSelect}
    >
      {photoUrl ? (
        <Image source={{ uri: photoUrl }} style={styles.selectorImage} />
      ) : (
        <View style={[styles.selectorImage, styles.selectorImagePlaceholder]}>
          <Feather name="image" size={24} color="#9CA3AF" />
        </View>
      )}
      <ThemedText style={styles.selectorTitle} numberOfLines={1}>
        {listing.brand} {listing.model}
      </ThemedText>
      <ThemedText style={styles.selectorSubtitle}>
        {listing.year} - {listing.km?.toLocaleString("tr-TR")} km
      </ThemedText>
      <Pressable
        style={styles.changeButton}
        onPress={onSelect}
      >
        <ThemedText style={styles.changeButtonText}>Degistir</ThemedText>
      </Pressable>
    </Pressable>
  );
}

function ListingPickerModal({
  visible,
  onClose,
  onSelect,
  excludeId,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (listing: Listing) => void;
  excludeId?: string;
}) {
  const { data: listings, isLoading } = useQuery<Listing[]>({
    queryKey: ["/api/listings"],
  });

  const filteredListings = listings?.filter(l => l.id !== excludeId) || [];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <ThemedText style={styles.modalTitle}>Arac Sec</ThemedText>
          <Pressable
            style={styles.modalClose}
            onPress={onClose}
          >
            <Feather name="x" size={24} color="#000000" />
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BrandColors.primaryBlue} />
          </View>
        ) : filteredListings.length > 0 ? (
          <FlatList
            data={filteredListings}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const photoUrl = item.photos && item.photos.length > 0 
                ? item.photos[0] 
                : null;
              
              return (
                <Pressable
                  style={({ pressed }) => [
                    styles.listingItem,
                    pressed && { backgroundColor: "#F3F4F6" },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onSelect(item);
                    onClose();
                  }}
                >
                  {photoUrl ? (
                    <Image source={{ uri: photoUrl }} style={styles.listingItemImage} />
                  ) : (
                    <View style={[styles.listingItemImage, styles.listingItemImagePlaceholder]}>
                      <Feather name="image" size={20} color="#9CA3AF" />
                    </View>
                  )}
                  <View style={styles.listingItemContent}>
                    <ThemedText style={styles.listingItemTitle}>
                      {item.brand} {item.model}
                    </ThemedText>
                    <ThemedText style={styles.listingItemSubtitle}>
                      {item.year} - {item.km?.toLocaleString("tr-TR")} km - {item.fuelType}
                    </ThemedText>
                    <ThemedText style={styles.listingItemCity}>
                      {item.city}
                    </ThemedText>
                  </View>
                  <Feather name="chevron-right" size={20} color="#9CA3AF" />
                </Pressable>
              );
            }}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={48} color="#D1D5DB" />
            <ThemedText style={styles.emptyText}>
              Karsilastirilacak ilan bulunamadi
            </ThemedText>
          </View>
        )}
      </View>
    </Modal>
  );
}

export default function CompareScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const [vehicle1, setVehicle1] = useState<Listing | null>(null);
  const [vehicle2, setVehicle2] = useState<Listing | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectingPosition, setSelectingPosition] = useState<"left" | "right">("left");

  const openPicker = (position: "left" | "right") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectingPosition(position);
    setPickerVisible(true);
  };

  const handleSelect = (listing: Listing) => {
    if (selectingPosition === "left") {
      setVehicle1(listing);
    } else {
      setVehicle2(listing);
    }
  };

  const clearComparison = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVehicle1(null);
    setVehicle2(null);
  };

  const bothSelected = vehicle1 && vehicle2;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
        >
          <Feather name="arrow-left" size={24} color="#000000" />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Arac Karsilastir</ThemedText>
        {bothSelected && (
          <Pressable
            style={styles.clearButton}
            onPress={clearComparison}
          >
            <ThemedText style={styles.clearButtonText}>Temizle</ThemedText>
          </Pressable>
        )}
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.selectors}>
          <VehicleSelector
            listing={vehicle1}
            onSelect={() => openPicker("left")}
            position="left"
          />
          <View style={styles.vsContainer}>
            <ThemedText style={styles.vsText}>VS</ThemedText>
          </View>
          <VehicleSelector
            listing={vehicle2}
            onSelect={() => openPicker("right")}
            position="right"
          />
        </View>

        {bothSelected ? (
          <View style={styles.comparisonContainer}>
            <ThemedText style={styles.comparisonTitle}>Karsilastirma</ThemedText>
            
            <CompareRow 
              label="Marka" 
              value1={vehicle1.brand} 
              value2={vehicle2.brand}
            />
            <CompareRow 
              label="Model" 
              value1={vehicle1.model} 
              value2={vehicle2.model}
            />
            <CompareRow 
              label="Yil" 
              value1={vehicle1.year.toString()} 
              value2={vehicle2.year.toString()}
              highlight
            />
            <CompareRow 
              label="Kilometre" 
              value1={`${vehicle1.km?.toLocaleString("tr-TR")} km`} 
              value2={`${vehicle2.km?.toLocaleString("tr-TR")} km`}
              highlight
            />
            <CompareRow 
              label="Yakit Tipi" 
              value1={vehicle1.fuelType} 
              value2={vehicle2.fuelType}
            />
            <CompareRow 
              label="Vites" 
              value1={vehicle1.transmission} 
              value2={vehicle2.transmission}
            />
            <CompareRow 
              label="Sehir" 
              value1={vehicle1.city} 
              value2={vehicle2.city}
            />
            <CompareRow 
              label="Takas Durumu" 
              value1={vehicle1.swapActive ? "Aktif" : "Pasif"} 
              value2={vehicle2.swapActive ? "Aktif" : "Pasif"}
            />
            <CompareRow 
              label="Nakit Fark" 
              value1={vehicle1.acceptsCashDiff ? "Kabul Ediyor" : "Kabul Etmiyor"} 
              value2={vehicle2.acceptsCashDiff ? "Kabul Ediyor" : "Kabul Etmiyor"}
            />

            <View style={styles.swapCalculator}>
              <View style={styles.calculatorHeader}>
                <Feather name="dollar-sign" size={20} color={BrandColors.primaryBlue} />
                <ThemedText style={styles.calculatorTitle}>Takas Değer Hesaplayıcı</ThemedText>
              </View>

              <View style={styles.valueRow}>
                <View style={styles.valueCard}>
                  <ThemedText style={styles.valueLabel}>{vehicle1.brand} {vehicle1.model}</ThemedText>
                  <ThemedText style={styles.valueAmount}>
                    {vehicle1.estimatedValue 
                      ? `${vehicle1.estimatedValue.toLocaleString("tr-TR")} TL` 
                      : "Değer Belirtilmemiş"}
                  </ThemedText>
                </View>
                <View style={styles.valueCard}>
                  <ThemedText style={styles.valueLabel}>{vehicle2.brand} {vehicle2.model}</ThemedText>
                  <ThemedText style={styles.valueAmount}>
                    {vehicle2.estimatedValue 
                      ? `${vehicle2.estimatedValue.toLocaleString("tr-TR")} TL` 
                      : "Değer Belirtilmemiş"}
                  </ThemedText>
                </View>
              </View>

              {vehicle1.estimatedValue && vehicle2.estimatedValue ? (
                <View style={styles.differenceContainer}>
                  <View style={styles.differenceHeader}>
                    <Feather name="repeat" size={16} color="#FFFFFF" />
                    <ThemedText style={styles.differenceTitle}>Takas Farkı</ThemedText>
                  </View>
                  
                  {vehicle1.estimatedValue === vehicle2.estimatedValue ? (
                    <View style={styles.equalValueBadge}>
                      <Feather name="check-circle" size={20} color={BrandColors.successGreen} />
                      <ThemedText style={styles.equalValueText}>
                        Araçlar Eşit Değerde!
                      </ThemedText>
                    </View>
                  ) : (
                    <>
                      <ThemedText style={styles.differenceAmount}>
                        {Math.abs(vehicle1.estimatedValue - vehicle2.estimatedValue).toLocaleString("tr-TR")} TL
                      </ThemedText>
                      <View style={styles.differenceDirection}>
                        <Feather 
                          name="arrow-right" 
                          size={16} 
                          color={vehicle1.estimatedValue > vehicle2.estimatedValue ? BrandColors.successGreen : BrandColors.alertRed} 
                        />
                        <ThemedText style={styles.differenceDescription}>
                          {vehicle1.estimatedValue > vehicle2.estimatedValue 
                            ? `${vehicle2.brand} ${vehicle2.model} sahibi ${Math.abs(vehicle1.estimatedValue - vehicle2.estimatedValue).toLocaleString("tr-TR")} TL fark ödemeli`
                            : `${vehicle1.brand} ${vehicle1.model} sahibi ${Math.abs(vehicle1.estimatedValue - vehicle2.estimatedValue).toLocaleString("tr-TR")} TL fark ödemeli`
                          }
                        </ThemedText>
                      </View>
                    </>
                  )}

                  <View style={styles.compatibilitySection}>
                    <ThemedText style={styles.compatibilityLabel}>Takas Uyumu</ThemedText>
                    {(() => {
                      const diff = Math.abs(vehicle1.estimatedValue - vehicle2.estimatedValue);
                      const maxValue = Math.max(vehicle1.estimatedValue, vehicle2.estimatedValue);
                      const diffPercentage = (diff / maxValue) * 100;
                      const compatibility = 100 - Math.min(diffPercentage, 100);
                      
                      return (
                        <>
                          <View style={styles.compatibilityBar}>
                            <View 
                              style={[
                                styles.compatibilityFill, 
                                { 
                                  width: `${compatibility}%`,
                                  backgroundColor: compatibility > 70 
                                    ? BrandColors.successGreen 
                                    : compatibility > 40 
                                      ? "#F59E0B" 
                                      : BrandColors.alertRed
                                }
                              ]} 
                            />
                          </View>
                          <ThemedText style={[
                            styles.compatibilityPercent,
                            { 
                              color: compatibility > 70 
                                ? BrandColors.successGreen 
                                : compatibility > 40 
                                  ? "#F59E0B" 
                                  : BrandColors.alertRed 
                            }
                          ]}>
                            %{Math.round(compatibility)} Uyumlu
                          </ThemedText>
                        </>
                      );
                    })()}
                  </View>
                </View>
              ) : (
                <View style={styles.noValueWarning}>
                  <Feather name="alert-circle" size={20} color="#F59E0B" />
                  <ThemedText style={styles.noValueText}>
                    Her iki araç için de tahmini değer girilmeli
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.instructionContainer}>
            <View style={styles.instructionIcon}>
              <Feather name="columns" size={48} color="#D1D5DB" />
            </View>
            <ThemedText style={styles.instructionTitle}>
              Arac Karsilastir
            </ThemedText>
            <ThemedText style={styles.instructionText}>
              Iki arac secin ve ozelliklerini yan yana karsilastirin
            </ThemedText>
          </View>
        )}
      </ScrollView>

      <ListingPickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={handleSelect}
        excludeId={selectingPosition === "left" ? vehicle2?.id : vehicle1?.id}
      />
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
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
  },
  clearButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  clearButtonText: {
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "500",
  },
  content: {
    padding: Spacing.md,
  },
  selectors: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  selectorEmpty: {
    flex: 1,
    height: 180,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: BrandColors.primaryBlue,
    backgroundColor: "#EBF4FF",
    justifyContent: "center",
    alignItems: "center",
  },
  selectorIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  selectorText: {
    fontSize: 14,
    fontWeight: "500",
    color: BrandColors.primaryBlue,
  },
  selectorFilled: {
    flex: 1,
    borderRadius: BorderRadius.md,
    backgroundColor: "#F9FAFB",
    overflow: "hidden",
  },
  selectorImage: {
    width: "100%",
    height: 100,
  },
  selectorImagePlaceholder: {
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  selectorTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  selectorSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    paddingHorizontal: Spacing.sm,
    marginTop: 2,
  },
  changeButton: {
    margin: Spacing.sm,
    paddingVertical: Spacing.xs,
    alignItems: "center",
    backgroundColor: BrandColors.primaryBlue + "10",
    borderRadius: BorderRadius.sm,
  },
  changeButtonText: {
    fontSize: 12,
    color: BrandColors.primaryBlue,
    fontWeight: "500",
  },
  vsContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: Spacing.sm,
  },
  vsText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },
  comparisonContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: Spacing.md,
  },
  compareRow: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  compareRowHighlight: {
    backgroundColor: "#EBF4FF",
    marginHorizontal: -Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  compareLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: Spacing.xs,
  },
  compareValues: {
    flexDirection: "row",
    alignItems: "center",
  },
  compareValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    textAlign: "center",
  },
  compareDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#E5E7EB",
  },
  instructionContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xl * 2,
  },
  instructionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: Spacing.sm,
  },
  instructionText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  modalClose: {
    padding: Spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingVertical: Spacing.sm,
  },
  listingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  listingItemImage: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.sm,
  },
  listingItemImagePlaceholder: {
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  listingItemContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  listingItemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  listingItemSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  listingItemCity: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    color: "#9CA3AF",
    marginTop: Spacing.md,
  },
  swapCalculator: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  calculatorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  calculatorTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  valueRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  valueCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  valueLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  valueAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  differenceContainer: {
    backgroundColor: BrandColors.primaryBlue,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  differenceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  differenceTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  differenceAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  differenceDirection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  differenceDescription: {
    fontSize: 12,
    color: "#FFFFFF",
    flex: 1,
  },
  equalValueBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  equalValueText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  compatibilitySection: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    alignItems: "center",
  },
  compatibilityLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginBottom: Spacing.sm,
  },
  compatibilityBar: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: Spacing.sm,
  },
  compatibilityFill: {
    height: "100%",
    borderRadius: 4,
  },
  compatibilityPercent: {
    fontSize: 18,
    fontWeight: "700",
  },
  noValueWarning: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: "#FEF3C7",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  noValueText: {
    fontSize: 13,
    color: "#92400E",
  },
});
