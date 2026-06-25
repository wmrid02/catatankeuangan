# 📱 Catatan Keuangan rmw93

Aplikasi pencatatan keuangan Android — pemasukan, pengeluaran, dan laporan keuangan lengkap.

---

## ✨ Fitur Aplikasi

| Halaman | Fitur |
|---|---|
| 🏠 **Beranda** | Saldo total, ringkasan bulan ini, daftar transaksi |
| 💰 **Pemasukan** | Form (tanggal, jumlah, keterangan), total per bulan, riwayat |
| 💸 **Pengeluaran** | Form (tanggal, jumlah, jenis, keterangan), total per bulan, riwayat |
| 📊 **Laporan** | Filter per minggu / per bulan, grafik batang, breakdown jenis |

- ✅ Data tersimpan permanen di memori internal HP (AsyncStorage)
- ✅ Tidak hilang saat aplikasi ditutup atau HP di-restart
- ✅ Filter laporan per minggu (Minggu 1–5) & per bulan (Jan–Des)
- ✅ 9 kategori pengeluaran
- ✅ Hapus transaksi dengan konfirmasi

---

## 🛠️ Cara Membuat APK (Build)

### 1. Install Node.js & Java

- Download **Node.js 18+**: https://nodejs.org
- Download **JDK 17**: https://adoptium.net
- Download **Android Studio**: https://developer.android.com/studio

### 2. Setup Android SDK

Buka Android Studio → SDK Manager → Install:
- Android SDK Platform 34
- Android SDK Build-Tools 34.0.0

Tambahkan ke environment variable:
```
ANDROID_HOME = C:\Users\NAMA\AppData\Local\Android\Sdk   (Windows)
ANDROID_HOME = ~/Library/Android/sdk                      (Mac)
```

### 3. Install React Native CLI

```bash
npm install -g react-native-cli
```

### 4. Masuk ke folder project

```bash
cd CatatanKeuanganRMW93
```

### 5. Install dependencies

```bash
npm install
```

### 6. Buat Keystore untuk signing APK

```bash
cd android/app
keytool -genkey -v -keystore release.keystore -alias rmw93 \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass rmw93keuangan -keypass rmw93keuangan \
  -dname "CN=RMW93, OU=Mobile, O=RMW93, L=Indonesia, ST=Indonesia, C=ID"
cd ../..
```

### 7. Build APK Release

```bash
cd android
./gradlew assembleRelease        # Mac/Linux
gradlew.bat assembleRelease      # Windows
```

### 8. Lokasi APK

```
android/app/build/outputs/apk/release/app-release.apk
```

Copy file APK ini ke HP → Install!

---

## 📱 Cara Install di HP Android

1. Di HP: Buka **Pengaturan → Keamanan → Izinkan sumber tidak dikenal**
2. Copy file `app-release.apk` ke HP (via USB / WhatsApp / Google Drive)
3. Buka file APK di HP → **Install**
4. Buka aplikasi **"Catatan Keuangan rmw93"**

---

## 💾 Penyimpanan Data

Data disimpan menggunakan **AsyncStorage** di memori internal HP:
- Key: `rmw93_masuk_v1` (pemasukan)
- Key: `rmw93_keluar_v1` (pengeluaran)
- Data **tidak hilang** saat aplikasi ditutup
- Data **tetap ada** saat HP di-restart
- Data hilang hanya jika aplikasi di-uninstall atau "Hapus Data" di Settings HP

---

## 📁 Struktur File

```
CatatanKeuanganRMW93/
├── App.js                          # Entry point utama
├── index.js                        # Register komponen
├── app.json                        # Nama aplikasi
├── package.json                    # Dependencies
├── src/
│   ├── screens/
│   │   ├── BerandaScreen.js        # Halaman utama / dashboard
│   │   ├── PemasukanScreen.js      # Form & list pemasukan
│   │   ├── PengeluaranScreen.js    # Form & list pengeluaran
│   │   └── LaporanScreen.js        # Laporan keuangan
│   ├── components/
│   │   ├── TransaksiItem.js        # Komponen item transaksi
│   │   ├── MonthPicker.js          # Picker bulan
│   │   ├── SummaryCard.js          # Kartu ringkasan
│   │   └── BarChart.js             # Grafik batang
│   ├── utils/
│   │   ├── database.js             # AsyncStorage CRUD
│   │   └── format.js               # Format Rupiah, tanggal, dll
│   ├── navigation/
│   │   └── AppNavigator.js         # Bottom tab navigator
│   └── theme/
│       └── index.js                # Warna & style global
└── android/                        # Konfigurasi Android native
```

---

## ⚙️ Menjalankan di Emulator / HP (Development)

```bash
# Jalankan Metro bundler
npm start

# Di terminal baru, jalankan di Android
npm run android
```

Pastikan Android emulator sudah berjalan atau HP terhubung via USB dengan USB Debugging aktif.

---

## 🔧 Troubleshooting

**Error: SDK location not found**
→ Buat file `android/local.properties`:
```
sdk.dir=/Users/NAMA/Library/Android/sdk
```

**Error: JAVA_HOME not set**
→ Set environment variable JAVA_HOME ke lokasi JDK 17

**Gradle build failed**
```bash
cd android && ./gradlew clean && cd .. && npm run android
```
