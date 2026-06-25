// src/screens/PengeluaranScreen.js
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TextInput,
  TouchableOpacity, Alert, Platform, StatusBar, Modal, FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  getKeluar, addKeluar, deleteKeluar,
  filterByYearMonth, sumJumlah,
} from '../utils/database';
import {
  formatRupiah, formatTanggal, getNowYYYYMMDD,
  getNowYearMonth, getAllYearMonths, yearMonthLabel, JENIS_PENGELUARAN,
} from '../utils/format';
import { COLORS, RADIUS, SHADOW } from '../theme';
import TransaksiItem from '../components/TransaksiItem';
import MonthPicker from '../components/MonthPicker';

export default function PengeluaranScreen() {
  const [tanggal, setTanggal] = useState(getNowYYYYMMDD());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [jumlah, setJumlah] = useState('');
  const [jenis, setJenis] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [showJenisPicker, setShowJenisPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const [keluarAll, setKeluarAll] = useState([]);
  const [ym, setYm] = useState(getNowYearMonth());

  const loadData = useCallback(async () => {
    const data = await getKeluar();
    setKeluarAll(data);
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const keluarBulan = filterByYearMonth(keluarAll, ym);
  const totalBulan = sumJumlah(keluarBulan);

  const handleSimpan = async () => {
    if (!jumlah || Number(jumlah) <= 0) {
      Alert.alert('Peringatan', 'Masukkan jumlah pengeluaran yang valid.');
      return;
    }
    if (!jenis) {
      Alert.alert('Peringatan', 'Pilih jenis pengeluaran terlebih dahulu.');
      return;
    }
    setLoading(true);
    try {
      await addKeluar({
        tanggal, jumlah: Number(jumlah), jenis,
        keterangan: keterangan.trim(),
      });
      setJumlah('');
      setJenis('');
      setKeterangan('');
      await loadData();
      Alert.alert('Berhasil', 'Pengeluaran berhasil disimpan! ✓');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteKeluar(id);
    await loadData();
  };

  const ymOptions = getAllYearMonths([], keluarAll);

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor={COLORS.keluar} barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tambah Pengeluaran</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* FORM */}
        <View style={[styles.formCard, SHADOW.small]}>
          {/* Tanggal */}
          <Text style={styles.label}>Tanggal</Text>
          <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
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
          <Text style={[styles.label, { marginTop: 14 }]}>Jumlah Pengeluaran (Rp)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Contoh: 150000"
            placeholderTextColor={COLORS.textLight}
            value={jumlah}
            onChangeText={setJumlah}
          />
          {jumlah ? (
            <Text style={styles.preview}>{formatRupiah(Number(jumlah))}</Text>
          ) : null}

          {/* Jenis */}
          <Text style={[styles.label, { marginTop: 14 }]}>Jenis Pengeluaran</Text>
          <TouchableOpacity
            style={[styles.dateBtn, !jenis && { borderColor: COLORS.keluar }]}
            onPress={() => setShowJenisPicker(true)}>
            <Text style={[styles.dateTxt, !jenis && { color: COLORS.textLight }]}>
              {jenis || '🏷️  Pilih jenis pengeluaran...'}
            </Text>
          </TouchableOpacity>

          {/* Keterangan */}
          <Text style={[styles.label, { marginTop: 14 }]}>Keterangan (opsional)</Text>
          <TextInput
            style={[styles.input, styles.inputArea]}
            placeholder="Catatan tambahan..."
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
              {loading ? 'Menyimpan...' : '+ Simpan Pengeluaran'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* LIST */}
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Riwayat Pengeluaran</Text>
          <MonthPicker value={ym} options={ymOptions} onChange={setYm} />
        </View>

        <View style={[styles.totalCard, SHADOW.small]}>
          <Text style={styles.totalLbl}>Total Pengeluaran {yearMonthLabel(ym)}</Text>
          <Text style={styles.totalVal}>{formatRupiah(totalBulan)}</Text>
          <Text style={styles.totalSub}>{keluarBulan.length} transaksi</Text>
        </View>

        {keluarBulan.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>Belum ada pengeluaran bulan ini</Text>
          </View>
        ) : (
          keluarBulan.map(item => (
            <TransaksiItem key={item.id} item={item} type="keluar" onDelete={handleDelete} />
          ))
        )}
      </ScrollView>

      {/* Jenis Picker Modal */}
      <Modal visible={showJenisPicker} transparent animationType="slide">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowJenisPicker(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Pilih Jenis Pengeluaran</Text>
            <FlatList
              data={JENIS_PENGELUARAN}
              keyExtractor={i => i}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.opt, item === jenis && styles.optActive]}
                  onPress={() => { setJenis(item); setShowJenisPicker(false); }}>
                  <Text style={[styles.optTxt, item === jenis && styles.optTxtActive]}>
                    {item}
                  </Text>
                  {item === jenis && <Text style={{ color: COLORS.keluar, fontWeight: '700' }}>✓</Text>}
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
    backgroundColor: COLORS.keluar,
    paddingVertical: 18, paddingHorizontal: 20,
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
    fontSize: 18, fontWeight: '700', color: COLORS.keluar,
    marginTop: 6, marginLeft: 2,
  },
  btnSimpan: {
    backgroundColor: COLORS.keluar, borderRadius: RADIUS.md,
    padding: 14, alignItems: 'center', marginTop: 18,
  },
  btnSimpanTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  listHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  totalCard: {
    backgroundColor: COLORS.keluarLight, borderRadius: RADIUS.md,
    padding: 14, marginBottom: 12,
  },
  totalLbl: { fontSize: 12, color: COLORS.keluar },
  totalVal: { fontSize: 22, fontWeight: '800', color: COLORS.keluar, marginVertical: 2 },
  totalSub: { fontSize: 12, color: COLORS.keluar, opacity: 0.7 },
  empty: { alignItems: 'center', paddingVertical: 32 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 14, color: COLORS.textSecondary },
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    padding: 20, maxHeight: '70%',
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
  optActive: { backgroundColor: COLORS.keluarLight, borderRadius: RADIUS.sm },
  optTxt: { fontSize: 15, color: COLORS.text },
  optTxtActive: { color: COLORS.keluar, fontWeight: '700' },
});
