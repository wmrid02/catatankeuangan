// src/utils/database.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  MASUK: 'rmw93_masuk_v1',
  KELUAR: 'rmw93_keluar_v1',
};

const load = async (key) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const save = async (key, data) => {
  await AsyncStorage.setItem(key, JSON.stringify(data));
};

// ─── PEMASUKAN ────────────────────────────────────────────────────────────────
export const getMasuk = () => load(KEYS.MASUK);

export const addMasuk = async ({ tanggal, jumlah, keterangan }) => {
  const list = await load(KEYS.MASUK);
  const item = {
    id: Date.now().toString(),
    tanggal,
    jumlah: Number(jumlah),
    keterangan: keterangan || 'Pemasukan',
    createdAt: new Date().toISOString(),
  };
  list.unshift(item);
  await save(KEYS.MASUK, list);
  return item;
};

export const deleteMasuk = async (id) => {
  const list = await load(KEYS.MASUK);
  await save(KEYS.MASUK, list.filter(i => i.id !== id));
};

// ─── PENGELUARAN ──────────────────────────────────────────────────────────────
export const getKeluar = () => load(KEYS.KELUAR);

export const addKeluar = async ({ tanggal, jumlah, jenis, keterangan }) => {
  const list = await load(KEYS.KELUAR);
  const item = {
    id: Date.now().toString(),
    tanggal,
    jumlah: Number(jumlah),
    jenis,
    keterangan: keterangan || '',
    createdAt: new Date().toISOString(),
  };
  list.unshift(item);
  await save(KEYS.KELUAR, list);
  return item;
};

export const deleteKeluar = async (id) => {
  const list = await load(KEYS.KELUAR);
  await save(KEYS.KELUAR, list.filter(i => i.id !== id));
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
export const getYearMonth = (tanggal) => tanggal.substring(0, 7);
export const filterByYearMonth = (list, ym) =>
  list.filter(i => getYearMonth(i.tanggal) === ym);
export const filterByYear = (list, year) =>
  list.filter(i => i.tanggal.startsWith(String(year)));
export const sumJumlah = (list) =>
  list.reduce((s, i) => s + i.jumlah, 0);
export const getWeekOfMonth = (tanggal) =>
  Math.ceil(new Date(tanggal).getDate() / 7);
