// src/components/SummaryCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SHADOW } from '../theme';
import { formatRupiah } from '../utils/format';

export default function SummaryCard({ label, value, color, bgColor, fullWidth }) {
  return (
    <View style={[
      styles.card,
      SHADOW.small,
      fullWidth && styles.fullWidth,
      bgColor && { backgroundColor: bgColor },
    ]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: color || COLORS.text }]}>
        {formatRupiah(value)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 14,
  },
  fullWidth: { flex: undefined },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
  },
});
