import React from "react";
import Svg, { Path, G, Defs, LinearGradient, Stop } from "react-native-svg";
import { View, StyleSheet } from "react-native";

interface TakasLogoProps {
  size?: number;
}

export function TakasLogo({ size = 32 }: TakasLogoProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#4A90D9" />
            <Stop offset="100%" stopColor="#357ABD" />
          </LinearGradient>
        </Defs>
        <G>
          <Path
            d="M50 5 C25 5 5 25 5 50 C5 75 25 95 50 95 C75 95 95 75 95 50 C95 25 75 5 50 5"
            fill="url(#blueGradient)"
          />
          <Path
            d="M30 45 L45 45 L45 35 L65 50 L45 65 L45 55 L30 55 Z"
            fill="#FFFFFF"
          />
          <Path
            d="M70 55 L55 55 L55 65 L35 50 L55 35 L55 45 L70 45 Z"
            fill="#FFFFFF"
            opacity="0.7"
          />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
