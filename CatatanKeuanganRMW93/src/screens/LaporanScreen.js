// src/screens/LaporanScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, Modal, FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  getMasuk, getKeluar,
  filterByYearMonth, filterByYear,
  sumJumlah, getWeekOfMonth,
} from '../utils/database';
import {
  formatRupiah, yearMonthLabel, getAllYearMonths,
  BULAN_NAMES,
} from '../utils/format';
import { COLORS, RADIUS, SHADOW } from '../theme';
import BarChart from '../components/BarChart';
import MonthPicker from '../components/MonthPicker';

const TAB = { MINGGU: 'minggu', BULAN: 'bulan' };

export default function LaporanScreen() {
  const [tab, setTab] = useState(TAB.MINGGU);
  const [masukAll, setMasukAll] = useState([]);
  const [keluarAll, setKeluarAll] = useState([]);

  // Per minggu
  const now = new Date();
  const initYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedYM, setSelectedYM] = useState(initYM);

  // Per bulan (pilih tahun)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [showYearPicker, setShowYearPicker] = useState(false);

  const loadData = useCallback(async () => {
    const [m, k] = await Promise.all([getMasuk(), getKeluar()]);
    setMasukAll(m);
    setKeluarAll(k);
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const ymOptions = getAllYearMonths(masukAll, keluarAll);
  const years = [...new Set([now.getFullYear(), ...masukAll.map(i => +i.tanggal.substring(0, 4)), ...keluarAll.map(i => +i.tanggal.substring(0, 4))])].sort((a, b) => b - a);

  // ── PER MINGGU ────────────────────────────────────────────────────────────
  const masukBulan = filterByYearMonth(masukAll, selectedYM);
  const keluarBulan = filterByYearMonth(keluarAll, selectedYM);
  const totalMasukBulan = sumJumlah(masukBulan);
  const totalKeluarBulan = sumJumlah(keluarBulan);

  const weekData = [1, 2, 3, 4, 5].map(w => ({
    masuk: sumJumlah(masukBulan.filter(i => getWeekOfMonth(i.tanggal) === w)),
    keluar: sumJumlah(keluarBulan.filter(i => getWeekOfMonth(i.tanggal) === w)),
  }));

  const weekMasukChart = weekData.map((d, i) => ({ label: `Minggu ${i + 1}`, value: d.masuk }));
  const weekKeluarChart = weekData.map((d, i) => ({ label: `Minggu ${i + 1}`, value: d.keluar }));

  // Breakdown jenis pengeluaran bulan
  const jenisBulan = {};
  keluarBulan.forEach(i => { jenisBulan[i.jenis] = (jenisBulan[i.jenis] || 0) + i.jumlah; });
  const jenisChart = Object.entries(jenisBulan)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }));

  // ── PER BULAN (TAHUNAN) ───────────────────────────────────────────────────
  const masukTahun = filterByYear(masukAll, selectedYear);
  const keluarTahun = filterByYear(keluarAll, selectedYear);
  const totalMasukTahun = sumJumlah(masukTahun);
  const totalKeluarTahun = sumJumlah(keluarTahun);

  const bulanMasukChart = BULAN_NAMES.map((b, i) => {
    const ym = `${selectedYear}-${String(i + 1).padStart(2, '0')}`;
    return { label: b.substring(0, 3), value: sumJumlah(filterByYearMonth(masukAll, ym)) };
  });
  const bulanKeluarChart = BULAN_NAMES.map((b, i) => {
    const ym = `${selectedYear}-${String(i + 1).padStart(2, '0')}`;
    return { label: b.substring(0, 3), value: sumJumlah(filterByYearMonth(keluarAll, ym)) };
  });

  const jenisTahun = {};
  keluarTahun.forEach(i => { jenisTahun[i.jenis] = (jenisTahun[i.jenis] || 0) + i.jumlah; });
  const jenisTahunChart = Object.entries(jenisTahun)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value }));

  const SectionCard = ({ title, children }) => (
    <View style={[styles.sectionCard, SHADOW.small]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const TotalRow = ({ label, value, color }) => (
    <View style={styles.totalRow}>
      <Text style={styles.totalLabel}>{label}</Text>
      <Text style={[styles.totalValue, { color }]}>{formatRupiah(value)}</Text>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor={COLORS.primaryDark} barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Laporan Keuangan</Text>
      </View>

      {/* TAB */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === TAB.MINGGU && styles.tabBtnActive]}
          onPress={() => setTab(TAB.MINGGU)}>
          <Text style={[styles.tabTxt, tab === TAB.MINGGU && styles.tabTxtActive]}>
            Per Minggu
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === TAB.BULAN && styles.tabBtnActive]}
          onPress={() => setTab(TAB.BULAN)}>
          <Text style={[styles.tabTxt, tab === TAB.BULAN && styles.tabTxtActive]}>
            Per Bulan
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {tab === TAB.MINGGU ? (
          <>
            {/* Filter bulan */}
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Pilih Bulan :</Text>
              <MonthPicker value={selectedYM} options={ymOptions} onChange={setSelectedYM} />
            </View>

            {/* Ringkasan */}
            <SectionCard title={`Ringkasan — ${yearMonthLabel(selectedYM)}`}>
              <TotalRow label="Total Pemasukan" value={totalMasukBulan} color={COLORS.masuk} />
              <TotalRow label="Total Pengeluaran" value={totalKeluarBulan} color={COLORS.keluar} />
              <View style={styles.divider} />
              <TotalRow
                label="Saldo Bersih"
                value={totalMasukBulan - totalKeluarBulan}
                color={totalMasukBulan >= totalKeluarBulan ? COLORS.masuk : COLORS.keluar}
              />
            </SectionCard>

            {/* Pemasukan per minggu */}
            <SectionCard title="📈 Pemasukan per Minggu">
              <BarChart data={weekMasukChart} color={COLORS.masuk} />
            </SectionCard>

            {/* Pengeluaran per minggu */}
            <SectionCard title="📉 Pengeluaran per Minggu">
              <BarChart data={weekKeluarChart} color={COLORS.keluar} />
            </SectionCard>

            {/* Jenis pengeluaran */}
            {jenisChart.length > 0 && (
              <SectionCard title="🏷️ Jenis Pengeluaran Bulan Ini">
                <BarChart data={jenisChart} color={COLORS.keluar} />
              </SectionCard>
            )}
          </>
        ) : (
          <>
            {/* Filter tahun */}
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Pilih Tahun :</Text>
              <TouchableOpacity
                style={[styles.yearBtn, SHADOW.small]}
                onPress={() => setShowYearPicker(true)}>
                <Text style={styles.yearTxt}>{selectedYear}</Text>
                <Text style={styles.yearArrow}>▾</Text>
              </TouchableOpacity>
            </View>

            {/* Ringkasan tahunan */}
            <SectionCard title={`Ringkasan Tahun ${selectedYear}`}>
              <TotalRow label="Total Pemasukan" value={totalMasukTahun} color={COLORS.masuk} />
              <TotalRow label="Total Pengeluaran" value={totalKeluarTahun} color={COLORS.keluar} />
              <View style={styles.divider} />
              <TotalRow
                label="Saldo Bersih"
                value={totalMasukTahun - totalKeluarTahun}
                color={totalMasukTahun >= totalKeluarTahun ? COLORS.masuk : COLORS.keluar}
              />
            </SectionCard>

            {/* Pemasukan per bulan */}
            <SectionCard title="📈 Pemasukan per Bulan">
              <BarChart data={bulanMasukChart} color={COLORS.masuk} />
            </SectionCard>

            {/* Pengeluaran per bulan */}
            <SectionCard title="📉 Pengeluaran per Bulan">
              <BarChart data={bulanKeluarChart} color={COLORS.keluar} />
            </SectionCard>

            {/* Jenis pengeluaran tahunan */}
            {jenisTahunChart.length > 0 && (
              <SectionCard title="🏷️ Jenis Pengeluaran Tahunan">
                <BarChart data={jenisTahunChart} color={COLORS.keluar} />
              </SectionCard>
            )}
          </>
        )}
      </ScrollView>

      {/* Year picker modal */}
      <Modal visible={showYearPicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowYearPicker(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Pilih Tahun</Text>
            <FlatList
              data={years}
              keyExtractor={i => String(i)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.opt, item === selectedYear && styles.optActive]}
                  onPress={() => { setSelectedYear(item); setShowYearPicker(false); }}>
                  <Text style={[styles.optTxt, item === selectedYear && { color: COLORS.primary, fontWeight: '700' }]}>
                    {item}
                  </Text>
                  {item === selectedYear && <Text style={{ color: COLORS.primary, fontWeight: '700' }}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18, paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    marginHorizontal: 16, marginTop: 14,
    borderRadius: RADIUS.lg, padding: 4,
    ...SHADOW.small,
  },
  tabBtn: {
    flex: 1, paddingVertical: 10,
    borderRadius: RADIUS.md, alignItems: 'center',
  },
  tabBtnActive: { backgroundColor: COLORS.primary },
  tabTxt: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  tabTxtActive: { color: '#fff' },
  scroll: { padding: 16, paddingBottom: 40 },
  filterRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginBottom: 14,
  },
  filterLabel: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  yearBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.card, borderRadius: RADIUS.md,
    paddingHorizontal: 14, paddingVertical: 9,
  },
  yearTxt: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  yearArrow: { fontSize: 11, color: COLORS.primary },
  sectionCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    padding: 16, marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 14, fontWeight: '700', color: COLORS.text,
    marginBottom: 14,
  },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 6,
  },
  totalLabel: { fontSize: 13, color: COLORS.textSecondary },
  totalValue: { fontSize: 14, fontWeight: '700' },
  divider: {
    height: 0.5, backgroundColor: COLORS.border, marginVertical: 8,
  },
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    padding: 20, maxHeight: '50%',
  },
  sheetTitle: {
    fontSize: 16, fontWeight: '700', color: COLORS.text,
    marginBottom: 16, textAlign: 'center',
  },
  opt: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 6,
    borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  optActive: { backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.sm },
  optTxt: { fontSize: 15, color: COLORS.text },
});
