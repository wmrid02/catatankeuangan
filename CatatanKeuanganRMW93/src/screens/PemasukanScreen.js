// src/screens/PemasukanScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TextInput,
  TouchableOpacity, Alert, Platform, StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  getMasuk, addMasuk, deleteMasuk,
  filterByYearMonth, sumJumlah,
} from '../utils/database';
import {
  formatRupiah, formatTanggal, getNowYYYYMMDD,
  getNowYearMonth, getAllYearMonths, yearMonthLabel,
} from '../utils/format';
import { COLORS, RADIUS, SHADOW } from '../theme';
import TransaksiItem from '../components/TransaksiItem';
import MonthPicker from '../components/MonthPicker';

export default function PemasukanScreen() {
  const [tanggal, setTanggal] = useState(getNowYYYYMMDD());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [jumlah, setJumlah] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [loading, setLoading] = useState(false);

  const [masukAll, setMasukAll] = useState([]);
  const [ym, setYm] = useState(getNowYearMonth());

  const loadData = useCallback(async () => {
    const data = await getMasuk();
    setMasukAll(data);
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const masukBulan = filterByYearMonth(masukAll, ym);
  const totalBulan = sumJumlah(masukBulan);

  const handleSimpan = async () => {
    if (!jumlah || Number(jumlah) <= 0) {
      Alert.alert('Peringatan', 'Masukkan jumlah pemasukan yang valid.');
      return;
    }
    if (!keterangan.trim()) {
      Alert.alert('Peringatan', 'Keterangan tidak boleh kosong.');
      return;
    }
    setLoading(true);
    try {
      await addMasuk({ tanggal, jumlah: Number(jumlah), keterangan: keterangan.trim() });
      setJumlah('');
      setKeterangan('');
      await loadData();
      Alert.alert('Berhasil', 'Pemasukan berhasil disimpan! ✓');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteMasuk(id);
    await loadData();
  };

  const ymOptions = getAllYearMonths(masukAll, []);

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor={COLORS.primaryDark} barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tambah Pemasukan</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* FORM */}
        <View style={[styles.formCard, SHADOW.small]}>
          {/* Tanggal */}
          <Text style={styles.label}>Tanggal</Text>
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateTxt}>📅  {formatTanggal(tanggal)}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={new Date(tanggal + 'T00:00:00')}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(e, d) => {
                setShowDatePicker(Platform.OS === 'ios');
                if (d) {
                  const y = d.getFullYear();
                  const m = String(d.getMonth() + 1).padStart(2, '0');
                  const day = String(d.getDate()).padStart(2, '0');
                  setTanggal(`${y}-${m}-${day}`);
                }
              }}
            />
          )}

          {/* Jumlah */}
          <Text style={[styles.label, { marginTop: 14 }]}>Jumlah Pemasukan (Rp)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Contoh: 5000000"
            placeholderTextColor={COLORS.textLight}
            value={jumlah}
            onChangeText={setJumlah}
          />
          {jumlah ? (
            <Text style={styles.preview}>{formatRupiah(Number(jumlah))}</Text>
          ) : null}

          {/* Keterangan */}
          <Text style={[styles.label, { marginTop: 14 }]}>Keterangan</Text>
          <TextInput
            style={[styles.input, styles.inputArea]}
            placeholder="Contoh: Gaji bulan ini, Bonus, Freelance..."
            placeholderTextColor={COLORS.textLight}
            value={keterangan}
            onChangeText={setKeterangan}
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity
            style={[styles.btnSimpan, loading && { opacity: 0.7 }]}
            onPress={handleSimpan}
            disabled={loading}>
            <Text style={styles.btnSimpanTxt}>
              {loading ? 'Menyimpan...' : '+ Simpan Pemasukan'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* LIST */}
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Riwayat Pemasukan</Text>
          <MonthPicker value={ym} options={ymOptions} onChange={setYm} />
        </View>

        {/* Total bulan */}
        <View style={[styles.totalCard, SHADOW.small]}>
          <Text style={styles.totalLbl}>Total Pemasukan {yearMonthLabel(ym)}</Text>
          <Text style={styles.totalVal}>{formatRupiah(totalBulan)}</Text>
          <Text style={styles.totalSub}>{masukBulan.length} transaksi</Text>
        </View>

        {masukBulan.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>Belum ada pemasukan bulan ini</Text>
          </View>
        ) : (
          masukBulan.map(item => (
            <TransaksiItem key={item.id} item={item} type="masuk" onDelete={handleDelete} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.masuk,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  scroll: { padding: 16, paddingBottom: 40 },

  formCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    padding: 16, marginBottom: 20,
  },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  dateBtn: {
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, padding: 12,
    backgroundColor: COLORS.background,
  },
  dateTxt: { fontSize: 14, color: COLORS.text },
  input: {
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, padding: 12,
    fontSize: 14, color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  inputArea: { height: 80, textAlignVertical: 'top' },
  preview: {
    fontSize: 18, fontWeight: '700', color: COLORS.masuk,
    marginTop: 6, marginLeft: 2,
  },
  btnSimpan: {
    backgroundColor: COLORS.masuk, borderRadius: RADIUS.md,
    padding: 14, alignItems: 'center', marginTop: 18,
  },
  btnSimpanTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },

  listHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },

  totalCard: {
    backgroundColor: COLORS.masukLight, borderRadius: RADIUS.md,
    padding: 14, marginBottom: 12,
  },
  totalLbl: { fontSize: 12, color: COLORS.masuk },
  totalVal: { fontSize: 22, fontWeight: '800', color: COLORS.masuk, marginVertical: 2 },
  totalSub: { fontSize: 12, color: COLORS.masuk, opacity: 0.7 },

  empty: { alignItems: 'center', paddingVertical: 32 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary },
});
