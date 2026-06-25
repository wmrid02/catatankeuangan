// src/screens/BerandaScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  getMasuk, getKeluar, filterByYearMonth, sumJumlah,
} from '../utils/database';
import {
  formatRupiah, getNowYearMonth, getAllYearMonths, yearMonthLabel,
} from '../utils/format';
import { COLORS, RADIUS, SHADOW } from '../theme';
import TransaksiItem from '../components/TransaksiItem';
import MonthPicker from '../components/MonthPicker';
import { deleteMasuk, deleteKeluar } from '../utils/database';

export default function BerandaScreen() {
  const [masukAll, setMasukAll] = useState([]);
  const [keluarAll, setKeluarAll] = useState([]);
  const [ym, setYm] = useState(getNowYearMonth());
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const [m, k] = await Promise.all([getMasuk(), getKeluar()]);
    setMasukAll(m);
    setKeluarAll(k);
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const masukBulan = filterByYearMonth(masukAll, ym);
  const keluarBulan = filterByYearMonth(keluarAll, ym);
  const totalMasukBulan = sumJumlah(masukBulan);
  const totalKeluarBulan = sumJumlah(keluarBulan);
  const saldoBulan = totalMasukBulan - totalKeluarBulan;

  const totalSaldo = sumJumlah(masukAll) - sumJumlah(keluarAll);

  const allTransaksi = [
    ...masukBulan.map(i => ({ ...i, _type: 'masuk' })),
    ...keluarBulan.map(i => ({ ...i, _type: 'keluar' })),
  ].sort((a, b) => b.tanggal.localeCompare(a.tanggal));

  const ymOptions = getAllYearMonths(masukAll, keluarAll);

  const handleDelete = async (id, type) => {
    if (type === 'masuk') await deleteMasuk(id);
    else await deleteKeluar(id);
    await loadData();
  };

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor={COLORS.primaryDark} barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>Catatan Keuangan rmw93</Text>
          <Text style={styles.subTitle}>Saldo Total Keseluruhan</Text>
          <Text style={styles.saldoTotal}>{formatRupiah(totalSaldo)}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* BULAN PICKER */}
        <View style={styles.row}>
          <Text style={styles.sectionTitle}>Ringkasan Bulan</Text>
          <MonthPicker value={ym} options={ymOptions} onChange={setYm} />
        </View>

        {/* 3 CARDS */}
        <View style={styles.cards3}>
          <View style={[styles.card3Full, SHADOW.small, { backgroundColor: saldoBulan >= 0 ? COLORS.primaryLight : COLORS.keluarLight }]}>
            <Text style={styles.cardLbl}>Saldo Bulan Ini</Text>
            <Text style={[styles.cardVal, { color: saldoBulan >= 0 ? COLORS.primary : COLORS.keluar, fontSize: 22 }]}>
              {formatRupiah(saldoBulan)}
            </Text>
            <Text style={styles.cardSub}>{yearMonthLabel(ym)}</Text>
          </View>

          <View style={styles.cards2Col}>
            <View style={[styles.card2, SHADOW.small]}>
              <Text style={styles.cardLbl}>💰 Pemasukan</Text>
              <Text style={[styles.cardVal, { color: COLORS.masuk }]}>
                {formatRupiah(totalMasukBulan)}
              </Text>
            </View>
            <View style={[styles.card2, SHADOW.small]}>
              <Text style={styles.cardLbl}>💸 Pengeluaran</Text>
              <Text style={[styles.cardVal, { color: COLORS.keluar }]}>
                {formatRupiah(totalKeluarBulan)}
              </Text>
            </View>
          </View>
        </View>

        {/* TRANSAKSI LIST */}
        <Text style={[styles.sectionTitle, { marginTop: 20, marginBottom: 10 }]}>
          Transaksi — {yearMonthLabel(ym)}
        </Text>

        {allTransaksi.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>Belum ada transaksi bulan ini</Text>
          </View>
        ) : (
          allTransaksi.map(item => (
            <TransaksiItem
              key={item.id + item._type}
              item={item}
              type={item._type}
              onDelete={(id) => handleDelete(id, item._type)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  appName: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  subTitle: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  saldoTotal: { fontSize: 28, fontWeight: '800', color: '#fff' },
  scroll: { padding: 16, paddingBottom: 40 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  cards3: { gap: 10 },
  card3Full: {
    borderRadius: RADIUS.md,
    padding: 16,
    backgroundColor: COLORS.card,
  },
  cardLbl: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  cardVal: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  cardSub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  cards2Col: { flexDirection: 'row', gap: 10 },
  card2: {
    flex: 1, backgroundColor: COLORS.card,
    borderRadius: RADIUS.md, padding: 14,
  },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary },
});
