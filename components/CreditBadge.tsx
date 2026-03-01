import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface CreditBadgeProps {
  amount: number;
  style?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  onPress?: () => void;
}

const sizeMap = {
  sm: { fontSize: 12, iconSize: 12, paddingH: 8, paddingV: 4 },
  md: { fontSize: 14, iconSize: 14, paddingH: 10, paddingV: 5 },
  lg: { fontSize: 16, iconSize: 16, paddingH: 12, paddingV: 6 },
};

export default function CreditBadge({
  amount,
  style,
  size = 'md',
  showIcon = true,
  onPress,
}: CreditBadgeProps) {
  const sz = sizeMap[size];

  const inner = (
    <>
      {showIcon && (
        <Ionicons
          name="diamond"
          size={sz.iconSize}
          color={Colors.purple}
          style={styles.icon}
        />
      )}
      <Text style={[styles.text, { fontSize: sz.fontSize }]}>
        {amount.toLocaleString()}
      </Text>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
        style={[
          styles.container,
          { paddingHorizontal: sz.paddingH, paddingVertical: sz.paddingV },
          style,
        ]}
      >
        {inner}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { paddingHorizontal: sz.paddingH, paddingVertical: sz.paddingV },
        style,
      ]}
    >
      {inner}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    gap: 4,
  },
  icon: {},
  text: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
});
