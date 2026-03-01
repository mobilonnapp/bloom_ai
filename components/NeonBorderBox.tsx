import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';

interface NeonBorderBoxProps {
  children: React.ReactNode;
  style?: ViewStyle;
  innerStyle?: ViewStyle;
  borderWidth?: number;
  borderRadius?: number;
  gradientColors?: readonly [string, string, ...string[]];
  glowColor?: string;
  glowIntensity?: number;
}

export default function NeonBorderBox({
  children,
  style,
  innerStyle,
  borderWidth = 2,
  borderRadius = 20,
  gradientColors = Colors.gradientBorderPurplePink,
  glowColor = Colors.purple,
  glowIntensity = 0.4,
}: NeonBorderBoxProps) {
  return (
    <View
      style={[
        styles.shadow,
        {
          borderRadius,
          shadowColor: glowColor,
          shadowOpacity: glowIntensity,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { padding: borderWidth, borderRadius }]}
      >
        <View
          style={[
            styles.inner,
            { borderRadius: borderRadius - borderWidth },
            innerStyle,
          ]}
        >
          {children}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 16,
    elevation: 10,
  },
  gradient: {
    // padding applied dynamically
  },
  inner: {
    backgroundColor: Colors.card,
    overflow: 'hidden',
  },
});
