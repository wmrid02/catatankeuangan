// src/utils/format.js

export const formatRupiah = (number) => {
  const n = Math.round(Number(number) || 0);
  return 'Rp ' + n.toLocaleString('id-ID');
};

export const formatTanggal = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
};

export const formatTanggalShort = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

export const getNowYYYYMMDD = () => {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
};

export const getNowYearMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const yearMonthLabel = (ym) => {
  if (!ym) return '';
  const [y, m] = ym.split('-');
  return `${BULAN_NAMES[parseInt(m) - 1]} ${y}`;
};

export const BULAN_NAMES = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
];

export const JENIS_PENGELUARAN = [
  'Makan & Minum',
  'Transportasi',
  'Belanja',
  'Tagihan & Utilitas',
  'Kesehatan',
  'Pendidikan',
  'Hiburan',
  'Tabungan',
  'Lainnya',
];

export const getAllYearMonths = (masukList, keluarList) => {
  const set = new Set();
  const now = getNowYearMonth();
  set.add(now);
  [...masukList, ...keluarList].forEach(i => set.add(getYM(i.tanggal)));
  return [...set].sort((a, b) => b.localeCompare(a));
};

const getYM = (t) => t.substring(0, 7);
