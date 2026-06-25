// src/components/MonthPicker.js
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, FlatList,
} from 'react-native';
import { COLORS, RADIUS, SHADOW } from '../theme';
import { yearMonthLabel } from '../utils/format';

export default function MonthPicker({ value, options, onChange }) {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <TouchableOpacity style={[styles.btn, SHADOW.small]} onPress={() => setVisible(true)}>
        <Text style={styles.label}>{yearMonthLabel(value)}</Text>
        <Text style={styles.arrow}>▾</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setVisible(false)}>
          <View style={styles.sheet}>
            <Text style={styles.title}>Pilih Bulan</Text>
            <FlatList
              data={options}
              keyExtractor={i => i}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.option, item === value && styles.optionActive]}
                  onPress={() => { onChange(item); setVisible(false); }}>
                  <Text style={[styles.optionText, item === value && styles.optionTextActive]}>
                    {yearMonthLabel(item)}
                  </Text>
                  {item === value && <Text style={styles.check}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 6,
  },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  arrow: { fontSize: 11, color: COLORS.primary },
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: 20,
    maxHeight: '60%',
  },
  title: {
    fontSize: 16, fontWeight: '700', color: COLORS.text,
    marginBottom: 16, textAlign: 'center',
  },
  option: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 13, paddingHorizontal: 6,
    borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  optionActive: { backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.sm },
  optionText: { fontSize: 15, color: COLORS.text },
  optionTextActive: { color: COLORS.primary, fontWeight: '700' },
  check: { color: COLORS.primary, fontWeight: '700', fontSize: 16 },
});
