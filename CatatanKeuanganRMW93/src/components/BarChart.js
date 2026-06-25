// src/components/BarChart.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';
import { formatRupiah } from '../utils/format';

export default function BarChart({ data, color }) {
  const maxVal = Math.max(...data.map(d => d.value), 1);

  return (
    <View style={styles.container}>
      {data.map((d, i) => (
        <View key={i} style={styles.row}>
          <Text style={styles.lbl} numberOfLines={1}>{d.label}</Text>
          <View style={styles.barWrap}>
            <View
              style={[
                styles.bar,
                { width: `${Math.round((d.value / maxVal) * 100)}%`, backgroundColor: color },
              ]}
            />
          </View>
          <Text style={styles.val}>
            {d.value > 0 ? formatRupiah(d.value) : '–'}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  lbl: { width: 72, fontSize: 12, color: COLORS.textSecondary },
  barWrap: {
    flex: 1, height: 10, backgroundColor: '#EEEEEE',
    borderRadius: 5, overflow: 'hidden',
  },
  bar: { height: '100%', borderRadius: 5 },
  val: { width: 90, fontSize: 11, color: COLORS.textSecondary, textAlign: 'right' },
});
