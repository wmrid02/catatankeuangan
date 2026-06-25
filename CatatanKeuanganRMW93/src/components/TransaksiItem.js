// src/components/TransaksiItem.js
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { COLORS, RADIUS, SHADOW } from '../theme';
import { formatRupiah, formatTanggalShort } from '../utils/format';

export default function TransaksiItem({ item, type, onDelete }) {
  const isMasuk = type === 'masuk';

  const confirmDelete = () => {
    Alert.alert(
      'Hapus Transaksi',
      'Apakah Anda yakin ingin menghapus transaksi ini?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: () => onDelete(item.id) },
      ],
    );
  };

  return (
    <View style={[styles.card, SHADOW.small]}>
      <View style={[styles.iconBox, { backgroundColor: isMasuk ? COLORS.masukLight : COLORS.keluarLight }]}>
        <Text style={[styles.iconText, { color: isMasuk ? COLORS.masuk : COLORS.keluar }]}>
          {isMasuk ? '↓' : '↑'}
        </Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.label} numberOfLines={1}>
          {isMasuk ? item.keterangan : item.jenis}
        </Text>
        {!isMasuk && item.keterangan ? (
          <Text style={styles.sub} numberOfLines={1}>{item.keterangan}</Text>
        ) : null}
        <Text style={styles.tgl}>{formatTanggalShort(item.tanggal)}</Text>
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, { color: isMasuk ? COLORS.masuk : COLORS.keluar }]}>
          {isMasuk ? '+' : '-'}{formatRupiah(item.jumlah)}
        </Text>
        <TouchableOpacity onPress={confirmDelete} style={styles.deleteBtn} hitSlop={{top:8,bottom:8,left:8,right:8}}>
          <Text style={styles.deleteText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 12,
    marginBottom: 8,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  sub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  tgl: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    fontSize: 13,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 2,
  },
  deleteText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
});
